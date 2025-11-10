import { CreateLectureRequest, UpdateLectureRequest, Lecture, LectureResponse } from "../types/lecture/request";
import * as lectureModel from '../model/lecture.js';
import * as courseSectionModel from '../model/courseSection.js';
import * as courseService from './course.js';
import { LectureMessage } from '../types/lecture/enums.js';

/**
 * Create a new lecture (instructor only)
 */
export const createLecture = async (
  lectureData: CreateLectureRequest,
  instructorId: string
): Promise<LectureResponse> => {
  // First verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(lectureData.courseId, instructorId);
  if (!hasAccess) {
    throw new Error('Bạn không có quyền tạo bài học cho khóa học này');
  }

  // Verify that the section exists and belongs to the course
  const section = await courseSectionModel.getCourseSectionById(lectureData.sectionId);
  if (!section) {
    throw new Error('Không tìm thấy chương học');
  }

  if (section.courseId.toString() !== lectureData.courseId) {
    throw new Error('Chương học không thuộc khóa học này');
  }

  const lecture = await lectureModel.createLecture(lectureData);
  
  if (!lecture) {
    throw new Error(LectureMessage.FAIL_CREATE);
  }

  // Convert ObjectId to string for response
  const response: LectureResponse = {
    ...lecture,
    sectionId: lecture.sectionId.toString(),
    courseId: lecture.courseId.toString()
  };

  return response;
};

/**
 * Get lecture by ID (public)
 */
export const getLectureById = async (lectureId: string): Promise<LectureResponse> => {
  const lecture = await lectureModel.getLectureById(lectureId);
  
  if (!lecture) {
    throw new Error(LectureMessage.LECTURE_NOT_FOUND);
  }

  // Convert ObjectId to string for response
  const response: LectureResponse = {
    ...lecture,
    sectionId: lecture.sectionId.toString(),
    courseId: lecture.courseId.toString()
  };

  return response;
};

/**
 * Get lectures by section ID (public)
 */
export const getLecturesBySectionId = async (sectionId: string): Promise<LectureResponse[]> => {
  // First verify that the section exists
  const section = await courseSectionModel.getCourseSectionById(sectionId);
  if (!section) {
    throw new Error('Không tìm thấy chương học');
  }

  const lectures = await lectureModel.getLecturesBySectionId(sectionId);

  // Convert ObjectId to string for each lecture
  const responseLectures: LectureResponse[] = lectures.map(lecture => ({
    ...lecture,
    sectionId: lecture.sectionId.toString(),
    courseId: lecture.courseId.toString()
  }));

  return responseLectures;
};

/**
 * Get lectures by course ID (public)
 */
export const getLecturesByCourseId = async (courseId: string): Promise<LectureResponse[]> => {
  // First verify that the course exists
  await courseService.getCourseById(courseId);

  const lectures = await lectureModel.getLecturesByCourseId(courseId);

  // Convert ObjectId to string for each lecture
  const responseLectures: LectureResponse[] = lectures.map(lecture => ({
    ...lecture,
    sectionId: lecture.sectionId.toString(),
    courseId: lecture.courseId.toString()
  }));

  return responseLectures;
};

/**
 * Update lecture by ID (instructor only)
 */
export const updateLecture = async (
  lectureId: string,
  instructorId: string,
  updateData: UpdateLectureRequest
): Promise<LectureResponse> => {
  // First get the lecture to verify ownership
  const lecture = await lectureModel.getLectureById(lectureId);
  if (!lecture) {
    throw new Error(LectureMessage.LECTURE_NOT_FOUND);
  }

  // Verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(
    lecture.courseId.toString(),
    instructorId
  );
  if (!hasAccess) {
    throw new Error('Bạn không có quyền cập nhật bài học này');
  }

  const updatedLecture = await lectureModel.updateLecture(lectureId, updateData);
  
  if (!updatedLecture) {
    throw new Error(LectureMessage.FAIL_UPDATE);
  }

  // Convert ObjectId to string for response
  const response: LectureResponse = {
    ...updatedLecture,
    sectionId: updatedLecture.sectionId.toString(),
    courseId: updatedLecture.courseId.toString()
  };

  return response;
};

/**
 * Delete lecture by ID (instructor only)
 */
export const deleteLecture = async (lectureId: string, instructorId: string): Promise<boolean> => {
  // First get the lecture to verify ownership
  const lecture = await lectureModel.getLectureById(lectureId);
  if (!lecture) {
    throw new Error(LectureMessage.LECTURE_NOT_FOUND);
  }

  // Verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(
    lecture.courseId.toString(),
    instructorId
  );
  if (!hasAccess) {
    throw new Error('Bạn không có quyền xóa bài học này');
  }

  const success = await lectureModel.deleteLecture(lectureId);
  
  if (!success) {
    throw new Error(LectureMessage.FAIL_DELETE);
  }

  return true;
};

/**
 * Reorder lectures (instructor only)
 */
export const reorderLectures = async (
  lectureOrders: { lectureId: string; order: number }[],
  instructorId: string
): Promise<boolean> => {
  // Verify ownership of all lectures
  for (const { lectureId } of lectureOrders) {
    const lecture = await lectureModel.getLectureById(lectureId);
    if (!lecture) {
      throw new Error(LectureMessage.LECTURE_NOT_FOUND);
    }

    const hasAccess = await courseService.verifyCourseInstructor(
      lecture.courseId.toString(),
      instructorId
    );
    if (!hasAccess) {
      throw new Error('Bạn không có quyền sắp xếp lại bài học này');
    }
  }

  const success = await lectureModel.reorderLectures(lectureOrders);
  
  if (!success) {
    throw new Error(LectureMessage.FAIL_REORDER);
  }

  return true;
};

/**
 * Get next order number for a section (instructor only)
 */
export const getNextOrderNumber = async (sectionId: string, instructorId: string): Promise<number> => {
  // Verify that the section exists
  const section = await courseSectionModel.getCourseSectionById(sectionId);
  if (!section) {
    throw new Error('Không tìm thấy chương học');
  }

  // Verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(
    section.courseId.toString(),
    instructorId
  );
  if (!hasAccess) {
    throw new Error('Bạn không có quyền truy cập chương học này');
  }

  return await lectureModel.getNextOrderNumber(sectionId);
};

/**
 * Delete all lectures by section ID (when section is deleted)
 */
export const deleteLecturesBySectionId = async (sectionId: string): Promise<boolean> => {
  return await lectureModel.deleteLecturesBySectionId(sectionId);
};

/**
 * Delete all lectures by course ID (when course is deleted)
 */
export const deleteLecturesByCourseId = async (courseId: string): Promise<boolean> => {
  return await lectureModel.deleteLecturesByCourseId(courseId);
};
