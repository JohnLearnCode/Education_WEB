import { getCollection } from '../config/database';
import { CollectionName } from '../types/common/enums';
import { ObjectId } from 'mongodb';
import {
  CourseReview,
  CreateCourseReviewRequest,
  UpdateCourseReviewRequest,
  CourseReviewQueryParams,
  RatingDistribution
} from '../types/courseReview/request.js';
import { Course } from '../types/course/request.js';

export const createCourseReview = async (
  reviewData: CreateCourseReviewRequest,
  userId: string,
  userName: string
): Promise<CourseReview | null> => {
  try {
    const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);

    const newReview = {
      courseId: new ObjectId(reviewData.courseId),
      userId: new ObjectId(userId),
      userName,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newReview as unknown as CourseReview);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo đánh giá khóa học ở Model:', error);
    return null;
  }
};

export const findReviewByCourseAndUser = async (
  courseId: string,
  userId: string
): Promise<CourseReview | null> => {
  const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);
  return await collection.findOne({
    courseId: new ObjectId(courseId),
    userId: new ObjectId(userId)
  });
};

export const getReviewsByCourseId = async (
  courseId: string,
  queryParams: CourseReviewQueryParams = {}
): Promise<{ reviews: CourseReview[]; total: number }> => {
  try {
    const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);

    // Parse to numbers to handle string query params
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const sortBy = queryParams.sortBy || 'createdAt';
    const sortOrder = queryParams.sortOrder || 'desc';

    const skip = (page - 1) * limit;

    const filter = {
      courseId: new ObjectId(courseId)
    };

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await collection.countDocuments(filter);

    console.log('getReviewsByCourseId - courseId:', courseId, 'filter:', filter, 'total:', total, 'skip:', skip, 'limit:', limit);

    const reviews = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log('getReviewsByCourseId - reviews found:', reviews.length);

    return { reviews, total };
  } catch (error) {
    console.error('Lỗi lấy danh sách đánh giá khóa học:', error);
    return { reviews: [], total: 0 };
  }
};

export const getReviewById = async (reviewId: string): Promise<CourseReview | null> => {
  try {
    const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);
    return await collection.findOne({
      _id: new ObjectId(reviewId)
    });
  } catch (error) {
    console.error('Lỗi lấy đánh giá khóa học theo ID:', error);
    return null;
  }
};

export const updateCourseReview = async (
  reviewId: string,
  userId: string,
  updateData: UpdateCourseReviewRequest
): Promise<CourseReview | null> => {
  try {
    const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);

    const result = await collection.updateOne(
      {
        _id: new ObjectId(reviewId),
        userId: new ObjectId(userId)
      },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(reviewId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi cập nhật đánh giá khóa học:', error);
    return null;
  }
};

export const deleteCourseReview = async (
  reviewId: string,
  userId: string
): Promise<boolean> => {
  try {
    const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);

    const result = await collection.deleteOne({
      _id: new ObjectId(reviewId),
      userId: new ObjectId(userId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Lỗi xóa đánh giá khóa học:', error);
    return false;
  }
};

/**
 * Calculate rating statistics for a course
 * Returns average rating, count, and distribution
 */
export const calculateCourseRatingStats = async (
  courseId: string
): Promise<{
  rating: number;
  ratingCount: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}> => {
  try {
    const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);

    const stats = await collection.aggregate([
      { $match: { courseId: new ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
        }
      }
    ]).toArray();

    if (stats.length === 0) {
      return {
        rating: 0,
        ratingCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const result = stats[0];
    return {
      rating: Math.round(result.avgRating * 10) / 10, // Round to 1 decimal
      ratingCount: result.count,
      ratingDistribution: {
        1: result.rating1,
        2: result.rating2,
        3: result.rating3,
        4: result.rating4,
        5: result.rating5
      }
    };
  } catch (error) {
    console.error('Lỗi tính toán rating stats:', error);
    return {
      rating: 0,
      ratingCount: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};

/**
 * Get reviews for multiple courses (for instructor stats)
 */
export const getReviewsByCourseIds = async (
  courseIds: string[],
  limit: number = 5
): Promise<CourseReview[]> => {
  try {
    const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);
    
    const objectIds = courseIds.map(id => new ObjectId(id));
    
    return await collection
      .find({ courseId: { $in: objectIds } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Lỗi lấy reviews theo course IDs:', error);
    return [];
  }
};

/**
 * Get overall rating stats for instructor's courses
 */
export const getInstructorOverallStats = async (
  courseIds: string[]
): Promise<{
  totalReviews: number;
  overallAverageRating: number;
  ratingDistribution: RatingDistribution;
}> => {
  try {
    const collection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);
    
    const objectIds = courseIds.map(id => new ObjectId(id));
    
    const stats = await collection.aggregate([
      { $match: { courseId: { $in: objectIds } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
        }
      }
    ]).toArray();

    if (stats.length === 0) {
      return {
        totalReviews: 0,
        overallAverageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const result = stats[0];
    return {
      totalReviews: result.count,
      overallAverageRating: Math.round(result.avgRating * 10) / 10,
      ratingDistribution: {
        1: result.rating1,
        2: result.rating2,
        3: result.rating3,
        4: result.rating4,
        5: result.rating5
      }
    };
  } catch (error) {
    console.error('Lỗi lấy instructor overall stats:', error);
    return {
      totalReviews: 0,
      overallAverageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};
