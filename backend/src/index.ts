import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { connectRedis } from './lib/redis';
import { initializeSocket } from './lib/socket';
import { startGenerationWorker } from './workers/generationWorker';
import apiRouter from './routes';
import { Assignment } from './models/Assignment';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', apiRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

async function bootstrap(): Promise<void> {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('[MongoDB] Connected to', config.mongoUri);

    // Clean up stuck jobs from previous server run
    const stuck = await Assignment.updateMany(
      { status: 'processing' },
      { status: 'failed', errorMessage: 'Server restarted during generation. Please try again.' }
    );
    if (stuck.modifiedCount > 0) {
      console.log(`[Server] Marked ${stuck.modifiedCount} stuck assignment(s) as failed`);
    }

    // Connect to Redis
    await connectRedis();

    // Initialize Socket.io
    initializeSocket(httpServer);
    console.log('[Socket.io] Initialized');

    // Start BullMQ worker
    startGenerationWorker();

    // Start HTTP server
    httpServer.listen(config.port, () => {
      console.log(`[Server] Running on http://localhost:${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
