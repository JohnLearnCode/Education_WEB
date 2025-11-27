import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

export enum EarningStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export interface InstructorEarnings extends BaseEntity {
  instructorId: ObjectId;
  courseId: ObjectId;
  orderId: ObjectId;
  amount: number;
  platformFee: number;
  netEarning: number;
  status: EarningStatus;
  createdAt: Date;
  paidAt?: Date;
}

export interface CreateInstructorEarningsRequest {
  instructorId: string;
  courseId: string;
  orderId: string;
  amount: number;
}

export interface UpdateEarningStatusRequest {
  status: EarningStatus;
}

export interface InstructorEarningsQueryParams {
  page?: number;
  limit?: number;
  instructorId?: string;
  courseId?: string;
  status?: EarningStatus;
  sortBy?: 'createdAt' | 'amount' | 'paidAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InstructorEarningsResponse extends Omit<InstructorEarnings, 'instructorId' | 'courseId' | 'orderId'> {
  instructorId: string;
  courseId: string;
  orderId: string;
}

export interface InstructorEarningsSummary {
  totalEarnings: number;
  totalPlatformFee: number;
  totalNetEarning: number;
  pendingEarnings: number;
  paidEarnings: number;
  earningsCount: number;
}
