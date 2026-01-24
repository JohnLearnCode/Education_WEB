import { getCollection } from "../config/database.js";
import { Promotion } from "../types/promotion/request.js";
import { CollectionName } from "../types/common/enums.js";
import { ObjectId, Filter } from "mongodb";

/**
 * Create a new promotion
 */
export const createPromotion = async (data: {
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  targetCourseIds?: ObjectId[];
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}): Promise<Promotion | null> => {
  try {
    const collection = getCollection<Promotion>(CollectionName.PROMOTIONS);
    const now = new Date();

    const newPromotion = {
      name: data.name,
      description: data.description || '',
      discountType: data.discountType,
      discountValue: data.discountValue,
      targetCourseIds: data.targetCourseIds || [],
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newPromotion as unknown as Promotion);
    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }
    return null;
  } catch (error) {
    console.error('Error creating promotion:', error);
    return null;
  }
};

/**
 * Get promotion by ID
 */
export const getPromotionById = async (id: string): Promise<Promotion | null> => {
  try {
    const collection = getCollection<Promotion>(CollectionName.PROMOTIONS);
    return await collection.findOne({
      _id: new ObjectId(id),
      isDeleted: false
    });
  } catch (error) {
    console.error('Error getting promotion by id:', error);
    return null;
  }
};

/**
 * Get all promotions with filtering
 */
export const getAllPromotions = async (query: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  includeExpired?: boolean;
  courseId?: string;
}): Promise<{ promotions: Promotion[]; total: number }> => {
  try {
    const collection = getCollection<Promotion>(CollectionName.PROMOTIONS);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Filter<Promotion> = { isDeleted: false };

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (!query.includeExpired) {
      filter.endDate = { $gte: new Date() };
    }

    if (query.courseId) {
      filter.$or = [
        { targetCourseIds: { $size: 0 } },
        { targetCourseIds: new ObjectId(query.courseId) }
      ];
    }

    const [promotions, total] = await Promise.all([
      collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter)
    ]);

    return { promotions, total };
  } catch (error) {
    console.error('Error getting all promotions:', error);
    return { promotions: [], total: 0 };
  }
};

/**
 * Update promotion
 */
export const updatePromotion = async (
  id: string,
  data: Partial<Omit<Promotion, '_id' | 'createdAt' | 'isDeleted'>>
): Promise<Promotion | null> => {
  try {
    const collection = getCollection<Promotion>(CollectionName.PROMOTIONS);
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), isDeleted: false },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  } catch (error) {
    console.error('Error updating promotion:', error);
    return null;
  }
};

/**
 * Soft delete promotion (archive for analytics)
 */
export const deletePromotion = async (id: string): Promise<boolean> => {
  try {
    const collection = getCollection<Promotion>(CollectionName.PROMOTIONS);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, isActive: false, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return false;
  }
};

/**
 * Get active promotions for a specific course
 */
export const getActivePromotionsForCourse = async (courseId: string): Promise<Promotion[]> => {
  try {
    const collection = getCollection<Promotion>(CollectionName.PROMOTIONS);
    const now = new Date();

    return await collection.find({
      isActive: true,
      isDeleted: false,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { targetCourseIds: { $size: 0 } },
        { targetCourseIds: new ObjectId(courseId) }
      ]
    }).toArray();
  } catch (error) {
    console.error('Error getting active promotions for course:', error);
    return [];
  }
};
