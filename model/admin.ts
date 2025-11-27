import { getCollection } from '../config/database.js';
import { CollectionName } from '../types/common/enums.js';
import { User } from '../types/auth/request.js';
import { Course } from '../types/course/request.js';
import { Order } from '../types/order/request.js';
import { Enrollment } from '../types/enrollment/request.js';
import { CourseReview } from '../types/courseReview/request.js';
import { Category } from '../types/category/request.js';
import {
  UserStats,
  CourseStats,
  RevenueStats,
  OrderStats,
  CategoryCourseCount,
  RecentOrder,
  RecentUser,
  RecentReview,
  TopCourse,
  RevenueChartData,
  UserGrowthChartData
} from '../types/admin/request.js';
import { ObjectId } from 'mongodb';

/**
 * Get User Statistics
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);

    // Get current date and first day of current/last month
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total users
    const totalUsers = await collection.countDocuments({});

    // Total students (not instructors)
    const totalStudents = await collection.countDocuments({ isInstructor: false });

    // Total instructors
    const totalInstructors = await collection.countDocuments({ isInstructor: true });

    // New users this month
    const newUsersThisMonth = await collection.countDocuments({
      createdAt: { $gte: firstDayThisMonth }
    });

    // New users last month
    const newUsersLastMonth = await collection.countDocuments({
      createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth }
    });

    // Calculate growth rate
    const userGrowthRate = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 0;

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      newUsersThisMonth,
      userGrowthRate: Math.round(userGrowthRate * 10) / 10
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalInstructors: 0,
      newUsersThisMonth: 0,
      userGrowthRate: 0
    };
  }
};

/**
 * Get Course Statistics
 */
export const getCourseStats = async (): Promise<CourseStats> => {
  try {
    const courseCollection = getCollection<Course>(CollectionName.COURSES);
    const categoryCollection = getCollection<Category>(CollectionName.CATEGORIES);

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total courses
    const totalCourses = await courseCollection.countDocuments({});

    // Active courses (assuming all courses are active, you can add a status field)
    const activeCourses = totalCourses;

    // New courses this month
    const newCoursesThisMonth = await courseCollection.countDocuments({
      createdAt: { $gte: firstDayThisMonth }
    });

    // Courses by category
    const categories = await categoryCollection.find({}).toArray();
    const coursesByCategory: CategoryCourseCount[] = await Promise.all(
      categories.map(async (category) => {
        const count = await courseCollection.countDocuments({
          categoryId: category._id
        });
        return {
          categoryId: category._id!.toString(),
          categoryName: category.name,
          courseCount: count
        };
      })
    );

    return {
      totalCourses,
      activeCourses,
      newCoursesThisMonth,
      coursesByCategory
    };
  } catch (error) {
    console.error('Error getting course stats:', error);
    return {
      totalCourses: 0,
      activeCourses: 0,
      newCoursesThisMonth: 0,
      coursesByCategory: []
    };
  }
};

/**
 * Get Revenue Statistics
 */
export const getRevenueStats = async (): Promise<RevenueStats> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total revenue (completed orders only)
    const totalRevenueResult = await collection
      .aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
      .toArray();
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Revenue this month
    const revenueThisMonthResult = await collection
      .aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: firstDayThisMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
      .toArray();
    const revenueThisMonth = revenueThisMonthResult.length > 0 ? revenueThisMonthResult[0].total : 0;

    // Revenue last month
    const revenueLastMonthResult = await collection
      .aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
      .toArray();
    const revenueLastMonth = revenueLastMonthResult.length > 0 ? revenueLastMonthResult[0].total : 0;

    // Calculate growth rate
    const difference = revenueThisMonth - revenueLastMonth;
    const percentageChange = revenueLastMonth > 0
      ? (difference / revenueLastMonth) * 100
      : 0;

    return {
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      revenueGrowthRate: Math.round(percentageChange * 10) / 10,
      revenueComparison: {
        thisMonth: revenueThisMonth,
        lastMonth: revenueLastMonth,
        difference,
        percentageChange: Math.round(percentageChange * 10) / 10
      }
    };
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    return {
      totalRevenue: 0,
      revenueThisMonth: 0,
      revenueLastMonth: 0,
      revenueGrowthRate: 0,
      revenueComparison: {
        thisMonth: 0,
        lastMonth: 0,
        difference: 0,
        percentageChange: 0
      }
    };
  }
};

/**
 * Get Order Statistics
 */
export const getOrderStats = async (): Promise<OrderStats> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total orders
    const totalOrders = await collection.countDocuments({});

    // Orders by status
    const pendingOrders = await collection.countDocuments({ status: 'pending' });
    const completedOrders = await collection.countDocuments({ status: 'completed' });
    const failedOrders = await collection.countDocuments({ status: 'failed' });

    // Conversion rate
    const conversionRate = totalOrders > 0
      ? (completedOrders / totalOrders) * 100
      : 0;

    // Orders this month
    const ordersThisMonth = await collection.countDocuments({
      createdAt: { $gte: firstDayThisMonth }
    });

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      failedOrders,
      conversionRate: Math.round(conversionRate * 10) / 10,
      ordersThisMonth
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      conversionRate: 0,
      ordersThisMonth: 0
    };
  }
};

