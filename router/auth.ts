import { Router } from 'express';
import * as authController from '../controller/auth.js';
import * as googleAuthController from '../controller/googleAuth.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  authRegisterSchema,
  authLoginSchema
} from '../validator/auth.js';
import passport from '../config/passport.js';

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

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure',
    session: false 
  }),
  googleAuthController.googleAuthCallback
);

router.get(
  '/google/failure',
  googleAuthController.googleAuthFailure
);

export default router;