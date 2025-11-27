import { Router } from 'express';
import * as answerController from '../controller/answer.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createAnswerSchema,
  updateAnswerSchema,
  bulkCreateAnswersSchema
} from '../validator/answer.js';

const router: Router = Router();

// Get answer by ID (public)
router.get(
  '/:id',
  answerController.getAnswerById
);

// Create answer (instructor only)
router.post(
  '/',
  authenticateToken,
  requireInstructor,
  validateBody(createAnswerSchema),
  answerController.createAnswer
);

// Bulk create answers (instructor only)
router.post(
  '/bulk',
  authenticateToken,
  requireInstructor,
  validateBody(bulkCreateAnswersSchema),
  answerController.bulkCreateAnswers
);

// Update answer (instructor only)
router.put(
  '/:id',
  authenticateToken,
  requireInstructor,
  validateBody(updateAnswerSchema),
  answerController.updateAnswer
);

// Delete answer (instructor only)
router.delete(
  '/:id',
  authenticateToken,
  requireInstructor,
  answerController.deleteAnswer
);

export default router;
