import { Job } from 'bullmq';
import { Assignment } from '../models/Assignment';
import { QuestionPaper } from '../models/QuestionPaper';
import { generateQuestionPaper } from '../services/aiService';
import { emitToAssignment } from '../lib/socket';
import { GenerationJobData, createGenerationWorker } from '../lib/queue';
import { getRedisClient } from '../lib/redis';

async function processGenerationJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;
  const redis = getRedisClient();

  console.log(`[Worker] Processing generation job for assignment: ${assignmentId}`);

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment not found: ${assignmentId}`);
  }

  await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });

  emitToAssignment(assignmentId, 'generation:progress', {
    assignmentId,
    percentage: 5,
    message: 'Starting AI generation...',
    status: 'processing',
  });

  try {
    const paper = await generateQuestionPaper(
      assignment,
      async (percentage, message) => {
        await job.updateProgress(percentage);

        emitToAssignment(assignmentId, 'generation:progress', {
          assignmentId,
          percentage,
          message,
          status: 'processing',
        });

        // Cache progress in Redis for polling fallback
        await redis.setex(
          `generation:progress:${assignmentId}`,
          300,
          JSON.stringify({ percentage, message, status: 'processing' })
        );
      }
    );

    const questionPaper = await QuestionPaper.create({
      assignmentId: assignment._id,
      metadata: paper.metadata,
      sections: paper.sections,
      generatedAt: new Date(),
    });

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'completed',
      paperId: questionPaper._id,
    });

    await redis.setex(
      `generation:progress:${assignmentId}`,
      600,
      JSON.stringify({ percentage: 100, message: 'Complete', status: 'completed', paperId: questionPaper._id.toString() })
    );

    emitToAssignment(assignmentId, 'generation:complete', {
      assignmentId,
      paperId: questionPaper._id.toString(),
      percentage: 100,
      message: 'Question paper generated successfully!',
    });

    console.log(`[Worker] Successfully generated paper ${questionPaper._id} for assignment ${assignmentId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Generation failed';

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'failed',
      errorMessage,
    });

    await redis.setex(
      `generation:progress:${assignmentId}`,
      300,
      JSON.stringify({ percentage: 0, message: errorMessage, status: 'failed' })
    );

    emitToAssignment(assignmentId, 'generation:error', {
      assignmentId,
      error: errorMessage,
      status: 'failed',
    });

    throw error;
  }
}

export function startGenerationWorker(): void {
  const worker = createGenerationWorker(processGenerationJob);

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[Worker] Worker error:', err.message);
  });

  console.log('[Worker] Generation worker started');
}
