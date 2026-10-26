import express from 'express';
import authRoutes from './authRoutes.js';
import bookRoutes from './bookRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', bookRoutes);
router.use('/', ticketRoutes);
router.use('/admin', adminRoutes);

export default router;
