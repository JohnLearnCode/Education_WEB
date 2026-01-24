import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { Job } from 'bullmq';
import { v2 as cloudinary } from 'cloudinary';
import { VideoProcessingJobData, VideoQuality } from '../types/video/request.js';
import { QUALITY_CONFIGS, HLS_SEGMENT_DURATION } from '../types/video/enums.js';
import * as videoJobModel from '../model/videoJob.js';
import { VideoJobStatus } from '../types/video/request.js';

const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE_PATH = process.env.FFPROBE_PATH || 'ffprobe';

ffmpeg.setFfmpegPath(FFMPEG_PATH);
ffmpeg.setFfprobePath(FFPROBE_PATH);

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

const getVideoMetadata = (inputPath: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0
      });
    });
  });
};

const determineQualities = (sourceHeight: number): VideoQuality[] => {
  const qualities: VideoQuality[] = [];
  
  if (sourceHeight >= 1080) qualities.push(VideoQuality.Q1080P);
  if (sourceHeight >= 720) qualities.push(VideoQuality.Q720P);
  if (sourceHeight >= 480) qualities.push(VideoQuality.Q480P);
  qualities.push(VideoQuality.Q360P);
  
  return qualities;
};

const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const transcodeToHLS = (
  inputPath: string,
  outputDir: string,
  quality: VideoQuality,
  onProgress: (percent: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config = QUALITY_CONFIGS[quality];
    const qualityDir = path.join(outputDir, quality);
    ensureDir(qualityDir);

    const outputPath = path.join(qualityDir, 'index.m3u8');
    const segmentPath = path.join(qualityDir, 'segment_%03d.ts');

    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=${config.width}:${config.height}:force_original_aspect_ratio=decrease,pad=${config.width}:${config.height}:(ow-iw)/2:(oh-ih)/2`,
        '-c:v libx264',
        '-preset fast',
        '-crf 22',
        `-b:v ${config.bitrate}`,
        `-maxrate ${config.bitrate}`,
        `-bufsize ${parseInt(config.bitrate) * 2}k`,
        '-c:a aac',
        `-b:a ${config.audioBitrate}`,
        '-ar 44100',
        `-hls_time ${HLS_SEGMENT_DURATION}`,
        '-hls_list_size 0',
        '-hls_segment_filename', segmentPath,
        '-f hls'
      ])
      .output(outputPath)
      .on('progress', (progress) => {
        if (progress.percent) {
          onProgress(Math.round(progress.percent));
        }
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
};

const generateMasterPlaylist = (outputDir: string, qualities: VideoQuality[]): string => {
  const masterPath = path.join(outputDir, 'master.m3u8');
  
  let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';
  
  for (const quality of qualities) {
    const config = QUALITY_CONFIGS[quality];
    const bandwidth = parseInt(config.bitrate) * 1000;
    
    content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${config.width}x${config.height}\n`;
    content += `${quality}/index.m3u8\n\n`;
  }
  
  fs.writeFileSync(masterPath, content);
  return masterPath;
};

