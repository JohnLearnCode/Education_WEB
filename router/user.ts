import { Router } from 'express';
import * as userController from '../controller/user.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { updateUserProfileSchema, userQuerySchema } from '../validator/user.js';

const router: Router = Router();

router.get(
  '/profile',
  authenticateToken,
  userController.getMyProfile
);

router.put(
  '/profile',
  authenticateToken,
  validateBody(updateUserProfileSchema),
  userController.updateMyProfile
);

router.get(
  '/all',
  validateQuery(userQuerySchema),
  userController.getAllUsers
);

router.get(
  '/:id',
  userController.getUserById
);

router.delete(
  '/:id',
  authenticateToken,
  userController.deleteUser
);

export default router;
