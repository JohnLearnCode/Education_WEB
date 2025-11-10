import { Request, Response, NextFunction } from 'express';
import * as quizQuestionService from '../service/quizQuestion.js';
import { StatusCodes } from 'http-status-codes';
import { CreateQuizQuestionRequest, UpdateQuizQuestionRequest } from '../types/quizQuestion/request.js';
import { QuizQuestionMessage } from '../types/quizQuestion/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Create a new quiz question (instructor only)
 */
export const createQuizQuestion = async (
  req: Request<{}, {}, CreateQuizQuestionRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const instructorId = (req as any).user?.userId;
    if (!instructorId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const question = await quizQuestionService.createQuizQuestion(req.body, instructorId);
    return ResponseHelper.success(
      res,
      QuizQuestionMessage.SUCCESS_CREATE,
      question,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get quiz question by ID (public)
 */
export const getQuizQuestionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const question = await quizQuestionService.getQuizQuestionById(id);
    
    return ResponseHelper.success(
      res,
      QuizQuestionMessage.SUCCESS_GET,
      question,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get questions by quiz ID (public)
 */
export const getQuestionsByQuizId = async (
  req: Request<{ quizId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.params;
    const questions = await quizQuestionService.getQuestionsByQuizId(quizId);
    
    return ResponseHelper.success(
      res,
      QuizQuestionMessage.SUCCESS_GET,
      questions,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update quiz question by ID (instructor only)
 */
export const updateQuizQuestion = async (
  req: Request<{ id: string }, {}, UpdateQuizQuestionRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const instructorId = (req as any).user?.userId;
    if (!instructorId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { id } = req.params;
    const question = await quizQuestionService.updateQuizQuestion(id, instructorId, req.body);
    
    return ResponseHelper.success(
      res,
      QuizQuestionMessage.SUCCESS_UPDATE,
      question,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete quiz question by ID (instructor only)
 */
export const deleteQuizQuestion = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const instructorId = (req as any).user?.userId;
    if (!instructorId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { id } = req.params;
    await quizQuestionService.deleteQuizQuestion(id, instructorId);
    
    return ResponseHelper.success(
      res,
      QuizQuestionMessage.SUCCESS_DELETE,
      { message: 'Question deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder questions (instructor only)
 */
export const reorderQuestions = async (
  req: Request<{}, {}, { questions: { questionId: string; order: number }[] }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const instructorId = (req as any).user?.userId;
    if (!instructorId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { questions } = req.body;
    await quizQuestionService.reorderQuestions(questions, instructorId);
    
    return ResponseHelper.success(
      res,
      QuizQuestionMessage.SUCCESS_REORDER,
      { message: 'Questions reordered successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get next order number for a quiz (instructor only)
 */
export const getNextOrderNumber = async (
  req: Request<{ quizId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const instructorId = (req as any).user?.userId;
    if (!instructorId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { quizId } = req.params;
    const nextOrder = await quizQuestionService.getNextOrderNumber(quizId, instructorId);
    
    return ResponseHelper.success(
      res,
      'Get next order number successfully',
      { nextOrder },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
