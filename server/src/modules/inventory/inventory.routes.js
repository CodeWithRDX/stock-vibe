import { Router } from 'express';
import { adjustInventory, getTransactions } from './inventory.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { validate } from '../../middleware/validator.js';
import { adjustInventorySchema } from '../../validations/schemas.js';

const router = Router();

// Protect all endpoints, restrict to Admin role
router.use(protect);
router.use(restrictTo('Admin'));

router.post('/adjust/:productId', validate({ body: adjustInventorySchema }), adjustInventory);
router.get('/transactions', getTransactions);

export default router;
