import { Router } from 'express';
import { register, login, refresh, logout, getMe } from './auth.controller.js';
import { validate } from '../../middleware/validator.js';
import { protect } from '../../middleware/auth.js';
import { registerSchema, loginSchema } from '../../validations/schemas.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
