import { Request, Response, NextFunction } from 'express';
import * as complaintService from '../service/complaint';
import { ResponseHelper } from '../utils/response';

/**
 * Create a new complaint
 */
export const createComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      ResponseHelper.error(res, 'Unauthorized', undefined, 401);
      return;
    }

    const complaintData = req.body;
    const complaint = await complaintService.createComplaint(complaintData, userId);

    ResponseHelper.success(res, 'Tạo khiếu nại thành công', complaint, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      ResponseHelper.error(res, 'Unauthorized', undefined, 401);
      return;
    }

    const { complaintId } = req.params;
    const complaint = await complaintService.getComplaintById(complaintId, userId);

    ResponseHelper.success(res, 'Lấy thông tin khiếu nại thành công', complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all complaints of current user
 */
export const getUserComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      ResponseHelper.error(res, 'Unauthorized', undefined, 401);
      return;
    }

    const queryParams = req.query;
    const result = await complaintService.getUserComplaints(userId, queryParams);

    ResponseHelper.success(res, 'Lấy danh sách khiếu nại thành công', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update complaint
 */
export const updateComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      ResponseHelper.error(res, 'Unauthorized', undefined, 401);
      return;
    }

    const { complaintId } = req.params;
    const updateData = req.body;
    const complaint = await complaintService.updateComplaint(
      complaintId,
      userId,
      updateData
    );

    ResponseHelper.success(res, 'Cập nhật khiếu nại thành công', complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete complaint
 */
export const deleteComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      ResponseHelper.error(res, 'Unauthorized', undefined, 401);
      return;
    }

    const { complaintId } = req.params;
    await complaintService.deleteComplaint(complaintId, userId);

    ResponseHelper.success(res, 'Xóa khiếu nại thành công', null);
  } catch (error) {
    next(error);
  }
};
