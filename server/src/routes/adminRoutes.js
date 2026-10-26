import express from 'express';
import {
  getAdminMetrics,
  getAdminTicketQueue,
  getAdminTicketDetail,
  updateTicketStatus,
  overrideTicketCategory,
  overrideTicketPriority,
  assignTicket,
  addInternalNote,
  sendAdminReply,
  generateAiDraft,
  getAdminList,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  validate,
  updateStatusSchema,
  overrideCategorySchema,
  overridePrioritySchema,
  assignTicketSchema,
  addInternalNoteSchema,
  addMessageSchema,
} from '../validators/schemas.js';

const router = express.Router();

// Apply admin authentication to all routes in this router
router.use(requireAuth, requireAdmin);

router.get('/metrics', getAdminMetrics);
router.get('/tickets', getAdminTicketQueue);
router.get('/tickets/:id', getAdminTicketDetail);
router.patch('/tickets/:id/status', validate(updateStatusSchema), updateTicketStatus);
router.patch('/tickets/:id/category', validate(overrideCategorySchema), overrideTicketCategory);
router.patch('/tickets/:id/priority', validate(overridePrioritySchema), overrideTicketPriority);
router.patch('/tickets/:id/assign', validate(assignTicketSchema), assignTicket);
router.post('/tickets/:id/notes', validate(addInternalNoteSchema), addInternalNote);
router.post('/tickets/:id/messages', validate(addMessageSchema), sendAdminReply);
router.post('/tickets/:id/ai-draft', generateAiDraft);
router.get('/admins', getAdminList);

export default router;
