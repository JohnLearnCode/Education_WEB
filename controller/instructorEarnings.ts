import { Request, Response, NextFunction } from 'express';
import * as instructorEarningsService from '../service/instructorEarnings.js';
import { StatusCodes } from 'http-status-codes';
import {
  CreateInstructorEarningsRequest,
  UpdateEarningStatusRequest,
  InstructorEarningsQueryParams
} from '../types/instructorEarnings/request.js';
import { InstructorEarningsMessage } from '../types/instructorEarnings/enums.js';
import { ResponseHelper } from '../utils/response.js';

export const createEarning = async (
  req: Request<{}, {}, CreateInstructorEarningsRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const earning = await instructorEarningsService.createInstructorEarnings(req.body);
    return ResponseHelper.success(
      res,
      InstructorEarningsMessage.SUCCESS_CREATE,
      earning,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

export const getEarningById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const earning = await instructorEarningsService.getEarningById(id);

    return ResponseHelper.success(
      res,
      InstructorEarningsMessage.SUCCESS_GET,
      earning,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const getMyEarnings = async (
  req: Request<{}, {}, {}, InstructorEarningsQueryParams>,
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

    const result = await instructorEarningsService.getMyEarnings(instructorId, req.query);

    return ResponseHelper.success(
      res,
      InstructorEarningsMessage.SUCCESS_GET,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const getMyEarningsSummary = async (
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

    const summary = await instructorEarningsService.getMyEarningsSummary(instructorId);

    return ResponseHelper.success(
      res,
      InstructorEarningsMessage.SUCCESS_GET,
      summary,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const updateEarningStatus = async (
  req: Request<{ id: string }, {}, UpdateEarningStatusRequest>,
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
    const earning = await instructorEarningsService.updateEarningStatus(id, instructorId, req.body);

    return ResponseHelper.success(
      res,
      InstructorEarningsMessage.SUCCESS_UPDATE,
      earning,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const deleteEarning = async (
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
    await instructorEarningsService.deleteEarning(id, instructorId);

    return ResponseHelper.success(
      res,
      InstructorEarningsMessage.SUCCESS_DELETE,
      { message: 'Earning deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
