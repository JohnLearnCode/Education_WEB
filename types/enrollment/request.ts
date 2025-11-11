import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Enrollment Request Types - Input Data
 */

// Enrollment Entity Interface
export interface Enrollment extends BaseEntity {
  userId: ObjectId;
  courseId: ObjectId;
  enrolledAt: Date;
  progress: number; // Percentage (0-100)
  lastAccessedAt: Date;
  completedAt?: Date; // Optional, only set when course is completed
  completedLectures: string[]; // Array of lecture IDs that have been completed
}

// Enroll in Course Request
export interface EnrollCourseRequest {
  courseId: string;
}

// Mark Lecture as Completed Request
export interface MarkLectureCompletedRequest {
  lectureId: string;
}

// Update Progress Request
export interface UpdateProgressRequest {
  completedLectures: string[];
}

// Enrollment Response
export interface EnrollmentResponse extends Omit<Enrollment, 'userId' | 'courseId'> {
  userId: string;
  courseId: string;
}

// Enrollment with Course Details
export interface EnrollmentWithCourse extends EnrollmentResponse {
  course?: {
    title: string;
    description: string;
    thumbnail?: string;
    instructorId: string;
  };
}

// Progress Summary
export interface ProgressSummary {
  enrollmentId: string;
  courseId: string;
  progress: number;
  totalLectures: number;
  completedLectures: number;
  isCompleted: boolean;
  enrolledAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
}
