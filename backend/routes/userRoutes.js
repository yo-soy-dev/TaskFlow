import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserTasks,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getUsers);
router.get('/:id', getUser);
router.get('/:id/tasks', getUserTasks);

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
    body('email').isEmail().withMessage('Please provide a valid email.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('role').isIn(['admin', 'employee']).withMessage('Role must be admin or employee.'),
  ],
  validate,
  createUser
);

router.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 chars.'),
    body('email').optional().isEmail().withMessage('Valid email required.'),
    body('role').optional().isIn(['admin', 'employee']).withMessage('Invalid role.'),
  ],
  validate,
  updateUser
);

router.delete('/:id', deleteUser);

export default router;