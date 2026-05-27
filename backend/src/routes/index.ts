import { Router } from 'express';
import assignmentsRouter from './assignments';
import papersRouter from './papers';

const router = Router();

router.use('/assignments', assignmentsRouter);
router.use('/papers', papersRouter);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

export default router;
