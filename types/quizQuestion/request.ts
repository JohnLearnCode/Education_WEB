import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';
import { QuizType } from '../common/enums.js';
import { Answer } from '../answer/request.js';

/**
 * QuizQuestion Request Types - Input Data
 */

// QuizQuestion Entity Interface
export interface QuizQuestion extends BaseEntity {
  quizId: ObjectId;
  questionText: string;
  imageUrl?: string; // Hỗ trợ hình ảnh cho câu hỏi
  answerIds: ObjectId[]; // Mảng các answer options
  correctAnswerIds: ObjectId[]; // Mảng ID của đáp án đúng
  requiredAnswers: number; // Số đáp án cần chọn (= correctAnswerIds.length)
  type: QuizType; // MULTIPLE_CHOICE, FILL_BLANK
  createdAt: Date;
}

// Create QuizQuestion Request (với answers inline)
export interface CreateQuizQuestionRequest {
  quizId: string;
  questionText: string;
  imageUrl?: string;
  answers: { text: string; imageUrl?: string }[]; // Tạo answers inline
  correctAnswerIndices: number[]; // Index của đáp án đúng trong mảng answers
  type: QuizType;
  // requiredAnswers sẽ tự động = correctAnswerIndices.length
}

// Update QuizQuestion Request
export interface UpdateQuizQuestionRequest {
  questionText?: string;
  imageUrl?: string;
  answerIds?: string[];
  correctAnswerIds?: string[];
  requiredAnswers?: number;
  type?: QuizType;
}

// QuizQuestion Response với populated answers
export interface QuizQuestionResponse extends Omit<QuizQuestion, 'quizId' | 'answerIds' | 'correctAnswerIds'> {
  quizId: string;
  answers: Answer[]; // Populated answers
  correctAnswerIds: string[];
  requiredAnswers: number;
}

// QuizQuestion Response cho student (không có correctAnswerIds, answers được shuffle)
export interface QuizQuestionStudentResponse extends Omit<QuizQuestionResponse, 'correctAnswerIds'> {
  requiredAnswers: number; // Số đáp án cần chọn
}
