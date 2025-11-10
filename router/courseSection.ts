import { Router } from 'express';
import * as courseSectionController from '../controller/courseSection.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createCourseSectionSchema,
  updateCourseSectionSchema,
  reorderSectionsSchema
} from '../validator/courseSection.js';

const router: Router = Router();

// Public routes
router.get(
  '/section/:id',
  courseSectionController.getCourseSectionById
);

router.get(
  '/course/:courseId/sections',
  courseSectionController.getSectionsByCourseId
);

// Instructor routes (protected)
router.post(
  '/',
  authenticateToken,
  requireInstructor,
  validateBody(createCourseSectionSchema),
  courseSectionController.createCourseSection
);

router.put(
  '/section/:id',
  authenticateToken,
  requireInstructor,
  validateBody(updateCourseSectionSchema),
  courseSectionController.updateCourseSection
);

router.delete(
  '/section/:id',
  authenticateToken,
  requireInstructor,
  courseSectionController.deleteCourseSection
);

router.post(
  '/reorder',
  authenticateToken,
  requireInstructor,
  validateBody(reorderSectionsSchema),
  courseSectionController.reorderSections
);

router.get(
  '/course/:courseId/next-order',
  authenticateToken,
  requireInstructor,
  courseSectionController.getNextOrderNumber
);

export default router;
