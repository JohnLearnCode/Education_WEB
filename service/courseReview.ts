import {
  CreateCourseReviewRequest,
  UpdateCourseReviewRequest,
  CourseReviewResponse,
  CourseReviewQueryParams,
  InstructorReviewStats,
  CourseReviewStats
} from '../types/courseReview/request.js';
import { CourseReviewMessage } from '../types/courseReview/enums.js';
import * as courseReviewModel from '../model/courseReview.js';
import * as courseModel from '../model/course.js';
import * as courseService from './course.js';

const toResponse = (review: any): CourseReviewResponse => {
  return {
    ...review,
    _id: review._id?.toString(),
    courseId: review.courseId.toString(),
    userId: review.userId.toString()
  };
};

/**
 * Sync course rating stats after review changes
 */
const syncCourseRating = async (courseId: string): Promise<void> => {
  const stats = await courseReviewModel.calculateCourseRatingStats(courseId);
  await courseModel.updateCourseRating(
    courseId,
    stats.rating,
    stats.ratingCount,
    stats.ratingDistribution
  );
};

export const createCourseReview = async (
  reviewData: CreateCourseReviewRequest,
  userId: string,
  userName: string
): Promise<CourseReviewResponse> => {
  const course = await courseService.getCourseById(reviewData.courseId);
  if (!course) {
    throw new Error('Khóa học không tồn tại');
  }

  const existing = await courseReviewModel.findReviewByCourseAndUser(reviewData.courseId, userId);
  if (existing) {
    throw new Error(CourseReviewMessage.DUPLICATE_REVIEW);
  }

  const review = await courseReviewModel.createCourseReview(reviewData, userId, userName);

  if (!review) {
    throw new Error(CourseReviewMessage.FAIL_CREATE);
  }

  // Sync course rating after creating review
  await syncCourseRating(reviewData.courseId);

  return toResponse(review);
};

export const getCourseReviews = async (
  courseId: string,
  queryParams: CourseReviewQueryParams = {}
): Promise<{ reviews: CourseReviewResponse[]; total: number; page: number; totalPages: number }> => {
  const course = await courseService.getCourseById(courseId);
  if (!course) {
    throw new Error('Khóa học không tồn tại');
  }

  const { reviews, total } = await courseReviewModel.getReviewsByCourseId(courseId, queryParams);

  const page = queryParams.page || 1;
  const limit = queryParams.limit || 10;
  const totalPages = Math.ceil(total / limit);

  const responseReviews: CourseReviewResponse[] = reviews.map(toResponse);

  return {
    reviews: responseReviews,
    total,
    page,
    totalPages
  };
};

export const updateCourseReview = async (
  reviewId: string,
  userId: string,
  updateData: UpdateCourseReviewRequest
): Promise<CourseReviewResponse> => {
  // Get existing review to get courseId
  const existingReview = await courseReviewModel.getReviewById(reviewId);
  if (!existingReview) {
    throw new Error(CourseReviewMessage.REVIEW_NOT_FOUND);
  }

  const updated = await courseReviewModel.updateCourseReview(reviewId, userId, updateData);

  if (!updated) {
    throw new Error(CourseReviewMessage.FAIL_UPDATE);
  }

  // Sync course rating if rating was updated
  if (updateData.rating !== undefined) {
    await syncCourseRating(existingReview.courseId.toString());
  }

  return toResponse(updated);
};

export const deleteCourseReview = async (
  reviewId: string,
  userId: string
): Promise<boolean> => {
  // Get existing review to get courseId before deleting
  const existingReview = await courseReviewModel.getReviewById(reviewId);
  if (!existingReview) {
    throw new Error(CourseReviewMessage.REVIEW_NOT_FOUND);
  }

  const courseId = existingReview.courseId.toString();

  const success = await courseReviewModel.deleteCourseReview(reviewId, userId);

  if (!success) {
    throw new Error(CourseReviewMessage.FAIL_DELETE);
  }

  // Sync course rating after deleting review
  await syncCourseRating(courseId);

  return true;
};

/**
 * Get instructor review statistics
 * Returns overall stats and per-course stats
 */
export const getInstructorReviewStats = async (
  instructorId: string
): Promise<InstructorReviewStats> => {
  // Get all courses by instructor
  const { courses } = await courseModel.getCoursesByInstructorId(instructorId, { limit: 100 });
  
  if (courses.length === 0) {
    return {
      totalCourses: 0,
      totalReviews: 0,
      overallAverageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      courseStats: [],
      recentReviews: []
    };
  }

  const courseIds = courses.map(c => c._id!.toString());
  
  // Get overall stats
  const overallStats = await courseReviewModel.getInstructorOverallStats(courseIds);
  
  // Get recent reviews across all courses
  const recentReviews = await courseReviewModel.getReviewsByCourseIds(courseIds, 10);
  
  // Create course map for quick lookup
  const courseMap = new Map(courses.map(c => [c._id!.toString(), c]));
  
  // Build per-course stats
  const courseStats: CourseReviewStats[] = [];
  
  for (const course of courses) {
    const courseId = course._id!.toString();
    const stats = await courseReviewModel.calculateCourseRatingStats(courseId);
    const { reviews } = await courseReviewModel.getReviewsByCourseId(courseId, { limit: 3 });
    
    courseStats.push({
      courseId,
      courseTitle: course.title,
      courseImage: course.imageUrl,
      averageRating: stats.rating,
      totalReviews: stats.ratingCount,
      ratingDistribution: stats.ratingDistribution,
      recentReviews: reviews.map(toResponse)
    });
  }
  
  // Sort by total reviews descending
  courseStats.sort((a, b) => b.totalReviews - a.totalReviews);
  
  // Map recent reviews with course title
  const recentReviewsWithTitle = recentReviews.map(review => {
    const course = courseMap.get(review.courseId.toString());
    return {
      ...toResponse(review),
      courseTitle: course?.title || 'Unknown Course'
    };
  });

  return {
    totalCourses: courses.length,
    totalReviews: overallStats.totalReviews,
    overallAverageRating: overallStats.overallAverageRating,
    ratingDistribution: overallStats.ratingDistribution,
    courseStats,
    recentReviews: recentReviewsWithTitle
  };
};

/**
 * Get course reviews for instructor (with course info and stats)
 * Verifies instructor owns the course
 */
export const getInstructorCourseReviews = async (
  courseId: string,
  instructorId: string,
  queryParams: CourseReviewQueryParams = {}
): Promise<CourseReviewStats & { reviews: CourseReviewResponse[]; page: number; totalPages: number }> => {
  // Get course and verify ownership
  const course = await courseModel.getCourseById(courseId);
  if (!course) {
    throw new Error('Khóa học không tồn tại');
  }

  if (course.instructorId.toString() !== instructorId) {
    throw new Error('Bạn không có quyền xem đánh giá của khóa học này');
  }

  // Get reviews with pagination
  const { reviews, total } = await courseReviewModel.getReviewsByCourseId(courseId, queryParams);
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const totalPages = Math.ceil(total / limit);

  // Get rating stats
  const stats = await courseReviewModel.calculateCourseRatingStats(courseId);

  return {
    courseId,
    courseTitle: course.title,
    courseImage: course.imageUrl,
    averageRating: stats.rating,
    totalReviews: stats.ratingCount,
    ratingDistribution: stats.ratingDistribution,
    recentReviews: [],
    reviews: reviews.map(toResponse),
    page,
    totalPages
  };
};