/**
 * Get Recent Orders
 */
export const getRecentOrders = async (limit: number = 5): Promise<RecentOrder[]> => {
  try {
    const orderCollection = getCollection<Order>(CollectionName.ORDERS);
    const userCollection = getCollection<User>(CollectionName.USERS);

    const orders = await orderCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const recentOrders: RecentOrder[] = await Promise.all(
      orders.map(async (order) => {
        const user = await userCollection.findOne({ _id: order.userId });
        return {
          orderId: order._id!.toString(),
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          courseCount: order.courses.length
        };
      })
    );

    return recentOrders;
  } catch (error) {
    console.error('Error getting recent orders:', error);
    return [];
  }
};

/**
 * Get Recent Users
 */
export const getRecentUsers = async (limit: number = 5): Promise<RecentUser[]> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);

    const users = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return users.map((user) => ({
      userId: user._id!.toString(),
      name: user.name,
      email: user.email,
      isInstructor: user.isInstructor,
      createdAt: user.createdAt
    }));
  } catch (error) {
    console.error('Error getting recent users:', error);
    return [];
  }
};

/**
 * Get Recent Reviews
 */
export const getRecentReviews = async (limit: number = 5): Promise<RecentReview[]> => {
  try {
    const reviewCollection = getCollection<CourseReview>(CollectionName.COURSE_REVIEWS);
    const courseCollection = getCollection<Course>(CollectionName.COURSES);

    const reviews = await reviewCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const recentReviews: RecentReview[] = await Promise.all(
      reviews.map(async (review) => {
        const course = await courseCollection.findOne({ _id: review.courseId });
        return {
          reviewId: review._id!.toString(),
          courseTitle: course?.title || 'Unknown Course',
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt
        };
      })
    );

    return recentReviews;
  } catch (error) {
    console.error('Error getting recent reviews:', error);
    return [];
  }
};

/**
 * Get Top Courses
 */
export const getTopCourses = async (limit: number = 5): Promise<TopCourse[]> => {
  try {
    const courseCollection = getCollection<Course>(CollectionName.COURSES);
    const userCollection = getCollection<User>(CollectionName.USERS);
    const orderCollection = getCollection<Order>(CollectionName.ORDERS);

    // Get courses sorted by student count
    const courses = await courseCollection
      .find({})
      .sort({ studentCount: -1 })
      .limit(limit)
      .toArray();

    const topCourses: TopCourse[] = await Promise.all(
      courses.map(async (course) => {
        const instructor = await userCollection.findOne({ _id: course.instructorId });
        
        // Calculate revenue for this course
        const revenueResult = await orderCollection
          .aggregate([
            {
              $match: {
                status: 'completed',
                'courses.courseId': course._id!.toString()
              }
            },
            { $unwind: '$courses' },
            {
              $match: {
                'courses.courseId': course._id!.toString()
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$courses.price' }
              }
            }
          ])
          .toArray();

        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        return {
          courseId: course._id!.toString(),
          title: course.title,
          instructorName: instructor?.name || 'Unknown',
          studentCount: course.studentCount,
          revenue,
          rating: course.rating
        };
      })
    );

    return topCourses;
  } catch (error) {
    console.error('Error getting top courses:', error);
    return [];
  }
};

/**
 * Get Revenue Chart Data (last 6 months)
 */
export const getRevenueChartData = async (): Promise<RevenueChartData[]> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const chartData = await collection
      .aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
      .toArray();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return chartData.map((data) => ({
      month: `${monthNames[data._id.month - 1]} ${data._id.year}`,
      revenue: data.revenue,
      orders: data.orders
    }));
  } catch (error) {
    console.error('Error getting revenue chart data:', error);
    return [];
  }
};

/**
 * Get User Growth Chart Data (last 6 months)
 */
export const getUserGrowthChartData = async (): Promise<UserGrowthChartData[]> => {
  try {
    const collection = getCollection<User>(CollectionName.USERS);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const chartData = await collection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            students: {
              $sum: { $cond: [{ $eq: ['$isInstructor', false] }, 1, 0] }
            },
            instructors: {
              $sum: { $cond: [{ $eq: ['$isInstructor', true] }, 1, 0] }
            },
            total: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
      .toArray();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return chartData.map((data) => ({
      month: `${monthNames[data._id.month - 1]} ${data._id.year}`,
      students: data.students,
      instructors: data.instructors,
      total: data.total
    }));
  } catch (error) {
    console.error('Error getting user growth chart data:', error);
    return [];
  }
};
