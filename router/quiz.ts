import { Router } from 'express';
import * as quizController from '../controller/quiz.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createQuizSchema,
  updateQuizSchema
} from '../validator/quiz.js';

const router: Router = Router();

// Public routes
router.get(
  '/quiz/:id',
  quizController.getQuizById
);

router.get(
  '/lecture/:lectureId/quiz',
  quizController.getQuizByLectureId
);

router.get(
  '/course/:courseId/quizzes',
  quizController.getQuizzesByCourseId
);

// Instructor routes (protected)
router.post(
  '/',
  authenticateToken,
  requireInstructor,
  validateBody(createQuizSchema),
  quizController.createQuiz
);

router.put(
  '/quiz/:id',
  authenticateToken,
  requireInstructor,
  validateBody(updateQuizSchema),
  quizController.updateQuiz
);

router.delete(
  '/quiz/:id',
  authenticateToken,
  requireInstructor,
  quizController.deleteQuiz
);

export default router;
