import { Router } from 'express';
import * as quizQuestionController from '../controller/quizQuestion.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createQuizQuestionSchema,
  updateQuizQuestionSchema,
  reorderQuestionsSchema
} from '../validator/quizQuestion.js';

const router: Router = Router();

// Public routes
router.get(
  '/question/:id',
  quizQuestionController.getQuizQuestionById
);

router.get(
  '/quiz/:quizId/questions',
  quizQuestionController.getQuestionsByQuizId
);

// Instructor routes (protected)
router.post(
  '/',
  authenticateToken,
  requireInstructor,
  validateBody(createQuizQuestionSchema),
  quizQuestionController.createQuizQuestion
);

router.put(
  '/question/:id',
  authenticateToken,
  requireInstructor,
  validateBody(updateQuizQuestionSchema),
  quizQuestionController.updateQuizQuestion
);

router.delete(
  '/question/:id',
  authenticateToken,
  requireInstructor,
  quizQuestionController.deleteQuizQuestion
);

router.post(
  '/reorder',
  authenticateToken,
  requireInstructor,
  validateBody(reorderQuestionsSchema),
  quizQuestionController.reorderQuestions
);

router.get(
  '/quiz/:quizId/next-order',
  authenticateToken,
  requireInstructor,
  quizQuestionController.getNextOrderNumber
);

export default router;
