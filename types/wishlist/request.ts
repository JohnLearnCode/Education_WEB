import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

export interface WishlistCourseItem {
  courseId: ObjectId;
}

export interface Wishlist extends BaseEntity {
  userId: ObjectId;
  courses: WishlistCourseItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToWishlistRequest {
  courseId: string;
}

export interface RemoveFromWishlistRequest {
  courseId: string;
}

export interface WishlistResponse extends Omit<Wishlist, 'userId' | 'courses'> {
  userId: string;
  courses: { courseId: string }[];
}
