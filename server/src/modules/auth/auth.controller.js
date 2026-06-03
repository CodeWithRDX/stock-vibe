import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../utils/errors.js';
import { sendSuccess } from '../../utils/response.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123!@#',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_key_456!@#',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

  // Access Token Cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  // Refresh Token Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError('Email already in use'));
    }

    const newUser = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'Seller',
    });

    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return sendSuccess(res, 201, 'User registered successfully', userResponse);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return next(new UnauthorizedError('Invalid email or password'));
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    setTokenCookies(res, accessToken, refreshToken);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken, // also returned in body for client storage flexibility
    };

    return sendSuccess(res, 200, 'Login successful', userResponse);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new UnauthorizedError('Refresh token missing'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_key_456!@#');
    } catch (err) {
      return next(new UnauthorizedError('Refresh token expired or invalid'));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    setTokenCookies(res, accessToken, newRefreshToken);

    return sendSuccess(res, 200, 'Token refreshed successfully', {
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userResponse = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };
    return sendSuccess(res, 200, 'Current user profile retrieved', userResponse);
  } catch (error) {
    next(error);
  }
};
