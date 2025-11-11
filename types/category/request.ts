import { BaseEntity } from '../common/interface.js';

/**
 * Category Request Types - Input Data
 */

// Category Entity Interface
export interface Category extends BaseEntity {
  name: string;
  description: string;
  courseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create Category Request
export interface CreateCategoryRequest {
  name: string;
  description: string;
}

// Update Category Request
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// Category Response
export interface CategoryResponse extends Omit<Category, '_id'> {
  _id: string;
}

// Category with Courses
export interface CategoryWithCourses extends CategoryResponse {
  courses?: Array<{
    _id: string;
    title: string;
    thumbnail?: string;
    price: number;
  }>;
}
