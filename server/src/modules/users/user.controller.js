import User from './user.model.js';
import { sendSuccess } from '../../utils/response.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};
