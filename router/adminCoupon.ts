import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validateBody } from '../middleware/validation.js';
import { createCouponSchema, updateCouponSchema } from '../validator/coupon.js';
import * as couponController from '../controller/coupon.js';

const router = Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', validateBody(createCouponSchema), couponController.createCoupon);
router.put('/:id', validateBody(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.get('/:id/usages', couponController.getCouponUsages);

export default router;
