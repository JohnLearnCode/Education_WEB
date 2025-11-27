import { Router } from 'express';
import * as cartController from '../controller/cart.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { addToCartSchema, removeFromCartSchema } from '../validator/cart.js';

const router: Router = Router();

router.get(
  '/my',
  authenticateToken,
  cartController.getMyCart
);

router.post(
  '/add',
  authenticateToken,
  validateBody(addToCartSchema),
  cartController.addToCart
);

router.post(
  '/remove',
  authenticateToken,
  validateBody(removeFromCartSchema),
  cartController.removeFromCart
);

export default router;
