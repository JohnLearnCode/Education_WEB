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

// SePay Webhook/Callback data (actual structure from SePay)
export interface SepayWebhookOrder {
  id: string;
  order_id: string;
  order_status: string; // CAPTURED, PENDING, etc.
  order_currency: string;
  order_amount: string;
  order_invoice_number: string;
  custom_data: any[];
  user_agent?: string;
  ip_address?: string;
  order_description?: string;
}

export interface SepayWebhookTransaction {
  id: string;
  payment_method: string;
  transaction_id: string;
  transaction_type: string;
  transaction_date: string;
  transaction_status: string; // APPROVED, DECLINED, etc.
  transaction_amount: string;
  transaction_currency: string;
  authentication_status?: string;
  card_number?: string | null;
  card_holder_name?: string | null;
  card_expiry?: string | null;
  card_funding_method?: string | null;
  card_brand?: string | null;
}

export interface SepayWebhookData {
  timestamp: number;
  notification_type: string; // ORDER_PAID, ORDER_FAILED, etc.
  order: SepayWebhookOrder;
  transaction: SepayWebhookTransaction;
  customer?: any;
  agreement?: any;
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
