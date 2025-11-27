import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

export interface CartCourseItem {
  courseId: ObjectId;
}

export interface Cart extends BaseEntity {
  userId: ObjectId;
  courses: CartCourseItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  courseId: string;
}

export interface RemoveFromCartRequest {
  courseId: string;
}

export interface CartResponse extends Omit<Cart, 'userId' | 'courses'> {
  userId: string;
  courses: { courseId: string }[];
}
