import { getCollection } from '../config/database.js';
import { VideoJob, VideoJobStatus, VideoQuality, CreateVideoJobRequest } from '../types/video/request.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'videoJobs';

export const createVideoJob = async (data: CreateVideoJobRequest): Promise<VideoJob | null> => {
  try {
    const collection = getCollection<VideoJob>(COLLECTION_NAME);
    
    const newJob: Omit<VideoJob, '_id'> = {
      userId: new ObjectId(data.userId),
      lectureId: data.lectureId ? new ObjectId(data.lectureId) : undefined,
      courseId: data.courseId ? new ObjectId(data.courseId) : undefined,
      originalFilename: data.originalFilename,
      tempFilePath: data.tempFilePath,
      status: VideoJobStatus.PENDING,
      progress: 0,
      qualities: [],
      fileSize: data.fileSize,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newJob as VideoJob);
    
    if (result.insertedId) {
      return await collection.findOne({ _id: result.insertedId });
    }
    
    return null;
  } catch (error) {
    console.error('Error creating video job:', error);
    return null;
  }
};

export const getVideoJobById = async (jobId: string): Promise<VideoJob | null> => {
  try {
    const collection = getCollection<VideoJob>(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(jobId) });
  } catch (error) {
    console.error('Error getting video job:', error);
    return null;
  }
};

export const getVideoJobsByUserId = async (userId: string): Promise<VideoJob[]> => {
  try {
    const collection = getCollection<VideoJob>(COLLECTION_NAME);
    return await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  } catch (error) {
    console.error('Error getting video jobs by user:', error);
    return [];
  }
};

export const updateVideoJobStatus = async (
  jobId: string,
  status: VideoJobStatus,
  progress?: number,
  error?: string
): Promise<boolean> => {
  try {
    const collection = getCollection<VideoJob>(COLLECTION_NAME);
    
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (progress !== undefined) {
      updateData.progress = progress;
    }
    
    if (error) {
      updateData.error = error;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(jobId) },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating video job status:', error);
    return false;
  }
};

export const updateVideoJobProgress = async (jobId: string, progress: number): Promise<boolean> => {
  try {
    const collection = getCollection<VideoJob>(COLLECTION_NAME);

    const result = await collection.updateOne(
      { _id: new ObjectId(jobId) },
      { 
        $set: { 
          progress,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating video job progress:', error);
    return false;
  }
};

export const completeVideoJob = async (
  jobId: string,
  hlsUrl: string,
  qualities: VideoQuality[],
  duration: number
): Promise<boolean> => {
  try {
    const collection = getCollection<VideoJob>(COLLECTION_NAME);

    const result = await collection.updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          status: VideoJobStatus.COMPLETED,
          progress: 100,
          hlsUrl,
          qualities,
          duration,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error completing video job:', error);
    return false;
  }
};

export const failVideoJob = async (jobId: string, error: string): Promise<boolean> => {
  try {
    const collection = getCollection<VideoJob>(COLLECTION_NAME);

    const result = await collection.updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          status: VideoJobStatus.FAILED,
          error,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error failing video job:', error);
    return false;
  }
};

export const deleteVideoJob = async (jobId: string): Promise<boolean> => {
  try {
    const collection = getCollection<VideoJob>(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(jobId) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting video job:', error);
    return false;
  }
};
