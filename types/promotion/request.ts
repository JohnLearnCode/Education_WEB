import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Promotion Types - Time-limited sales and discounts
 */

// Discount Type
export type DiscountType = 'percentage' | 'fixed';

// Promotion Entity Interface
export interface Promotion extends BaseEntity {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;  // Percentage (0-100) or fixed amount
  targetCourseIds: ObjectId[];  // Empty = applies to all courses
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isDeleted: boolean;  // Soft delete for analytics
  createdAt: Date;
  updatedAt: Date;
}

// Create Promotion Request
export interface CreatePromotionRequest {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  targetCourseIds?: string[];
  startDate: string | Date;
  endDate: string | Date;
  isActive?: boolean;
}

// Update Promotion Request
export interface UpdatePromotionRequest {
  name?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  targetCourseIds?: string[];
  startDate?: string | Date;
  endDate?: string | Date;
  isActive?: boolean;
}

// Promotion Query Parameters
export interface PromotionQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  includeExpired?: boolean;
  courseId?: string;  // Filter by target course
}

// Promotion Response
export interface PromotionResponse extends Omit<Promotion, 'targetCourseIds'> {
  targetCourseIds: string[];
  targetCourses?: Array<{
    _id: string;
    title: string;
  }>;
}
