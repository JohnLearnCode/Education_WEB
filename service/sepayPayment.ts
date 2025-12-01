import { sepayClient } from '../config/sepay.js';
import * as orderModel from '../model/order.js';
import * as enrollmentService from './enrollment.js';
import {
  SepayPaymentMethod,
  SepayWebhookData,
  SepayTransactionStatus,
  SepayMessage
} from '../types/payment/sepay.js';

// Base URLs for payment callbacks
const getBaseUrl = (): string => {
  const protocol = process.env.FRONTEND_PROTOCOL || 'http';
  const host = process.env.FRONTEND_HOST || 'localhost';
  const port = process.env.FRONTEND_PORT || '3000';
  return `${protocol}://${host}:${port}`;
};

/**
 * Initialize SePay payment for an order
 */
export const initiateSepayPayment = async (
  orderId: string,
  userId: string,
  paymentMethod: SepayPaymentMethod = 'BANK_TRANSFER'
): Promise<{
  checkoutUrl: string;
  checkoutFields: Record<string, any>;
  orderId: string;
  orderAmount: number;
}> => {
  // Get order details
  const order = await orderModel.getOrderById(orderId);
  
  if (!order) {
    throw new Error(SepayMessage.ORDER_NOT_FOUND);
  }

  // Verify order belongs to user
  if (order.userId.toString() !== userId) {
    throw new Error(SepayMessage.INVALID_ORDER);
  }

  // Check if order is already paid
  if (order.status === 'completed') {
    throw new Error(SepayMessage.ORDER_ALREADY_PAID);
  }

  const baseUrl = getBaseUrl();
  
  // Get checkout URL from SePay
  const checkoutUrl = sepayClient.checkout.initCheckoutUrl();
  console.log('🔗 SePay Checkout URL:', checkoutUrl);

  // Generate order description
  const courseNames = order.courses.map(c => c.title).join(', ');
  const orderDescription = `Thanh toan don hang ${orderId} - ${courseNames}`.substring(0, 200);

  // Initialize checkout form fields
  // According to SePay SDK docs: operation and payment_method are required
  const checkoutFields = sepayClient.checkout.initOneTimePaymentFields({
    operation: 'PURCHASE',
    payment_method: paymentMethod,
    order_invoice_number: orderId,
    order_amount: order.totalAmount,
    currency: 'VND',
    order_description: orderDescription,
    success_url: `${baseUrl}/payment/success?orderId=${orderId}`,
    error_url: `${baseUrl}/payment/error?orderId=${orderId}`,
    cancel_url: `${baseUrl}/payment/cancel?orderId=${orderId}`,
  });

  console.log('📝 SePay Checkout Fields:', JSON.stringify(checkoutFields, null, 2));

  // Update order payment method
  await orderModel.updateOrderPaymentMethod(orderId, `sepay_${paymentMethod.toLowerCase()}`);

  return {
    checkoutUrl,
    checkoutFields,
    orderId,
    orderAmount: order.totalAmount
  };
};

/**
 * Handle SePay webhook callback
 */
export const handleSepayWebhook = async (
  webhookData: SepayWebhookData
): Promise<{ success: boolean; message: string }> => {
  const { order_invoice_number, transaction_status, transaction_id } = webhookData;

  // Get order
  const order = await orderModel.getOrderById(order_invoice_number);
  
  if (!order) {
    console.error(`SePay Webhook: Order not found - ${order_invoice_number}`);
    return { success: false, message: SepayMessage.ORDER_NOT_FOUND };
  }

  // Process based on transaction status
  switch (transaction_status) {
    case SepayTransactionStatus.SUCCESS:
      // Update order status to completed
      await orderModel.updateOrderStatus(order_invoice_number, 'completed');
      
      // Save transaction ID
      await orderModel.updateOrderTransactionId(order_invoice_number, transaction_id);

      // Auto-enroll user in purchased courses
      for (const course of order.courses) {
        try {
          const existingEnrollment = await enrollmentService.getEnrollmentByUserAndCourse(
            order.userId.toString(),
            course.courseId
          );

          if (!existingEnrollment) {
            await enrollmentService.enrollCourse(course.courseId, order.userId.toString());
          }
        } catch (error) {
          console.error(`Error enrolling user in course ${course.courseId}:`, error);
        }
      }

      console.log(`SePay Webhook: Payment successful for order ${order_invoice_number}`);
      return { success: true, message: SepayMessage.PAYMENT_SUCCESS };

    case SepayTransactionStatus.FAILED:
      await orderModel.updateOrderStatus(order_invoice_number, 'failed');
      console.log(`SePay Webhook: Payment failed for order ${order_invoice_number}`);
      return { success: true, message: SepayMessage.PAYMENT_FAILED };

    case SepayTransactionStatus.CANCELLED:
      await orderModel.updateOrderStatus(order_invoice_number, 'cancelled');
      console.log(`SePay Webhook: Payment cancelled for order ${order_invoice_number}`);
      return { success: true, message: SepayMessage.PAYMENT_CANCELLED };

    case SepayTransactionStatus.PENDING:
      // Order remains in pending status
      console.log(`SePay Webhook: Payment pending for order ${order_invoice_number}`);
      return { success: true, message: 'Đang chờ xử lý thanh toán' };

    default:
      console.warn(`SePay Webhook: Unknown status ${transaction_status} for order ${order_invoice_number}`);
      return { success: false, message: 'Trạng thái thanh toán không xác định' };
  }
};

/**
 * Verify payment status by order ID
 */
export const verifyPaymentStatus = async (
  orderId: string,
  userId: string
): Promise<{ status: string; message: string }> => {
  const order = await orderModel.getOrderById(orderId);
  
  if (!order) {
    throw new Error(SepayMessage.ORDER_NOT_FOUND);
  }

  // Verify order belongs to user
  if (order.userId.toString() !== userId) {
    throw new Error(SepayMessage.INVALID_ORDER);
  }

  const statusMessages: Record<string, string> = {
    'pending': 'Đang chờ thanh toán',
    'completed': 'Thanh toán thành công',
    'failed': 'Thanh toán thất bại',
    'cancelled': 'Đã hủy thanh toán',
    'refunded': 'Đã hoàn tiền'
  };

  return {
    status: order.status,
    message: statusMessages[order.status] || 'Trạng thái không xác định'
  };
};
