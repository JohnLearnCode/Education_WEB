import { Router } from 'express';
import * as courseReviewController from '../controller/courseReview.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  createCourseReviewSchema,
  updateCourseReviewSchema,
  courseReviewQuerySchema
} from '../validator/courseReview.js';

const router: Router = Router();

// Instructor review statistics (must be before /:id routes)
router.get(
  '/instructor/stats',
  authenticateToken,
  courseReviewController.getInstructorReviewStats
);

// Instructor: get reviews for a specific course
router.get(
  '/instructor/course/:courseId',
  authenticateToken,
  validateQuery(courseReviewQuerySchema),
  courseReviewController.getInstructorCourseReviews as any
);

router.get(
  '/course/:courseId',
  validateQuery(courseReviewQuerySchema),
  courseReviewController.getCourseReviews as any
);

router.post(
  '/',
  authenticateToken,
  validateBody(createCourseReviewSchema),
  courseReviewController.createCourseReview
);

router.put(
  '/:id',
  authenticateToken,
  validateBody(updateCourseReviewSchema),
  courseReviewController.updateCourseReview
);

router.delete(
  '/:id',
  authenticateToken,
  courseReviewController.deleteCourseReview
);

export default router;
