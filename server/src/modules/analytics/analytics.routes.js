import { Router } from 'express';
import { getAdminAnalytics, getSellerAnalytics } from './analytics.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/admin', restrictTo('Admin'), getAdminAnalytics);
router.get('/seller', restrictTo('Seller'), getSellerAnalytics);

export default router;
