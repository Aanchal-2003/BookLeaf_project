import express from 'express';
import {
  createTicket,
  getAuthorTickets,
  getAuthorTicketById,
  addAuthorMessage,
} from '../controllers/ticketController.js';
import { requireAuth, requireAuthor } from '../middleware/auth.js';
import { validate, createTicketSchema, addMessageSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/tickets', requireAuth, requireAuthor, validate(createTicketSchema), createTicket);
router.get('/tickets', requireAuth, requireAuthor, getAuthorTickets);
router.get('/tickets/:id', requireAuth, requireAuthor, getAuthorTicketById);
router.post('/tickets/:id/messages', requireAuth, requireAuthor, validate(addMessageSchema), addAuthorMessage);

export default router;
