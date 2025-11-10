import { Router } from 'express';
import * as lectureController from '../controller/lecture.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createLectureSchema,
  updateLectureSchema,
  reorderLecturesSchema
} from '../validator/lecture.js';

const router: Router = Router();

// Public routes
router.get(
  '/lecture/:id',
  lectureController.getLectureById
);

router.get(
  '/section/:sectionId/lectures',
  lectureController.getLecturesBySectionId
);

router.get(
  '/course/:courseId/lectures',
  lectureController.getLecturesByCourseId
);

// Instructor routes (protected)
router.post(
  '/',
  authenticateToken,
  requireInstructor,
  validateBody(createLectureSchema),
  lectureController.createLecture
);

router.put(
  '/lecture/:id',
  authenticateToken,
  requireInstructor,
  validateBody(updateLectureSchema),
  lectureController.updateLecture
);

router.delete(
  '/lecture/:id',
  authenticateToken,
  requireInstructor,
  lectureController.deleteLecture
);

router.post(
  '/reorder',
  authenticateToken,
  requireInstructor,
  validateBody(reorderLecturesSchema),
  lectureController.reorderLectures
);

router.get(
  '/section/:sectionId/next-order',
  authenticateToken,
  requireInstructor,
  lectureController.getNextOrderNumber
);

export default router;
