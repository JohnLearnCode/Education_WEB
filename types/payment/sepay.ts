/**
 * SePay Payment Types
 */

// SePay Payment Methods (based on sepay-pg-node SDK)
export type SepayPaymentMethod = 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';

// Request to initiate SePay payment
export interface InitSepayPaymentRequest {
  orderId: string;
  paymentMethod?: SepayPaymentMethod;
}

// SePay checkout input fields (for initOneTimePaymentFields)
export interface SepayCheckoutInput {
  operation: 'PURCHASE';
  payment_method: SepayPaymentMethod;
  order_invoice_number: string;
  order_amount: number;
  currency: string;
  order_description?: string;
  customer_id?: string;
  success_url?: string;
  error_url?: string;
  cancel_url?: string;
  custom_data?: string;
}

// SePay checkout form fields (SDK output - returned from initOneTimePaymentFields)
export interface SepayCheckoutFields {
  merchant: string;
  operation: 'PURCHASE';
  payment_method: SepayPaymentMethod;
  order_invoice_number: string;
  order_amount: number;
  currency: string;
  order_description: string;
  customer_id?: string;
  success_url?: string;
  error_url?: string;
  cancel_url?: string;
  custom_data?: string;
  signature: string;
  [key: string]: string | number | undefined;
}

// Response from initiate payment
export interface SepayPaymentResponse {
  checkoutUrl: string;
  checkoutFields: SepayCheckoutFields;
  orderId: string;
  orderAmount: number;
}

// SePay Webhook/Callback data
export interface SepayWebhookData {
  order_invoice_number: string;
  transaction_id: string;
  transaction_status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  amount: number;
  currency: string;
  payment_method: string;
  timestamp: string;
  signature?: string;
}

// Payment status enum
export enum SepayTransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED'
}

// Messages
export enum SepayMessage {
  PAYMENT_INITIATED = 'Khởi tạo thanh toán thành công',
  PAYMENT_SUCCESS = 'Thanh toán thành công',
  PAYMENT_FAILED = 'Thanh toán thất bại',
  PAYMENT_CANCELLED = 'Thanh toán đã bị hủy',
  INVALID_ORDER = 'Đơn hàng không hợp lệ',
  ORDER_NOT_FOUND = 'Không tìm thấy đơn hàng',
  ORDER_ALREADY_PAID = 'Đơn hàng đã được thanh toán',
  INVALID_SIGNATURE = 'Chữ ký không hợp lệ',
  WEBHOOK_RECEIVED = 'Webhook đã được xử lý'
}
