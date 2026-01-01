import express from 'express';
import {
  getModules,
  getModuleById,
  startModule,
  completeModule,
  getUserProgress,
} from '../controllers/moduleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getModules);
router.get('/:id', protect, getModuleById);
router.post('/:id/start', protect, startModule);
router.post('/:id/complete', protect, completeModule);
router.get('/:id/progress', protect, getUserProgress);

export default router;
