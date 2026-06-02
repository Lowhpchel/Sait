import express from 'express';
import { createRequest, getRequests } from '../controllers/requestController.js';

const router = express.Router();

router.get('/', getRequests);
router.post('/', createRequest);

export default router;