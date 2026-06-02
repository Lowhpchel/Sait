import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getUserOrders,
  addToOrders,
  removeFromOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Маршруты для пользователей
router.get('/my', protect, getUserOrders);
router.post('/add', protect, addToOrders);
router.delete('/:id', protect, removeFromOrders);

// Маршруты для админа и менеджера
router.get('/all', protect, authorize('admin', 'manager'), getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.delete('/admin/:id', protect, authorize('admin', 'manager'), deleteOrder);

export default router;