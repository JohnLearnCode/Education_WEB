import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

// Complaint Status Enum
export enum ComplaintStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

// Complaint Type Enum
export enum ComplaintType {
  COURSE = 'course',
  INSTRUCTOR = 'instructor'
}

// Complaint Entity Interface
export interface Complaint extends BaseEntity {
  userId: ObjectId;
  userName?: string;           // Denormalized for display
  userEmail?: string;          // Denormalized for display
  
  // Either courseId or instructorId must be present
  courseId?: ObjectId;
  courseName?: string;         // Denormalized for display
  
  instructorId?: ObjectId;
  instructorName?: string;     // Denormalized for display
  
  type: ComplaintType;         // 'course' or 'instructor'
  title: string;
  description: string;
  status: ComplaintStatus;
  
  // Admin response
  adminResponse?: string;
  adminId?: ObjectId;
  adminName?: string;
  respondedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Create Complaint Request
export interface CreateComplaintRequest {
  courseId?: string;
  instructorId?: string;
  title: string;
  description: string;
}

// Update Complaint Request (for users)
export interface UpdateComplaintRequest {
  title?: string;
  description?: string;
}

// Admin Update Complaint Request
export interface AdminUpdateComplaintRequest {
  status?: ComplaintStatus;
  adminResponse?: string;
}

// Complaint Query Parameters
export interface ComplaintQueryParams {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
  type?: ComplaintType;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Complaint Response
export interface ComplaintResponse extends Omit<Complaint, 'userId' | 'courseId' | 'instructorId' | 'adminId'> {
  userId: string;
  courseId?: string;
  instructorId?: string;
  adminId?: string;
}

// Complaint Statistics
export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  byCourse: number;
  byInstructor: number;
}
