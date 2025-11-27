import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

// Course Review Entity Interface
export interface CourseReview extends BaseEntity {
  courseId: ObjectId;
  userId: ObjectId;
  userName: string;        // Denormalized for display
  rating: number;          // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Rating Distribution for Course stats
export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

// Create Course Review Request
export interface CreateCourseReviewRequest {
  courseId: string;
  rating: number;
  comment: string;
}

// Update Course Review Request
export interface UpdateCourseReviewRequest {
  rating?: number;
  comment?: string;
}

// Course Review Query Parameters
export interface CourseReviewQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Course Review Response
export interface CourseReviewResponse extends Omit<CourseReview, 'courseId' | 'userId'> {
  courseId: string;
  userId: string;
}

// Instructor Review Statistics - Per Course
export interface CourseReviewStats {
  courseId: string;
  courseTitle: string;
  courseImage: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  recentReviews: CourseReviewResponse[];
}

// Instructor Overall Review Statistics
export interface InstructorReviewStats {
  totalCourses: number;
  totalReviews: number;
  overallAverageRating: number;
  ratingDistribution: RatingDistribution;
  courseStats: CourseReviewStats[];
  recentReviews: (CourseReviewResponse & { courseTitle: string })[];
}
