import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
import { InternalServerError } from '../errors/AppError.js';
import { UploadErrorCode } from '../types/upload/enums.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Upload image to Cloudinary
 * @param base64Image - Base64 encoded image
 * @param folder - Folder name on Cloudinary (default: 'images')
 * @returns Secure URL of uploaded image
 */
export const uploadImage = async (
  base64Image: string,
  folder: string = 'images'
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload image error:', error);
    throw new InternalServerError(
      'Tải ảnh lên cloud thất bại',
      UploadErrorCode.UPLOAD_FAILED
    );
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param base64Images - Array of base64 encoded images
 * @param folder - Folder name on Cloudinary (default: 'images')
 * @returns Array of secure URLs
 */
export const uploadMultipleImages = async (
  base64Images: string[],
  folder: string = 'images'
): Promise<string[]> => {
  try {
    const uploadPromises = base64Images.map(img => 
      cloudinary.uploader.upload(img, {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      })
    );
    const results = await Promise.all(uploadPromises);
    return results.map(r => r.secure_url);
  } catch (error: any) {
    console.error('Cloudinary upload multiple images error:', error);
    throw new InternalServerError(
      'Tải nhiều ảnh lên cloud thất bại',
      UploadErrorCode.UPLOAD_FAILED
    );
  }
}

/**
 * Upload video to Cloudinary
 * @param base64Video - Base64 encoded video
 * @param folder - Folder name on Cloudinary (default: 'videos/lectures')
 * @returns Secure URL of uploaded video
 */
export const uploadVideo = async (
  base64Video: string,
  folder: string = 'videos/lectures'
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64Video, {
      folder,
      resource_type: "video",
      chunk_size: 6000000, // 6MB chunks for large files
      eager: [
        { streaming_profile: "hd", format: "m3u8" }
      ],
      eager_async: true
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload video error:', error);
    throw new InternalServerError(
      'Tải video lên cloud thất bại',
      UploadErrorCode.UPLOAD_FAILED
    );
  }
}

/**
 * Upload avatar image to Cloudinary
 * @param base64Image - Base64 encoded image
 * @returns Secure URL of uploaded avatar
 */
export const uploadAvatar = async (base64Image: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'avatars',
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload avatar error:', error);
    throw new InternalServerError(
      'Tải avatar lên cloud thất bại',
      UploadErrorCode.UPLOAD_FAILED
    );
  }
}

/**
 * Upload file (PDF, Word) to Cloudinary
 * @param fileBuffer - File buffer
 * @param folder - Folder name on Cloudinary (default: 'documents')
 * @param originalFilename - Original filename to preserve extension
 * @param mimetype - File mimetype
 * @returns Secure URL of uploaded file
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  folder: string = 'documents',
  originalFilename: string,
  mimetype: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Extract extension from original filename
    const extension = originalFilename.split('.').pop()?.toLowerCase() || '';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: filename,
        format: extension, // Preserve file format
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload file error:', error);
          reject(new InternalServerError(
            'Tải file lên cloud thất bại',
            UploadErrorCode.UPLOAD_FAILED
          ));
        } else {
          resolve(result!.secure_url);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export default cloudinary;

