import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseHelper } from '../utils/response.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { VideoMessage, VideoErrorCode, ALLOWED_VIDEO_MIMETYPES, MAX_VIDEO_SIZE_BYTES } from '../types/video/enums.js';
import * as videoUploadService from '../service/videoUpload.js';

export const uploadVideoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError(VideoMessage.ERROR_NO_FILE, VideoErrorCode.NO_FILE);
    }

    if (!ALLOWED_VIDEO_MIMETYPES.includes(req.file.mimetype)) {
      throw new BadRequestError(VideoMessage.ERROR_INVALID_TYPE, VideoErrorCode.INVALID_TYPE);
    }

    if (req.file.size > MAX_VIDEO_SIZE_BYTES) {
      throw new BadRequestError(VideoMessage.ERROR_FILE_TOO_LARGE, VideoErrorCode.FILE_TOO_LARGE);
    }

    const userId = (req.user as any)?.userId;
    const { lectureId, courseId } = req.body;

    const videoJob = await videoUploadService.uploadVideoForProcessing(
      req.file,
      userId,
      lectureId,
      courseId
    );

    return ResponseHelper.success(
      res,
      VideoMessage.SUCCESS_UPLOAD,
      { 
        jobId: videoJob._id,
        status: videoJob.status,
        originalFilename: videoJob.originalFilename
      },
      StatusCodes.ACCEPTED
    );
  } catch (error) {
    next(error);
  }
};

export const getVideoStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const userId = (req.user as any)?.userId;

    const videoJob = await videoUploadService.getVideoJobStatus(jobId, userId);

    return ResponseHelper.success(
      res,
      VideoMessage.SUCCESS_GET_STATUS,
      videoJob,
      StatusCodes.OK
    );
  } catch (error: any) {
    if (error.message === VideoMessage.ERROR_JOB_NOT_FOUND) {
      return next(new NotFoundError(VideoMessage.ERROR_JOB_NOT_FOUND, VideoErrorCode.JOB_NOT_FOUND));
    }
    next(error);
  }
};

export const getVideoHLSHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const userId = (req.user as any)?.userId;

    const hlsUrl = await videoUploadService.getVideoHLSUrl(jobId, userId);

    return ResponseHelper.success(
      res,
      VideoMessage.SUCCESS_GET_HLS,
      { hlsUrl },
      StatusCodes.OK
    );
  } catch (error: any) {
    if (error.message === VideoMessage.ERROR_JOB_NOT_FOUND) {
      return next(new NotFoundError(VideoMessage.ERROR_JOB_NOT_FOUND, VideoErrorCode.JOB_NOT_FOUND));
    }
    if (error.message === VideoMessage.ERROR_HLS_NOT_READY) {
      return next(new BadRequestError(VideoMessage.ERROR_HLS_NOT_READY, VideoErrorCode.HLS_NOT_READY));
    }
    next(error);
  }
};

export const getUserVideosHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any)?.userId;

    const videoJobs = await videoUploadService.getUserVideoJobs(userId);

    return ResponseHelper.success(
      res,
      VideoMessage.SUCCESS_GET_STATUS,
      { videos: videoJobs },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const deleteVideoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const userId = (req.user as any)?.userId;

    await videoUploadService.deleteVideoJob(jobId, userId);

    return ResponseHelper.success(
      res,
      VideoMessage.SUCCESS_DELETE,
      null,
      StatusCodes.OK
    );
  } catch (error: any) {
    if (error.message === VideoMessage.ERROR_JOB_NOT_FOUND) {
      return next(new NotFoundError(VideoMessage.ERROR_JOB_NOT_FOUND, VideoErrorCode.JOB_NOT_FOUND));
    }
    next(error);
  }
};
