import Task from "../models/Task.js";
import { sendResponse, sendError } from "../utils/response.js";
import {
  logActivity,
  createNotification,
} from "../utils/activity.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

import https from 'https';
import http from 'http';

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      resolve(res);
    }).on('error', reject);
  });
};


// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, category, assignedTo, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (req.user.role === 'employee') {
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }
    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email avatar department')
        .populate('createdBy', 'name email')
        .sort(sortOptions).skip(skip).limit(limitNum),
      Task.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Tasks fetched successfully.', { tasks }, {
      total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum,
    });
  } catch (error) { next(error); }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar department')
      .populate('createdBy', 'name email')
      .populate('attachments.uploadedBy', 'name');

    if (!task) return sendError(res, 404, 'Task not found.');
    if (req.user.role === 'employee' && String(task.assignedTo?._id) !== String(req.user._id) && String(task.createdBy._id) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied.');
    }
    return sendResponse(res, 200, true, 'Task fetched.', { task });
  } catch (error) { next(error); }
};

// @desc    Create task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, category, progress, assignedTo, dueDate, tags } = req.body;
    const task = await Task.create({
      title, description, status, priority,
      category: category || 'general',
      progress: progress || 0,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      tags: tags || [],
    });

    await task.populate('assignedTo', 'name email avatar department');
    await task.populate('createdBy', 'name email');

    await logActivity(req.user._id, 'task_created', 'task', task._id, task.title);

    if (assignedTo && assignedTo !== String(req.user._id)) {
      await createNotification(
        assignedTo, req.user._id, 'task_assigned',
        'New Task Assigned',
        `${req.user.name} assigned you a task: "${task.title}"`,
        task._id, '/tasks'
      );
    }

    return sendResponse(res, 201, true, 'Task created successfully.', { task });
  } catch (error) { next(error); }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found.');

    const oldStatus = task.status;
    const oldAssignedTo = String(task.assignedTo || '');

    if (req.user.role === 'employee') {
      if (String(task.assignedTo) !== String(req.user._id)) return sendError(res, 403, 'Access denied.');
      const { status, progress } = req.body;
      if (status) task.status = status;
      if (progress !== undefined) task.progress = progress;
      await task.save();
    } else {
      const { title, description, status, priority, category, progress, assignedTo, dueDate, tags } = req.body;
      task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, status, priority, category, progress, assignedTo, dueDate, tags },
        { new: true, runValidators: true }
      );
    }

    await task.populate('assignedTo', 'name email avatar department');
    await task.populate('createdBy', 'name email');

    // Log activity
    if (task.status !== oldStatus) {
      await logActivity(req.user._id, 'task_status_changed', 'task', task._id, task.title, { from: oldStatus, to: task.status });
    } else {
      await logActivity(req.user._id, 'task_updated', 'task', task._id, task.title);
    }

    // Notify if newly assigned
    const newAssignedTo = String(task.assignedTo?._id || '');
    if (newAssignedTo && newAssignedTo !== oldAssignedTo) {
      await createNotification(
        newAssignedTo, req.user._id, 'task_assigned',
        'Task Assigned to You',
        `${req.user.name} assigned you: "${task.title}"`,
        task._id
      );
    }

    // Notify assignee of update
    if (task.assignedTo && String(task.assignedTo._id) !== String(req.user._id)) {
      await createNotification(
        task.assignedTo._id, req.user._id, 'task_updated',
        'Task Updated',
        `"${task.title}" was updated by ${req.user.name}`,
        task._id
      );
    }

    return sendResponse(res, 200, true, 'Task updated successfully.', { task });
  } catch (error) { next(error); }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found.');

    // Delete cloudinary attachments
    if (task.attachments?.length > 0) {
      await Promise.all(task.attachments.map(a => deleteFromCloudinary(a.publicId)));
    }

    await task.deleteOne();
    await logActivity(req.user._id, 'task_deleted', 'task', task._id, task.title);

    return sendResponse(res, 200, true, 'Task deleted successfully.');
  } catch (error) { next(error); }
};

// @desc    Get task stats
// @route   GET /api/tasks/stats
const getTaskStats = async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'employee'
      ? { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] }
      : {};

    const [statusStats, priorityStats, categoryStats, totalTasks, overdueTasks] = await Promise.all([
      Task.aggregate([{ $match: matchQuery }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: matchQuery }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: matchQuery }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
      Task.countDocuments(matchQuery),
      Task.countDocuments({ ...matchQuery, dueDate: { $lt: new Date() }, status: { $ne: 'completed' } }),
    ]);

    const toMap = (arr) => arr.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

    return sendResponse(res, 200, true, 'Stats fetched.', {
      stats: {
        total: totalTasks,
        overdue: overdueTasks,
        byStatus: { todo: 0, 'in-progress': 0, review: 0, completed: 0, ...toMap(statusStats) },
        byPriority: { low: 0, medium: 0, high: 0, critical: 0, ...toMap(priorityStats) },
        byCategory: toMap(categoryStats),
      },
    });
  } catch (error) { next(error); }
};

