import { BaseEntity } from '../common/interface.js';

/**
 * Admin Dashboard Statistics Types
 */

// User Statistics
export interface UserStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  newUsersThisMonth: number;
  userGrowthRate: number; // Percentage growth compared to last month
}

// Course Statistics
export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  newCoursesThisMonth: number;
  coursesByCategory: CategoryCourseCount[];
}

export interface CategoryCourseCount {
  categoryId: string;
  categoryName: string;
  courseCount: number;
}

// Revenue Statistics
export interface RevenueStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowthRate: number; // Percentage growth
  revenueComparison: {
    thisMonth: number;
    lastMonth: number;
    difference: number;
    percentageChange: number;
  };
}

// Order Statistics
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  failedOrders: number;
  conversionRate: number; // Percentage of completed orders
  ordersThisMonth: number;
}

// Dashboard Overview - Combined Stats
export interface DashboardStats {
  users: UserStats;
  courses: CourseStats;
  revenue: RevenueStats;
  orders: OrderStats;
  lastUpdated: Date;
}

// Chart Data Types
export interface RevenueChartData {
  month: string;
  revenue: number;
  orders: number;
}

export interface UserGrowthChartData {
  month: string;
  students: number;
  instructors: number;
  total: number;
}

export interface TopCourse {
  courseId: string;
  title: string;
  instructorName: string;
  studentCount: number;
  revenue: number;
  rating: number;
}

// Recent Activities
export interface RecentOrder {
  orderId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  courseCount: number;
}

export interface RecentUser {
  userId: string;
  name: string;
  email: string;
  isInstructor: boolean;
  createdAt: Date;
}

export interface RecentReview {
  reviewId: string;
  courseTitle: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Dashboard Response
export interface DashboardResponse {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  recentUsers: RecentUser[];
  recentReviews: RecentReview[];
  topCourses: TopCourse[];
}

// Query Parameters
export interface AdminQueryParams {
  startDate?: Date;
  endDate?: Date;
  period?: 'day' | 'week' | 'month' | 'year';
}

// Chart Data Response
export interface ChartDataResponse {
  revenueChart: RevenueChartData[];
  userGrowthChart: UserGrowthChartData[];
}
