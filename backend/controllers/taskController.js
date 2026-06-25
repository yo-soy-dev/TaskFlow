import Task from '../models/Task.js';
import { sendResponse, sendError } from '../utils/response.js';

// @desc    Get all tasks (with search, filter, pagination)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      assignedTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Employees can only see their own tasks
    if (req.user.role === 'employee') {
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email avatar department')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Tasks fetched successfully.', { tasks }, {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar department')
      .populate('createdBy', 'name email');

    if (!task) return sendError(res, 404, 'Task not found.');

    if (
      req.user.role === 'employee' &&
      String(task.assignedTo?._id) !== String(req.user._id) &&
      String(task.createdBy._id) !== String(req.user._id)
    ) {
      return sendError(res, 403, 'Access denied.');
    }

    return sendResponse(res, 200, true, 'Task fetched successfully.', { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Admin)
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      tags: tags || [],
    });

    await task.populate('assignedTo', 'name email avatar department');
    await task.populate('createdBy', 'name email');

    return sendResponse(res, 201, true, 'Task created successfully.', { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found.');

    if (req.user.role === 'employee') {
      if (String(task.assignedTo) !== String(req.user._id)) {
        return sendError(res, 403, 'Access denied.');
      }
      const { status } = req.body;
      task.status = status || task.status;
      await task.save();
    } else {
      const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;
      task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, status, priority, assignedTo, dueDate, tags },
        { new: true, runValidators: true }
      );
    }

    await task.populate('assignedTo', 'name email avatar department');
    await task.populate('createdBy', 'name email');

    return sendResponse(res, 200, true, 'Task updated successfully.', { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found.');

    return sendResponse(res, 200, true, 'Task deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const matchStage =
      req.user.role === 'employee'
        ? { $match: { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] } }
        : { $match: {} };

    const [statusStats, priorityStats, totalTasks, overdueTasks] = await Promise.all([
      Task.aggregate([matchStage, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([matchStage, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments(req.user.role === 'employee' ? {
        $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
      } : {}),
      Task.countDocuments({
        ...(req.user.role === 'employee' ? {
          $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
        } : {}),
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
    ]);

    const statusMap = {};
    statusStats.forEach(({ _id, count }) => { statusMap[_id] = count; });

    const priorityMap = {};
    priorityStats.forEach(({ _id, count }) => { priorityMap[_id] = count; });

    return sendResponse(res, 200, true, 'Statistics fetched.', {
      stats: {
        total: totalTasks,
        overdue: overdueTasks,
        byStatus: {
          todo: statusMap['todo'] || 0,
          'in-progress': statusMap['in-progress'] || 0,
          review: statusMap['review'] || 0,
          completed: statusMap['completed'] || 0,
        },
        byPriority: {
          low: priorityMap['low'] || 0,
          medium: priorityMap['medium'] || 0,
          high: priorityMap['high'] || 0,
          critical: priorityMap['critical'] || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats };