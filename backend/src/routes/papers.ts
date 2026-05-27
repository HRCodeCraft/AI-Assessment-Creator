import { Router, Request, Response } from 'express';
import { QuestionPaper } from '../models/QuestionPaper';
import { Assignment } from '../models/Assignment';

const router = Router();

// GET /api/papers/:id - Get question paper
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id).lean();
    if (!paper) {
      return res.status(404).json({ success: false, error: 'Paper not found' });
    }
    res.json({ success: true, data: paper });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch paper' });
  }
});

// GET /api/papers/by-assignment/:assignmentId
router.get('/by-assignment/:assignmentId', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId).select('paperId status').lean();
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    if (!assignment.paperId) {
      return res.json({ success: true, data: null, status: assignment.status });
    }

    const paper = await QuestionPaper.findById(assignment.paperId).lean();
    res.json({ success: true, data: paper, status: assignment.status });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch paper' });
  }
});

export default router;
