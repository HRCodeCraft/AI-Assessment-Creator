'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';
import { papersApi, QuestionPaper } from '@/lib/api';
import QuestionPaperView from '@/components/QuestionPaper';
import AppShell from '@/components/layout/AppShell';
import { useSettingsStore } from '@/store/settingsStore';

export default function PaperPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { settings } = useSettingsStore();
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    papersApi
      .get(id)
      .then((res) => setPaper(res.data.data))
      .catch(() => setError('Failed to load question paper.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownload() {
    if (!paperRef.current || !paper) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(paperRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 0;
      while (y < pdfHeight) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -y, pdfWidth, pdfHeight);
        y += pageHeight;
      }
      pdf.save(`${paper.metadata.subject}-${paper.metadata.grade}-paper.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  }

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

  const teacherName = settings.teacherName || 'Teacher';

  return (
    <AppShell breadcrumbs={[{ label: 'Create New', href: '/create' }]}>
      <div className="max-w-4xl mx-auto space-y-4">

        {/* AI greeting banner — Download button lives here */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ink-900 rounded-2xl px-6 py-5"
        >
          <p className="text-sm text-white leading-relaxed mb-4">
            <span className="font-bold">Certainly, {teacherName}!</span> Here are your customized Question Paper for{' '}
            <span className="font-semibold text-brand-300">{paper.metadata.grade}</span>{' '}
            <span className="font-semibold text-brand-300">{paper.metadata.subject}</span>{' '}
            classes on the{' '}
            <span className="font-semibold text-brand-200">{paper.metadata.topic}</span> chapters:
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white text-ink-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-ink-100 transition-colors"
            >
              <Download size={15} />
              Download as PDF
            </button>
            <button
              onClick={() => router.push('/create')}
              className="flex items-center gap-2 border border-white/20 text-white/80 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>
        </motion.div>

        {/* Question Paper (no action bar inside) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuestionPaperView paper={paper} paperRef={paperRef} />
        </motion.div>

      </div>
    </AppShell>
  );
}
