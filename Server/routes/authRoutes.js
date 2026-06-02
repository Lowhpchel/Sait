import express from 'express';
import { login, register, getMe, getUsers } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты
router.post('/login', login);
router.post('/register', register);

// Защищенные маршруты
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);

export default router;