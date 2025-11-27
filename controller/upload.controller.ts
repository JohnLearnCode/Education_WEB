import { Request, Response, NextFunction } from 'express';
import { uploadImage, uploadVideo, uploadAvatar, uploadFile } from '../config/cloudinary.js';
import { bufferToBase64 } from '../middleware/uploadMiddleware.js';
import { ResponseHelper } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../errors/AppError.js';
import { UploadMessage, UploadErrorCode } from '../types/upload/enums.js';

/**
 * Upload single image to Cloudinary
 * @route POST /api/upload/image
 * @access Private (authenticated users)
 */
export const uploadImageHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError(
        UploadMessage.ERROR_NO_FILE,
        UploadErrorCode.NO_FILE
      );
    }
    
    // Convert buffer to base64
    const base64Image = bufferToBase64(req.file.buffer, req.file.mimetype);
    
    // Upload to Cloudinary
    const url = await uploadImage(base64Image, 'images');
    
    return ResponseHelper.success(
      res,
      UploadMessage.SUCCESS_UPLOAD_IMAGE,
      { url },
      StatusCodes.OK
    );
  } catch (error: any) {
    next(error);
  }
};

/**
 * Upload video to Cloudinary (for lecture videos)
 * @route POST /api/upload/video
 * @access Private (instructors only)
 */
export const uploadVideoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError(
        UploadMessage.ERROR_NO_FILE,
        UploadErrorCode.NO_FILE
      );
    }
    
    // Convert buffer to base64
    const base64Video = bufferToBase64(req.file.buffer, req.file.mimetype);
    
    // Upload to Cloudinary
    const url = await uploadVideo(base64Video, 'videos/lectures');
    
    return ResponseHelper.success(
      res,
      UploadMessage.SUCCESS_UPLOAD_VIDEO,
      { url },
      StatusCodes.OK
    );
  } catch (error: any) {
    next(error);
  }
};

/**
 * Upload avatar image to Cloudinary
 * @route POST /api/upload/avatar
 * @access Private (authenticated users)
 */
export const uploadAvatarHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError(
        UploadMessage.ERROR_NO_FILE,
        UploadErrorCode.NO_FILE
      );
    }
    
    // Convert buffer to base64
    const base64Image = bufferToBase64(req.file.buffer, req.file.mimetype);
    
    // Upload to Cloudinary with avatar transformations
    const url = await uploadAvatar(base64Image);
    
    return ResponseHelper.success(
      res,
      UploadMessage.SUCCESS_UPLOAD_AVATAR,
      { url },
      StatusCodes.OK
    );
  } catch (error: any) {
    next(error);
  }
};

/**
 * Upload file (PDF, Word) to Cloudinary
 * @route POST /api/upload/file
 * @access Private (instructors only)
 */
export const uploadFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError(
        UploadMessage.ERROR_NO_FILE,
        UploadErrorCode.NO_FILE
      );
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new BadRequestError(
        'Chỉ chấp nhận file PDF hoặc Word (.pdf, .doc, .docx)',
        UploadErrorCode.INVALID_FILE_TYPE
      );
    }
    
    // Upload to Cloudinary with buffer directly to preserve extension
    const url = await uploadFile(
      req.file.buffer,
      'documents/lectures',
      req.file.originalname,
      req.file.mimetype
    );
    
    return ResponseHelper.success(
      res,
      'Tải file lên thành công',
      { url },
      StatusCodes.OK
    );
  } catch (error: any) {
    next(error);
  }
};
