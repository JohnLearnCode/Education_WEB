import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import * as adminCoursesController from '../controller/adminCourses';

const router = Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

router.get('/', adminCoursesController.getAllCourses);
router.get('/stats', adminCoursesController.getCoursesStats);
router.get('/:courseId', adminCoursesController.getCourseById);
router.patch('/:courseId/status', adminCoursesController.updateCourseStatus);
router.delete('/:courseId', adminCoursesController.deleteCourse);

export default router;
