import { Router } from 'express';
import { getAllUsers } from './user.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = Router();

router.get('/', protect, restrictTo('Admin'), getAllUsers);

export default router;
