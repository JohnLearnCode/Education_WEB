import {
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderResponse,
  OrderSummary,
  OrderItem
} from "../types/order/request";
import * as orderModel from '../model/order.js';
import * as courseModel from '../model/course.js';
import * as enrollmentService from './enrollment.js';
import { OrderMessage } from '../types/order/enums.js';

/**
 * Create a new order
 */
export const createOrder = async (
  orderData: CreateOrderRequest,
  userId: string
): Promise<OrderResponse> => {
  // Validate courses exist and get course details
  const courses: OrderItem[] = [];
  let totalAmount = 0;

  for (const courseId of orderData.courseIds) {
    // Check if course exists
    const course = await courseModel.getCourseById(courseId);
    if (!course) {
      throw new Error(`${OrderMessage.COURSE_NOT_FOUND}: ${courseId}`);
    }

    // Check if user already purchased this course
    const alreadyPurchased = await orderModel.hasUserPurchasedCourse(userId, courseId);
    if (alreadyPurchased) {
      throw new Error(`${OrderMessage.ALREADY_PURCHASED}: ${course.title}`);
    }

    // Add course to order
    courses.push({
      courseId: course._id!.toString(),
      title: course.title,
      price: course.price,
      thumbnail: course.imageUrl
    });

    totalAmount += course.price;
  }

  if (courses.length === 0) {
    throw new Error(OrderMessage.EMPTY_CART);
  }

  // Create order
  const order = await orderModel.createOrder({
    userId,
    courses,
    totalAmount,
    paymentMethod: orderData.paymentMethod
  });

  if (!order) {
    throw new Error(OrderMessage.FAIL_CREATE);
  }

  // Convert to response
  const response: OrderResponse = {
    ...order,
    userId: order.userId.toString()
  };

  return response;
};

/**
 * Get order by ID
 */
export const getOrderById = async (
  orderId: string,
  userId: string
): Promise<OrderResponse> => {
  const order = await orderModel.getOrderById(orderId);
  
  if (!order) {
    throw new Error(OrderMessage.ORDER_NOT_FOUND);
  }

  // Verify that the order belongs to the user
  if (order.userId.toString() !== userId) {
    throw new Error('Bạn không có quyền xem đơn hàng này');
  }

  // Convert to response
  const response: OrderResponse = {
    ...order,
    userId: order.userId.toString()
  };

  return response;
};

/**
 * Get all orders by user
 */
export const getOrdersByUserId = async (userId: string): Promise<OrderResponse[]> => {
  const orders = await orderModel.getOrdersByUserId(userId);

  // Convert to response array
  const responseOrders: OrderResponse[] = orders.map(order => ({
    ...order,
    userId: order.userId.toString()
  }));

  return responseOrders;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  updateData: UpdateOrderStatusRequest,
  userId: string
): Promise<OrderResponse> => {
  // Get order
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new Error(OrderMessage.ORDER_NOT_FOUND);
  }

  // Verify that the order belongs to the user
  if (order.userId.toString() !== userId) {
    throw new Error('Bạn không có quyền cập nhật đơn hàng này');
  }

  // Update status
  const updatedOrder = await orderModel.updateOrderStatus(orderId, updateData.status);

  if (!updatedOrder) {
    throw new Error(OrderMessage.FAIL_UPDATE);
  }

  // If order is completed, auto-enroll user in courses
  if (updateData.status === 'completed') {
    for (const course of updatedOrder.courses) {
      try {
        // Check if already enrolled
        const existingEnrollment = await enrollmentService.getEnrollmentByUserAndCourse(
          userId,
          course.courseId
        );

        if (!existingEnrollment) {
          // Auto-enroll user in the course
          await enrollmentService.enrollCourse(course.courseId, userId);
        }
      } catch (error) {
        console.error(`Error enrolling user in course ${course.courseId}:`, error);
        // Continue with other courses even if one fails
      }
    }
  }

  // Convert to response
  const response: OrderResponse = {
    ...updatedOrder,
    userId: updatedOrder.userId.toString()
  };

  return response;
};

/**
 * Get order summary
 */
export const getOrderSummary = async (
  orderId: string,
  userId: string
): Promise<OrderSummary> => {
  const order = await orderModel.getOrderById(orderId);
  
  if (!order) {
    throw new Error(OrderMessage.ORDER_NOT_FOUND);
  }

  // Verify that the order belongs to the user
  if (order.userId.toString() !== userId) {
    throw new Error('Bạn không có quyền xem đơn hàng này');
  }

  const summary: OrderSummary = {
    orderId: order._id!.toString(),
    totalAmount: order.totalAmount,
    courseCount: order.courses.length,
    status: order.status,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt
  };

  return summary;
};

/**
 * Check if user has purchased a course
 */
export const hasUserPurchasedCourse = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  return await orderModel.hasUserPurchasedCourse(userId, courseId);
};

/**
 * Get user's purchased courses
 */
export const getUserPurchasedCourses = async (userId: string): Promise<string[]> => {
  return await orderModel.getUserPurchasedCourses(userId);
};
