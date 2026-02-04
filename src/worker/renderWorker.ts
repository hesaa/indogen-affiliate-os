// src/worker/renderWorker.ts
import { Redis } from 'ioredis';
import { execa } from 'execa';
import { drizzle } from '@src/lib/db';
import { redisClient } from '@src/lib/redis/client';
import { logger } from '@src/lib/utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Worker configuration
const REDIS_QUEUE = 'render_jobs';
const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';
const MAX_RETRIES = 3;

interface RenderJob {
  id: string;
  userId: string;
  inputUrl: string;
  outputFormat: string;
  effects: string[];
  status: string;
  progress: number;
  retries: number;
}

async function processJob(job: RenderJob): Promise<void> {
  const jobId = job.id;
  const inputUrl = job.inputUrl;
  const outputFormat = job.outputFormat;
  const effects = job.effects;

  try {
    // Update job status to processing
    await drizzle.update('render_jobs', { id: jobId }, {
      status: 'processing',
      progress: 0,
    });

    // Build FFmpeg command
    const outputPath = `/tmp/output_${jobId}.${outputFormat}`;
    let ffmpegArgs = [
      '-i', inputUrl,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputPath,
    ];

    // Add effects
    effects.forEach(effect => {
      switch (effect) {
        case 'watermark':
          ffmpegArgs.unshift('-i', '/app/watermark.png');
          ffmpegArgs.push('-filter_complex', '[0:v][1:v]overlay=main_w-overlay_w-10:main_h-overlay_h-10[v]');
          ffmpegArgs.push('-map', '[v]');
          ffmpegArgs.push('-map', '0:a');
          break;
        case 'blur':
          ffmpegArgs.push('-filter:v', 'blur=5');
          break;
        case 'speed':
          ffmpegArgs.push('-filter:v', 'setpts=0.5*PTS');
          break;
      }
    });

    // Execute FFmpeg with progress tracking
    const ffmpegProcess = execa(FFMPEG_PATH, ffmpegArgs, {
      stdio: 'pipe',
      env: {
        ...process.env,
        // Set FFmpeg to output progress information
        FFREPORT: `file=/tmp/ffmpeg_${jobId}.log`,
      },
    });

    ffmpegProcess.stderr?.on('data', (data) => {
      const output = data.toString();
      const progressMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
      if (progressMatch) {
        const hours = parseInt(progressMatch[1]);
        const minutes = parseInt(progressMatch[2]);
        const seconds = parseInt(progressMatch[3]);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const progress = Math.floor((totalSeconds / 10) * 100); // Simplified progress calculation
        drizzle.update('render_jobs', { id: jobId }, { progress });
      }
    });

    await ffmpegProcess;
    logger.info(`FFmpeg completed for job ${jobId}`);

    // Upload to cloud storage (placeholder)
    const outputUrl = await uploadToCloud(outputPath);

    // Update job status to completed
    await drizzle.update('render_jobs', { id: jobId }, {
      status: 'completed',
      progress: 100,
      outputUrl,
    });

    logger.info(`Job ${jobId} completed successfully`);
  } catch (error) {
    logger.error(`Error processing job ${jobId}:`, error);

    // Retry logic
    if (job.retries < MAX_RETRIES) {
      await drizzle.update('render_jobs', { id: jobId }, {
        status: 'queued',
        progress: 0,
        retries: job.retries + 1,
      });
      await redisClient.rpush(REDIS_QUEUE, JSON.stringify({
        ...job,
        retries: job.retries + 1,
      }));
    } else {
      await drizzle.update('render_jobs', { id: jobId }, {
        status: 'failed',
        progress: 0,
      });
    }
  }
}

async function uploadToCloud(filePath: string): Promise<string> {
  // Placeholder for cloud storage upload logic
  // This should be implemented with your preferred cloud storage provider
  return `https://cdn.example.com/output_${Date.now()}.mp4`;
}

async function main() {
  logger.info('Render worker started');

  // Subscribe to Redis queue
  const subscriber = redisClient.duplicate();
  subscriber.subscribe(REDIS_QUEUE);

  subscriber.on('message', async (channel, message) => {
    if (channel === REDIS_QUEUE) {
      try {
        const job: RenderJob = JSON.parse(message);
        await processJob(job);
      } catch (error) {
        logger.error('Error processing message:', error);
      }
    }
  });

  // Also process existing jobs in queue
  const queueLength = await redisClient.llen(REDIS_QUEUE);
  logger.info(`Processing ${queueLength} jobs in queue`);

  for (let i = 0; i < queueLength; i++) {
    const message = await redisClient.lpop(REDIS_QUEUE);
    if (message) {
      const job: RenderJob = JSON.parse(message);
      await processJob(job);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down render worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down render worker...');
  process.exit(0);
});

// Start the worker
main().catch((error) => {
  logger.error('Fatal error in render worker:', error);
  process.exit(1);
});