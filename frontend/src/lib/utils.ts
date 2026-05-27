import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function calcTotalMarks(qc: {
  mcq: { count: number; marksEach: number };
  shortAnswer: { count: number; marksEach: number };
  longAnswer: { count: number; marksEach: number };
  trueFalse: { count: number; marksEach: number };
}): number {
  return (
    qc.mcq.count * qc.mcq.marksEach +
    qc.shortAnswer.count * qc.shortAnswer.marksEach +
    qc.longAnswer.count * qc.longAnswer.marksEach +
    qc.trueFalse.count * qc.trueFalse.marksEach
  );
}

export function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'processing': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'failed': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-ink-500 bg-ink-50 border-ink-200';
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'Completed';
    case 'processing': return 'Generating...';
    case 'pending': return 'Pending';
    case 'failed': return 'Failed';
    default: return status;
  }
}
