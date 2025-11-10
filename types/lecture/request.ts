import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Lecture Request Types - Input Data
 */

// Lecture Entity Interface
export interface Lecture extends BaseEntity {
  sectionId: ObjectId;
  courseId: ObjectId;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'attachment';
  videoUrl?: string;
  textContent?: string;
  attachmentUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create Lecture Request
export interface CreateLectureRequest {
  sectionId: string;
  courseId: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'attachment';
  videoUrl?: string;
  textContent?: string;
  attachmentUrl?: string;
  order: number;
}

// Update Lecture Request
export interface UpdateLectureRequest {
  title?: string;
  duration?: string;
  type?: 'video' | 'text' | 'attachment';
  videoUrl?: string;
  textContent?: string;
  attachmentUrl?: string;
  order?: number;
}

// Lecture Response
export interface LectureResponse extends Omit<Lecture, 'sectionId' | 'courseId'> {
  sectionId: string;
  courseId: string;
}

// Reorder Lectures Request
export interface ReorderLecturesRequest {
  lectures: {
    lectureId: string;
    order: number;
  }[];
}
