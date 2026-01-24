import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';
import { DiscountType } from '../promotion/request.js';

/**
 * Coupon Types - Discount codes for checkout
 */

// Coupon Entity Interface
export interface Coupon extends BaseEntity {
  code: string;  // Unique, uppercase
  discountType: DiscountType;
  discountValue: number;  // Percentage (0-100) or fixed amount
  minOrderAmount?: number;  // Minimum order to apply coupon
  maxUses: number;  // 0 = unlimited
  currentUses: number;
  maxUsesPerUser: number;  // 0 = unlimited (per-coupon setting)
  targetCourseIds: ObjectId[];  // Empty = applies to all courses
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;
  isDeleted: boolean;  // Soft delete for analytics
  createdAt: Date;
  updatedAt: Date;
}

// Create Coupon Request
export interface CreateCouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  targetCourseIds?: string[];
  startDate: string | Date;
  expiryDate: string | Date;
  isActive?: boolean;
}

// Update Coupon Request
export interface UpdateCouponRequest {
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  targetCourseIds?: string[];
  startDate?: string | Date;
  expiryDate?: string | Date;
  isActive?: boolean;
}

// Coupon Query Parameters
export interface CouponQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  includeExpired?: boolean;
  code?: string;  // Search by code
}

// Validate Coupon Request
export interface ValidateCouponRequest {
  code: string;
  courseIds: string[];
  orderAmount: number;
}

// Validate Coupon Response
export interface ValidateCouponResponse {
  valid: boolean;
  message?: string;
  coupon?: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number;  // Calculated discount for this order
  };
}

// Coupon Response
export interface CouponResponse extends Omit<Coupon, 'targetCourseIds'> {
  targetCourseIds: string[];
  usageRate?: number;  // currentUses / maxUses (if maxUses > 0)
  targetCourses?: Array<{
    _id: string;
    title: string;
  }>;
}
