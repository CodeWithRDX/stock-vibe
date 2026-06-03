import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import productRoutes from './modules/products/product.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import quotationRoutes from './modules/quotations/quotation.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

import errorHandler from './middleware/error.js';
import { sendSuccess } from './utils/response.js';

const app = express();

// Security Middlewares
app.use(helmet());

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});
app.use('/api/', apiLimiter);

// Status route
app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'Server health check passed', {
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Routing Registry
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback for unhandled routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
