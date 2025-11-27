export enum InstructorEarningsMessage {
  SUCCESS_CREATE = 'Tạo bản ghi thu nhập thành công',
  SUCCESS_GET = 'Lấy thông tin thu nhập thành công',
  SUCCESS_UPDATE = 'Cập nhật trạng thái thu nhập thành công',
  SUCCESS_DELETE = 'Xóa bản ghi thu nhập thành công',
  
  FAIL_CREATE = 'Tạo bản ghi thu nhập thất bại',
  FAIL_GET = 'Lấy thông tin thu nhập thất bại',
  FAIL_UPDATE = 'Cập nhật trạng thái thu nhập thất bại',
  FAIL_DELETE = 'Xóa bản ghi thu nhập thất bại',
  
  EARNING_NOT_FOUND = 'Không tìm thấy bản ghi thu nhập',
  DUPLICATE_ORDER = 'Đơn hàng này đã được ghi nhận thu nhập',
  INVALID_AMOUNT = 'Số tiền không hợp lệ'
}

export const PLATFORM_FEE_PERCENTAGE = 0.1; // 10%
