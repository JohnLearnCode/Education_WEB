import { Request, Response, NextFunction } from 'express';
import { adminCoursesService } from '../service/adminCourses';
import { ResponseHelper } from '../utils/response.js';

/**
 * Get all courses with pagination and filters
 */
export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all',
      category = 'all'
    } = req.query;

    const result = await adminCoursesService.getAllCourses({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      status: String(status),
      category: String(category),
    });

    ResponseHelper.success(
      res,
      'Courses retrieved successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const course = await adminCoursesService.getCourseById(courseId);

    ResponseHelper.success(
      res,
      'Course retrieved successfully',
      course
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update course status (approve/reject)
 */
export const updateCourseStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;

    const course = await adminCoursesService.updateCourseStatus(courseId, status);

    ResponseHelper.success(
      res,
      `Course ${status} successfully`,
      course
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    await adminCoursesService.deleteCourse(courseId);

    ResponseHelper.success(
      res,
      'Course deleted successfully',
      null
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get courses statistics
 */
export const getCoursesStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminCoursesService.getCoursesStats();

    ResponseHelper.success(
      res,
      'Course statistics retrieved successfully',
      stats
    );
  } catch (error) {
    next(error);
  }
};
