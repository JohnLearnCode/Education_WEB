import { AddToWishlistRequest, RemoveFromWishlistRequest, WishlistResponse } from '../types/wishlist/request.js';
import { WishlistMessage } from '../types/wishlist/enums.js';
import * as wishlistModel from '../model/wishlist.js';
import * as courseService from './course.js';
import * as cartService from './cart.js';

const toResponse = (wishlist: any): WishlistResponse => {
  return {
    ...wishlist,
    _id: wishlist._id?.toString(),
    userId: wishlist.userId.toString(),
    courses: (wishlist.courses || []).map((item: any) => ({
      courseId: item.courseId.toString()
    }))
  };
};

export const getOrCreateWishlist = async (userId: string): Promise<WishlistResponse> => {
  let wishlist = await wishlistModel.getWishlistByUserId(userId);

  if (!wishlist) {
    const created = await wishlistModel.createEmptyWishlist(userId);
    if (!created) {
      throw new Error(WishlistMessage.FAIL_GET);
    }
    wishlist = created;
  }

  return toResponse(wishlist);
};

export const addToWishlist = async (
  userId: string,
  data: AddToWishlistRequest
): Promise<WishlistResponse> => {
  const course = await courseService.getCourseById(data.courseId);
  if (!course) {
    throw new Error('Khóa học không tồn tại');
  }

  let wishlist = await wishlistModel.getWishlistByUserId(userId);

  if (!wishlist) {
    const created = await wishlistModel.createEmptyWishlist(userId);
    if (!created) {
      throw new Error(WishlistMessage.FAIL_GET);
    }
    wishlist = created;
  }

  const exists = wishlist.courses.some((c) => c.courseId.toString() === data.courseId);
  if (exists) {
    throw new Error(WishlistMessage.COURSE_ALREADY_IN_WISHLIST);
  }

  const newCourseIds = [...wishlist.courses.map((c) => c.courseId.toString()), data.courseId];

  const updated = await wishlistModel.updateWishlistCourses(userId, newCourseIds);
  if (!updated) {
    throw new Error(WishlistMessage.FAIL_ADD);
  }

  return toResponse(updated);
};

export const removeFromWishlist = async (
  userId: string,
  data: RemoveFromWishlistRequest
): Promise<WishlistResponse> => {
  let wishlist = await wishlistModel.getWishlistByUserId(userId);

  if (!wishlist) {
    const created = await wishlistModel.createEmptyWishlist(userId);
    if (!created) {
      throw new Error(WishlistMessage.FAIL_GET);
    }
    wishlist = created;
  }

  const exists = wishlist.courses.some((c) => c.courseId.toString() === data.courseId);
  if (!exists) {
    throw new Error(WishlistMessage.COURSE_NOT_IN_WISHLIST);
  }

  const newCourseIds = wishlist.courses
    .filter((c) => c.courseId.toString() !== data.courseId)
    .map((c) => c.courseId.toString());

  const updated = await wishlistModel.updateWishlistCourses(userId, newCourseIds);
  if (!updated) {
    throw new Error(WishlistMessage.FAIL_REMOVE);
  }

  return toResponse(updated);
};

export const moveToCart = async (
  userId: string,
  data: AddToWishlistRequest
): Promise<{ cart: any; wishlist: WishlistResponse }> => {
  const course = await courseService.getCourseById(data.courseId);
  if (!course) {
    throw new Error('Khóa học không tồn tại');
  }

  let wishlist = await wishlistModel.getWishlistByUserId(userId);
  if (!wishlist) {
    throw new Error(WishlistMessage.COURSE_NOT_IN_WISHLIST);
  }

  const exists = wishlist.courses.some((c) => c.courseId.toString() === data.courseId);
  if (!exists) {
    throw new Error(WishlistMessage.COURSE_NOT_IN_WISHLIST);
  }

  const cart = await cartService.addToCart(userId, { courseId: data.courseId });

  const newCourseIds = wishlist.courses
    .filter((c) => c.courseId.toString() !== data.courseId)
    .map((c) => c.courseId.toString());

  const updatedWishlist = await wishlistModel.updateWishlistCourses(userId, newCourseIds);
  if (!updatedWishlist) {
    throw new Error(WishlistMessage.FAIL_MOVE_TO_CART);
  }

  return {
    cart,
    wishlist: toResponse(updatedWishlist)
  };
};
