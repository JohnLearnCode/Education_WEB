import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Answer Request Types - Input Data
 */

// Answer Entity Interface
export interface Answer extends BaseEntity {
  text: string;
  imageUrl?: string;
  createdAt: Date;
}

// Create Answer Request
export interface CreateAnswerRequest {
  text: string;
  imageUrl?: string;
}

// Update Answer Request
export interface UpdateAnswerRequest {
  text?: string;
  imageUrl?: string;
}

// Answer Response
export interface AnswerResponse extends Omit<Answer, '_id'> {
  _id: string;
}

// Bulk Create Answers Request
export interface BulkCreateAnswersRequest {
  answers: CreateAnswerRequest[];
}
