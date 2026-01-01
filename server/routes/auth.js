import express from 'express';
import { signup, login, verifyToken, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateSignup, validateAge } from '../middleware/validation.js';

const router = express.Router();

router.post('/signup', validateSignup, validateAge, signup);
router.post('/login', login);
router.get('/verify', protect, verifyToken);
router.post('/logout', logout);

export default router;
