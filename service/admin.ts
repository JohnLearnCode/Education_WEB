import * as adminModel from '../model/admin.js';
import {
  DashboardStats,
  DashboardResponse,
  ChartDataResponse
} from '../types/admin/request.js';

/**
 * Get complete dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const [users, courses, revenue, orders] = await Promise.all([
      adminModel.getUserStats(),
      adminModel.getCourseStats(),
      adminModel.getRevenueStats(),
      adminModel.getOrderStats()
    ]);

    return {
      users,
      courses,
      revenue,
      orders,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw new Error('Failed to get dashboard statistics');
  }
};

/**
 * Get complete dashboard data including stats and recent activities
 */
export const getDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const [stats, recentOrders, recentUsers, recentReviews, topCourses] = await Promise.all([
      getDashboardStats(),
      adminModel.getRecentOrders(5),
      adminModel.getRecentUsers(5),
      adminModel.getRecentReviews(5),
      adminModel.getTopCourses(5)
    ]);

    return {
      stats,
      recentOrders,
      recentUsers,
      recentReviews,
      topCourses
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw new Error('Failed to get dashboard data');
  }
};

/**
 * Get chart data for dashboard
 */
export const getChartData = async (): Promise<ChartDataResponse> => {
  try {
    const [revenueChart, userGrowthChart] = await Promise.all([
      adminModel.getRevenueChartData(),
      adminModel.getUserGrowthChartData()
    ]);

    return {
      revenueChart,
      userGrowthChart
    };
  } catch (error) {
    console.error('Error getting chart data:', error);
    throw new Error('Failed to get chart data');
  }
};

/**
 * Get user statistics only
 */
export const getUserStats = async () => {
  return await adminModel.getUserStats();
};

/**
 * Get course statistics only
 */
export const getCourseStats = async () => {
  return await adminModel.getCourseStats();
};

/**
 * Get revenue statistics only
 */
export const getRevenueStats = async () => {
  return await adminModel.getRevenueStats();
};

/**
 * Get order statistics only
 */
export const getOrderStats = async () => {
  return await adminModel.getOrderStats();
};
