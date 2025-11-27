import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import * as adminOrdersController from '../controller/adminOrders';

const router = Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

router.get('/', adminOrdersController.getAllOrders);
router.get('/stats', adminOrdersController.getOrdersStats);
router.get('/:orderId', adminOrdersController.getOrderById);
router.patch('/:orderId/status', adminOrdersController.updateOrderStatus);

export default router;
