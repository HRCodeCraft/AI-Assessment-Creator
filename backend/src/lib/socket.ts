import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('join:assignment', (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      console.log(`[Socket] ${socket.id} joined room assignment:${assignmentId}`);
    });

    socket.on('leave:assignment', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitToAssignment(
  assignmentId: string,
  event: string,
  data: Record<string, unknown>
): void {
  if (!io) return;
  io.to(`assignment:${assignmentId}`).emit(event, data);
}
