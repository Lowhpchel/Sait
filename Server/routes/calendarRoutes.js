import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/calendarController.js';

const router = express.Router();

// Просмотр доступен всем авторизованным
router.get('/', protect, getEvents);

// Создание, редактирование, удаление - админ и менеджер
router.post('/', protect, authorize('admin', 'manager'), createEvent);
router.put('/:id', protect, authorize('admin', 'manager'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteEvent);

export default router;