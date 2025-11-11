import { getCollection } from "../config/database";
import { Order, OrderItem } from "../types/order/request";
import { CollectionName } from "../types/common/enums";
import { ObjectId } from "mongodb";

/**
 * Create a new order
 */
export const createOrder = async (orderData: {
  userId: string;
  courses: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
}): Promise<Order | null> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);

    const now = new Date();
    const newOrder = {
      userId: new ObjectId(orderData.userId),
      courses: orderData.courses,
      totalAmount: orderData.totalAmount,
      status: "pending",
      paymentMethod: orderData.paymentMethod,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newOrder as unknown as Order);

    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }

    return null;
  } catch (error) {
    console.error('Lỗi tạo order ở Model:', error);
    return null;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);
    return await collection.findOne({
      _id: new ObjectId(orderId)
    });
  } catch (error) {
    console.error('Lỗi get order by id:', error);
    return null;
  }
};

/**
 * Get all orders by user
 */
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);
    return await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get orders by user id:', error);
    return [];
  }
};

/**
 * Get all orders (for admin)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);
    return await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get all orders:', error);
    return [];
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<Order | null> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);

    const result = await collection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      return await collection.findOne({ _id: new ObjectId(orderId) });
    }

    return null;
  } catch (error) {
    console.error('Lỗi update order status:', error);
    return null;
  }
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status: string): Promise<Order[]> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);
    return await collection
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Lỗi get orders by status:', error);
    return [];
  }
};

/**
 * Check if user has purchased a course
 */
export const hasUserPurchasedCourse = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);
    
    const order = await collection.findOne({
      userId: new ObjectId(userId),
      status: "completed",
      "courses.courseId": courseId
    });

    return order !== null;
  } catch (error) {
    console.error('Lỗi check user purchased course:', error);
    return false;
  }
};

/**
 * Get user's purchased courses
 */
export const getUserPurchasedCourses = async (userId: string): Promise<string[]> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);
    
    const orders = await collection
      .find({
        userId: new ObjectId(userId),
        status: "completed"
      })
      .toArray();

    const courseIds: string[] = [];
    orders.forEach(order => {
      order.courses.forEach(course => {
        if (!courseIds.includes(course.courseId)) {
          courseIds.push(course.courseId);
        }
      });
    });

    return courseIds;
  } catch (error) {
    console.error('Lỗi get user purchased courses:', error);
    return [];
  }
};

/**
 * Get total revenue (for admin/instructor)
 */
export const getTotalRevenue = async (): Promise<number> => {
  try {
    const collection = getCollection<Order>(CollectionName.ORDERS);
    
    const result = await collection
      .aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
      .toArray();

    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Lỗi get total revenue:', error);
    return 0;
  }
};
