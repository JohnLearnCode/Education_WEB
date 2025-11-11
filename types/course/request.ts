import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Course Request Types - Input Data
 */

// Course Entity Interface
export interface Course extends BaseEntity {
  title: string;
  description: string;
  instructorId: ObjectId;
  categoryId: ObjectId;
  price: number;
  level: string;
  rating: number;
  ratingCount: number;
  imageUrl: string;
  slug: string;
  totalDuration: string;
  lectureCount: number;
  studentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create Course Request
export interface CreateCourseRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  level: string;
  imageUrl?: string;
  totalDuration?: string;
  lectureCount?: number;
}

// Update Course Request
export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  level?: string;
  imageUrl?: string;
  totalDuration?: string;
  lectureCount?: number;
}

// Course Query Parameters
export interface CourseQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'price' | 'rating' | 'studentCount';
  sortOrder?: 'asc' | 'desc';
}

// Instructor Info for Course Response
export interface InstructorInfo {
  _id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// Course Response with instructor info
export interface CourseResponse extends Omit<Course, 'instructorId' | 'categoryId'> {
  instructorId: string;
  categoryId: string;
  instructor?: InstructorInfo;
  category?: {
    _id: string;
    name: string;
  };
}
