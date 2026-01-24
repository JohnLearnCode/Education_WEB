import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { validateCouponSchema } from '../validator/coupon.js';
import * as couponController from '../controller/coupon.js';

const router = Router();

// Public route for coupon validation (requires auth but not admin)
router.post('/coupons/validate', authenticateToken, validateBody(validateCouponSchema), couponController.validateCoupon);

export default router;
