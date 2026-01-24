import path from 'path';
import fs from 'fs';
import { VideoJob, VideoJobResponse, VideoJobStatus, CreateVideoJobRequest } from '../types/video/request.js';
import { VideoMessage } from '../types/video/enums.js';
import * as videoJobModel from '../model/videoJob.js';
import { addVideoJob, getJobProgress } from '../config/bullmq.js';

const TEMP_UPLOAD_DIR = process.env.VIDEO_TEMP_DIR || './temp/uploads';
const HLS_OUTPUT_DIR = process.env.HLS_OUTPUT_DIR || './temp/hls';

const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const toResponse = (job: VideoJob): VideoJobResponse => {
  return {
    _id: job._id!.toString(),
    userId: job.userId.toString(),
    lectureId: job.lectureId?.toString(),
    courseId: job.courseId?.toString(),
    originalFilename: job.originalFilename,
    status: job.status,
    progress: job.progress,
    hlsUrl: job.hlsUrl,
    qualities: job.qualities,
    duration: job.duration,
    fileSize: job.fileSize,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  };
};

export const uploadVideoForProcessing = async (
  file: Express.Multer.File,
  userId: string,
  lectureId?: string,
  courseId?: string
): Promise<VideoJobResponse> => {
  ensureDir(TEMP_UPLOAD_DIR);

  const timestamp = Date.now();
  const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const tempFilename = `${timestamp}_${safeFilename}`;
  const tempFilePath = path.join(TEMP_UPLOAD_DIR, tempFilename);

  fs.writeFileSync(tempFilePath, file.buffer);

  const jobData: CreateVideoJobRequest = {
    userId,
    lectureId,
    courseId,
    originalFilename: file.originalname,
    tempFilePath,
    fileSize: file.size
  };

  const videoJob = await videoJobModel.createVideoJob(jobData);
  
  if (!videoJob || !videoJob._id) {
    fs.unlinkSync(tempFilePath);
    throw new Error(VideoMessage.ERROR_UPLOAD_FAILED);
  }

  const jobId = videoJob._id.toString();
  const outputDir = path.join(HLS_OUTPUT_DIR, jobId);

  await addVideoJob(
    {
      jobId,
      inputPath: tempFilePath,
      outputDir,
      qualities: []
    },
    jobId
  );

  return toResponse(videoJob);
};

export const getVideoJobStatus = async (jobId: string, userId: string): Promise<VideoJobResponse> => {
  const videoJob = await videoJobModel.getVideoJobById(jobId);
  
  if (!videoJob) {
    throw new Error(VideoMessage.ERROR_JOB_NOT_FOUND);
  }

  if (videoJob.userId.toString() !== userId) {
    throw new Error(VideoMessage.ERROR_JOB_NOT_FOUND);
  }

  const queueProgress = await getJobProgress(jobId);
  if (queueProgress && queueProgress.progress) {
    videoJob.progress = queueProgress.progress as number;
  }

  return toResponse(videoJob);
};

export const getVideoHLSUrl = async (jobId: string, userId: string): Promise<string> => {
  const videoJob = await videoJobModel.getVideoJobById(jobId);
  
  if (!videoJob) {
    throw new Error(VideoMessage.ERROR_JOB_NOT_FOUND);
  }

  if (videoJob.userId.toString() !== userId) {
    throw new Error(VideoMessage.ERROR_JOB_NOT_FOUND);
  }

  if (videoJob.status !== VideoJobStatus.COMPLETED || !videoJob.hlsUrl) {
    throw new Error(VideoMessage.ERROR_HLS_NOT_READY);
  }

  return videoJob.hlsUrl;
};

export const getUserVideoJobs = async (userId: string): Promise<VideoJobResponse[]> => {
  const jobs = await videoJobModel.getVideoJobsByUserId(userId);
  return jobs.map(toResponse);
};

export const deleteVideoJob = async (jobId: string, userId: string): Promise<boolean> => {
  const videoJob = await videoJobModel.getVideoJobById(jobId);
  
  if (!videoJob) {
    throw new Error(VideoMessage.ERROR_JOB_NOT_FOUND);
  }

  if (videoJob.userId.toString() !== userId) {
    throw new Error(VideoMessage.ERROR_JOB_NOT_FOUND);
  }

  return await videoJobModel.deleteVideoJob(jobId);
};
