import { Request, Response, NextFunction } from 'express';
import * as orderService from '../service/order.js';
import { StatusCodes } from 'http-status-codes';
import {
  CreateOrderRequest,
  UpdateOrderStatusRequest
} from '../types/order/request.js';
import { OrderMessage } from '../types/order/enums.js';
import { ResponseHelper } from '../utils/response.js';

/**
 * Create a new order (authenticated user)
 */
export const createOrder = async (
  req: Request<{}, {}, CreateOrderRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const order = await orderService.createOrder(req.body, userId);
    
    return ResponseHelper.success(
      res,
      OrderMessage.SUCCESS_CREATE,
      order,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID (authenticated user - own orders only)
 */
export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id, userId);
    
    return ResponseHelper.success(
      res,
      OrderMessage.SUCCESS_GET,
      order,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders by current user
 */
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const orders = await orderService.getOrdersByUserId(userId);
    
    return ResponseHelper.success(
      res,
      OrderMessage.SUCCESS_GET_ALL,
      orders,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (authenticated user - own orders only)
 */
export const updateOrderStatus = async (
  req: Request<{ id: string }, {}, UpdateOrderStatusRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { id } = req.params;
    const order = await orderService.updateOrderStatus(id, req.body, userId);
    
    return ResponseHelper.success(
      res,
      OrderMessage.SUCCESS_UPDATE,
      order,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order summary
 */
export const getOrderSummary = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { id } = req.params;
    const summary = await orderService.getOrderSummary(id, userId);
    
    return ResponseHelper.success(
      res,
      OrderMessage.SUCCESS_GET,
      summary,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has purchased a course
 */
export const checkCoursePurchase = async (
  req: Request<{ courseId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const { courseId } = req.params;
    const hasPurchased = await orderService.hasUserPurchasedCourse(userId, courseId);
    
    return ResponseHelper.success(
      res,
      'Kiểm tra mua khóa học thành công',
      { hasPurchased },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's purchased courses
 */
export const getMyPurchasedCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const courseIds = await orderService.getUserPurchasedCourses(userId);
    
    return ResponseHelper.success(
      res,
      'Lấy danh sách khóa học đã mua thành công',
      { courseIds },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
