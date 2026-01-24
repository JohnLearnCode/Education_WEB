import { ObjectId } from 'mongodb';

export enum VideoJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum VideoQuality {
  Q360P = '360p',
  Q480P = '480p',
  Q720P = '720p',
  Q1080P = '1080p'
}

export interface VideoJob {
  _id?: ObjectId;
  userId: ObjectId;
  lectureId?: ObjectId;
  courseId?: ObjectId;
  originalFilename: string;
  tempFilePath: string;
  status: VideoJobStatus;
  progress: number;
  hlsUrl?: string;
  qualities: VideoQuality[];
  duration?: number;
  fileSize?: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoJobResponse {
  _id: string;
  userId: string;
  lectureId?: string;
  courseId?: string;
  originalFilename: string;
  status: VideoJobStatus;
  progress: number;
  hlsUrl?: string;
  qualities: VideoQuality[];
  duration?: number;
  fileSize?: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVideoJobRequest {
  userId: string;
  lectureId?: string;
  courseId?: string;
  originalFilename: string;
  tempFilePath: string;
  fileSize?: number;
}

export interface VideoProcessingJobData {
  jobId: string;
  inputPath: string;
  outputDir: string;
  qualities: VideoQuality[];
}

export interface HLSSegment {
  quality: VideoQuality;
  playlistPath: string;
  segments: string[];
}

export interface ProcessedVideo {
  masterPlaylistUrl: string;
  qualities: VideoQuality[];
  duration: number;
}
