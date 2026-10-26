import mongoose from 'mongoose';
import { Ticket, Author, Book, Message, InternalNote, AuditEvent, Admin } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAuditEvent } from '../services/auditService.js';
import { aiService } from '../services/aiService.js';

export const getAdminMetrics = async (req, res, next) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const closedTickets = await Ticket.countDocuments({ status: 'Closed' });

    const criticalHighUnresolved = await Ticket.countDocuments({
      status: { $in: ['Open', 'In Progress'] },
      priority: { $in: ['Critical', 'High'] },
    });

    // Breakdown by category
    const categoryAggregation = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categoryBreakdown = categoryAggregation.map(item => ({
      category: item._id,
      count: item.count,
    }));

    // Recent 5 incoming tickets
    const recentTickets = await Ticket.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          criticalHighUnresolved,
        },
        categoryBreakdown,
        recentTickets,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminTicketQueue = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      assigned_admin_id,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assigned_admin_id) {
      query.assigned_admin_id = assigned_admin_id === 'unassigned' ? null : assigned_admin_id;
    }

    // Search across ticket number, subject, or author name
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Find author_ids matching name or email
      const matchingAuthors = await Author.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('author_id');

      const authorIds = matchingAuthors.map(a => a.author_id);

      query.$or = [
        { ticket_number: searchRegex },
        { subject: searchRegex },
        { author_id: { $in: authorIds } },
      ];
    }

    const sort = {};
    if (sortBy === 'priority') {
      // Prioritize Critical -> High -> Medium -> Low
      sort.priority = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate('assigned_admin_id', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Populate author details for display in queue
    const authorIds = [...new Set(tickets.map(t => t.author_id))];
    const authors = await Author.find({ author_id: { $in: authorIds } });
    const authorMap = new Map(authors.map(a => [a.author_id, a]));

    const enrichedTickets = tickets.map(ticket => {
      const t = ticket.toJSON();
      t.author = authorMap.get(ticket.author_id) || null;
      return t;
    });

    res.status(200).json({
      success: true,
      data: {
        tickets: enrichedTickets,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminTicketDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query).populate('assigned_admin_id', 'name email role');

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Retrieve Author context
    const author = await Author.findOne({ author_id: ticket.author_id });

    // Retrieve Book context if associated
    let book = null;
    if (ticket.book_id) {
      book = await Book.findOne({ book_id: ticket.book_id });
    }

    // Retrieve public message thread
    const messages = await Message.find({ ticket_id: ticket._id }).sort({ createdAt: 1 });

    // Retrieve private internal notes (Admins only!)
    const internalNotes = await InternalNote.find({ ticket_id: ticket._id }).sort({ createdAt: 1 });

    // Retrieve audit event log
    const auditEvents = await AuditEvent.find({ ticket_id: ticket._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ticket,
        author,
        book,
        messages,
        internalNotes,
        auditEvents,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const admin = req.user;

    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    const previousStatus = ticket.status;
    ticket.status = status;

    if (status === 'Resolved' && !ticket.resolved_at) {
      ticket.resolved_at = new Date();
    } else if (status === 'Closed' && !ticket.closed_at) {
      ticket.closed_at = new Date();
    }

    await ticket.save();

    await logAuditEvent({
      ticket_id: ticket._id,
      actor_type: 'admin',
      actor_id: admin.id,
      actor_name: admin.name,
      action: 'status_changed',
      field_changed: 'status',
      previous_value: previousStatus,
      new_value: status,
      notes: `Admin changed status from "${previousStatus}" to "${status}"`,
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: {
        ticket,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const overrideTicketCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, notes } = req.body;
    const admin = req.user;

    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    const previousCategory = ticket.category;
    ticket.category = category;
    await ticket.save();

    await logAuditEvent({
      ticket_id: ticket._id,
      actor_type: 'admin',
      actor_id: admin.id,
      actor_name: admin.name,
      action: 'category_overridden',
      field_changed: 'category',
      previous_value: previousCategory,
      new_value: category,
      notes: notes || `Admin manually reclassified category from "${previousCategory}" to "${category}"`,
    });

    res.status(200).json({
      success: true,
      message: `Category updated to ${category}`,
      data: {
        ticket,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const overrideTicketPriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority, notes } = req.body;
    const admin = req.user;

    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    const previousPriority = ticket.priority;
    ticket.priority = priority;
    await ticket.save();

    await logAuditEvent({
      ticket_id: ticket._id,
      actor_type: 'admin',
      actor_id: admin.id,
      actor_name: admin.name,
      action: 'priority_overridden',
      field_changed: 'priority',
      previous_value: previousPriority,
      new_value: priority,
      notes: notes || `Admin adjusted priority from "${previousPriority}" to "${priority}"`,
    });

    res.status(200).json({
      success: true,
      message: `Priority updated to ${priority}`,
      data: {
        ticket,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;
    const currentAdmin = req.user;

    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    let targetAdmin = null;
    if (admin_id) {
      targetAdmin = await Admin.findById(admin_id);
      if (!targetAdmin) {
        throw new AppError('Target admin not found', 404);
      }
    }

    const previousAssignee = ticket.assigned_admin_id;
    ticket.assigned_admin_id = targetAdmin ? targetAdmin._id : null;
    await ticket.save();

    await logAuditEvent({
      ticket_id: ticket._id,
      actor_type: 'admin',
      actor_id: currentAdmin.id,
      actor_name: currentAdmin.name,
      action: 'ticket_assigned',
      field_changed: 'assigned_admin_id',
      previous_value: previousAssignee ? previousAssignee.toString() : null,
      new_value: targetAdmin ? targetAdmin._id.toString() : null,
      notes: targetAdmin ? `Assigned to ${targetAdmin.name}` : 'Unassigned ticket',
    });

    res.status(200).json({
      success: true,
      message: targetAdmin ? `Ticket assigned to ${targetAdmin.name}` : 'Ticket unassigned',
      data: {
        ticket,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const addInternalNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const admin = req.user;

    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    const note = await InternalNote.create({
      ticket_id: ticket._id,
      admin_id: admin.id,
      admin_name: admin.name,
      content,
    });

    await logAuditEvent({
      ticket_id: ticket._id,
      actor_type: 'admin',
      actor_id: admin.id,
      actor_name: admin.name,
      action: 'internal_note_added',
      notes: 'Admin added a private internal note',
    });

    res.status(201).json({
      success: true,
      data: {
        note,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const sendAdminReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const admin = req.user;

    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Save message to public thread
    const message = await Message.create({
      ticket_id: ticket._id,
      sender_type: 'admin',
      sender_id: admin.id,
      sender_name: admin.name,
      content,
    });

    // Update ticket status to In Progress if it was Open
    if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    // Also assign to admin if unassigned
    if (!ticket.assigned_admin_id) {
      ticket.assigned_admin_id = admin.id;
    }
    await ticket.save();

    await logAuditEvent({
      ticket_id: ticket._id,
      actor_type: 'admin',
      actor_id: admin.id,
      actor_name: admin.name,
      action: 'admin_replied',
      notes: `Admin ${admin.name} replied to ticket`,
    });

    res.status(201).json({
      success: true,
      data: {
        message,
        ticket,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const generateAiDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    const author = await Author.findOne({ author_id: ticket.author_id });
    let book = null;
    if (ticket.book_id) {
      book = await Book.findOne({ book_id: ticket.book_id });
    }

    const recentMessages = await Message.find({ ticket_id: ticket._id }).sort({ createdAt: -1 }).limit(5);

    const draftResult = await aiService.draftResponse({
      ticket,
      author,
      book,
      recentMessages: recentMessages.reverse(),
    });

    ticket.ai_draft_response = draftResult.draft;
    await ticket.save();

    res.status(200).json({
      success: true,
      data: {
        draft: draftResult.draft,
        suggested_next_step: draftResult.suggested_next_step,
        missing_information: draftResult.missing_information,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminList = async (req, res, next) => {
  try {
    const admins = await Admin.find({ is_active: true }).select('name email role');
    res.status(200).json({
      success: true,
      data: {
        admins,
      },
    });
  } catch (err) {
    next(err);
  }
};
