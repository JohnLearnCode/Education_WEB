import { Router } from 'express';
import * as categoryController from '../controller/category.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createCategorySchema,
  updateCategorySchema
} from '../validator/category.js';

const router: Router = Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Instructor routes (protected)
router.post(
  '/',
  authenticateToken,
  requireInstructor,
  validateBody(createCategorySchema),
  categoryController.createCategory
);

router.put(
  '/:id',
  authenticateToken,
  requireInstructor,
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authenticateToken,
  requireInstructor,
  categoryController.deleteCategory
);

export default router;
