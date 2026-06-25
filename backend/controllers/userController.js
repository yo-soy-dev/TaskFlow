import User from '../models/User.js';
import Task from '../models/Task.js';
import { sendResponse, sendError } from '../utils/response.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Users fetched successfully.', { users }, {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found.');

    return sendResponse(res, 200, true, 'User fetched successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (Admin)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 400, 'Email already registered.');

    const user = await User.create({ name, email, password, role, department });
    return sendResponse(res, 201, true, 'User created successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, isActive },
      { new: true, runValidators: true }
    );

    if (!user) return sendError(res, 404, 'User not found.');

    return sendResponse(res, 200, true, 'User updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return sendError(res, 400, 'You cannot delete your own account.');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, 404, 'User not found.');

    await Task.updateMany({ assignedTo: req.params.id }, { assignedTo: null });

    return sendResponse(res, 200, true, 'User deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user task summary
// @route   GET /api/users/:id/tasks
// @access  Admin
const getUserTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.id })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'User tasks fetched.', { tasks });
  } catch (error) {
    next(error);
  }
};

export { getUsers, getUser, createUser, updateUser, deleteUser, getUserTasks };