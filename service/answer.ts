import * as answerModel from '../model/answer.js';
import { CreateAnswerRequest, UpdateAnswerRequest, Answer } from '../types/answer/request.js';
import { AppError } from '../errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
import { AnswerMessage } from '../types/answer/enums.js';

/**
 * Create a new answer
 */
export const createAnswer = async (answerData: CreateAnswerRequest): Promise<Answer> => {
  const answer = await answerModel.createAnswer(answerData);
  
  if (!answer) {
    throw new AppError(AnswerMessage.FAIL_CREATE, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  
  return answer;
};

/**
 * Bulk create answers
 */
export const bulkCreateAnswers = async (answers: CreateAnswerRequest[]): Promise<Answer[]> => {
  const createdAnswers = await answerModel.bulkCreateAnswers(answers);
  
  if (createdAnswers.length === 0) {
    throw new AppError(AnswerMessage.FAIL_CREATE, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  
  return createdAnswers;
};

/**
 * Get answer by ID
 */
export const getAnswerById = async (answerId: string): Promise<Answer> => {
  const answer = await answerModel.getAnswerById(answerId);
  
  if (!answer) {
    throw new AppError(AnswerMessage.ANSWER_NOT_FOUND, StatusCodes.NOT_FOUND);
  }
  
  return answer;
};

/**
 * Get answers by IDs
 */
export const getAnswersByIds = async (answerIds: string[]): Promise<Answer[]> => {
  return await answerModel.getAnswersByIds(answerIds);
};

/**
 * Update answer by ID
 */
export const updateAnswer = async (
  answerId: string,
  updateData: UpdateAnswerRequest
): Promise<Answer> => {
  const answer = await answerModel.updateAnswer(answerId, updateData);
  
  if (!answer) {
    throw new AppError(AnswerMessage.FAIL_UPDATE, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  
  return answer;
};

/**
 * Delete answer by ID
 */
export const deleteAnswer = async (answerId: string): Promise<void> => {
  const deleted = await answerModel.deleteAnswer(answerId);
  
  if (!deleted) {
    throw new AppError(AnswerMessage.FAIL_DELETE, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Delete answers by IDs
 */
export const deleteAnswersByIds = async (answerIds: string[]): Promise<void> => {
  await answerModel.deleteAnswersByIds(answerIds);
};
