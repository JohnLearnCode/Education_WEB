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
 * Get questions by quiz ID (for instructor - with correct answers)
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
 * Get questions by quiz ID for student (without correct answers)
 */
export const getQuestionsByQuizIdForStudent = async (
  req: Request<{ quizId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.params;
    const questions = await quizQuestionService.getQuestionsByQuizIdForStudent(quizId);
    
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
 * Import quiz questions from CSV/XLSX file (instructor only)
 */
export const importQuestions = async (
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
    const file = req.file;

    if (!file) {
      return ResponseHelper.error(
        res,
        'Vui lòng upload file CSV hoặc XLSX',
        StatusCodes.BAD_REQUEST.toString()
      );
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      return ResponseHelper.error(
        res,
        'Chỉ chấp nhận file CSV hoặc XLSX',
        StatusCodes.BAD_REQUEST.toString()
      );
    }

    const result = await quizQuestionService.importQuestionsFromFile(
      quizId,
      instructorId,
      file.buffer,
      file.originalname
    );

    return ResponseHelper.success(
      res,
      `Import thành công ${result.success} câu hỏi${result.failed > 0 ? `, ${result.failed} câu thất bại` : ''}`,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Download import template (instructor only)
 */
export const downloadImportTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const templateBuffer = quizQuestionService.generateImportTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=quiz_questions_template.xlsx');
    res.send(templateBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Preview import questions from CSV/XLSX file (instructor only)
 */
export const previewImport = async (
  req: Request,
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

    const file = req.file;

    if (!file) {
      return ResponseHelper.error(
        res,
        'Vui lòng upload file CSV hoặc XLSX',
        StatusCodes.BAD_REQUEST.toString()
      );
    }

    // Validate file type
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      return ResponseHelper.error(
        res,
        'Chỉ chấp nhận file CSV hoặc XLSX',
        StatusCodes.BAD_REQUEST.toString()
      );
    }

    const result = await quizQuestionService.previewQuestionsFromFile(
      file.buffer,
      file.originalname
    );

    return ResponseHelper.success(
      res,
      `Đọc được ${result.questions.length} câu hỏi${result.errors.length > 0 ? `, ${result.errors.length} lỗi` : ''}`,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Export quiz questions to XLSX file (instructor only)
 */
export const exportQuestions = async (
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
    const fileBuffer = await quizQuestionService.exportQuestionsToFile(quizId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=quiz_questions_${quizId}.xlsx`);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
};

