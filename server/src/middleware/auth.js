import { verifyToken } from '../utils/token.js';
import { AppError } from './errorHandler.js';
import { Author, Admin } from '../models/index.js';

export const requireAuth = async (req, res, next) => {
  try {
    // 1. Get token from HTTP-only cookie or Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in to proceed.', 401);
    }

    // 2. Verify token
    const decoded = verifyToken(token);

    // 3. Verify user still exists in database
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin || !admin.is_active) {
        throw new AppError('Admin account not found or has been deactivated.', 401);
      }
      req.user = {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      };
    } else if (decoded.role === 'author') {
      const author = await Author.findOne({ author_id: decoded.author_id });
      if (!author) {
        throw new AppError('Author account not found.', 401);
      }
      req.user = {
        id: author._id.toString(),
        author_id: author.author_id,
        name: author.name,
        email: author.email,
        role: 'author',
      };
    } else {
      throw new AppError('Invalid token role.', 401);
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired session. Please log in again.', 401));
    }
    next(error);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Access forbidden: insufficient permissions for this operation.', 403));
    }
    next();
  };
};

export const requireAdmin = requireRole('admin', 'superadmin');
export const requireAuthor = requireRole('author');
