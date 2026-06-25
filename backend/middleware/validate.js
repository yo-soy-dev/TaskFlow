import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

const validate = (req, res, next) => {
    console.log('validate called, next type:', typeof next);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 400, messages[0], errors.array());
  }
  next();
};

export { validate };