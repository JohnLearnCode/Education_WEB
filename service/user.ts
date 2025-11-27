import {
  UpdateUserProfileRequest,
  UserQueryParams,
  UserResponse,
  UserProfileResponse
} from '../types/user/request.js';
import { UserMessage } from '../types/user/enums.js';
import * as userModel from '../model/user.js';

const toUserResponse = (user: any): UserResponse => {
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    _id: user._id?.toString(),
    enrolledCourseIds: (user.enrolledCourseIds || []).map((id: any) => id.toString()),
    courseProgress: (user.courseProgress || []).map((p: any) => ({
      courseId: p.courseId.toString(),
      completedLectures: (p.completedLectures || []).map((id: any) => id.toString()),
      lastAccessedAt: p.lastAccessedAt,
      progress: p.progress
    }))
  };
};

const toProfileResponse = (user: any): UserProfileResponse => {
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    _id: user._id?.toString(),
    enrolledCourseIds: (user.enrolledCourseIds || []).map((id: any) => id.toString()),
    courseProgress: (user.courseProgress || []).map((p: any) => ({
      courseId: p.courseId.toString(),
      completedLectures: (p.completedLectures || []).map((id: any) => id.toString()),
      lastAccessedAt: p.lastAccessedAt,
      progress: p.progress
    }))
  };
};

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const user = await userModel.getUserById(userId);

  if (!user) {
    throw new Error(UserMessage.USER_NOT_FOUND);
  }

  return toProfileResponse(user);
};

export const getPublicUserProfile = async (userId: string): Promise<UserResponse> => {
  const user = await userModel.getUserById(userId);

  if (!user) {
    throw new Error(UserMessage.USER_NOT_FOUND);
  }

  return toUserResponse(user);
};

export const updateUserProfile = async (
  userId: string,
  updateData: UpdateUserProfileRequest
): Promise<UserProfileResponse> => {
  const updated = await userModel.updateUserProfile(userId, updateData);

  if (!updated) {
    throw new Error(UserMessage.FAIL_UPDATE);
  }

  return toProfileResponse(updated);
};

export const getAllUsers = async (
  queryParams: UserQueryParams = {}
): Promise<{ users: UserResponse[]; total: number; page: number; totalPages: number }> => {
  const { users, total } = await userModel.getAllUsers(queryParams);

  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const totalPages = Math.ceil(total / limit);

  const responseUsers: UserResponse[] = users.map(toUserResponse);

  return {
    users: responseUsers,
    total,
    page,
    totalPages
  };
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const success = await userModel.deleteUser(userId);

  if (!success) {
    throw new Error(UserMessage.FAIL_DELETE);
  }

  return true;
};

export const enrollUserInCourse = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  const success = await userModel.addEnrolledCourse(userId, courseId);
  if (!success) {
    throw new Error('Không thể ghi danh khóa học');
  }
  return true;
};

export const updateUserCourseProgress = async (
  userId: string,
  courseId: string,
  completedLectureId: string
): Promise<boolean> => {
  const success = await userModel.updateCourseProgress(userId, courseId, completedLectureId);
  if (!success) {
    throw new Error('Không thể cập nhật tiến độ khóa học');
  }
  return true;
};
