/**
 * Common Enums - Shared across modules
 */

// Collection Names
export enum CollectionName {
  USERS = 'users',
  POST = 'posts',
  CATEGORIES = 'categories',
  COURSES = 'courses',
  COURSE_SECTIONS = 'course_sections',
  LECTURES = 'lectures',
  QUIZZES = 'quizzes',
  QUIZ_QUESTIONS = 'quiz_questions',
  QUIZ_ATTEMPTS = 'quiz_attempts',
  ENROLLMENTS = 'enrollments',
  ORDERS = 'orders'
}

// Common Messages
export enum CommonMessage {
  VALIDATION_ERROR = 'Dữ liệu không hợp lệ',
  SERVER_ERROR = 'Có lỗi xảy ra trên server',
  SERVER_RUNNING = 'Server đang chạy',
  WELCOME_MESSAGE = 'Chào mừng đến với Todo API!'
}

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  SELLER = 'seller'
}


// Sort Direction (Common)
export enum SortDirection {
  ASC = 1,
  DESC = -1
}
