import logger from '../config/logger.js';
import { sendError } from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error stack locally, or standard info in production
  if (err.statusCode >= 500) {
    logger.error(`${err.message} \nStack: ${err.stack}`);
  } else {
    logger.warn(`Request warning [${req.method} ${req.originalUrl}]: ${err.message}`);
  }

  // Handle specific MongoDB errors
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || 'Unknown field';
    return sendError(res, 409, `Duplicate value: ${value}. Please use another value!`);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((el) => el.message);
    return sendError(res, 400, `Invalid input data: ${messages.join('. ')}`);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Your session token has expired. Please log in again.');
  }

  // Handle Zod validation errors
  if (err.issues) {
    const errorDetails = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return sendError(res, 400, 'Validation failed', errorDetails);
  }

  // Operational error (known, thrown via AppError)
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message);
  }

  // Generic Programming / Unknown error
  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong on our side' : err.message;
  return sendError(res, err.statusCode, message);
};

export default errorHandler;
