import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';
import * as adminService from '../service/admin.js';

/**
 * Get complete dashboard data
 * @route GET /api/admin/dashboard
 */
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const dashboardData = await adminService.getDashboardData();
    ResponseHelper.success(res, 'Dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    console.error('Error in getDashboard controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Failed to get dashboard data',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get dashboard statistics only
 * @route GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    ResponseHelper.success(res, 'Dashboard statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Error in getDashboardStats controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Failed to get dashboard statistics',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get chart data for dashboard
 * @route GET /api/admin/dashboard/charts
 */
export const getChartData = async (req: Request, res: Response): Promise<void> => {
  try {
    const chartData = await adminService.getChartData();
    ResponseHelper.success(res, 'Chart data retrieved successfully', chartData);
  } catch (error) {
    console.error('Error in getChartData controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Failed to get chart data',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get user statistics
 * @route GET /api/admin/stats/users
 */
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getUserStats();
    ResponseHelper.success(res, 'User statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Error in getUserStats controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Failed to get user statistics',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get course statistics
 * @route GET /api/admin/stats/courses
 */
export const getCourseStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getCourseStats();
    ResponseHelper.success(res, 'Course statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Error in getCourseStats controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Failed to get course statistics',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get revenue statistics
 * @route GET /api/admin/stats/revenue
 */
export const getRevenueStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getRevenueStats();
    ResponseHelper.success(res, 'Revenue statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Error in getRevenueStats controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Failed to get revenue statistics',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};

/**
 * Get order statistics
 * @route GET /api/admin/stats/orders
 */
export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getOrderStats();
    ResponseHelper.success(res, 'Order statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Error in getOrderStats controller:', error);
    ResponseHelper.error(
      res,
      error instanceof Error ? error.message : 'Failed to get order statistics',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};
