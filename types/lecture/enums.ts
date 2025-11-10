export enum LectureMessage {
  SUCCESS_CREATE = "Tạo bài học thành công",
  FAIL_CREATE = "Tạo bài học thất bại",
  
  SUCCESS_UPDATE = "Cập nhật bài học thành công",
  FAIL_UPDATE = "Cập nhật bài học thất bại",
  
  SUCCESS_DELETE = "Xóa bài học thành công",
  FAIL_DELETE = "Xóa bài học thất bại",
  
  SUCCESS_GET = "Lấy thông tin bài học thành công",
  FAIL_GET = "Lấy thông tin bài học thất bại",
  
  LECTURE_NOT_FOUND = "Không tìm thấy bài học",
  SUCCESS_REORDER = "Sắp xếp lại bài học thành công",
  FAIL_REORDER = "Sắp xếp lại bài học thất bại",
  UNAUTHORIZED_ACCESS = "Bạn không có quyền truy cập bài học này"
}

export enum LectureType {
  VIDEO = "video",
  TEXT = "text",
  ATTACHMENT = "attachment"
}
