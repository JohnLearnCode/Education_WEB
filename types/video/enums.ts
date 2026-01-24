export enum VideoMessage {
  SUCCESS_UPLOAD = 'Video đã được upload và đang xử lý',
  SUCCESS_GET_STATUS = 'Lấy trạng thái video thành công',
  SUCCESS_GET_HLS = 'Lấy HLS URL thành công',
  SUCCESS_DELETE = 'Xóa video thành công',
  
  ERROR_NO_FILE = 'Vui lòng chọn file video',
  ERROR_INVALID_TYPE = 'Chỉ chấp nhận file video (mp4, mov, avi, mkv, webm)',
  ERROR_FILE_TOO_LARGE = 'File video quá lớn. Tối đa 500MB',
  ERROR_JOB_NOT_FOUND = 'Không tìm thấy video job',
  ERROR_PROCESSING_FAILED = 'Xử lý video thất bại',
  ERROR_HLS_NOT_READY = 'Video đang được xử lý, vui lòng thử lại sau',
  ERROR_FFMPEG_NOT_FOUND = 'FFmpeg không được cài đặt trên server',
  ERROR_UPLOAD_FAILED = 'Upload video thất bại'
}

export enum VideoErrorCode {
  NO_FILE = 'VIDEO_NO_FILE',
  INVALID_TYPE = 'VIDEO_INVALID_TYPE',
  FILE_TOO_LARGE = 'VIDEO_FILE_TOO_LARGE',
  JOB_NOT_FOUND = 'VIDEO_JOB_NOT_FOUND',
  PROCESSING_FAILED = 'VIDEO_PROCESSING_FAILED',
  HLS_NOT_READY = 'VIDEO_HLS_NOT_READY',
  FFMPEG_NOT_FOUND = 'VIDEO_FFMPEG_NOT_FOUND',
  UPLOAD_FAILED = 'VIDEO_UPLOAD_FAILED'
}

export const ALLOWED_VIDEO_MIMETYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm'
];

export const MAX_VIDEO_SIZE_MB = 500;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export const HLS_SEGMENT_DURATION = 10;

export const QUALITY_CONFIGS = {
  '1080p': { width: 1920, height: 1080, bitrate: '5000k', audioBitrate: '192k' },
  '720p': { width: 1280, height: 720, bitrate: '2800k', audioBitrate: '128k' },
  '480p': { width: 854, height: 480, bitrate: '1400k', audioBitrate: '128k' },
  '360p': { width: 640, height: 360, bitrate: '800k', audioBitrate: '96k' }
};
