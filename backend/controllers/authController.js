import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendResponse, sendError } from '../utils/response.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    console.log('register hit, body:', req.body);
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email is already registered.');
    }

    const user = await User.create({ name, email, password, role, department });
    const token = generateToken(user._id, user.role);

    return sendResponse(res, 201, true, 'Registration successful.', { user, token });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Your account has been deactivated. Contact an admin.');
    }

    const token = generateToken(user._id, user.role);
    const userObj = user.toJSON();

    return sendResponse(res, 200, true, 'Login successful.', { user: userObj, token });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendResponse(res, 200, true, 'Profile fetched.', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res, next) => {
  try {
    const { name, department, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, avatar },
      { new: true, runValidators: true }
    );
    return sendResponse(res, 200, true, 'Profile updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, true, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

export { register, login, getMe, updateMe, changePassword };