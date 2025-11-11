export enum CategoryMessage {
  SUCCESS_CREATE = "Tạo danh mục thành công",
  FAIL_CREATE = "Tạo danh mục thất bại",
  
  SUCCESS_UPDATE = "Cập nhật danh mục thành công",
  FAIL_UPDATE = "Cập nhật danh mục thất bại",
  
  SUCCESS_DELETE = "Xóa danh mục thành công",
  FAIL_DELETE = "Xóa danh mục thất bại",
  
  SUCCESS_GET = "Lấy thông tin danh mục thành công",
  SUCCESS_GET_ALL = "Lấy danh sách danh mục thành công",
  FAIL_GET = "Lấy thông tin danh mục thất bại",
  
  CATEGORY_NOT_FOUND = "Không tìm thấy danh mục",
  CATEGORY_NAME_EXISTS = "Tên danh mục đã tồn tại",
  CATEGORY_HAS_COURSES = "Không thể xóa danh mục đang có khóa học"
}
