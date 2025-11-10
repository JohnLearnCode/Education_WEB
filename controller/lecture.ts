import { Request, Response, NextFunction } from 'express';
import * as lectureService from '../service/lecture.js';
import { StatusCodes } from 'http-status-codes';
import { CreateLectureRequest, UpdateLectureRequest } from '../types/lecture/request.js';
import { LectureMessage } from '../types/lecture/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Create a new lecture (instructor only)
 */
export const createLecture = async (
  req: Request<{}, {}, CreateLectureRequest>,
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

    const lecture = await lectureService.createLecture(req.body, instructorId);
    return ResponseHelper.success(
      res,
      LectureMessage.SUCCESS_CREATE,
      lecture,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get lecture by ID (public)
 */
export const getLectureById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lecture = await lectureService.getLectureById(id);
    
    return ResponseHelper.success(
      res,
      LectureMessage.SUCCESS_GET,
      lecture,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get lectures by section ID (public)
 */
export const getLecturesBySectionId = async (
  req: Request<{ sectionId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sectionId } = req.params;
    const lectures = await lectureService.getLecturesBySectionId(sectionId);
    
    return ResponseHelper.success(
      res,
      LectureMessage.SUCCESS_GET,
      lectures,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get lectures by course ID (public)
 */
export const getLecturesByCourseId = async (
  req: Request<{ courseId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const lectures = await lectureService.getLecturesByCourseId(courseId);
    
    return ResponseHelper.success(
      res,
      LectureMessage.SUCCESS_GET,
      lectures,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update lecture by ID (instructor only)
 */
export const updateLecture = async (
  req: Request<{ id: string }, {}, UpdateLectureRequest>,
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

    const { id } = req.params;
    const lecture = await lectureService.updateLecture(id, instructorId, req.body);
    
    return ResponseHelper.success(
      res,
      LectureMessage.SUCCESS_UPDATE,
      lecture,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete lecture by ID (instructor only)
 */
export const deleteLecture = async (
  req: Request<{ id: string }>,
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

    const { id } = req.params;
    await lectureService.deleteLecture(id, instructorId);
    
    return ResponseHelper.success(
      res,
      LectureMessage.SUCCESS_DELETE,
      { message: 'Lecture deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder lectures (instructor only)
 */
export const reorderLectures = async (
  req: Request<{}, {}, { lectures: { lectureId: string; order: number }[] }>,
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

    const { lectures } = req.body;
    await lectureService.reorderLectures(lectures, instructorId);
    
    return ResponseHelper.success(
      res,
      LectureMessage.SUCCESS_REORDER,
      { message: 'Lectures reordered successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get next order number for a section (instructor only)
 */
export const getNextOrderNumber = async (
  req: Request<{ sectionId: string }>,
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

    const { sectionId } = req.params;
    const nextOrder = await lectureService.getNextOrderNumber(sectionId, instructorId);
    
    return ResponseHelper.success(
      res,
      'Get next order number successfully',
      { nextOrder },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
