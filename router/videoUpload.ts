import { Router } from 'express';
import * as videoUploadController from '../controller/videoUpload.controller.js';
import { uploadSingleVideo } from '../middleware/uploadMiddleware.js';
import { authenticateToken, requireInstructor } from '../middleware/auth.js';

const router: Router = Router();

/**
 * @route POST /api/video/upload
 * @desc Upload video for HLS processing
 * @access Private (instructors only)
 */
router.post(
  '/upload',
  authenticateToken,
  requireInstructor,
  uploadSingleVideo('video'),
  videoUploadController.uploadVideoHandler
);

/**
 * @route GET /api/video/status/:jobId
 * @desc Get video processing status
 * @access Private (owner only)
 */
router.get(
  '/status/:jobId',
  authenticateToken,
  videoUploadController.getVideoStatusHandler
);

/**
 * @route GET /api/video/:jobId/hls
 * @desc Get HLS playlist URL
 * @access Private (owner only)
 */
router.get(
  '/:jobId/hls',
  authenticateToken,
  videoUploadController.getVideoHLSHandler
);

/**
 * @route GET /api/video/my-videos
 * @desc Get all videos uploaded by user
 * @access Private (authenticated users)
 */
router.get(
  '/my-videos',
  authenticateToken,
  videoUploadController.getUserVideosHandler
);

/**
 * @route DELETE /api/video/:jobId
 * @desc Delete video job
 * @access Private (owner only)
 */
router.delete(
  '/:jobId',
  authenticateToken,
  videoUploadController.deleteVideoHandler
);

export default router;
