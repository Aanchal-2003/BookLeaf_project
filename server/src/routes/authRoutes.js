import express from 'express';
import { authorLogin, adminLogin, getMe, logout } from '../controllers/authController.js';
import { validate, loginSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/author/login', validate(loginSchema), authorLogin);
router.post('/admin/login', validate(loginSchema), adminLogin);
router.get('/me', getMe);
router.post('/logout', logout);

export default router;
