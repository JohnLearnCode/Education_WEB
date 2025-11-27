import { Router } from 'express';
import * as quizAttemptController from '../controller/quizAttempt.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import { submitQuizAttemptSchema } from '../validator/quizAttempt.js';

const router: Router = Router();

// Student routes (authenticated)
router.post(
  '/submit',
  authenticateToken,
  validateBody(submitQuizAttemptSchema),
  quizAttemptController.submitQuizAttempt
);

router.get(
  '/attempt/:id',
  authenticateToken,
  quizAttemptController.getQuizAttemptById
);

router.get(
  '/my-attempts',
  authenticateToken,
  quizAttemptController.getMyAttempts
);

router.get(
  '/quiz/:quizId/my-attempts',
  authenticateToken,
  quizAttemptController.getMyAttemptsByQuiz
);

router.get(
  '/quiz/:quizId/my-best',
  authenticateToken,
  quizAttemptController.getMyBestAttempt
);

router.get(
  '/course/:courseId/my-attempts',
  authenticateToken,
  quizAttemptController.getMyAttemptsByCourse
);

// Instructor routes (protected)
router.get(
  '/quiz/:quizId/all-attempts',
  authenticateToken,
  requireInstructor,
  quizAttemptController.getAttemptsByQuizId
);

router.get(
  '/course/:courseId/all-attempts',
  authenticateToken,
  requireInstructor,
  quizAttemptController.getAttemptsByCourseId
);

export default router;
