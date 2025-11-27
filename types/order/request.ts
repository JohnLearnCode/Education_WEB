import { BaseEntity } from '../common/interface.js';
import { ObjectId } from 'mongodb';

/**
 * Order Request Types - Input Data
 */

// Order Item (Course in order)
export interface OrderItem {
  courseId: string;
  title: string;
  price: number;
  thumbnail?: string;
}

// Order Entity Interface
export interface Order extends BaseEntity {
  userId: ObjectId;
  courses: OrderItem[];
  totalAmount: number;
  status: string; // pending, completed, cancelled, refunded
  paymentMethod: string; // credit_card, paypal, bank_transfer, momo, vnpay
  createdAt: Date;
  updatedAt: Date;
}

// Create Order Request
export interface CreateOrderRequest {
  courseIds: string[];
  paymentMethod: string;
}

// Update Order Status Request
export interface UpdateOrderStatusRequest {
  status: string;
}

// Order Response
export interface OrderResponse extends Omit<Order, 'userId'> {
  userId: string;
}

// Order with User Info
export interface OrderWithUser extends OrderResponse {
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

// Order Summary
export interface OrderSummary {
  orderId: string;
  totalAmount: number;
  courseCount: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
}
