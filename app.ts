import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import passport from 'passport';

// Import configurations
import { connectDB, closeDB } from './config/database.js';
import swaggerSpec from './config/swagger.js';
import { configurePassport } from './config/passport.js';

// Import routes
import authRoutes from './router/auth.js';
import categoryRoutes from './router/category.js';
import courseRoutes from './router/course.js';
import courseSectionRoutes from './router/courseSection.js';
import lectureRoutes from './router/lecture.js';
import quizRoutes from './router/quiz.js';
import quizQuestionRoutes from './router/quizQuestion.js';
import quizAttemptRoutes from './router/quizAttempt.js';
import answerRoutes from './router/answer.js';
import enrollmentRoutes from './router/enrollment.js';
import orderRoutes from './router/order.js';
import courseReviewRoutes from './router/courseReview.js';
import cartRoutes from './router/cart.js';
import userRoutes from './router/user.js';
import instructorEarningsRoutes from './router/instructorEarnings.js';
import wishlistRoutes from './router/wishlist.js';
import uploadRoutes from './router/upload.js';
import adminRoutes from './router/admin.js';
import adminUsersRoutes from './router/adminUsers.js';
import adminCoursesRoutes from './router/adminCourses.js';
import adminOrdersRoutes from './router/adminOrders.js';
import complaintRoutes from './router/complaint.js';
import adminComplaintsRoutes from './router/adminComplaints.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { ResponseHelper } from './utils/response.js';




/**
 * Express Application - EVCare Backend
 */

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Configure Passport
configurePassport();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/health', (req, res) => {
  return ResponseHelper.success(res, 'Server is running', {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Education Web API Docs'
}));



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-sections', courseSectionRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-questions', quizQuestionRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/course-reviews', courseReviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructor-earnings', instructorEarningsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/courses', adminCoursesRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin/complaints', adminComplaintsRoutes);

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

      console.log(`\n🚀 Server đang chạy tại ${baseUrl}`);
      console.log(`📚 Swagger API Docs: ${baseUrl}/api-docs`);
      console.log(`🏥 Health Check: ${baseUrl}/health`);
      console.log(`🔐 Auth API: ${baseUrl}/api/auth`);
      console.log(`👤 User API: ${baseUrl}/api/users`);
      console.log(`🛒 Cart API: ${baseUrl}/api/cart`);
      console.log(`❤️  Wishlist API: ${baseUrl}/api/wishlist`);
      console.log(`📤 Upload API: ${baseUrl}/api/upload`);
      console.log(`👑 Admin API: ${baseUrl}/api/admin\n`);

    });
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error);
    process.exit(1);
  }
};

// Khởi động server
startServer();

export default app;
