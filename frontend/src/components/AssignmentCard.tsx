'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Trash2, Clock, Calendar, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Assignment } from '@/lib/api';
import { cn, formatDate, statusColor, statusLabel } from '@/lib/utils';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const canView = assignment.status === 'completed' && assignment.paperId;

  function handleView() {
    if (canView) router.push(`/paper/${assignment.paperId}`);
    setMenuOpen(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
      onClick={() => canView && handleView()}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink-900 text-sm leading-snug line-clamp-1 group-hover:text-ink-700 transition-colors">
            {assignment.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <BookOpen size={11} className="text-ink-400 flex-shrink-0" />
            <span className="text-xs text-ink-500 truncate">{assignment.subject} · {assignment.grade}</span>
          </div>
        </div>

        {/* Three-dot menu */}
        <div ref={menuRef} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-7 h-7 rounded-lg hover:bg-ink-100 flex items-center justify-center transition-colors"
          >
            <MoreVertical size={15} className="text-ink-500" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-lg border border-ink-100 py-1 z-10"
              >
                <button
                  onClick={handleView}
                  disabled={!canView}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium transition-colors',
                    canView
                      ? 'text-ink-700 hover:bg-ink-50 cursor-pointer'
                      : 'text-ink-300 cursor-not-allowed'
                  )}
                >
                  <Eye size={13} />
                  View Assignment
                </button>
                <button
                  onClick={() => { onDelete(assignment._id); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status badge */}
      <div className="mb-3">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', statusColor(assignment.status))}>
          {assignment.status === 'processing' && (
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
          )}
          {statusLabel(assignment.status)}
        </span>
      </div>

      {/* Dates */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-ink-400" />
          <span className="text-xs text-ink-500">
            <span className="font-medium">Assigned on :</span> {formatDate(assignment.createdAt)}
          </span>
        </div>
        {assignment.dueDate && (
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-ink-400" />
            <span className="text-xs text-ink-500">
              <span className="font-medium">Due :</span>{' '}
              <span className="text-brand-600 font-semibold">{formatDate(assignment.dueDate)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between">
        <span className="text-xs text-ink-400">{assignment.totalQuestions} questions · {assignment.totalMarks} marks</span>
        {canView && (
          <span className="text-xs font-medium text-brand-600 hover:text-brand-700">View →</span>
        )}
      </div>
    </motion.div>
  );
}
