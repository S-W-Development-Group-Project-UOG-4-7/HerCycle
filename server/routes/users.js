import express from 'express';
import {
  getProfile,
  updateProfile,
  getUserStats,
  getUserModuleProgress,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/stats', protect, getUserStats);
router.get('/progress', protect, getUserModuleProgress);

export default router;
