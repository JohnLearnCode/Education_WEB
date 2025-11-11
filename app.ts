import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Import configurations
import { connectDB, closeDB } from './config/database.js';

// Import routes
import authRoutes from './router/auth.js';
import categoryRoutes from './router/category.js';
import courseRoutes from './router/course.js';
import courseSectionRoutes from './router/courseSection.js';
import lectureRoutes from './router/lecture.js';
import quizRoutes from './router/quiz.js';
import quizQuestionRoutes from './router/quizQuestion.js';
import quizAttemptRoutes from './router/quizAttempt.js';
import enrollmentRoutes from './router/enrollment.js';
import orderRoutes from './router/order.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { ResponseHelper } from './utils/response.js';




/**
 * Express Application - EVCare Backend
 */

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  return ResponseHelper.success(res, 'Server is running', {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-sections', courseSectionRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-questions', quizQuestionRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Start server với MongoDB connection
 */
const startServer = async () => {
  try {
    // Kết nối MongoDB trước
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      const protocol = process.env.API_PROTOCOL || 'http';
      const host = process.env.API_HOST || 'localhost';
      const baseUrl = `${protocol}://${host}:${PORT}`;

      console.log(`🚀 Server đang chạy tại ${baseUrl}`);
      console.log(`📚 API Documentation: ${baseUrl}/`);
      console.log(`🔐 Auth API: ${baseUrl}/api/auth`);
      console.log(`👤 User API: ${baseUrl}/api/users`);

    });
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error);
    process.exit(1);
  }
};

// Khởi động server
startServer();

export default app;
