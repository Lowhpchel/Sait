import express from 'express';
import {
  getServices,
  getServiceById,
  getCategories,
  getPopularServices
} from '../controllers/serviceController.js';

const router = express.Router();

// Статические маршруты (без параметров)
router.get('/popular', getPopularServices);
router.get('/categories/all', getCategories);

// Динамические маршруты
router.get('/', getServices);
router.get('/:id', getServiceById);

export default router;