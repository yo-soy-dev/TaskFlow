import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getTaskStats);

router.get('/', getTasks);
router.get('/:id', getTask);

router.post(
  '/',
  adminOnly,
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters.'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description max 1000 chars.'),
    body('status').optional().isIn(['todo', 'in-progress', 'review', 'completed']).withMessage('Invalid status.'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority.'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format.'),
  ],
  validate,
  createTask
);

router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 chars.'),
    body('status').optional().isIn(['todo', 'in-progress', 'review', 'completed']).withMessage('Invalid status.'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority.'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format.'),
  ],
  validate,
  updateTask
);

router.delete('/:id', adminOnly, deleteTask);

export default router;