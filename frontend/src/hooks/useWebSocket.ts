'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '@/store/assignmentStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket || !globalSocket.connected) {
    globalSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return globalSocket;
}

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { updateGeneration, completeGeneration, failGeneration } = useAssignmentStore();

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    socketRef.current = getSocket();
  }, []);

  const joinAssignment = useCallback((assignmentId: string) => {
    if (!socketRef.current) connect();
    socketRef.current?.emit('join:assignment', assignmentId);
  }, [connect]);

  const leaveAssignment = useCallback((assignmentId: string) => {
    socketRef.current?.emit('leave:assignment', assignmentId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('generation:progress', (data: { percentage: number; message: string }) => {
      updateGeneration(data.percentage, data.message);
    });

    socket.on('generation:complete', (data: { paperId: string }) => {
      completeGeneration(data.paperId);
    });

    socket.on('generation:error', (data: { error: string }) => {
      failGeneration(data.error);
    });

    return () => {
      socket.off('generation:progress');
      socket.off('generation:complete');
      socket.off('generation:error');
    };
  }, [updateGeneration, completeGeneration, failGeneration]);

  return { joinAssignment, leaveAssignment, connect };
}
