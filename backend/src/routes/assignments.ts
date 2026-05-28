import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import { Assignment } from '../models/Assignment';
import { generationQueue } from '../lib/queue';
import { getRedisClient } from '../lib/redis';

async function extractFileText(file: Express.Multer.File): Promise<string> {
  try {
    const mime = file.mimetype;
    if (mime === 'application/pdf') {
      const parsed = await pdfParse(file.buffer);
      return (parsed.text || '').replace(/\s+/g, ' ').trim().slice(0, 3000);
    }
    if (mime.startsWith('image/')) {
      return ''; // Images can't be parsed for text
    }
    return file.buffer.toString('utf-8').slice(0, 3000);
  } catch (err) {
    console.warn('[Upload] File text extraction failed, continuing without it:', (err as Error).message);
    return '';
  }
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const QuestionTypeRowSchema = z.object({
  label: z.string().min(1),
  type: z.string().min(1),
  count: z.number().int().min(1),
  marksEach: z.number().min(0.5),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(100),
  grade: z.string().min(1).max(50),
  topic: z.string().min(1).max(200),
  dueDate: z.string().optional(),
  timeLimit: z.number().int().min(10).max(300),
  additionalInstructions: z.string().max(1000).optional(),
  questionTypes: z.array(QuestionTypeRowSchema).min(1),
  difficultyDistribution: z.object({
    easy: z.number().min(0).max(100),
    medium: z.number().min(0).max(100),
    hard: z.number().min(0).max(100),
  }),
});

// GET /api/assignments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-fileContent')
      .lean();
    res.json({ success: true, data: assignments });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).select('-fileContent').lean();
    if (!assignment) return res.status(404).json({ success: false, error: 'Assignment not found' });
    res.json({ success: true, data: assignment });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
  }
});

// POST /api/assignments
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let body: unknown;
    try {
      body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    } catch {
      body = req.body;
    }

    const validated = CreateAssignmentSchema.parse(body);

    const diffSum =
      validated.difficultyDistribution.easy +
      validated.difficultyDistribution.medium +
      validated.difficultyDistribution.hard;
    if (Math.abs(diffSum - 100) > 1) {
      return res.status(400).json({ success: false, error: 'Difficulty distribution must sum to 100%' });
    }

    const totalMarks = validated.questionTypes.reduce(
      (sum, qt) => sum + qt.count * qt.marksEach,
      0
    );
    const totalQuestions = validated.questionTypes.reduce((sum, qt) => sum + qt.count, 0);

    let fileContent: string | undefined;
    if (req.file) {
      fileContent = await extractFileText(req.file);
    }

    const assignment = await Assignment.create({
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      totalMarks,
      totalQuestions,
      fileContent,
      status: 'pending',
    });

    const job = await generationQueue.add('generate', {
      assignmentId: assignment._id.toString(),
    });

    await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

    res.status(201).json({
      success: true,
      data: {
        assignmentId: assignment._id.toString(),
        jobId: job.id,
        totalMarks,
        totalQuestions,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    }
    console.error('[Assignments] Create error:', err);
    res.status(500).json({ success: false, error: 'Failed to create assignment' });
  }
});

// GET /api/assignments/:id/progress
router.get('/:id/progress', async (req: Request, res: Response) => {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(`generation:progress:${req.params.id}`);
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    const assignment = await Assignment.findById(req.params.id).select('status paperId').lean();
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' });

    res.json({
      success: true,
      data: {
        status: assignment.status,
        paperId: assignment.paperId?.toString(),
        percentage: assignment.status === 'completed' ? 100 : 0,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to get progress' });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete' });
  }
});

export default router;
