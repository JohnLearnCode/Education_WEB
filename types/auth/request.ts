import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Auth Request Types - Input Data
 */

// User Entity Interface
export interface User extends BaseEntity {
  email: string;
  password: string;
  name: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  avatarUrl?: string;
  isInstructor: boolean;
  isAdmin: boolean;
  enrolledCourseIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Create User Request
export interface RegisterUserRequest {
  password: string;
  email: string;
  name: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  avatarUrl?: string;
  isInstructor?: boolean;
  isAdmin?: boolean;
}

export interface LoginAuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}



