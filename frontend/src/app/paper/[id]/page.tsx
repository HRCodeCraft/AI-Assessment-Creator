'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { papersApi, QuestionPaper } from '@/lib/api';
import QuestionPaperView from '@/components/QuestionPaper';
import AppShell from '@/components/layout/AppShell';

export default function PaperPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    papersApi
      .get(id)
      .then((res) => setPaper(res.data.data))
      .catch(() => setError('Failed to load question paper.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell breadcrumbs={[{ label: 'Create New', href: '/create' }]}>
        <div className="flex items-center justify-center h-60">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
            <p className="text-sm text-ink-500">Loading paper...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !paper) {
    return (
      <AppShell breadcrumbs={[{ label: 'Create New', href: '/create' }]}>
        <div className="flex flex-col items-center justify-center h-60 gap-4">
          <p className="text-red-500 text-sm">{error || 'Paper not found.'}</p>
          <button onClick={() => router.push('/')} className="btn-secondary">Go to Dashboard</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumbs={[{ label: 'Create New', href: '/create' }]}>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* AI greeting banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ink-900 rounded-2xl px-6 py-4 flex items-start justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={16} className="text-white" />
            </div>
            <p className="text-sm text-white leading-relaxed">
              <span className="font-semibold">Certainly!</span> Here is your customized Question Paper for{' '}
              <span className="text-brand-400 font-semibold">{paper.metadata.grade}</span>{' '}
              <span className="text-brand-400 font-semibold">{paper.metadata.subject}</span>{' '}
              on the topic{' '}
              <span className="text-brand-300 font-semibold">{paper.metadata.topic}</span>:
            </p>
          </div>
        </motion.div>

        {/* Question Paper */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuestionPaperView
            paper={paper}
            onRegenerate={() => router.push('/create')}
          />
        </motion.div>
      </div>
    </AppShell>
  );
}
