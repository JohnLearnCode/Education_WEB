import express from 'express';
import * as adminController from '../controller/admin.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

/**
 * All admin routes require authentication and admin role
 */

// Dashboard routes
router.get('/dashboard', authenticateToken, requireAdmin, adminController.getDashboard);
router.get('/dashboard/stats', authenticateToken, requireAdmin, adminController.getDashboardStats);
router.get('/dashboard/charts', authenticateToken, requireAdmin, adminController.getChartData);

// Individual statistics routes
router.get('/stats/users', authenticateToken, requireAdmin, adminController.getUserStats);
router.get('/stats/courses', authenticateToken, requireAdmin, adminController.getCourseStats);
router.get('/stats/revenue', authenticateToken, requireAdmin, adminController.getRevenueStats);
router.get('/stats/orders', authenticateToken, requireAdmin, adminController.getOrderStats);

export default router;
