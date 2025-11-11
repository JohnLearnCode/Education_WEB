import { Router } from 'express';
import * as enrollmentController from '../controller/enrollment.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  enrollCourseSchema,
  markLectureCompletedSchema
} from '../validator/enrollment.js';

const router: Router = Router();

// Student routes (authenticated)
router.post(
  '/enroll',
  authenticateToken,
  validateBody(enrollCourseSchema),
  enrollmentController.enrollCourse
);

router.get(
  '/enrollment/:id',
  authenticateToken,
  enrollmentController.getEnrollmentById
);

router.get(
  '/my-enrollments',
  authenticateToken,
  enrollmentController.getMyEnrollments
);

router.get(
  '/course/:courseId/my-enrollment',
  authenticateToken,
  enrollmentController.getMyEnrollmentByCourse
);

router.post(
  '/complete-lecture',
  authenticateToken,
  validateBody(markLectureCompletedSchema),
  enrollmentController.markLectureCompleted
);

router.get(
  '/enrollment/:enrollmentId/progress',
  authenticateToken,
  enrollmentController.getProgressSummary
);

router.get(
  '/my-completed-courses',
  authenticateToken,
  enrollmentController.getMyCompletedCourses
);

router.delete(
  '/enrollment/:id',
  authenticateToken,
  enrollmentController.deleteEnrollment
);

// Instructor routes (protected)
router.get(
  '/course/:courseId/enrollments',
  authenticateToken,
  requireInstructor,
  enrollmentController.getEnrollmentsByCourseId
);

export default router;
