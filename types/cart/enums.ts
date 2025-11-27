export enum CartMessage {
  SUCCESS_GET = 'Lấy giỏ hàng thành công',
  SUCCESS_ADD = 'Thêm khóa học vào giỏ hàng thành công',
  SUCCESS_REMOVE = 'Xóa khóa học khỏi giỏ hàng thành công',
  FAIL_GET = 'Lấy giỏ hàng thất bại',
  FAIL_ADD = 'Thêm khóa học vào giỏ hàng thất bại',
  FAIL_REMOVE = 'Xóa khóa học khỏi giỏ hàng thất bại',
  COURSE_ALREADY_IN_CART = 'Khóa học đã có trong giỏ hàng',
  COURSE_NOT_IN_CART = 'Khóa học không tồn tại trong giỏ hàng'
}
