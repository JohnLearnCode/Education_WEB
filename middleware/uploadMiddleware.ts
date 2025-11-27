import { NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { BadRequestError } from '../errors/AppError.js';
import { UploadMessage, UploadErrorCode } from '../types/upload/enums.js';


// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska'];
const ALLOWED_SPREADSHEET_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// File size limits
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB for images
const VIDEO_SIZE_LIMIT = 1024 * 1024 * 1024; // 1GB for videos
const SPREADSHEET_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB for spreadsheets
const DOCUMENT_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB for documents

/**
 * Image file filter
 */
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(
      UploadMessage.ERROR_INVALID_IMAGE_TYPE,
      UploadErrorCode.INVALID_FILE_TYPE
    ));
  }
};

/**
 * Video file filter
 */
const videoFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(
      UploadMessage.ERROR_INVALID_VIDEO_TYPE,
      UploadErrorCode.INVALID_FILE_TYPE
    ));
  }
};

/**
 * Multer config for images
 */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
  fileFilter: imageFileFilter
});

/**
 * Multer config for videos
 */
export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: VIDEO_SIZE_LIMIT },
  fileFilter: videoFileFilter
});

/**
 * Upload single image middleware
 */
export const uploadSingleImage = (fieldName: string = 'image') => {
  const multerMiddleware = uploadImage.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError(
              UploadMessage.ERROR_FILE_TOO_LARGE,
              UploadErrorCode.FILE_TOO_LARGE
            ));
          }
        }
        return next(err);
      }
      next();
    });
  };
}

/**
 * Upload single video middleware
 */
export const uploadSingleVideo = (fieldName: string = 'video') => {
  const multerMiddleware = uploadVideo.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError(
              UploadMessage.ERROR_FILE_TOO_LARGE,
              UploadErrorCode.FILE_TOO_LARGE
            ));
          }
        }
        return next(err);
      }
      next();
    });
  };
}

/**
 * Upload multiple images middleware
 */
export const uploadMultipleImages = (fieldName: string = 'images', maxCount: number = 10) => {
  const multerMiddleware = uploadImage.array(fieldName, maxCount);

  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError(
              UploadMessage.ERROR_FILE_TOO_LARGE,
              UploadErrorCode.FILE_TOO_LARGE
            ));
          }
        }
        return next(err);
      }
      next();
    });
  };
}

/**
 * Upload multiple fields middleware
 */
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  const multerMiddleware = uploadImage.fields(fields);

  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError(
              UploadMessage.ERROR_FILE_TOO_LARGE,
              UploadErrorCode.FILE_TOO_LARGE
            ));
          }
        }
        return next(err);
      }
      next();
    });
  };
}

/**
 * Convert buffer to base64 data URI
 */
export const bufferToBase64 = (buffer: Buffer, mimetype: string): string => {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

/**
 * Spreadsheet file filter
 */
const spreadsheetFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  
  if (ALLOWED_SPREADSHEET_TYPES.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(
      'Chỉ chấp nhận file CSV hoặc XLSX',
      UploadErrorCode.INVALID_FILE_TYPE
    ));
  }
};

/**
 * Multer config for spreadsheets (CSV, XLSX)
 */
export const uploadSpreadsheet = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: SPREADSHEET_SIZE_LIMIT },
  fileFilter: spreadsheetFileFilter
});

/**
 * Upload single spreadsheet middleware
 */
export const uploadSingleSpreadsheet = (fieldName: string = 'file') => {
  const multerMiddleware = uploadSpreadsheet.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError(
              'File quá lớn (tối đa 10MB)',
              UploadErrorCode.FILE_TOO_LARGE
            ));
          }
        }
        return next(err);
      }
      next();
    });
  };
}

/**
 * Document file filter (PDF, Word)
 */
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(
      'Chỉ chấp nhận file PDF hoặc Word (.pdf, .doc, .docx)',
      UploadErrorCode.INVALID_FILE_TYPE
    ));
  }
};

/**
 * Multer config for documents (PDF, Word)
 */
export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: DOCUMENT_SIZE_LIMIT },
  fileFilter: documentFileFilter
});

/**
 * Upload single document middleware
 */
export const uploadSingleDocument = (fieldName: string = 'file') => {
  const multerMiddleware = uploadDocument.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError(
              'File quá lớn (tối đa 50MB)',
              UploadErrorCode.FILE_TOO_LARGE
            ));
          }
        }
        return next(err);
      }
      next();
    });
  };
}









