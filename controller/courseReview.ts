import { Request, Response, NextFunction } from 'express';
import * as courseReviewService from '../service/courseReview.js';
import { StatusCodes } from 'http-status-codes';
import {
  CreateCourseReviewRequest,
  UpdateCourseReviewRequest,
  CourseReviewQueryParams
} from '../types/courseReview/request.js';
import { CourseReviewMessage } from '../types/courseReview/enums.js';
import { ResponseHelper } from '../utils/response.js';

export const createCourseReview = async (
  req: Request<{}, {}, CreateCourseReviewRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    const userName = (req as any).user?.name || (req as any).user?.email || 'Anonymous';

    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const review = await courseReviewService.createCourseReview(req.body, userId, userName);
    return ResponseHelper.success(
      res,
      CourseReviewMessage.SUCCESS_CREATE,
      review,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

export const getCourseReviews = async (
  req: Request<{ courseId: string }, {}, {}, CourseReviewQueryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const result = await courseReviewService.getCourseReviews(courseId, req.query);

    return ResponseHelper.success(
      res,
      CourseReviewMessage.SUCCESS_GET,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const updateCourseReview = async (
  req: Request<{ id: string }, {}, UpdateCourseReviewRequest>,
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
    const review = await courseReviewService.updateCourseReview(id, userId, req.body);

    return ResponseHelper.success(
      res,
      CourseReviewMessage.SUCCESS_UPDATE,
      review,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const deleteCourseReview = async (
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
    await courseReviewService.deleteCourseReview(id, userId);

    return ResponseHelper.success(
      res,
      CourseReviewMessage.SUCCESS_DELETE,
      { message: 'Course review deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get instructor review statistics
 * Returns overall stats and per-course breakdown
 */
export const getInstructorReviewStats = async (
  req: Request,
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

    const stats = await courseReviewService.getInstructorReviewStats(instructorId);

    return ResponseHelper.success(
      res,
      CourseReviewMessage.SUCCESS_GET,
      stats,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a specific course (instructor only)
 * Returns course info, stats, and paginated reviews
 */
export const getInstructorCourseReviews = async (
  req: Request<{ courseId: string }, {}, {}, CourseReviewQueryParams>,
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
    const result = await courseReviewService.getInstructorCourseReviews(
      courseId,
      instructorId,
      req.query
    );

    return ResponseHelper.success(
      res,
      CourseReviewMessage.SUCCESS_GET,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
