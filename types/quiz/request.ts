import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Quiz Request Types - Input Data
 */

// Quiz Entity Interface (Overview only, no questions stored here)
export interface Quiz extends BaseEntity {
  lectureId: ObjectId;
  courseId: ObjectId;
  title: string;
  passingScore: number;
  timeLimit: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

// Create Quiz Request
export interface CreateQuizRequest {
  lectureId: string;
  courseId: string;
  title: string;
  passingScore: number;
  timeLimit: number;
}

// Update Quiz Request
export interface UpdateQuizRequest {
  title?: string;
  passingScore?: number;
  timeLimit?: number;
}

// Quiz Response
export interface QuizResponse extends Omit<Quiz, 'lectureId' | 'courseId'> {
  lectureId: string;
  courseId: string;
}
