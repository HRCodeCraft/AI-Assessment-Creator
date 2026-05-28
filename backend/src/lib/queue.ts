import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config';

// BullMQ bundles its own ioredis — pass a plain URL, not a shared Redis instance
function redisConnection() {
  const url = new URL(config.redisUrl);
  const tls = config.redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined;
  return {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: parseInt(url.pathname?.slice(1) || '0', 10) || 0,
    maxRetriesPerRequest: null as null,
    tls,
  };
}

export const generationQueue = new Queue('question-generation', {
  connection: redisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export interface GenerationJobData {
  assignmentId: string;
}

export function createGenerationWorker(
  processor: (job: Job<GenerationJobData>) => Promise<void>
): Worker<GenerationJobData> {
  return new Worker<GenerationJobData>(
    'question-generation',
    processor,
    { connection: redisConnection(), concurrency: 3 }
  );
}
