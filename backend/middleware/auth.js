import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'Token is invalid. User not found.');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Your account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please login again.');
    }
    return sendError(res, 500, 'Server error during authentication.');
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admin privileges required.');
  }
  next();
};

const adminOrOwner = (field = 'assignedTo') => (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.resource && String(req.resource[field]) === String(req.user._id)) return next();
  return sendError(res, 403, 'Access denied. You do not have permission for this action.');
};

export { protect, adminOnly, adminOrOwner };