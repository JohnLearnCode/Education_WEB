import {
  CreateComplaintRequest,
  UpdateComplaintRequest,
  ComplaintResponse,
  ComplaintQueryParams
} from '../types/complaint/request';
import * as complaintModel from '../model/complaint';
import { AppError } from '../errors/AppError';

/**
 * Convert complaint to response format
 */
const toResponse = (complaint: any): ComplaintResponse => {
  return {
    ...complaint,
    _id: complaint._id?.toString(),
    userId: complaint.userId.toString(),
    courseId: complaint.courseId?.toString(),
    instructorId: complaint.instructorId?.toString(),
    adminId: complaint.adminId?.toString()
  };
};

/**
 * Create a new complaint
 */
export const createComplaint = async (
  complaintData: CreateComplaintRequest,
  userId: string
): Promise<ComplaintResponse> => {
  try {
    const complaint = await complaintModel.createComplaint(complaintData, userId);

    if (!complaint) {
      throw new AppError('Không thể tạo khiếu nại', 500);
    }

    return toResponse(complaint);
  } catch (error: any) {
    throw new AppError(error.message || 'Lỗi khi tạo khiếu nại', 400);
  }
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (
  complaintId: string,
  userId: string
): Promise<ComplaintResponse> => {
  const complaint = await complaintModel.getComplaintById(complaintId);

  if (!complaint) {
    throw new AppError('Không tìm thấy khiếu nại', 404);
  }

  // Check if user owns this complaint
  if (complaint.userId.toString() !== userId) {
    throw new AppError('Bạn không có quyền xem khiếu nại này', 403);
  }

  return toResponse(complaint);
};

/**
 * Get all complaints by user
 */
export const getUserComplaints = async (
  userId: string,
  queryParams: ComplaintQueryParams = {}
): Promise<{
  complaints: ComplaintResponse[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { complaints, total } = await complaintModel.getComplaintsByUserId(
    userId,
    queryParams
  );

  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const totalPages = Math.ceil(total / limit);

  const responseComplaints: ComplaintResponse[] = complaints.map(toResponse);

  return {
    complaints: responseComplaints,
    total,
    page,
    totalPages
  };
};

/**
 * Update complaint
 */
export const updateComplaint = async (
  complaintId: string,
  userId: string,
  updateData: UpdateComplaintRequest
): Promise<ComplaintResponse> => {
  try {
    const updated = await complaintModel.updateComplaint(
      complaintId,
      userId,
      updateData
    );

    if (!updated) {
      throw new AppError('Không thể cập nhật khiếu nại', 400);
    }

    return toResponse(updated);
  } catch (error: any) {
    throw new AppError(error.message || 'Lỗi khi cập nhật khiếu nại', 400);
  }
};

/**
 * Delete complaint
 */
export const deleteComplaint = async (
  complaintId: string,
  userId: string
): Promise<void> => {
  try {
    const deleted = await complaintModel.deleteComplaint(complaintId, userId);

    if (!deleted) {
      throw new AppError('Không thể xóa khiếu nại', 400);
    }
  } catch (error: any) {
    throw new AppError(error.message || 'Lỗi khi xóa khiếu nại', 400);
  }
};
