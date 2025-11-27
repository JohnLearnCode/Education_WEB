import { Router } from 'express';
import * as quizQuestionController from '../controller/quizQuestion.js';
import { validateBody } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createQuizQuestionSchema,
  updateQuizQuestionSchema
} from '../validator/quizQuestion.js';
import { uploadSingleSpreadsheet } from '../middleware/uploadMiddleware.js';

const router: Router = Router();

// Public routes
router.get(
  '/question/:id',
  quizQuestionController.getQuizQuestionById
);

// Get questions for instructor (with correct answers)
router.get(
  '/quiz/:quizId/questions',
  quizQuestionController.getQuestionsByQuizId
);

// Get questions for student (without correct answers)
router.get(
  '/quiz/:quizId/questions/student',
  quizQuestionController.getQuestionsByQuizIdForStudent
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

// Import questions from CSV/XLSX file
router.post(
  '/quiz/:quizId/import',
  authenticateToken,
  requireInstructor,
  uploadSingleSpreadsheet('file'),
  quizQuestionController.importQuestions
);

// Download import template
router.get(
  '/import-template',
  quizQuestionController.downloadImportTemplate
);

// Preview import (parse file without saving)
router.post(
  '/preview-import',
  authenticateToken,
  requireInstructor,
  uploadSingleSpreadsheet('file'),
  quizQuestionController.previewImport
);

// Export questions to XLSX
router.get(
  '/quiz/:quizId/export',
  authenticateToken,
  requireInstructor,
  quizQuestionController.exportQuestions
);

export default router;
