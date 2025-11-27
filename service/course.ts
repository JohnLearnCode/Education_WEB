import { CreateCourseRequest, UpdateCourseRequest, Course, CourseQueryParams, CourseResponse, InstructorInfo } from "../types/course/request";
import * as courseModel from '../model/course.js';
import * as authModel from '../model/auth.js';
import * as categoryModel from '../model/category.js';
import * as categoryService from './category.js';
import * as courseSectionModel from '../model/courseSection.js';
import * as lectureModel from '../model/lecture.js';
import { CourseMessage } from '../types/course/enums.js';
import { CategoryMessage } from '../types/category/enums.js';

/**
 * Get instructor info by ID
 */
const getInstructorInfo = async (instructorId: string): Promise<InstructorInfo | null> => {
  const user = await authModel.findUserById(instructorId);
  if (!user) return null;

  return {
    _id: user._id?.toString() || '',
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl
  };
};

/**
 * Create a new course (instructor only)
 */
export const createCourse = async (courseData: CreateCourseRequest, instructorId: string): Promise<CourseResponse> => {
  // Verify category exists
  const category = await categoryModel.getCategoryById(courseData.categoryId);
  if (!category) {
    throw new Error(CategoryMessage.CATEGORY_NOT_FOUND);
  }

  const course = await courseModel.createCourse(courseData, instructorId);

  if (!course) {
    throw new Error(CourseMessage.FAIL_CREATE);
  }

  // Increment course count in category
  await categoryService.incrementCourseCount(courseData.categoryId);

  // Get instructor info
  const instructor = await getInstructorInfo(instructorId);

  // Convert ObjectId to string for response
  const response: CourseResponse = {
    ...course,
    instructorId: course.instructorId.toString(),
    categoryId: course.categoryId.toString(),
    instructor: instructor || undefined,
    category: {
      _id: category._id!.toString(),
      name: category.name
    }
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

  // Get category info
  const category = await categoryModel.getCategoryById(course.categoryId.toString());

  // Convert ObjectId to string for response
  const response: CourseResponse = {
    ...course,
    instructorId: course.instructorId.toString(),
    categoryId: course.categoryId.toString(),
    instructor: instructor || undefined,
    category: category ? {
      _id: category._id!.toString(),
      name: category.name
    } : undefined
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

  // Convert to integers (query params come as strings)
  const page = parseInt(String(queryParams.page || 1), 10);
  const limit = parseInt(String(queryParams.limit || 10), 10);
  const totalPages = Math.ceil(total / limit);

  // Get instructor info
  const instructor = await getInstructorInfo(instructorId);

  // Convert ObjectId to string for each course and add instructor info
  const responseCourses: CourseResponse[] = courses.map(course => ({
    ...course,
    instructorId: course.instructorId.toString(),
    categoryId: course.categoryId.toString(),
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

  // Get category info
  const category = await categoryModel.getCategoryById(course.categoryId.toString());

  // Convert ObjectId to string for response
  const response: CourseResponse = {
    ...course,
    instructorId: course.instructorId.toString(),
    categoryId: course.categoryId.toString(),
    instructor: instructor || undefined,
    category: category ? {
      _id: category._id!.toString(),
      name: category.name
    } : undefined
  };

  return response;
};

/**
 * Delete course by ID (instructor only)
 */
export const deleteCourse = async (courseId: string, instructorId: string): Promise<boolean> => {
  // Get course to get categoryId before deleting
  const course = await courseModel.getCourseById(courseId);
  if (!course) {
    throw new Error(CourseMessage.COURSE_NOT_FOUND);
  }

  const success = await courseModel.deleteCourse(courseId, instructorId);

  if (!success) {
    throw new Error(CourseMessage.FAIL_DELETE);
  }

  // Decrement course count in category
  await categoryService.decrementCourseCount(course.categoryId.toString());

  return true;
};

/**
 * Get all courses (public view)
 */
export const getAllCourses = async (
  queryParams: CourseQueryParams = {}
): Promise<{ courses: CourseResponse[], total: number, page: number, totalPages: number }> => {
  const { courses, total } = await courseModel.getAllCourses(queryParams);

  // Convert to integers (query params come as strings)
  const page = parseInt(String(queryParams.page || 1), 10);
  const limit = parseInt(String(queryParams.limit || 10), 10);
  const totalPages = Math.ceil(total / limit);

  // Convert ObjectId to string for each course and add instructor info
  const responseCourses: CourseResponse[] = await Promise.all(
    courses.map(async (course) => {
      const instructor = await getInstructorInfo(course.instructorId.toString());
      return {
        ...course,
        instructorId: course.instructorId.toString(),
        categoryId: course.categoryId.toString(),
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

/**
 * Get course curriculum (sections with lectures)
 */
export const getCourseCurriculum = async (courseId: string): Promise<any[]> => {
  // Verify course exists
  const course = await courseModel.getCourseById(courseId);
  if (!course) {
    throw new Error(CourseMessage.COURSE_NOT_FOUND);
  }

  // Get all sections for the course
  const sections = await courseSectionModel.getSectionsByCourseId(courseId);

  // For each section, get its lectures
  const curriculum = await Promise.all(
    sections.map(async (section) => {
      const lectures = await lectureModel.getLecturesBySectionId(section._id!.toString());
      
      return {
        _id: section._id?.toString(),
        courseId: section.courseId.toString(),
        title: section.title,
        order: section.order,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
        lectures: lectures.map(lecture => ({
          _id: lecture._id?.toString(),
          sectionId: lecture.sectionId.toString(),
          courseId: lecture.courseId.toString(),
          title: lecture.title,
          duration: lecture.duration,
          type: lecture.type,
          videoUrl: lecture.videoUrl,
          textContent: lecture.textContent,
          attachmentUrl: lecture.attachmentUrl,
          order: lecture.order,
          createdAt: lecture.createdAt,
          updatedAt: lecture.updatedAt
        }))
      };
    })
  );

  return curriculum;
};
