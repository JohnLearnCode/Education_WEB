export enum CourseMessage {
  SUCCESS_CREATE = "Tạo khóa học thành công",
  FAIL_CREATE = "Tạo khóa học thất bại",
  
  SUCCESS_UPDATE = "Cập nhật khóa học thành công",
  FAIL_UPDATE = "Cập nhật khóa học thất bại",
  
  SUCCESS_DELETE = "Xóa khóa học thành công",
  FAIL_DELETE = "Xóa khóa học thất bại",
  
  SUCCESS_GET = "Lấy thông tin khóa học thành công",
  FAIL_GET = "Lấy thông tin khóa học thất bại",
  
  COURSE_NOT_FOUND = "Không tìm thấy khóa học",
  INSTRUCTOR_ACCESS_REQUIRED = "Yêu cầu quyền truy cập của giảng viên",
  UNAUTHORIZED_ACCESS = "Bạn không có quyền truy cập khóa học này"
}

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  ALL_LEVELS = "all-levels"
}

export enum CourseCategory {
  DEVELOPMENT = "development",
  BUSINESS = "business",
  DESIGN = "design",
  MARKETING = "marketing",
  IT_SOFTWARE = "it-software",
  PERSONAL_DEVELOPMENT = "personal-development",
  PHOTOGRAPHY = "photography",
  MUSIC = "music",
  HEALTH_FITNESS = "health-fitness",
  LANGUAGE = "language",
  ACADEMICS = "academics"
}
