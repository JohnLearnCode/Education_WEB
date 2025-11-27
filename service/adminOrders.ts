import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { NotFoundError } from '../errors/AppError';

interface GetOrdersParams {
  page: number;
  limit: number;
  search: string;
  status: string;
}

export const adminOrdersService = {
  /**
   * Get all orders with pagination and filters
   */
  getAllOrders: async (params: GetOrdersParams) => {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;

    const ordersCollection = getCollection('orders');

    // Build filter query
    const filter: any = {};

    // Filter by status
    if (status !== 'all') {
      filter.status = status;
    }

    // Get total count
    const total = await ordersCollection.countDocuments(filter);

    // Get orders with user info
    const orders = await ordersCollection
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $addFields: {
            userName: { $arrayElemAt: ['$user.name', 0] },
            userEmail: { $arrayElemAt: ['$user.email', 0] },
            courseCount: {
              $cond: {
                if: { $isArray: '$courses' },
                then: { $size: '$courses' },
                else: 0
              }
            },
          },
        },
        {
          $project: {
            user: 0,
          },
        },
      ])
      .toArray();

    // If search is provided, filter by orderNumber, userName, or userEmail
    let filteredOrders = orders;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = orders.filter(
        (order: any) =>
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.userName?.toLowerCase().includes(searchLower) ||
          order.userEmail?.toLowerCase().includes(searchLower)
      );
    }

    return {
      orders: filteredOrders,
      pagination: {
        total: search ? filteredOrders.length : total,
        page,
        limit,
        totalPages: Math.ceil((search ? filteredOrders.length : total) / limit),
      },
    };
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string) => {
    const ordersCollection = getCollection('orders');
    
    const orders = await ordersCollection
      .aggregate([
        { $match: { _id: new ObjectId(orderId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courses.courseId',
            foreignField: '_id',
            as: 'courseDetails',
          },
        },
        {
          $addFields: {
            userName: { $arrayElemAt: ['$user.name', 0] },
            userEmail: { $arrayElemAt: ['$user.email', 0] },
          },
        },
      ])
      .toArray();

    if (!orders || orders.length === 0) {
      throw new NotFoundError('Order not found');
    }

    return orders[0];
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: string) => {
    const ordersCollection = getCollection('orders');

    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new NotFoundError('Order not found');
    }

    return result;
  },

  /**
   * Get orders statistics
   */
  getOrdersStats: async () => {
    const ordersCollection = getCollection('orders');

    const [totalOrders, completedOrders, pendingOrders, failedOrders, revenueResult] =
      await Promise.all([
        ordersCollection.countDocuments({}),
        ordersCollection.countDocuments({ status: 'completed' }),
        ordersCollection.countDocuments({ status: 'pending' }),
        ordersCollection.countDocuments({ status: 'failed' }),
        ordersCollection
          .aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ])
          .toArray(),
      ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      failedOrders,
      totalRevenue,
    };
  },
};
