import { Request, Response, NextFunction } from 'express';
import * as adminComplaintsService from '../service/adminComplaints';
import { ResponseHelper } from '../utils/response';

/**
 * Get all complaints with pagination and filters
 */
export const getAllComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryParams = req.query;
    const result = await adminComplaintsService.getAllComplaints(queryParams);

    ResponseHelper.success(res, 'Lấy danh sách khiếu nại thành công', result);
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
    const { complaintId } = req.params;
    const complaint = await adminComplaintsService.getComplaintById(complaintId);

    ResponseHelper.success(res, 'Lấy thông tin khiếu nại thành công', complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * Update complaint status and response
 */
export const updateComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = (req.user as any)?.userId;
    if (!adminId) {
      ResponseHelper.error(res, 'Unauthorized', undefined, 401);
      return;
    }

    const { complaintId } = req.params;
    const updateData = req.body;
    const complaint = await adminComplaintsService.updateComplaint(
      complaintId,
      adminId,
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
    const { complaintId } = req.params;
    await adminComplaintsService.deleteComplaint(complaintId);

    ResponseHelper.success(res, 'Xóa khiếu nại thành công', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Get complaint statistics
 */
export const getComplaintStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminComplaintsService.getComplaintStats();

    ResponseHelper.success(res, 'Lấy thống kê khiếu nại thành công', stats);
  } catch (error) {
    next(error);
  }
};
