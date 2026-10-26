import { z } from 'zod';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '../constants/enums.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    next(err);
  }
};

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email or Identifier is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(3, 'Subject must be at least 3 characters long').max(200, 'Subject cannot exceed 200 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters long').max(5000, 'Description cannot exceed 5000 characters'),
    book_id: z.string().nullable().optional(),
    category: z.enum(TICKET_CATEGORIES).optional(), // Optional if auto-classified
  }),
});

export const addMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content cannot be empty').max(5000, 'Message cannot exceed 5000 characters'),
  }),
});

export const addInternalNoteSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Internal note cannot be empty').max(5000, 'Note cannot exceed 5000 characters'),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(TICKET_STATUSES),
  }),
});

export const overrideCategorySchema = z.object({
  body: z.object({
    category: z.enum(TICKET_CATEGORIES),
    notes: z.string().max(500).optional(),
  }),
});

export const overridePrioritySchema = z.object({
  body: z.object({
    priority: z.enum(TICKET_PRIORITIES),
    notes: z.string().max(500).optional(),
  }),
});

export const assignTicketSchema = z.object({
  body: z.object({
    admin_id: z.string().nullable(), // Pass null to unassign or admin ObjectId
  }),
});
