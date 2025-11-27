import { Router } from 'express';
import * as uploadController from '../controller/upload.controller.js';
import { uploadSingleImage, uploadSingleVideo, uploadSingleDocument } from '../middleware/uploadMiddleware.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';

const router: Router = Router();

/**
 * @route POST /api/upload/image
 * @desc Upload single image
 * @access Private (authenticated users)
 */
router.post(
  '/image',
  authenticateToken,
  uploadSingleImage('image'),
  uploadController.uploadImageHandler
);

/**
 * @route POST /api/upload/video
 * @desc Upload video for lecture
 * @access Private (instructors only)
 */
router.post(
  '/video',
  authenticateToken,
  requireInstructor,
  uploadSingleVideo('video'),
  uploadController.uploadVideoHandler
);

/**
 * @route POST /api/upload/avatar
 * @desc Upload avatar image
 * @access Private (authenticated users)
 */
router.post(
  '/avatar',
  authenticateToken,
  uploadSingleImage('avatar'),
  uploadController.uploadAvatarHandler
);

/**
 * @route POST /api/upload/file
 * @desc Upload document file (PDF, Word)
 * @access Private (instructors only)
 */
router.post(
  '/file',
  authenticateToken,
  requireInstructor,
  uploadSingleDocument('file'),
  uploadController.uploadFileHandler
);

export default router;
