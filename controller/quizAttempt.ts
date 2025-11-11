import { Request, Response, NextFunction } from 'express';
import * as quizAttemptService from '../service/quizAttempt.js';
import { StatusCodes } from 'http-status-codes';
import { SubmitQuizAttemptRequest } from '../types/quizAttempt/request.js';
import { QuizAttemptMessage } from '../types/quizAttempt/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Submit quiz attempt (authenticated user)
 */
export const submitQuizAttempt = async (
  req: Request<{}, {}, SubmitQuizAttemptRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const result = await quizAttemptService.submitQuizAttempt(req.body, userId);
    
    // Return different message based on pass/fail
    const message = result.passed 
      ? QuizAttemptMessage.CONGRATULATIONS_PASSED 
      : QuizAttemptMessage.TRY_AGAIN;
    
    return ResponseHelper.success(
      res,
      message,
      result,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get quiz attempt by ID (authenticated user - own attempts only)
 */
export const getQuizAttemptById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { id } = req.params;
    const attempt = await quizAttemptService.getQuizAttemptById(id, userId);
    
    return ResponseHelper.success(
      res,
      QuizAttemptMessage.SUCCESS_GET,
      attempt,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all attempts by current user
 */
export const getMyAttempts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const attempts = await quizAttemptService.getAttemptsByUserId(userId);
    
    return ResponseHelper.success(
      res,
      QuizAttemptMessage.SUCCESS_GET,
      attempts,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all attempts for a specific quiz by current user
 */
export const getMyAttemptsByQuiz = async (
  req: Request<{ quizId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { quizId } = req.params;
    const attempts = await quizAttemptService.getAttemptsByUserAndQuiz(userId, quizId);
    
    return ResponseHelper.success(
      res,
      QuizAttemptMessage.SUCCESS_GET,
      attempts,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get best attempt for a quiz by current user
 */
export const getMyBestAttempt = async (
  req: Request<{ quizId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { quizId } = req.params;
    const attempt = await quizAttemptService.getBestAttemptByUserAndQuiz(userId, quizId);
    
    return ResponseHelper.success(
      res,
      QuizAttemptMessage.SUCCESS_GET,
      attempt,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all attempts for a course by current user
 */
export const getMyAttemptsByCourse = async (
  req: Request<{ courseId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { courseId } = req.params;
    const attempts = await quizAttemptService.getAttemptsByUserAndCourse(userId, courseId);
    
    return ResponseHelper.success(
      res,
      QuizAttemptMessage.SUCCESS_GET,
      attempts,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all attempts for a quiz (instructor only)
 */
export const getAttemptsByQuizId = async (
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
    const attempts = await quizAttemptService.getAttemptsByQuizId(quizId, instructorId);
    
    return ResponseHelper.success(
      res,
      QuizAttemptMessage.SUCCESS_GET,
      attempts,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
