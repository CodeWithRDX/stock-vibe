import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import User from '../modules/users/user.model.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fall back to cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new UnauthorizedError('You are not logged in. Please log in to get access.'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123!@#');

    // Check if user still exists
    const currentUser = await User.findById(decoded.id).select('-passwordHash');
    if (!currentUser) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists.'));
    }

    // Grant access
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};

export const optionalProtect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123!@#');
      const currentUser = await User.findById(decoded.id).select('-passwordHash');
      if (currentUser) {
        req.user = currentUser;
      }
    }
    next();
  } catch (error) {
    // Gracefully proceed on token expiry/errors for optional auth
    next();
  }
};
