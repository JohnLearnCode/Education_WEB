import { Request, Response, NextFunction } from 'express';
import { adminOrdersService } from '../service/adminOrders';
import { ResponseHelper } from '../utils/response.js';

/**
 * Get all orders with pagination and filters
 */
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all'
    } = req.query;

    const result = await adminOrdersService.getAllOrders({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      status: String(status),
    });

    ResponseHelper.success(
      res,
      'Orders retrieved successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await adminOrdersService.getOrderById(orderId);

    ResponseHelper.success(
      res,
      'Order retrieved successfully',
      order
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await adminOrdersService.updateOrderStatus(orderId, status);

    ResponseHelper.success(
      res,
      `Order ${status} successfully`,
      order
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders statistics
 */
export const getOrdersStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminOrdersService.getOrdersStats();

    ResponseHelper.success(
      res,
      'Order statistics retrieved successfully',
      stats
    );
  } catch (error) {
    next(error);
  }
};
