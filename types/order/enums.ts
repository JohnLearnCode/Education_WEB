export enum OrderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded"
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  PAYPAL = "paypal",
  BANK_TRANSFER = "bank_transfer",
  MOMO = "momo",
  VNPAY = "vnpay"
}

export enum OrderMessage {
  SUCCESS_CREATE = "Tạo đơn hàng thành công",
  FAIL_CREATE = "Tạo đơn hàng thất bại",
  
  SUCCESS_UPDATE = "Cập nhật đơn hàng thành công",
  FAIL_UPDATE = "Cập nhật đơn hàng thất bại",
  
  SUCCESS_GET = "Lấy thông tin đơn hàng thành công",
  SUCCESS_GET_ALL = "Lấy danh sách đơn hàng thành công",
  FAIL_GET = "Lấy thông tin đơn hàng thất bại",
  
  ORDER_NOT_FOUND = "Không tìm thấy đơn hàng",
  COURSE_NOT_FOUND = "Không tìm thấy khóa học",
  ALREADY_PURCHASED = "Bạn đã mua khóa học này rồi",
  INVALID_STATUS = "Trạng thái đơn hàng không hợp lệ",
  INVALID_PAYMENT_METHOD = "Phương thức thanh toán không hợp lệ",
  EMPTY_CART = "Giỏ hàng trống"
}
