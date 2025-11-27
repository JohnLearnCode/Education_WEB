import { AddToCartRequest, RemoveFromCartRequest, CartResponse } from '../types/cart/request.js';
import { CartMessage } from '../types/cart/enums.js';
import * as cartModel from '../model/cart.js';
import * as courseService from './course.js';

const toResponse = (cart: any): CartResponse => {
  return {
    ...cart,
    _id: cart._id?.toString(),
    userId: cart.userId.toString(),
    courses: (cart.courses || []).map((item: any) => ({
      courseId: item.courseId.toString()
    }))
  };
};

export const getOrCreateCart = async (userId: string): Promise<CartResponse> => {
  let cart = await cartModel.getCartByUserId(userId);

  if (!cart) {
    const created = await cartModel.createEmptyCart(userId);
    if (!created) {
      throw new Error(CartMessage.FAIL_GET);
    }
    cart = created;
  }

  return toResponse(cart);
};

export const addToCart = async (
  userId: string,
  data: AddToCartRequest
): Promise<CartResponse> => {
  const course = await courseService.getCourseById(data.courseId);
  if (!course) {
    throw new Error('Khóa học không tồn tại');
  }

  let cart = await cartModel.getCartByUserId(userId);

  if (!cart) {
    const created = await cartModel.createEmptyCart(userId);
    if (!created) {
      throw new Error(CartMessage.FAIL_GET);
    }
    cart = created;
  }

  const exists = cart.courses.some((c) => c.courseId.toString() === data.courseId);
  if (exists) {
    throw new Error(CartMessage.COURSE_ALREADY_IN_CART);
  }

  const newCourseIds = [...cart.courses.map((c) => c.courseId.toString()), data.courseId];

  const updated = await cartModel.updateCartCourses(userId, newCourseIds);
  if (!updated) {
    throw new Error(CartMessage.FAIL_ADD);
  }

  return toResponse(updated);
};

export const removeFromCart = async (
  userId: string,
  data: RemoveFromCartRequest
): Promise<CartResponse> => {
  let cart = await cartModel.getCartByUserId(userId);

  if (!cart) {
    const created = await cartModel.createEmptyCart(userId);
    if (!created) {
      throw new Error(CartMessage.FAIL_GET);
    }
    cart = created;
  }

  const exists = cart.courses.some((c) => c.courseId.toString() === data.courseId);
  if (!exists) {
    throw new Error(CartMessage.COURSE_NOT_IN_CART);
  }

  const newCourseIds = cart.courses
    .filter((c) => c.courseId.toString() !== data.courseId)
    .map((c) => c.courseId.toString());

  const updated = await cartModel.updateCartCourses(userId, newCourseIds);
  if (!updated) {
    throw new Error(CartMessage.FAIL_REMOVE);
  }

  return toResponse(updated);
};
