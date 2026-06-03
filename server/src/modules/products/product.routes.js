import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  createProduct,
  updateProduct,
  getProductById,
  getAllProducts,
} from './product.controller.js';
import { protect, restrictTo, optionalProtect } from '../../middleware/auth.js';
import { validate } from '../../middleware/validator.js';
import {
  createCategorySchema,
  createProductSchema,
  updateProductSchema,
} from '../../validations/schemas.js';

const router = Router();

// Category Endpoints
router.post('/categories', protect, restrictTo('Admin'), validate({ body: createCategorySchema }), createCategory);
router.get('/categories', optionalProtect, getAllCategories);

// Product Endpoints
router.post('/', protect, restrictTo('Admin'), validate({ body: createProductSchema }), createProduct);
router.put('/:id', protect, restrictTo('Admin'), validate({ body: updateProductSchema }), updateProduct);
router.get('/:id', optionalProtect, getProductById);
router.get('/', optionalProtect, getAllProducts);

export default router;
