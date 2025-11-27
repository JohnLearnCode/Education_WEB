import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

export interface CourseProgress {
  courseId: ObjectId;
  completedLectures: ObjectId[];
  lastAccessedAt: Date;
  progress: number;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  password: string;
  googleId?: string;
  avatarUrl?: string;
  isInstructor: boolean;
  isAdmin: boolean;
  enrolledCourseIds: ObjectId[];
  courseProgress: CourseProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileRequest {
  name?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isInstructor?: boolean;
  sortBy?: 'createdAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponse extends Omit<User, 'password' | 'enrolledCourseIds' | 'courseProgress'> {
  enrolledCourseIds: string[];
  courseProgress: {
    courseId: string;
    completedLectures: string[];
    lastAccessedAt: Date;
    progress: number;
  }[];
}

export interface UserProfileResponse extends Omit<User, 'password' | 'enrolledCourseIds' | 'courseProgress'> {
  enrolledCourseIds: string[];
  courseProgress: {
    courseId: string;
    completedLectures: string[];
    lastAccessedAt: Date;
    progress: number;
  }[];
}
