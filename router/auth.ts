import { Router } from 'express';
import * as authController from '../controller/auth.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  authRegisterSchema,
  authLoginSchema
} from '../validator/auth.js';

const router: Router = Router();

// Register
router.post(
  '/register',
  validateBody(authRegisterSchema),
  authController.registerAuth
);

// Login
router.post(
  '/login',
  validateBody(authLoginSchema),
  authController.loginAuth
);

// Refresh Token
router.post(
  '/refresh-token',
  authController.refreshToken
);

// Get Profile (protected route)
router.get(
  '/profile',
  authenticateToken,
  authController.getProfile
);

export default router;