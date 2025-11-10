import { Router } from 'express';
import * as courseController from '../controller/course.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema
} from '../validator/course.js';

const router: Router = Router();

// Public routes
router.get(
  '/all',
  validateQuery(courseQuerySchema),
  courseController.getAllCourses
);

router.get(
  '/:id',
  courseController.getCourseById
);

// Instructor routes (protected)
router.post(
  '/',
  authenticateToken,
  requireInstructor,
  validateBody(createCourseSchema),
  courseController.createCourse
);

router.get(
  '/my/courses',
  authenticateToken,
  requireInstructor,
  validateQuery(courseQuerySchema),
  courseController.getMyCourses
);

router.put(
  '/:id',
  authenticateToken,
  requireInstructor,
  validateBody(updateCourseSchema),
  courseController.updateCourse
);

router.delete(
  '/:id',
  authenticateToken,
  requireInstructor,
  courseController.deleteCourse
);

export default router;
