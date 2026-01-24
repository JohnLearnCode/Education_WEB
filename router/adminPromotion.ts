import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validateBody } from '../middleware/validation.js';
import { createPromotionSchema, updatePromotionSchema } from '../validator/promotion.js';
import * as promotionController from '../controller/promotion.js';

const router = Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

router.get('/', promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', validateBody(createPromotionSchema), promotionController.createPromotion);
router.put('/:id', validateBody(updatePromotionSchema), promotionController.updatePromotion);
router.delete('/:id', promotionController.deletePromotion);

export default router;
