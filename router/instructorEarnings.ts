import { Router } from 'express';
import * as instructorEarningsController from '../controller/instructorEarnings.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';
import {
  createInstructorEarningsSchema,
  updateEarningStatusSchema,
  instructorEarningsQuerySchema
} from '../validator/instructorEarnings.js';

const router: Router = Router();

router.post(
  '/',
  authenticateToken,
  validateBody(createInstructorEarningsSchema),
  instructorEarningsController.createEarning
);

router.get(
  '/my/earnings',
  authenticateToken,
  requireInstructor,
  validateQuery(instructorEarningsQuerySchema),
  instructorEarningsController.getMyEarnings
);

router.get(
  '/my/summary',
  authenticateToken,
  requireInstructor,
  instructorEarningsController.getMyEarningsSummary
);

router.get(
  '/:id',
  authenticateToken,
  instructorEarningsController.getEarningById
);

router.put(
  '/:id',
  authenticateToken,
  requireInstructor,
  validateBody(updateEarningStatusSchema),
  instructorEarningsController.updateEarningStatus
);

router.delete(
  '/:id',
  authenticateToken,
  requireInstructor,
  instructorEarningsController.deleteEarning
);

export default router;
