import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getStats,
  getAllRequests,
  updateRequestStatus,
  deleteRequest,
  createRequest,
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getMonthlyStats,
  getServicesStats,
  getStatusStats,
  getExportData,
  createUser
} from '../controllers/adminController.js';

const router = express.Router();

// Все маршруты требуют авторизации
router.use(protect);

router.get('/stats/monthly', getMonthlyStats);
router.get('/stats/services', getServicesStats);
router.get('/stats/statuses', getStatusStats);
router.get('/export/:type', getExportData);

// ========== ДОСТУПНО ВСЕМ АВТОРИЗОВАННЫМ ==========
// Статистика (админ и менеджер)
router.get('/stats', authorize('admin', 'manager'), getStats);

// Просмотр заявок (админ и менеджер)
router.get('/requests', authorize('admin', 'manager'), getAllRequests);

// Создание заявок (админ и менеджер)
router.post('/requests', authorize('admin', 'manager'), createRequest);

// Изменение статуса заявок (админ и менеджер)
router.put('/requests/:id', authorize('admin', 'manager'), updateRequestStatus);

// Просмотр услуг (админ и менеджер)
router.get('/services', authorize('admin', 'manager'), getAllServicesAdmin);

// Просмотр пользователей (админ и менеджер)
router.get('/users', authorize('admin', 'manager'), getAllUsers);

// ========== ТОЛЬКО ДЛЯ АДМИНА ==========
// Удаление заявок
router.delete('/requests/:id', authorize('admin'), deleteRequest);

// Создание услуг
router.post('/services', authorize('admin'), createService);

// Обновление услуг
router.put('/services/:id', authorize('admin'), updateService);

// Удаление услуг
router.delete('/services/:id', authorize('admin'), deleteService);

// Создание пользователей
router.post('/users', authorize('admin'), createUser);

// Изменение ролей
router.put('/users/:id/role', authorize('admin'), updateUserRole);

// Блокировка/разблокировка
router.put('/users/:id/status', authorize('admin'), toggleUserStatus);

// Удаление пользователей
router.delete('/users/:id', authorize('admin'), deleteUser);



export default router;