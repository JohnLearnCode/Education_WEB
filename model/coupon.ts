import { getCollection } from "../config/database.js";
import { Coupon } from "../types/coupon/request.js";
import { CouponUsage } from "../types/coupon/coupon-usage.js";
import { CollectionName } from "../types/common/enums.js";
import { ObjectId, Filter } from "mongodb";

/**
 * Create a new coupon
 */
export const createCoupon = async (data: {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  targetCourseIds?: ObjectId[];
  startDate: Date;
  expiryDate: Date;
  isActive?: boolean;
}): Promise<Coupon | null> => {
  try {
    const collection = getCollection<Coupon>(CollectionName.COUPONS);
    const now = new Date();

    const newCoupon = {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount,
      maxUses: data.maxUses ?? 0,
      currentUses: 0,
      maxUsesPerUser: data.maxUsesPerUser ?? 0,
      targetCourseIds: data.targetCourseIds || [],
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      isActive: data.isActive ?? true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newCoupon as unknown as Coupon);
    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }
    return null;
  } catch (error) {
    console.error('Error creating coupon:', error);
    return null;
  }
};

/**
 * Get coupon by ID
 */
export const getCouponById = async (id: string): Promise<Coupon | null> => {
  try {
    const collection = getCollection<Coupon>(CollectionName.COUPONS);
    return await collection.findOne({
      _id: new ObjectId(id),
      isDeleted: false
    });
  } catch (error) {
    console.error('Error getting coupon by id:', error);
    return null;
  }
};

/**
 * Get coupon by code
 */
export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  try {
    const collection = getCollection<Coupon>(CollectionName.COUPONS);
    return await collection.findOne({
      code: code.toUpperCase(),
      isDeleted: false
    });
  } catch (error) {
    console.error('Error getting coupon by code:', error);
    return null;
  }
};

/**
 * Get all coupons with filtering
 */
export const getAllCoupons = async (query: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  includeExpired?: boolean;
  code?: string;
}): Promise<{ coupons: Coupon[]; total: number }> => {
  try {
    const collection = getCollection<Coupon>(CollectionName.COUPONS);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Filter<Coupon> = { isDeleted: false };

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (!query.includeExpired) {
      filter.expiryDate = { $gte: new Date() };
    }

    if (query.code) {
      filter.code = { $regex: query.code.toUpperCase(), $options: 'i' };
    }

    const [coupons, total] = await Promise.all([
      collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter)
    ]);

    return { coupons, total };
  } catch (error) {
    console.error('Error getting all coupons:', error);
    return { coupons: [], total: 0 };
  }
};

/**
 * Update coupon
 */
export const updateCoupon = async (
  id: string,
  data: Partial<Omit<Coupon, '_id' | 'createdAt' | 'isDeleted' | 'currentUses'>>
): Promise<Coupon | null> => {
  try {
    const collection = getCollection<Coupon>(CollectionName.COUPONS);

    // Normalize code to uppercase if provided
    if (data.code) {
      data.code = data.code.toUpperCase();
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), isDeleted: false },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  } catch (error) {
    console.error('Error updating coupon:', error);
    return null;
  }
};

/**
 * Soft delete coupon (archive for analytics)
 */
export const deleteCoupon = async (id: string): Promise<boolean> => {
  try {
    const collection = getCollection<Coupon>(CollectionName.COUPONS);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, isActive: false, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return false;
  }
};

/**
 * Increment coupon usage atomically
 */
export const incrementCouponUsage = async (couponId: string): Promise<boolean> => {
  try {
    const collection = getCollection<Coupon>(CollectionName.COUPONS);
    const result = await collection.updateOne(
      { _id: new ObjectId(couponId) },
      { $inc: { currentUses: 1 }, $set: { updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    return false;
  }
};

/**
 * Record coupon usage
 */
export const recordCouponUsage = async (data: {
  couponId: ObjectId;
  userId: ObjectId;
  orderId: ObjectId;
  discountAmount: number;
}): Promise<CouponUsage | null> => {
  try {
    const collection = getCollection<CouponUsage>(CollectionName.COUPON_USAGES);
    const now = new Date();

    const usage = {
      couponId: data.couponId,
      userId: data.userId,
      orderId: data.orderId,
      discountAmount: data.discountAmount,
      usedAt: now,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(usage as unknown as CouponUsage);
    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }
    return null;
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    return null;
  }
};

/**
 * Get user's usage count for a coupon
 */
export const getUserCouponUsageCount = async (couponId: string, userId: string): Promise<number> => {
  try {
    const collection = getCollection<CouponUsage>(CollectionName.COUPON_USAGES);
    return await collection.countDocuments({
      couponId: new ObjectId(couponId),
      userId: new ObjectId(userId)
    });
  } catch (error) {
    console.error('Error getting user coupon usage count:', error);
    return 0;
  }
};

/**
 * Get coupon usage history
 */
export const getCouponUsages = async (
  couponId: string,
  query: { page?: number; limit?: number }
): Promise<{ usages: CouponUsage[]; total: number }> => {
  try {
    const collection = getCollection<CouponUsage>(CollectionName.COUPON_USAGES);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = { couponId: new ObjectId(couponId) };

    const [usages, total] = await Promise.all([
      collection.find(filter).sort({ usedAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter)
    ]);

    return { usages, total };
  } catch (error) {
    console.error('Error getting coupon usages:', error);
    return { usages: [], total: 0 };
  }
};
