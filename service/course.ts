import { CreateCourseRequest, UpdateCourseRequest, Course, CourseQueryParams, CourseResponse, InstructorInfo } from "../types/course/request";
import * as courseModel from '../model/course.js';
import * as authModel from '../model/auth.js';
import { CourseMessage } from '../types/course/enums.js';

/**
 * Get instructor info by ID
 */
const getInstructorInfo = async (instructorId: string): Promise<InstructorInfo | null> => {
  const user = await authModel.findUserById(instructorId);
  if (!user) return null;

  return {
    _id: user._id?.toString() || '',
    username: user.username,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl
  };
};

/**
 * Create a new course (instructor only)
 */
export const createCourse = async (courseData: CreateCourseRequest, instructorId: string): Promise<CourseResponse> => {
  const course = await courseModel.createCourse(courseData, instructorId);
  
  if (!course) {
    throw new Error(CourseMessage.FAIL_CREATE);
  }

  // Get instructor info
  const instructor = await getInstructorInfo(instructorId);

  // Convert ObjectId to string for response
  const response: CourseResponse = {
    ...course,
    instructorId: course.instructorId.toString(),
    instructor: instructor || undefined
  };

  return response;
};

/**
 * Get course by ID
 */
export const getCourseById = async (courseId: string): Promise<CourseResponse> => {
  const course = await courseModel.getCourseById(courseId);
  
  if (!course) {
    throw new Error(CourseMessage.COURSE_NOT_FOUND);
  }

  // Get instructor info
  const instructor = await getInstructorInfo(course.instructorId.toString());

  // Convert ObjectId to string for response
  const response: CourseResponse = {
    ...course,
    instructorId: course.instructorId.toString(),
    instructor: instructor || undefined
  };

  return response;
};

/**
 * Get courses by instructor ID (instructor's own courses)
 */
export const getCoursesByInstructorId = async (
  instructorId: string,
  queryParams: CourseQueryParams = {}
): Promise<{ courses: CourseResponse[], total: number, page: number, totalPages: number }> => {
  const { courses, total } = await courseModel.getCoursesByInstructorId(instructorId, queryParams);
  
  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const totalPages = Math.ceil(total / limit);

  // Get instructor info
  const instructor = await getInstructorInfo(instructorId);

  // Convert ObjectId to string for each course and add instructor info
  const responseCourses: CourseResponse[] = courses.map(course => ({
    ...course,
    instructorId: course.instructorId.toString(),
    instructor: instructor || undefined
  }));

  return {
    courses: responseCourses,
    total,
    page,
    totalPages
  };
};

/**
 * Update course by ID (instructor only)
 */
export const updateCourse = async (
  courseId: string,
  instructorId: string,
  updateData: UpdateCourseRequest
): Promise<CourseResponse> => {
  const course = await courseModel.updateCourse(courseId, instructorId, updateData);
  
  if (!course) {
    throw new Error(CourseMessage.FAIL_UPDATE);
  }

  // Get instructor info
  const instructor = await getInstructorInfo(instructorId);

  // Convert ObjectId to string for response
  const response: CourseResponse = {
    ...course,
    instructorId: course.instructorId.toString(),
    instructor: instructor || undefined
  };

  return response;
};

/**
 * Delete course by ID (instructor only)
 */
export const deleteCourse = async (courseId: string, instructorId: string): Promise<boolean> => {
  const success = await courseModel.deleteCourse(courseId, instructorId);
  
  if (!success) {
    throw new Error(CourseMessage.FAIL_DELETE);
  }

  return true;
};

/**
 * Get all courses (public view)
 */
export const getAllCourses = async (
  queryParams: CourseQueryParams = {}
): Promise<{ courses: CourseResponse[], total: number, page: number, totalPages: number }> => {
  const { courses, total } = await courseModel.getAllCourses(queryParams);
  
  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const totalPages = Math.ceil(total / limit);

  // Convert ObjectId to string for each course and add instructor info
  const responseCourses: CourseResponse[] = await Promise.all(
    courses.map(async (course) => {
      const instructor = await getInstructorInfo(course.instructorId.toString());
      return {
        ...course,
        instructorId: course.instructorId.toString(),
        instructor: instructor || undefined
      };
    })
  );

  return {
    courses: responseCourses,
    total,
    page,
    totalPages
  };
};

/**
 * Check if user is the instructor of the course
 */
export const verifyCourseInstructor = async (courseId: string, instructorId: string): Promise<boolean> => {
  const course = await courseModel.getCourseById(courseId);
  
  if (!course) {
    return false;
  }

  return course.instructorId.toString() === instructorId;
};
