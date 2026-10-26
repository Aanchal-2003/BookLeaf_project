import express from 'express';
import { getAuthorBooks, getBookById, getAuthorDashboardSummary } from '../controllers/bookController.js';
import { requireAuth, requireAuthor } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard/summary', requireAuth, requireAuthor, getAuthorDashboardSummary);
router.get('/books', requireAuth, requireAuthor, getAuthorBooks);
router.get('/books/:id', requireAuth, getBookById);

export default router;
