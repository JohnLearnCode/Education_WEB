import { Request, Response, NextFunction } from 'express';
import * as enrollmentService from '../service/enrollment.js';
import { StatusCodes } from 'http-status-codes';
import { EnrollCourseRequest, MarkLectureCompletedRequest } from '../types/enrollment/request.js';
import { EnrollmentMessage } from '../types/enrollment/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Enroll in a course (authenticated user)
 */
export const enrollCourse = async (
  req: Request<{}, {}, EnrollCourseRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { courseId } = req.body;
    const enrollment = await enrollmentService.enrollCourse(courseId, userId);
    
    return ResponseHelper.success(
      res,
      EnrollmentMessage.SUCCESS_ENROLL,
      enrollment,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get enrollment by ID (authenticated user - own enrollments only)
 */
export const getEnrollmentById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { id } = req.params;
    const enrollment = await enrollmentService.getEnrollmentById(id, userId);
    
    return ResponseHelper.success(
      res,
      EnrollmentMessage.SUCCESS_GET,
      enrollment,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all enrollments by current user
 */
export const getMyEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const enrollments = await enrollmentService.getEnrollmentsByUserId(userId);
    
    return ResponseHelper.success(
      res,
      EnrollmentMessage.SUCCESS_GET,
      enrollments,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all enrolled courses with details by current user
 */
export const getMyEnrolledCoursesWithDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const enrolledCourses = await enrollmentService.getEnrolledCoursesWithDetails(userId);
    
    return ResponseHelper.success(
      res,
      'Lấy danh sách khóa học đã đăng ký thành công',
      enrolledCourses,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get enrollment for a specific course by current user
 */
export const getMyEnrollmentByCourse = async (
  req: Request<{ courseId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { courseId } = req.params;
    const enrollment = await enrollmentService.getEnrollmentByUserAndCourse(userId, courseId);
    
    return ResponseHelper.success(
      res,
      EnrollmentMessage.SUCCESS_GET,
      enrollment,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark lecture as completed (authenticated user)
 */
export const markLectureCompleted = async (
  req: Request<{}, {}, MarkLectureCompletedRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { lectureId } = req.body;
    const progress = await enrollmentService.markLectureCompleted(lectureId, userId);
    
    // Return different message if course is completed
    const message = progress.isCompleted 
      ? EnrollmentMessage.CONGRATULATIONS_COMPLETED 
      : EnrollmentMessage.SUCCESS_COMPLETE_LECTURE;
    
    return ResponseHelper.success(
      res,
      message,
      progress,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get progress summary for an enrollment
 */
export const getProgressSummary = async (
  req: Request<{ enrollmentId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { enrollmentId } = req.params;
    const progress = await enrollmentService.getProgressSummary(enrollmentId, userId);
    
    return ResponseHelper.success(
      res,
      EnrollmentMessage.SUCCESS_GET,
      progress,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get completed courses by current user
 */
export const getMyCompletedCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const enrollments = await enrollmentService.getCompletedCoursesByUser(userId);
    
    return ResponseHelper.success(
      res,
      EnrollmentMessage.SUCCESS_GET,
      enrollments,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all enrollments for a course (instructor only)
 */
export const getEnrollmentsByCourseId = async (
  req: Request<{ courseId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const instructorId = (req as any).user?.userId;
    if (!instructorId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { courseId } = req.params;
    const enrollments = await enrollmentService.getEnrollmentsByCourseId(courseId, instructorId);
    
    return ResponseHelper.success(
      res,
      EnrollmentMessage.SUCCESS_GET,
      enrollments,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete enrollment (unenroll from course)
 */
export const deleteEnrollment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { id } = req.params;
    await enrollmentService.deleteEnrollment(id, userId);
    
    return ResponseHelper.success(
      res,
      'Hủy đăng ký khóa học thành công',
      { message: 'Enrollment deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
