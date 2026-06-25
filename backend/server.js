import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Task Manager API is running 🚀', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 TaskFlow API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
      users: '/api/users',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;