// @desc    Upload attachment to task
// @route   POST /api/tasks/:id/attachments
const uploadAttachment = async (req, res, next) => {
  try {
    console.log(req.file);
    if (!req.file) return sendError(res, 400, 'No file uploaded.');
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found.');

    const result = await uploadToCloudinary(req.file.buffer, 'taskflow/attachments', req.file.originalname, req.file.mimetype);
    console.log(result);

    const attachment = {
      filename: result.public_id,
      originalName: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id,
    };

    task.attachments.push(attachment);
    await task.save();

    const savedAttachment = task.attachments[task.attachments.length - 1];

    await logActivity(req.user._id, 'task_attachment_added', 'task', task._id, task.title, { file: req.file.originalname });

    // return sendResponse(res, 200, true, 'File uploaded successfully.', { attachment });
    return sendResponse(res, 200, true, 'File uploaded successfully.', { attachment: savedAttachment });
  } catch (error) {
    console.error("UPLOAD ERROR:");
    console.error(error);
    if (error.http_code) {
      console.error("HTTP CODE:", error.http_code);
    }

    if (error.message) {
      console.error("MESSAGE:", error.message);
    }
    next(error); }
};

// @desc    Delete attachment
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
const deleteAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found.');

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) return sendError(res, 404, 'Attachment not found.');

    await deleteFromCloudinary(attachment.publicId);
    attachment.deleteOne();
    await task.save();

    return sendResponse(res, 200, true, 'Attachment deleted.');
  } catch (error) { next(error); }
};

// @desc    Export tasks as CSV data
// @route   GET /api/tasks/export
const exportTasks = async (req, res, next) => {
  try {
    const query = req.user.role === 'employee'
      ? { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] }
      : {};

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const rows = [
      ['Title', 'Status', 'Priority', 'Category', 'Progress', 'Assigned To', 'Created By', 'Due Date', 'Tags', 'Created At'],
      ...tasks.map(t => [
        `"${t.title}"`,
        t.status,
        t.priority,
        t.category,
        `${t.progress}%`,
        t.assignedTo?.name || 'Unassigned',
        t.createdBy?.name || '',
        t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
        `"${(t.tags || []).join(', ')}"`,
        new Date(t.createdAt).toLocaleDateString(),
      ]),
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks_export.csv');
    return res.send(csv);
  } catch (error) { next(error); }
};

const downloadAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found.');

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) return sendError(res, 404, 'Attachment not found.');

    // const response = await fetch(attachment.url);
    // if (!response.ok) return sendError(res, 502, 'Could not fetch file.');

    const fileUrl = attachment.url.replace('http://', 'https://');
    const fileRes = await fetchUrl(fileUrl);

    let filename = attachment.originalName || 'download';
    if (attachment.mimetype === 'application/pdf' && !filename.endsWith('.pdf')) {
      filename += '.pdf';
    }

    res.setHeader('Content-Type', attachment.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);

    // const reader = response.body.getReader();
    // const stream = new ReadableStream({
    //   start(controller) {
    //     function push() {
    //       reader.read().then(({ done, value }) => {
    //         if (done) { controller.close(); return; }
    //         controller.enqueue(value);
    //         push();
    //       });
    //     }
    //     push();
    //   }
    // });

    // const { Readable } = await import('stream');
    // const nodeStream = Readable.fromWeb(stream);
    // nodeStream.pipe(res);
     fileRes.pipe(res);
  } catch (error) { next(error); }
};

const openAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, 'Task not found.');

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) return sendError(res, 404, 'Attachment not found.');

    // const response = await fetch(attachment.url);
    // if (!response.ok) return sendError(res, 502, 'Could not fetch file.');

    const fileUrl = attachment.url.replace('http://', 'https://');
    const fileRes = await fetchUrl(fileUrl);

    res.setHeader('Content-Type', attachment.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);

    // const { Readable } = await import('stream');
    // Readable.fromWeb(response.body).pipe(res);
    fileRes.pipe(res);
  } catch (error) { next(error); }
};




export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  uploadAttachment,
  deleteAttachment,
  exportTasks,
  downloadAttachment, 
  openAttachment,
};