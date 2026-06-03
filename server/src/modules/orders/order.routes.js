import { Router } from 'express';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus } from './order.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { validate } from '../../middleware/validator.js';
import { createOrderSchema, updateOrderStatusSchema } from '../../validations/schemas.js';

const router = Router();

router.use(protect);

router.post('/', validate({ body: createOrderSchema }), createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', restrictTo('Admin'), validate({ body: updateOrderStatusSchema }), updateOrderStatus);

export default router;
