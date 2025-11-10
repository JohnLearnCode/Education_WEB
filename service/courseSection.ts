import { CreateCourseSectionRequest, UpdateCourseSectionRequest, CourseSection, CourseSectionResponse } from "../types/courseSection/request";
import * as courseSectionModel from '../model/courseSection.js';
import * as courseModel from '../model/course.js';
import * as courseService from './course.js';
import { CourseSectionMessage } from '../types/courseSection/enums.js';

/**
 * Create a new course section (instructor only)
 */
export const createCourseSection = async (
  sectionData: CreateCourseSectionRequest,
  instructorId: string
): Promise<CourseSectionResponse> => {
  // First verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(sectionData.courseId, instructorId);
  if (!hasAccess) {
    throw new Error('Bạn không có quyền tạo chương cho khóa học này');
  }

  const section = await courseSectionModel.createCourseSection(sectionData);
  
  if (!section) {
    throw new Error(CourseSectionMessage.FAIL_CREATE);
  }

  // Convert ObjectId to string for response
  const response: CourseSectionResponse = {
    ...section,
    courseId: section.courseId.toString()
  };

  return response;
};

/**
 * Get course section by ID (public)
 */
export const getCourseSectionById = async (sectionId: string): Promise<CourseSectionResponse> => {
  const section = await courseSectionModel.getCourseSectionById(sectionId);
  
  if (!section) {
    throw new Error(CourseSectionMessage.SECTION_NOT_FOUND);
  }

  // Convert ObjectId to string for response
  const response: CourseSectionResponse = {
    ...section,
    courseId: section.courseId.toString()
  };

  return response;
};

/**
 * Get sections by course ID (public)
 */
export const getSectionsByCourseId = async (courseId: string): Promise<CourseSectionResponse[]> => {
  // First verify that the course exists
  await courseService.getCourseById(courseId);

  const sections = await courseSectionModel.getSectionsByCourseId(courseId);

  // Convert ObjectId to string for each section
  const responseSections: CourseSectionResponse[] = sections.map(section => ({
    ...section,
    courseId: section.courseId.toString()
  }));

  return responseSections;
};

/**
 * Update course section by ID (instructor only)
 */
export const updateCourseSection = async (
  sectionId: string,
  instructorId: string,
  updateData: UpdateCourseSectionRequest
): Promise<CourseSectionResponse> => {
  // First get the section to verify ownership
  const section = await courseSectionModel.getCourseSectionById(sectionId);
  if (!section) {
    throw new Error(CourseSectionMessage.SECTION_NOT_FOUND);
  }

  // Verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(
    section.courseId.toString(),
    instructorId
  );
  if (!hasAccess) {
    throw new Error('Bạn không có quyền cập nhật chương này');
  }

  const updatedSection = await courseSectionModel.updateCourseSection(sectionId, updateData);
  
  if (!updatedSection) {
    throw new Error(CourseSectionMessage.FAIL_UPDATE);
  }

  // Convert ObjectId to string for response
  const response: CourseSectionResponse = {
    ...updatedSection,
    courseId: updatedSection.courseId.toString()
  };

  return response;
};

/**
 * Delete course section by ID (instructor only)
 */
export const deleteCourseSection = async (sectionId: string, instructorId: string): Promise<boolean> => {
  // First get the section to verify ownership
  const section = await courseSectionModel.getCourseSectionById(sectionId);
  if (!section) {
    throw new Error(CourseSectionMessage.SECTION_NOT_FOUND);
  }

  // Verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(
    section.courseId.toString(),
    instructorId
  );
  if (!hasAccess) {
    throw new Error('Bạn không có quyền xóa chương này');
  }

  const success = await courseSectionModel.deleteCourseSection(sectionId);
  
  if (!success) {
    throw new Error(CourseSectionMessage.FAIL_DELETE);
  }

  return true;
};

/**
 * Reorder sections (instructor only)
 */
export const reorderSections = async (
  sectionOrders: { sectionId: string; order: number }[],
  instructorId: string
): Promise<boolean> => {
  // Verify ownership of all sections
  for (const { sectionId } of sectionOrders) {
    const section = await courseSectionModel.getCourseSectionById(sectionId);
    if (!section) {
      throw new Error(CourseSectionMessage.SECTION_NOT_FOUND);
    }

    const hasAccess = await courseService.verifyCourseInstructor(
      section.courseId.toString(),
      instructorId
    );
    if (!hasAccess) {
      throw new Error('Bạn không có quyền sắp xếp lại chương này');
    }
  }

  const success = await courseSectionModel.reorderSections(sectionOrders);
  
  if (!success) {
    throw new Error(CourseSectionMessage.FAIL_REORDER);
  }

  return true;
};

/**
 * Get next order number for a course (instructor only)
 */
export const getNextOrderNumber = async (courseId: string, instructorId: string): Promise<number> => {
  // Verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(courseId, instructorId);
  if (!hasAccess) {
    throw new Error('Bạn không có quyền truy cập khóa học này');
  }

  return await courseSectionModel.getNextOrderNumber(courseId);
};

/**
 * Delete all sections by course ID (when course is deleted)
 */
export const deleteSectionsByCourseId = async (courseId: string): Promise<boolean> => {
  return await courseSectionModel.deleteSectionsByCourseId(courseId);
};
