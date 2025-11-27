/**
 * Upload Domain Messages & Error Codes
 */

export enum UploadMessage {
  // Success messages
  SUCCESS_UPLOAD_IMAGE = 'Upload ảnh thành công',
  SUCCESS_UPLOAD_VIDEO = 'Upload video thành công',
  SUCCESS_UPLOAD_AVATAR = 'Upload avatar thành công',
  
  // Error messages
  ERROR_NO_FILE = 'Không có file được gửi lên',
  ERROR_INVALID_FILE_TYPE = 'Loại file không hợp lệ',
  ERROR_FILE_TOO_LARGE = 'Kích thước file vượt quá giới hạn cho phép',
  ERROR_UPLOAD_FAILED = 'Lỗi khi upload file',
  ERROR_INVALID_IMAGE_TYPE = 'Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)',
  ERROR_INVALID_VIDEO_TYPE = 'Chỉ chấp nhận file video (mp4, avi, mov, wmv, flv, mkv)',
}

export enum UploadErrorCode {
  NO_FILE = 'UPLOAD_NO_FILE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UPLOAD_FAILED = 'UPLOAD_ERROR',
}