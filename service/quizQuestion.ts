import { CreateQuizQuestionRequest, UpdateQuizQuestionRequest, QuizQuestion, QuizQuestionResponse } from "../types/quizQuestion/request";
import * as quizQuestionModel from '../model/quizQuestion.js';
import * as quizModel from '../model/quiz.js';
import * as quizService from './quiz.js';
import { QuizQuestionMessage } from '../types/quizQuestion/enums.js';

/**
 * Verify quiz ownership by instructor
 */
const verifyQuizOwnership = async (quizId: string, instructorId: string): Promise<void> => {
  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) {
    throw new Error('Không tìm thấy quiz');
  }

  // Use quiz service to verify course ownership
  const quizResponse = await quizService.getQuizById(quizId);
  const courseId = quizResponse.courseId;
  
  const courseService = await import('./course.js');
  const hasAccess = await courseService.verifyCourseInstructor(courseId, instructorId);
  if (!hasAccess) {
    throw new Error('Bạn không có quyền truy cập quiz này');
  }
};

/**
 * Create a new quiz question (instructor only)
 */
export const createQuizQuestion = async (
  questionData: CreateQuizQuestionRequest,
  instructorId: string
): Promise<QuizQuestionResponse> => {
  // Verify that the instructor owns the quiz
  await verifyQuizOwnership(questionData.quizId, instructorId);

  // Validate correctAnswerIndex is within options range
  if (questionData.correctAnswerIndex >= questionData.options.length) {
    throw new Error('Chỉ số đáp án đúng vượt quá số lượng đáp án');
  }

  const question = await quizQuestionModel.createQuizQuestion(questionData);
  
  if (!question) {
    throw new Error(QuizQuestionMessage.FAIL_CREATE);
  }

  // Convert ObjectId to string for response
  const response: QuizQuestionResponse = {
    ...question,
    quizId: question.quizId.toString()
  };

  return response;
};

/**
 * Get quiz question by ID (public)
 */
export const getQuizQuestionById = async (questionId: string): Promise<QuizQuestionResponse> => {
  const question = await quizQuestionModel.getQuizQuestionById(questionId);
  
  if (!question) {
    throw new Error(QuizQuestionMessage.QUESTION_NOT_FOUND);
  }

  // Convert ObjectId to string for response
  const response: QuizQuestionResponse = {
    ...question,
    quizId: question.quizId.toString()
  };

  return response;
};

/**
 * Get questions by quiz ID (public)
 */
export const getQuestionsByQuizId = async (quizId: string): Promise<QuizQuestionResponse[]> => {
  // First verify that the quiz exists
  await quizService.getQuizById(quizId);

  const questions = await quizQuestionModel.getQuestionsByQuizId(quizId);

  // Convert ObjectId to string for each question
  const responseQuestions: QuizQuestionResponse[] = questions.map(question => ({
    ...question,
    quizId: question.quizId.toString()
  }));

  return responseQuestions;
};

/**
 * Update quiz question by ID (instructor only)
 */
export const updateQuizQuestion = async (
  questionId: string,
  instructorId: string,
  updateData: UpdateQuizQuestionRequest
): Promise<QuizQuestionResponse> => {
  // First get the question to verify ownership
  const question = await quizQuestionModel.getQuizQuestionById(questionId);
  if (!question) {
    throw new Error(QuizQuestionMessage.QUESTION_NOT_FOUND);
  }

  // Verify that the instructor owns the quiz
  await verifyQuizOwnership(question.quizId.toString(), instructorId);

  // Validate correctAnswerIndex if provided
  if (updateData.correctAnswerIndex !== undefined && updateData.options) {
    if (updateData.correctAnswerIndex >= updateData.options.length) {
      throw new Error('Chỉ số đáp án đúng vượt quá số lượng đáp án');
    }
  } else if (updateData.correctAnswerIndex !== undefined) {
    // If only correctAnswerIndex is updated, check against existing options
    if (updateData.correctAnswerIndex >= question.options.length) {
      throw new Error('Chỉ số đáp án đúng vượt quá số lượng đáp án hiện tại');
    }
  } else if (updateData.options && question.correctAnswerIndex >= updateData.options.length) {
    throw new Error('Số lượng đáp án mới không hợp lệ với chỉ số đáp án đúng hiện tại');
  }

  const updatedQuestion = await quizQuestionModel.updateQuizQuestion(questionId, updateData);
  
  if (!updatedQuestion) {
    throw new Error(QuizQuestionMessage.FAIL_UPDATE);
  }

  // Convert ObjectId to string for response
  const response: QuizQuestionResponse = {
    ...updatedQuestion,
    quizId: updatedQuestion.quizId.toString()
  };

  return response;
};

/**
 * Delete quiz question by ID (instructor only)
 */
export const deleteQuizQuestion = async (questionId: string, instructorId: string): Promise<boolean> => {
  // First get the question to verify ownership
  const question = await quizQuestionModel.getQuizQuestionById(questionId);
  if (!question) {
    throw new Error(QuizQuestionMessage.QUESTION_NOT_FOUND);
  }

  // Verify that the instructor owns the quiz
  await verifyQuizOwnership(question.quizId.toString(), instructorId);

  const success = await quizQuestionModel.deleteQuizQuestion(questionId);
  
  if (!success) {
    throw new Error(QuizQuestionMessage.FAIL_DELETE);
  }

  return true;
};

/**
 * Reorder questions (instructor only)
 */
export const reorderQuestions = async (
  questionOrders: { questionId: string; order: number }[],
  instructorId: string
): Promise<boolean> => {
  // Verify ownership of all questions (they should all belong to the same quiz)
  if (questionOrders.length === 0) {
    throw new Error('Danh sách câu hỏi trống');
  }

  const firstQuestion = await quizQuestionModel.getQuizQuestionById(questionOrders[0].questionId);
  if (!firstQuestion) {
    throw new Error(QuizQuestionMessage.QUESTION_NOT_FOUND);
  }

  const quizId = firstQuestion.quizId.toString();
  await verifyQuizOwnership(quizId, instructorId);

  // Verify all questions belong to the same quiz
  for (const { questionId } of questionOrders) {
    const question = await quizQuestionModel.getQuizQuestionById(questionId);
    if (!question) {
      throw new Error(QuizQuestionMessage.QUESTION_NOT_FOUND);
    }
    if (question.quizId.toString() !== quizId) {
      throw new Error('Tất cả câu hỏi phải thuộc cùng một quiz');
    }
  }

  const success = await quizQuestionModel.reorderQuestions(questionOrders);
  
  if (!success) {
    throw new Error(QuizQuestionMessage.FAIL_REORDER);
  }

  return true;
};

/**
 * Get next order number for a quiz (instructor only)
 */
export const getNextOrderNumber = async (quizId: string, instructorId: string): Promise<number> => {
  // Verify that the instructor owns the quiz
  await verifyQuizOwnership(quizId, instructorId);

  return await quizQuestionModel.getNextOrderNumber(quizId);
};

/**
 * Delete all questions by quiz ID (when quiz is deleted)
 */
export const deleteQuestionsByQuizId = async (quizId: string): Promise<boolean> => {
  return await quizQuestionModel.deleteQuestionsByQuizId(quizId);
};
