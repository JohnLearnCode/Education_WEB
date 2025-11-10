import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * QuizQuestion Request Types - Input Data
 */

// QuizQuestion Entity Interface
export interface QuizQuestion extends BaseEntity {
  quizId: ObjectId;
  questionText: string;
  options: string[]; // Array of answer options
  correctAnswerIndex: number; // Index of correct answer in options array (0-based)
  order: number;
  createdAt: Date;
}

// Create QuizQuestion Request
export interface CreateQuizQuestionRequest {
  quizId: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  order: number;
}

// Update QuizQuestion Request
export interface UpdateQuizQuestionRequest {
  questionText?: string;
  options?: string[];
  correctAnswerIndex?: number;
  order?: number;
}

// QuizQuestion Response
export interface QuizQuestionResponse extends Omit<QuizQuestion, 'quizId'> {
  quizId: string;
}

// Reorder Questions Request
export interface ReorderQuestionsRequest {
  questions: {
    questionId: string;
    order: number;
  }[];
}
