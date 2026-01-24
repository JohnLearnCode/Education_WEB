import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const VIDEO_QUEUE_NAME = 'video-processing';

export const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 100
    },
    removeOnFail: {
      age: 7 * 24 * 3600
    }
  }
});

export const videoQueueEvents = new QueueEvents(VIDEO_QUEUE_NAME, {
  connection: new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  })
});

export const createVideoWorker = (processor: (job: any) => Promise<any>): Worker => {
  return new Worker(VIDEO_QUEUE_NAME, processor, {
    connection: new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    }),
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60000
    }
  });
};

export const addVideoJob = async (jobData: any, jobId: string) => {
  return await videoQueue.add('process-video', jobData, {
    jobId,
    priority: 1
  });
};

export const getJobProgress = async (jobId: string) => {
  const job = await videoQueue.getJob(jobId);
  if (!job) return null;
  
  return {
    id: job.id,
    progress: job.progress,
    state: await job.getState(),
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason
  };
};

videoQueueEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Video job ${jobId} completed`);
});

videoQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Video job ${jobId} failed: ${failedReason}`);
});

videoQueueEvents.on('progress', ({ jobId, data }) => {
  console.log(`📊 Video job ${jobId} progress: ${data}%`);
});

export { connection as bullmqConnection };
