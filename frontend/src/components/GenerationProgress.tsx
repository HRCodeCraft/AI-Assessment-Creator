'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  isOpen: boolean;
  percentage: number;
  message: string;
  error?: string | null;
  onDismissError?: () => void;
}

const steps = [
  { min: 0,  max: 15,  label: 'Analyzing requirements...' },
  { min: 15, max: 40,  label: 'Structuring exam format...' },
  { min: 40, max: 80,  label: 'Generating questions...' },
  { min: 80, max: 95,  label: 'Validating & organizing...' },
  { min: 95, max: 100, label: 'Finalizing paper...' },
];

export default function GenerationProgress({
  isOpen,
  percentage,
  message,
  error,
  onDismissError,
}: GenerationProgressProps) {
  const isComplete = percentage === 100 && !error;
  const isError = !!error;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 text-center"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              {isError ? (
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
              ) : isComplete ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"
                >
                  <CheckCircle size={32} className="text-emerald-500" />
                </motion.div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                  >
                    <div className="w-full h-full rounded-full border-2 border-transparent border-t-ink-900" />
                  </motion.div>
                  <Sparkles size={24} className="text-ink-700" />
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-ink-900 mb-2">
              {isError ? 'Generation Failed' : isComplete ? 'Paper Ready!' : 'Generating Question Paper'}
            </h2>

            {/* Message */}
            <p className="text-sm text-ink-500 mb-6 min-h-[20px]">
              {isError ? error : message}
            </p>

            {/* Progress Bar */}
            {!isError && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-ink-500 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold text-ink-700">{percentage}%</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-ink-800 to-ink-600 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Steps */}
            {!isError && !isComplete && (
              <div className="space-y-2 text-left">
                {steps.map((step, i) => {
                  const isActive = percentage >= step.min && percentage < step.max;
                  const isDone = percentage >= step.max;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isDone ? 'bg-emerald-500' : isActive ? 'bg-ink-900' : 'bg-ink-100'
                      }`}>
                        {isDone ? (
                          <CheckCircle size={12} className="text-white" />
                        ) : isActive ? (
                          <Loader2 size={10} className="text-white animate-spin" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-ink-300" />
                        )}
                      </div>
                      <span className={`text-xs transition-all ${
                        isDone ? 'text-emerald-600 font-medium' : isActive ? 'text-ink-800 font-semibold' : 'text-ink-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error dismiss */}
            {isError && onDismissError && (
              <button onClick={onDismissError} className="btn-primary w-full justify-center">
                Try Again
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