const uploadHLSToCloudinary = async (
  outputDir: string,
  jobId: string,
  qualities: VideoQuality[]
): Promise<string> => {
  const cloudinaryFolder = `videos/hls/${jobId}`;
  const uploadedUrls: { [key: string]: string } = {};

  // Step 1: Upload all files and collect URLs
  for (const quality of qualities) {
    const qualityDir = path.join(outputDir, quality);
    const files = fs.readdirSync(qualityDir);

    for (const file of files) {
      const filePath = path.join(qualityDir, file);
      const publicId = `${cloudinaryFolder}/${quality}/${path.parse(file).name}`;

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw',
        public_id: publicId,
        folder: '',
        overwrite: true
      });

      uploadedUrls[`${quality}/${file}`] = result.secure_url;
    }
  }

  // Step 2: Update each quality playlist with Cloudinary URLs for segments
  for (const quality of qualities) {
    const qualityPlaylistPath = path.join(outputDir, quality, 'index.m3u8');
    let playlistContent = fs.readFileSync(qualityPlaylistPath, 'utf-8');
    
    // Replace all segment references with Cloudinary URLs
    const segmentPattern = /segment_\d+\.ts/g;
    playlistContent = playlistContent.replace(segmentPattern, (match) => {
      const segmentKey = `${quality}/${match}`;
      return uploadedUrls[segmentKey] || match;
    });
    
    // Write updated playlist back to file
    fs.writeFileSync(qualityPlaylistPath, playlistContent);
    
    // Re-upload the updated quality playlist to Cloudinary
    const qualityPublicId = `${cloudinaryFolder}/${quality}/index`;
    const updatedResult = await cloudinary.uploader.upload(qualityPlaylistPath, {
      resource_type: 'raw',
      public_id: qualityPublicId,
      folder: '',
      overwrite: true
    });
    
    uploadedUrls[`${quality}/index.m3u8`] = updatedResult.secure_url;
  }

  // Step 3: Update master playlist with updated quality playlist URLs
  const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
  let masterContent = fs.readFileSync(masterPlaylistPath, 'utf-8');

  for (const quality of qualities) {
    const qualityPlaylistKey = `${quality}/index.m3u8`;
    if (uploadedUrls[qualityPlaylistKey]) {
      masterContent = masterContent.replace(
        `${quality}/index.m3u8`,
        uploadedUrls[qualityPlaylistKey]
      );
    }
  }

  const updatedMasterPath = path.join(outputDir, 'master_updated.m3u8');
  fs.writeFileSync(updatedMasterPath, masterContent);

  // Step 4: Upload final master playlist
  const masterResult = await cloudinary.uploader.upload(updatedMasterPath, {
    resource_type: 'raw',
    public_id: `${cloudinaryFolder}/master`,
    folder: '',
    overwrite: true
  });

  return masterResult.secure_url;
};

const cleanupTempFiles = (inputPath: string, outputDir: string) => {
  try {
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

export const processVideoJob = async (job: Job<VideoProcessingJobData>) => {
  const { jobId, inputPath, outputDir } = job.data;
  
  console.log(`🎬 Starting video processing for job ${jobId}`);

  try {
    await videoJobModel.updateVideoJobStatus(jobId, VideoJobStatus.PROCESSING, 0);
    await job.updateProgress(5);

    const metadata = await getVideoMetadata(inputPath);
    console.log(`📊 Video metadata: ${metadata.width}x${metadata.height}, duration: ${metadata.duration}s`);
    await job.updateProgress(10);

    const qualities = determineQualities(metadata.height);
    console.log(`🎯 Target qualities: ${qualities.join(', ')}`);

    ensureDir(outputDir);

    const progressPerQuality = 70 / qualities.length;
    let currentProgress = 10;

    for (let i = 0; i < qualities.length; i++) {
      const quality = qualities[i];
      console.log(`🔄 Transcoding to ${quality}...`);
      
      await transcodeToHLS(inputPath, outputDir, quality, async (percent) => {
        const totalProgress = Math.round(currentProgress + (percent * progressPerQuality / 100));
        await job.updateProgress(totalProgress);
        await videoJobModel.updateVideoJobProgress(jobId, totalProgress);
      });
      
      currentProgress += progressPerQuality;
      console.log(`✅ ${quality} transcoding complete`);
    }

    await job.updateProgress(85);
    console.log(`📝 Generating master playlist...`);
    generateMasterPlaylist(outputDir, qualities);

    await job.updateProgress(90);
    console.log(`☁️ Uploading to Cloudinary...`);
    const hlsUrl = await uploadHLSToCloudinary(outputDir, jobId, qualities);

    await job.updateProgress(98);
    console.log(`🧹 Cleaning up temp files...`);
    cleanupTempFiles(inputPath, outputDir);

    await videoJobModel.completeVideoJob(jobId, hlsUrl, qualities, metadata.duration);
    await job.updateProgress(100);

    console.log(`🎉 Video processing complete for job ${jobId}`);
    
    return {
      success: true,
      hlsUrl,
      qualities,
      duration: metadata.duration
    };

  } catch (error: any) {
    console.error(`❌ Video processing failed for job ${jobId}:`, error);
    
    await videoJobModel.failVideoJob(jobId, error.message || 'Unknown error');
    
    cleanupTempFiles(inputPath, outputDir);
    
    throw error;
  }
};
