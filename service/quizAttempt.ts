import { SubmitQuizAttemptRequest, QuizAttemptResponse, QuizResultSummary } from "../types/quizAttempt/request";
import * as quizAttemptModel from '../model/quizAttempt.js';
import * as quizModel from '../model/quiz.js';
import * as quizQuestionModel from '../model/quizQuestion.js';
import { QuizAttemptMessage } from '../types/quizAttempt/enums.js';

/**
 * Submit quiz attempt and calculate score
 */
export const submitQuizAttempt = async (
  attemptData: SubmitQuizAttemptRequest,
  userId: string
): Promise<QuizResultSummary> => {
  // Get quiz details
  const quiz = await quizModel.getQuizById(attemptData.quizId);
  if (!quiz) {
    throw new Error(QuizAttemptMessage.QUIZ_NOT_FOUND);
  }

  // Get all questions for this quiz
  const questions = await quizQuestionModel.getQuestionsByQuizId(attemptData.quizId);
  if (questions.length === 0) {
    throw new Error('Quiz này chưa có câu hỏi');
  }

  // Validate that all questions are answered
  if (attemptData.answers.length !== questions.length) {
    throw new Error(`Bạn phải trả lời đủ ${questions.length} câu hỏi`);
  }

  // Create a map of question IDs to questions for easy lookup
  const questionMap = new Map();
  questions.forEach(q => {
    questionMap.set(q._id!.toString(), q);
  });

  // Validate all question IDs exist
  for (const answer of attemptData.answers) {
    if (!questionMap.has(answer.questionId)) {
      throw new Error(`Câu hỏi ${answer.questionId} không tồn tại trong quiz này`);
    }
  }

  // Calculate score
  let correctAnswers = 0;
  const totalQuestions = questions.length;

  for (const answer of attemptData.answers) {
    const question = questionMap.get(answer.questionId);
    if (question && question.correctAnswerIndex === answer.selectedAnswerIndex) {
      correctAnswers++;
    }
  }

  // Calculate percentage score
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  // Determine if passed based on quiz's passingScore
  const passed = score >= quiz.passingScore;

  // Save attempt to database
  const attempt = await quizAttemptModel.createQuizAttempt({
    userId,
    courseId: quiz.courseId.toString(),
    lectureId: quiz.lectureId.toString(),
    quizId: attemptData.quizId,
    answers: attemptData.answers,
    score,
    totalQuestions,
    correctAnswers,
    passed
  });

  if (!attempt) {
    throw new Error(QuizAttemptMessage.FAIL_SUBMIT);
  }

  // Return result summary
  const result: QuizResultSummary = {
    attemptId: attempt._id!.toString(),
    score,
    totalQuestions,
    correctAnswers,
    passed,
    passingScore: quiz.passingScore,
    attemptedAt: attempt.attemptedAt
  };

  return result;
};

/**
 * Get quiz attempt by ID
 */
export const getQuizAttemptById = async (
  attemptId: string,
  userId: string
): Promise<QuizAttemptResponse> => {
  const attempt = await quizAttemptModel.getQuizAttemptById(attemptId);
  
  if (!attempt) {
    throw new Error(QuizAttemptMessage.ATTEMPT_NOT_FOUND);
  }

  // Verify that the attempt belongs to the user
  if (attempt.userId.toString() !== userId) {
    throw new Error('Bạn không có quyền xem kết quả này');
  }

  // Convert ObjectId to string for response
  const response: QuizAttemptResponse = {
    ...attempt,
    userId: attempt.userId.toString(),
    courseId: attempt.courseId.toString(),
    lectureId: attempt.lectureId.toString(),
    quizId: attempt.quizId.toString()
  };

  return response;
};

/**
 * Get all attempts by user
 */
