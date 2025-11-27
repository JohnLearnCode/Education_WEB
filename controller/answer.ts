import { Request, Response, NextFunction } from 'express';
import * as answerService from '../service/answer.js';
import { StatusCodes } from 'http-status-codes';
import { CreateAnswerRequest, UpdateAnswerRequest, BulkCreateAnswersRequest } from '../types/answer/request.js';
import { AnswerMessage } from '../types/answer/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Create a new answer
 */
export const createAnswer = async (
  req: Request<{}, {}, CreateAnswerRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const answer = await answerService.createAnswer(req.body);
    return ResponseHelper.success(
      res,
      AnswerMessage.SUCCESS_CREATE,
      answer,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk create answers
 */
export const bulkCreateAnswers = async (
  req: Request<{}, {}, BulkCreateAnswersRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const answers = await answerService.bulkCreateAnswers(req.body.answers);
    return ResponseHelper.success(
      res,
      AnswerMessage.SUCCESS_CREATE,
      answers,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get answer by ID
 */
export const getAnswerById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const answer = await answerService.getAnswerById(id);
    
    return ResponseHelper.success(
      res,
      AnswerMessage.SUCCESS_GET,
      answer,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update answer by ID
 */
export const updateAnswer = async (
  req: Request<{ id: string }, {}, UpdateAnswerRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const answer = await answerService.updateAnswer(id, req.body);
    
    return ResponseHelper.success(
      res,
      AnswerMessage.SUCCESS_UPDATE,
      answer,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete answer by ID
 */
export const deleteAnswer = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await answerService.deleteAnswer(id);
    
    return ResponseHelper.success(
      res,
      AnswerMessage.SUCCESS_DELETE,
      { message: 'Answer deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
