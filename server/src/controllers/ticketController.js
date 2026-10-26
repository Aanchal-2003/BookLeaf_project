import { Ticket, Book, Author, Message } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { aiService } from '../services/aiService.js';
import { logAuditEvent } from '../services/auditService.js';

/**
 * Generate a sequential human-readable ticket number (e.g. TCK-1001)
 */
const generateTicketNumber = async () => {
  const count = await Ticket.countDocuments();
  const nextNumber = 1000 + count + 1;
  return `TCK-${nextNumber}`;
};

export const createTicket = async (req, res, next) => {
  try {
    const authorId = req.user.author_id;
    const { subject, description, book_id, category: userCategory } = req.body;

    let book = null;
    if (book_id) {
      book = await Book.findOne({ book_id, author_id: authorId });
      if (!book) {
        throw new AppError('The selected book does not belong to your account', 400);
      }
    }

    const author = await Author.findOne({ author_id: authorId });
    const ticketNumber = await generateTicketNumber();

    // 1. Run AI Classification & Priority Scoring
    let category = userCategory || 'General Inquiry';
    let aiPredictedCategory = null;
    let aiPredictedPriority = 'Medium';
    let aiConfidence = null;
    let aiReasoning = null;
    let aiProcessingStatus = 'completed';
    let aiDraftResponse = null;

    try {
      const classification = await aiService.classifyTicket({
        subject,
        description,
        bookTitle: book ? book.title : '',
      });

      aiPredictedCategory = classification.category;
      if (!userCategory) {
        category = classification.category;
      }
      aiConfidence = classification.confidence;
      aiReasoning = classification.reasoning;

      const priorityScoring = await aiService.scorePriority({
        subject,
        description,
        category,
        book,
      });

      aiPredictedPriority = priorityScoring.priority;

      // Generate initial grounded response draft for the admin
      const draftResult = await aiService.draftResponse({
        ticket: { category, subject, description },
        author,
        book,
      });
      aiDraftResponse = draftResult.draft;
    } catch (aiErr) {
      console.warn('[AI Warning] Background AI processing encountered error, falling back:', aiErr.message);
      aiProcessingStatus = 'failed';
    }

    // 2. Persist Ticket to MongoDB
    const ticket = await Ticket.create({
      ticket_number: ticketNumber,
      author_id: authorId,
      book_id: book ? book.book_id : null,
      subject,
      description,
      category,
      ai_predicted_category: aiPredictedCategory,
      priority: aiPredictedPriority,
      ai_predicted_priority: aiPredictedPriority,
      status: 'Open',
      ai_processing_status: aiProcessingStatus,
      ai_confidence: aiConfidence,
      ai_reasoning: aiReasoning,
      ai_draft_response: aiDraftResponse,
    });

    // 3. Create initial conversation message
    await Message.create({
      ticket_id: ticket._id,
      sender_type: 'author',
      sender_id: authorId,
      sender_name: author.name,
      content: description,
    });

    // 4. Log Audit Event
    await logAuditEvent({
      ticket_id: ticket._id,
      actor_type: 'author',
      actor_id: authorId,
      actor_name: author.name,
      action: 'ticket_created',
      notes: `Ticket ${ticketNumber} raised under category "${category}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket raised successfully',
      data: {
        ticket,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAuthorTickets = async (req, res, next) => {
  try {
    const authorId = req.user.author_id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { author_id: authorId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: {
        tickets,
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

export const getAuthorTicketById = async (req, res, next) => {
  try {
    const authorId = req.user.author_id;
    const { id } = req.params;

    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Author data isolation
    if (ticket.author_id !== authorId) {
      throw new AppError('Access forbidden: you do not have permission to view this ticket', 403);
    }

    // Public messages only — internal notes are strictly excluded!
    const messages = await Message.find({ ticket_id: ticket._id }).sort({ createdAt: 1 });

    let book = null;
    if (ticket.book_id) {
      book = await Book.findOne({ book_id: ticket.book_id });
    }

    res.status(200).json({
      success: true,
      data: {
        ticket,
        messages,
        book,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const addAuthorMessage = async (req, res, next) => {
  try {
    const authorId = req.user.author_id;
    const { id } = req.params;
    const { content } = req.body;

    const query = id.startsWith('TCK') ? { ticket_number: id } : { _id: id };
    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    if (ticket.author_id !== authorId) {
      throw new AppError('Access forbidden', 403);
    }

    const author = await Author.findOne({ author_id: authorId });

    // Create message
    const message = await Message.create({
      ticket_id: ticket._id,
      sender_type: 'author',
      sender_id: authorId,
      sender_name: author.name,
      content,
    });

    // If ticket was resolved, set back to in progress
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      ticket.status = 'In Progress';
      await ticket.save();

      await logAuditEvent({
        ticket_id: ticket._id,
        actor_type: 'author',
        actor_id: authorId,
        actor_name: author.name,
        action: 'status_reopened',
        field_changed: 'status',
        previous_value: 'Resolved',
        new_value: 'In Progress',
        notes: 'Ticket reopened due to new author message',
      });
    }

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
