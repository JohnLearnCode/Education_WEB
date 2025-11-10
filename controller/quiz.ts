import { Request, Response, NextFunction } from 'express';
import * as quizService from '../service/quiz.js';
import { StatusCodes } from 'http-status-codes';
import { CreateQuizRequest, UpdateQuizRequest } from '../types/quiz/request.js';
import { QuizMessage } from '../types/quiz/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Create a new quiz (instructor only)
 */
export const createQuiz = async (
  req: Request<{}, {}, CreateQuizRequest>,
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

    const quiz = await quizService.createQuiz(req.body, instructorId);
    return ResponseHelper.success(
      res,
      QuizMessage.SUCCESS_CREATE,
      quiz,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get quiz by ID (public)
 */
export const getQuizById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const quiz = await quizService.getQuizById(id);
    
    return ResponseHelper.success(
      res,
      QuizMessage.SUCCESS_GET,
      quiz,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get quiz by lecture ID (public)
 */
export const getQuizByLectureId = async (
  req: Request<{ lectureId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lectureId } = req.params;
    const quiz = await quizService.getQuizByLectureId(lectureId);
    
    return ResponseHelper.success(
      res,
      QuizMessage.SUCCESS_GET,
      quiz,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get quizzes by course ID (public)
 */
export const getQuizzesByCourseId = async (
  req: Request<{ courseId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const quizzes = await quizService.getQuizzesByCourseId(courseId);
    
    return ResponseHelper.success(
      res,
      QuizMessage.SUCCESS_GET,
      quizzes,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update quiz by ID (instructor only)
 */
export const updateQuiz = async (
  req: Request<{ id: string }, {}, UpdateQuizRequest>,
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
    const quiz = await quizService.updateQuiz(id, instructorId, req.body);
    
    return ResponseHelper.success(
      res,
      QuizMessage.SUCCESS_UPDATE,
      quiz,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete quiz by ID (instructor only)
 */
export const deleteQuiz = async (
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
    await quizService.deleteQuiz(id, instructorId);
    
    return ResponseHelper.success(
      res,
      QuizMessage.SUCCESS_DELETE,
      { message: 'Quiz deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
