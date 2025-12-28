import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { protect } from '../middleware/auth.middleware.js';
import { pollRoutes } from './poll.routes.js';
import { userRoutes } from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/polls', pollRoutes);
router.use('/users', protect, userRoutes);

export const apiRoutes = router;
