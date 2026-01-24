import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Coupon Usage Types - Tracking coupon usage history
 */

// Coupon Usage Entity Interface
export interface CouponUsage extends BaseEntity {
  couponId: ObjectId;
  userId: ObjectId;
  orderId: ObjectId;
  discountAmount: number;  // Amount saved
  usedAt: Date;
}

// Create Coupon Usage (Internal - used after payment success)
export interface CreateCouponUsageRequest {
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
}

// Coupon Usage Query Parameters
export interface CouponUsageQueryParams {
  page?: number;
  limit?: number;
  couponId?: string;
  userId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

// Coupon Usage Response
export interface CouponUsageResponse extends Omit<CouponUsage, 'couponId' | 'userId' | 'orderId'> {
  couponId: string;
  userId: string;
  orderId: string;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

// Coupon Usage Statistics (for analytics)
export interface CouponUsageStats {
  couponId: string;
  code: string;
  totalUses: number;
  totalDiscountAmount: number;
  uniqueUsers: number;
  usagesByDate: Array<{
    date: string;
    uses: number;
    discountAmount: number;
  }>;
}
