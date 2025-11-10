import { Request, Response, NextFunction } from 'express';
import * as courseSectionService from '../service/courseSection.js';
import { StatusCodes } from 'http-status-codes';
import { CreateCourseSectionRequest, UpdateCourseSectionRequest } from '../types/courseSection/request.js';
import { CourseSectionMessage } from '../types/courseSection/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Create a new course section (instructor only)
 */
export const createCourseSection = async (
  req: Request<{}, {}, CreateCourseSectionRequest>,
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

    const section = await courseSectionService.createCourseSection(req.body, instructorId);
    return ResponseHelper.success(
      res,
      CourseSectionMessage.SUCCESS_CREATE,
      section,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get course section by ID (public)
 */
export const getCourseSectionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const section = await courseSectionService.getCourseSectionById(id);
    
    return ResponseHelper.success(
      res,
      CourseSectionMessage.SUCCESS_GET,
      section,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get sections by course ID (public)
 */
export const getSectionsByCourseId = async (
  req: Request<{ courseId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const sections = await courseSectionService.getSectionsByCourseId(courseId);
    
    return ResponseHelper.success(
      res,
      CourseSectionMessage.SUCCESS_GET,
      sections,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update course section by ID (instructor only)
 */
export const updateCourseSection = async (
  req: Request<{ id: string }, {}, UpdateCourseSectionRequest>,
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
    const section = await courseSectionService.updateCourseSection(id, instructorId, req.body);
    
    return ResponseHelper.success(
      res,
      CourseSectionMessage.SUCCESS_UPDATE,
      section,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete course section by ID (instructor only)
 */
export const deleteCourseSection = async (
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
    await courseSectionService.deleteCourseSection(id, instructorId);
    
    return ResponseHelper.success(
      res,
      CourseSectionMessage.SUCCESS_DELETE,
      { message: 'Course section deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder sections (instructor only)
 */
export const reorderSections = async (
  req: Request<{}, {}, { sections: { sectionId: string; order: number }[] }>,
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

    const { sections } = req.body;
    await courseSectionService.reorderSections(sections, instructorId);
    
    return ResponseHelper.success(
      res,
      CourseSectionMessage.SUCCESS_REORDER,
      { message: 'Sections reordered successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get next order number for a course (instructor only)
 */
export const getNextOrderNumber = async (
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
    const nextOrder = await courseSectionService.getNextOrderNumber(courseId, instructorId);
    
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
