import { Book, Ticket } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAuthorBooks = async (req, res, next) => {
  try {
    const authorId = req.user.author_id;
    const books = await Book.find({ author_id: authorId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: {
        books,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Query by either book_id (e.g. BK001) or MongoDB _id
    const query = id.startsWith('BK') ? { book_id: id } : { _id: id };
    const book = await Book.findOne(query);

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Author data isolation: authors can only view their own books
    if (req.user.role === 'author' && book.author_id !== req.user.author_id) {
      throw new AppError('Access forbidden: you do not have permission to view this book', 403);
    }

    res.status(200).json({
      success: true,
      data: {
        book,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAuthorDashboardSummary = async (req, res, next) => {
  try {
    const authorId = req.user.author_id;

    // Fetch all books for this author
    const books = await Book.find({ author_id: authorId });

    const totalBooks = books.length;
    const publishedBooks = books.filter(b => b.status === 'Published & Live').length;
    const totalRoyaltyEarned = books.reduce((acc, b) => acc + (b.total_royalty_earned || 0), 0);
    const totalRoyaltyPaid = books.reduce((acc, b) => acc + (b.royalty_paid || 0), 0);
    const pendingRoyalties = books.reduce((acc, b) => acc + (b.royalty_pending || 0), 0);

    // Fetch author's ticket stats
    const tickets = await Ticket.find({ author_id: authorId }).sort({ createdAt: -1 });

    const ticketSummary = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'Open').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length,
      closed: tickets.filter(t => t.status === 'Closed').length,
    };

    const recentTickets = tickets;

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalBooks,
          publishedBooks,
          totalRoyaltyEarned,
          totalRoyaltyPaid,
          pendingRoyalties,
        },
        ticketSummary,
        recentTickets,
        books,
      },
    });
  } catch (err) {
    next(err);
  }
};
