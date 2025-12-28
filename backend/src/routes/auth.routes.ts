import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { logout, register, login, getMe, addBalance } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/add-balance', protect, addBalance);

export const authRoutes = router;
