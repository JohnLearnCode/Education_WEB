import { Router } from 'express';
import * as wishlistController from '../controller/wishlist.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { addToWishlistSchema, removeFromWishlistSchema } from '../validator/wishlist.js';

const router: Router = Router();

router.get(
  '/my',
  authenticateToken,
  wishlistController.getMyWishlist
);

router.post(
  '/add',
  authenticateToken,
  validateBody(addToWishlistSchema),
  wishlistController.addToWishlist
);

router.post(
  '/remove',
  authenticateToken,
  validateBody(removeFromWishlistSchema),
  wishlistController.removeFromWishlist
);

router.post(
  '/move-to-cart',
  authenticateToken,
  validateBody(addToWishlistSchema),
  wishlistController.moveToCart
);

export default router;
