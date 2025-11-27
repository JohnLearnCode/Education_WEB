import {
  AdminUpdateComplaintRequest,
  ComplaintResponse,
  ComplaintQueryParams,
  ComplaintStats
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
 * Get all complaints (Admin)
 */
export const getAllComplaints = async (
  queryParams: ComplaintQueryParams = {}
): Promise<{
  complaints: ComplaintResponse[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { complaints, total } = await complaintModel.getAllComplaints(queryParams);

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
 * Get complaint by ID (Admin)
 */
export const getComplaintById = async (complaintId: string): Promise<ComplaintResponse> => {
  const complaint = await complaintModel.getComplaintById(complaintId);

  if (!complaint) {
    throw new AppError('Không tìm thấy khiếu nại', 404);
  }

  return toResponse(complaint);
};

/**
 * Update complaint (Admin)
 */
export const updateComplaint = async (
  complaintId: string,
  adminId: string,
  updateData: AdminUpdateComplaintRequest
): Promise<ComplaintResponse> => {
  const updated = await complaintModel.adminUpdateComplaint(
    complaintId,
    adminId,
    updateData
  );

  if (!updated) {
    throw new AppError('Không thể cập nhật khiếu nại', 400);
  }

  return toResponse(updated);
};

/**
 * Delete complaint (Admin)
 */
export const deleteComplaint = async (complaintId: string): Promise<void> => {
  const deleted = await complaintModel.adminDeleteComplaint(complaintId);

  if (!deleted) {
    throw new AppError('Không thể xóa khiếu nại', 400);
  }
};

/**
 * Get complaint statistics
 */
export const getComplaintStats = async (): Promise<ComplaintStats> => {
  return await complaintModel.getComplaintStats();
};
