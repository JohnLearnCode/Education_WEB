import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import * as adminComplaintsController from '../controller/adminComplaints';

const router = Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * /api/admin/complaints/stats:
 *   get:
 *     summary: Get complaint statistics
 *     tags: [Admin - Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', adminComplaintsController.getComplaintStats);

/**
 * @swagger
 * /api/admin/complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Admin - Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [course, instructor]
 *         description: Filter by type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, description, user name or email
 *     responses:
 *       200:
 *         description: Complaints retrieved successfully
 */
router.get('/', adminComplaintsController.getAllComplaints);

/**
 * @swagger
 * /api/admin/complaints/{complaintId}:
 *   get:
 *     summary: Get complaint by ID
 *     tags: [Admin - Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint retrieved successfully
 */
router.get('/:complaintId', adminComplaintsController.getComplaintById);

/**
 * @swagger
 * /api/admin/complaints/{complaintId}:
 *   patch:
 *     summary: Update complaint status and response
 *     tags: [Admin - Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, rejected]
 *               adminResponse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 */
router.patch('/:complaintId', adminComplaintsController.updateComplaint);

/**
 * @swagger
 * /api/admin/complaints/{complaintId}:
 *   delete:
 *     summary: Delete complaint
 *     tags: [Admin - Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 */
router.delete('/:complaintId', adminComplaintsController.deleteComplaint);

export default router;
