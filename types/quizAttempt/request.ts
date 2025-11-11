import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * QuizAttempt Request Types - Input Data
 */

// Answer structure for each question
export interface QuestionAnswer {
  questionId: string;
  selectedAnswerIndex: number;
}

// QuizAttempt Entity Interface
export interface QuizAttempt extends BaseEntity {
  userId: ObjectId;
  courseId: ObjectId;
  lectureId: ObjectId;
  quizId: ObjectId;
  answers: QuestionAnswer[]; // Array of answers submitted by student
  score: number; // Percentage score (0-100)
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean; // Based on quiz's passingScore
  attemptedAt: Date;
}

// Submit Quiz Attempt Request
export interface SubmitQuizAttemptRequest {
  quizId: string;
  answers: QuestionAnswer[];
}

// QuizAttempt Response
export interface QuizAttemptResponse extends Omit<QuizAttempt, 'userId' | 'courseId' | 'lectureId' | 'quizId'> {
  userId: string;
  courseId: string;
  lectureId: string;
  quizId: string;
}

// Quiz Result Summary
export interface QuizResultSummary {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  passingScore: number;
  attemptedAt: Date;
}
