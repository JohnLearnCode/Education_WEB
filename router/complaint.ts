import { Router } from 'express';
import * as complaintController from '../controller/complaint';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication

// Get all complaints of current user
router.get(
  '/',
  authenticateToken,
  complaintController.getUserComplaints
);

// Get complaint by ID
router.get(
  '/:complaintId',
  authenticateToken,
  complaintController.getComplaintById
);

// Create a new complaint
router.post(
  '/',
  authenticateToken,
  complaintController.createComplaint
);

// Update complaint
router.put(
  '/:complaintId',
  authenticateToken,
  complaintController.updateComplaint
);

// Delete complaint
router.delete(
  '/:complaintId',
  authenticateToken,
  complaintController.deleteComplaint
);

export default router;
