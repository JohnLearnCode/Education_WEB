export enum UserMessage {
  SUCCESS_GET = 'Lấy thông tin người dùng thành công',
  SUCCESS_UPDATE = 'Cập nhật thông tin người dùng thành công',
  SUCCESS_DELETE = 'Xóa người dùng thành công',
  
  FAIL_GET = 'Lấy thông tin người dùng thất bại',
  FAIL_UPDATE = 'Cập nhật thông tin người dùng thất bại',
  FAIL_DELETE = 'Xóa người dùng thất bại',
  
  USER_NOT_FOUND = 'Không tìm thấy người dùng',
  UNAUTHORIZED_ACCESS = 'Bạn không có quyền truy cập thông tin này'
}
