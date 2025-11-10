import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * CourseSection Request Types - Input Data
 */

// CourseSection Entity Interface
export interface CourseSection extends BaseEntity {
  courseId: ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create CourseSection Request
export interface CreateCourseSectionRequest {
  courseId: string;
  title: string;
  order: number;
}

// Update CourseSection Request
export interface UpdateCourseSectionRequest {
  title?: string;
  order?: number;
}

// CourseSection Response
export interface CourseSectionResponse extends Omit<CourseSection, 'courseId'> {
  courseId: string;
}

// Reorder Sections Request
export interface ReorderSectionsRequest {
  sections: {
    sectionId: string;
    order: number;
  }[];
}
