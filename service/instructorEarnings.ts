import {
  CreateInstructorEarningsRequest,
  UpdateEarningStatusRequest,
  InstructorEarningsResponse,
  InstructorEarningsQueryParams,
  InstructorEarningsSummary,
  EarningStatus
} from '../types/instructorEarnings/request.js';
import { InstructorEarningsMessage } from '../types/instructorEarnings/enums.js';
import * as instructorEarningsModel from '../model/instructorEarnings.js';
import * as courseService from './course.js';

const toResponse = (earning: any): InstructorEarningsResponse => {
  return {
    ...earning,
    _id: earning._id?.toString(),
    instructorId: earning.instructorId.toString(),
    courseId: earning.courseId.toString(),
    orderId: earning.orderId.toString()
  };
};

export const createInstructorEarnings = async (
  data: CreateInstructorEarningsRequest
): Promise<InstructorEarningsResponse> => {
  if (data.amount <= 0) {
    throw new Error(InstructorEarningsMessage.INVALID_AMOUNT);
  }

  const course = await courseService.getCourseById(data.courseId);
  if (!course) {
    throw new Error('Khóa học không tồn tại');
  }

  if (course.instructorId !== data.instructorId) {
    throw new Error('Instructor không sở hữu khóa học này');
  }

  const existingEarning = await instructorEarningsModel.getEarningByOrderId(data.orderId);
  if (existingEarning) {
    throw new Error(InstructorEarningsMessage.DUPLICATE_ORDER);
  }

  const earning = await instructorEarningsModel.createInstructorEarnings(data);

  if (!earning) {
    throw new Error(InstructorEarningsMessage.FAIL_CREATE);
  }

  return toResponse(earning);
};

export const getEarningById = async (earningId: string): Promise<InstructorEarningsResponse> => {
  const earning = await instructorEarningsModel.getEarningById(earningId);

  if (!earning) {
    throw new Error(InstructorEarningsMessage.EARNING_NOT_FOUND);
  }

  return toResponse(earning);
};

export const getMyEarnings = async (
  instructorId: string,
  queryParams: InstructorEarningsQueryParams = {}
): Promise<{ earnings: InstructorEarningsResponse[]; total: number; page: number; totalPages: number }> => {
  const { earnings, total } = await instructorEarningsModel.getEarningsByInstructor(
    instructorId,
    queryParams
  );

  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const totalPages = Math.ceil(total / limit);

  const responseEarnings: InstructorEarningsResponse[] = earnings.map(toResponse);

  return {
    earnings: responseEarnings,
    total,
    page,
    totalPages
  };
};

export const updateEarningStatus = async (
  earningId: string,
  instructorId: string,
  data: UpdateEarningStatusRequest
): Promise<InstructorEarningsResponse> => {
  const earning = await instructorEarningsModel.getEarningById(earningId);

  if (!earning) {
    throw new Error(InstructorEarningsMessage.EARNING_NOT_FOUND);
  }

  if (earning.instructorId.toString() !== instructorId) {
    throw new Error('Bạn không có quyền cập nhật thu nhập này');
  }

  const updated = await instructorEarningsModel.updateEarningStatus(earningId, data.status);

  if (!updated) {
    throw new Error(InstructorEarningsMessage.FAIL_UPDATE);
  }

  return toResponse(updated);
};

export const getMyEarningsSummary = async (
  instructorId: string
): Promise<InstructorEarningsSummary> => {
  return await instructorEarningsModel.getInstructorEarningsSummary(instructorId);
};

export const deleteEarning = async (earningId: string, instructorId: string): Promise<boolean> => {
  const earning = await instructorEarningsModel.getEarningById(earningId);

  if (!earning) {
    throw new Error(InstructorEarningsMessage.EARNING_NOT_FOUND);
  }

  if (earning.instructorId.toString() !== instructorId) {
    throw new Error('Bạn không có quyền xóa thu nhập này');
  }

  const success = await instructorEarningsModel.deleteEarning(earningId);

  if (!success) {
    throw new Error(InstructorEarningsMessage.FAIL_DELETE);
  }

  return true;
};
