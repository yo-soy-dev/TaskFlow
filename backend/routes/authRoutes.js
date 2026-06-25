import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, getMe, updateMe, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
    body('email').isEmail().withMessage('Please provide a valid email.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('role').optional().isIn(['admin', 'employee']).withMessage('Role must be admin or employee.'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);
router.put(
  '/me',
  protect,
  [body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.')],
  validate,
  updateMe
);

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
  ],
  validate,
  changePassword
);

export default router;