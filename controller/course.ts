import { Request, Response, NextFunction } from 'express';
import * as courseService from '../service/course.js';
import { StatusCodes } from 'http-status-codes';
import { CreateCourseRequest, UpdateCourseRequest, CourseQueryParams } from '../types/course/request.js';
import { CourseMessage } from '../types/course/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Create a new course (instructor only)
 */
export const createCourse = async (
  req: Request<{}, {}, CreateCourseRequest>,
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

    const course = await courseService.createCourse(req.body, instructorId);
    return ResponseHelper.success(
      res,
      CourseMessage.SUCCESS_CREATE,
      course,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID (public)
 */
export const getCourseById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);
    
    return ResponseHelper.success(
      res,
      CourseMessage.SUCCESS_GET,
      course,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get courses by instructor ID (instructor's own courses)
 */
export const getMyCourses = async (
  req: Request<{}, {}, {}, CourseQueryParams>,
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

    const result = await courseService.getCoursesByInstructorId(instructorId, req.query);
    
    return ResponseHelper.success(
      res,
      CourseMessage.SUCCESS_GET,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update course by ID (instructor only)
 */
export const updateCourse = async (
  req: Request<{ id: string }, {}, UpdateCourseRequest>,
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
    const course = await courseService.updateCourse(id, instructorId, req.body);
    
    return ResponseHelper.success(
      res,
      CourseMessage.SUCCESS_UPDATE,
      course,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete course by ID (instructor only)
 */
export const deleteCourse = async (
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
    await courseService.deleteCourse(id, instructorId);
    
    return ResponseHelper.success(
      res,
      CourseMessage.SUCCESS_DELETE,
      { message: 'Course deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses (public view)
 */
export const getAllCourses = async (
  req: Request<{}, {}, {}, CourseQueryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await courseService.getAllCourses(req.query);
    
    return ResponseHelper.success(
      res,
      CourseMessage.SUCCESS_GET,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get course curriculum (sections with lectures) - public
 */
export const getCourseCurriculum = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const curriculum = await courseService.getCourseCurriculum(id);
    
    return ResponseHelper.success(
      res,
      'Lấy nội dung khóa học thành công',
      curriculum,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
