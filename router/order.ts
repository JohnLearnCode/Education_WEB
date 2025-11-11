import { Router } from 'express';
import * as orderController from '../controller/order.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  createOrderSchema,
  updateOrderStatusSchema
} from '../validator/order.js';

const router: Router = Router();

// All routes require authentication
router.post(
  '/',
  authenticateToken,
  validateBody(createOrderSchema),
  orderController.createOrder
);

router.get(
  '/my-orders',
  authenticateToken,
  orderController.getMyOrders
);

router.get(
  '/order/:id',
  authenticateToken,
  orderController.getOrderById
);

router.put(
  '/order/:id/status',
  authenticateToken,
  validateBody(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

router.get(
  '/order/:id/summary',
  authenticateToken,
  orderController.getOrderSummary
);

router.get(
  '/check-purchase/:courseId',
  authenticateToken,
  orderController.checkCoursePurchase
);

router.get(
  '/my-purchased-courses',
  authenticateToken,
  orderController.getMyPurchasedCourses
);

export default router;
