import { CreateQuizRequest, UpdateQuizRequest, Quiz, QuizResponse } from "../types/quiz/request";
import * as quizModel from '../model/quiz.js';
import * as lectureModel from '../model/lecture.js';
import * as courseService from './course.js';
import { QuizMessage } from '../types/quiz/enums.js';

/**
 * Create a new quiz (instructor only)
 */
export const createQuiz = async (
  quizData: CreateQuizRequest,
  instructorId: string
): Promise<QuizResponse> => {
  // First verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(quizData.courseId, instructorId);
  if (!hasAccess) {
    throw new Error('Bạn không có quyền tạo quiz cho khóa học này');
  }

  // Verify that the lecture exists and belongs to the course
  const lecture = await lectureModel.getLectureById(quizData.lectureId);
  if (!lecture) {
    throw new Error('Không tìm thấy bài học');
  }

  if (lecture.courseId.toString() !== quizData.courseId) {
    throw new Error('Bài học không thuộc khóa học này');
  }

  // Check if quiz already exists for this lecture
  const existingQuiz = await quizModel.getQuizByLectureId(quizData.lectureId);
  if (existingQuiz) {
    throw new Error('Bài học này đã có quiz');
  }

  const quiz = await quizModel.createQuiz(quizData);
  
  if (!quiz) {
    throw new Error(QuizMessage.FAIL_CREATE);
  }

  // Convert ObjectId to string for response
  const response: QuizResponse = {
    ...quiz,
    lectureId: quiz.lectureId.toString(),
    courseId: quiz.courseId.toString()
  };

  return response;
};

/**
 * Get quiz by ID (public)
 */
export const getQuizById = async (quizId: string): Promise<QuizResponse> => {
  const quiz = await quizModel.getQuizById(quizId);
  
  if (!quiz) {
    throw new Error(QuizMessage.QUIZ_NOT_FOUND);
  }

  // Convert ObjectId to string for response
  const response: QuizResponse = {
    ...quiz,
    lectureId: quiz.lectureId.toString(),
    courseId: quiz.courseId.toString()
  };

  return response;
};

/**
 * Get quiz by lecture ID (public)
 */
export const getQuizByLectureId = async (lectureId: string): Promise<QuizResponse | null> => {
  // First verify that the lecture exists
  const lecture = await lectureModel.getLectureById(lectureId);
  if (!lecture) {
    throw new Error('Không tìm thấy bài học');
  }

  const quiz = await quizModel.getQuizByLectureId(lectureId);

  if (!quiz) {
    return null;
  }

  // Convert ObjectId to string for response
  const response: QuizResponse = {
    ...quiz,
    lectureId: quiz.lectureId.toString(),
    courseId: quiz.courseId.toString()
  };

  return response;
};

/**
 * Get quizzes by course ID (public)
 */
export const getQuizzesByCourseId = async (courseId: string): Promise<QuizResponse[]> => {
  // First verify that the course exists
  await courseService.getCourseById(courseId);

  const quizzes = await quizModel.getQuizzesByCourseId(courseId);

  // Convert ObjectId to string for each quiz
  const responseQuizzes: QuizResponse[] = quizzes.map(quiz => ({
    ...quiz,
    lectureId: quiz.lectureId.toString(),
    courseId: quiz.courseId.toString()
  }));

  return responseQuizzes;
};

/**
 * Update quiz by ID (instructor only)
 */
export const updateQuiz = async (
  quizId: string,
  instructorId: string,
  updateData: UpdateQuizRequest
): Promise<QuizResponse> => {
  // First get the quiz to verify ownership
  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) {
    throw new Error(QuizMessage.QUIZ_NOT_FOUND);
  }

  // Verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(
    quiz.courseId.toString(),
    instructorId
  );
  if (!hasAccess) {
    throw new Error('Bạn không có quyền cập nhật quiz này');
  }

  const updatedQuiz = await quizModel.updateQuiz(quizId, updateData);
  
  if (!updatedQuiz) {
    throw new Error(QuizMessage.FAIL_UPDATE);
  }

  // Convert ObjectId to string for response
  const response: QuizResponse = {
    ...updatedQuiz,
    lectureId: updatedQuiz.lectureId.toString(),
    courseId: updatedQuiz.courseId.toString()
  };

  return response;
};

/**
 * Delete quiz by ID (instructor only)
 */
export const deleteQuiz = async (quizId: string, instructorId: string): Promise<boolean> => {
  // First get the quiz to verify ownership
  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) {
    throw new Error(QuizMessage.QUIZ_NOT_FOUND);
  }

  // Verify that the instructor owns the course
  const hasAccess = await courseService.verifyCourseInstructor(
    quiz.courseId.toString(),
    instructorId
  );
  if (!hasAccess) {
    throw new Error('Bạn không có quyền xóa quiz này');
  }

  const success = await quizModel.deleteQuiz(quizId);
  
  if (!success) {
    throw new Error(QuizMessage.FAIL_DELETE);
  }

  return true;
};

/**
 * Delete quiz by lecture ID (when lecture is deleted)
 */
export const deleteQuizByLectureId = async (lectureId: string): Promise<boolean> => {
  return await quizModel.deleteQuizByLectureId(lectureId);
};

/**
 * Delete all quizzes by course ID (when course is deleted)
 */
export const deleteQuizzesByCourseId = async (courseId: string): Promise<boolean> => {
  return await quizModel.deleteQuizzesByCourseId(courseId);
};