export const getAttemptsByUserId = async (userId: string): Promise<QuizAttemptResponse[]> => {
  const attempts = await quizAttemptModel.getAttemptsByUserId(userId);

  // Convert ObjectId to string for each attempt
  const responseAttempts: QuizAttemptResponse[] = attempts.map(attempt => ({
    ...attempt,
    userId: attempt.userId.toString(),
    courseId: attempt.courseId.toString(),
    lectureId: attempt.lectureId.toString(),
    quizId: attempt.quizId.toString()
  }));

  return responseAttempts;
};

/**
 * Get all attempts for a specific quiz by user
 */
export const getAttemptsByUserAndQuiz = async (
  userId: string,
  quizId: string
): Promise<QuizAttemptResponse[]> => {
  // Verify quiz exists
  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) {
    throw new Error(QuizAttemptMessage.QUIZ_NOT_FOUND);
  }

  const attempts = await quizAttemptModel.getAttemptsByUserAndQuiz(userId, quizId);

  // Convert ObjectId to string for each attempt
  const responseAttempts: QuizAttemptResponse[] = attempts.map(attempt => ({
    ...attempt,
    userId: attempt.userId.toString(),
    courseId: attempt.courseId.toString(),
    lectureId: attempt.lectureId.toString(),
    quizId: attempt.quizId.toString()
  }));

  return responseAttempts;
};

/**
 * Get best attempt for a quiz by user
 */
export const getBestAttemptByUserAndQuiz = async (
  userId: string,
  quizId: string
): Promise<QuizAttemptResponse | null> => {
  // Verify quiz exists
  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) {
    throw new Error(QuizAttemptMessage.QUIZ_NOT_FOUND);
  }

  const attempt = await quizAttemptModel.getBestAttemptByUserAndQuiz(userId, quizId);

  if (!attempt) {
    return null;
  }

  // Convert ObjectId to string for response
  const response: QuizAttemptResponse = {
    ...attempt,
    userId: attempt.userId.toString(),
    courseId: attempt.courseId.toString(),
    lectureId: attempt.lectureId.toString(),
    quizId: attempt.quizId.toString()
  };

  return response;
};

/**
 * Get all attempts for a quiz (for instructors)
 */
export const getAttemptsByQuizId = async (
  quizId: string,
  instructorId: string
): Promise<QuizAttemptResponse[]> => {
  // Verify quiz exists and instructor owns it
  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) {
    throw new Error(QuizAttemptMessage.QUIZ_NOT_FOUND);
  }

  // Verify instructor ownership through course
  const courseService = await import('./course.js');
  const hasAccess = await courseService.verifyCourseInstructor(
    quiz.courseId.toString(),
    instructorId
  );
  if (!hasAccess) {
    throw new Error('Bạn không có quyền xem kết quả quiz này');
  }

  const attempts = await quizAttemptModel.getAttemptsByQuizId(quizId);

  // Convert ObjectId to string for each attempt
  const responseAttempts: QuizAttemptResponse[] = attempts.map(attempt => ({
    ...attempt,
    userId: attempt.userId.toString(),
    courseId: attempt.courseId.toString(),
    lectureId: attempt.lectureId.toString(),
    quizId: attempt.quizId.toString()
  }));

  return responseAttempts;
};

/**
 * Get all attempts for a course by user
 */
export const getAttemptsByUserAndCourse = async (
  userId: string,
  courseId: string
): Promise<QuizAttemptResponse[]> => {
  const attempts = await quizAttemptModel.getAttemptsByUserAndCourse(userId, courseId);

  // Convert ObjectId to string for each attempt
  const responseAttempts: QuizAttemptResponse[] = attempts.map(attempt => ({
    ...attempt,
    userId: attempt.userId.toString(),
    courseId: attempt.courseId.toString(),
    lectureId: attempt.lectureId.toString(),
    quizId: attempt.quizId.toString()
  }));

  return responseAttempts;
};

/**
 * Delete all attempts by quiz ID (when quiz is deleted)
 */
export const deleteAttemptsByQuizId = async (quizId: string): Promise<boolean> => {
  return await quizAttemptModel.deleteAttemptsByQuizId(quizId);
};
