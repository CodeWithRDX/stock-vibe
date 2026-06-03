import { Router } from 'express';
import { createQuotation, getAllQuotations, getQuotationById } from './quotation.controller.js';
import { protect } from '../../middleware/auth.js';
import { validate } from '../../middleware/validator.js';
import { createQuotationSchema } from '../../validations/schemas.js';

const router = Router();

router.use(protect);

router.post('/', validate({ body: createQuotationSchema }), createQuotation);
router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);

export default router;
