'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, KeyRound, FileText } from 'lucide-react';
import { papersApi, QuestionPaper } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';

export default function AnswerKeysPage() {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    papersApi
      .list()
      .then((res) => setPapers(res.data.data))
      .catch(() => setPapers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = papers.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.metadata.subject.toLowerCase().includes(q) ||
      p.metadata.topic.toLowerCase().includes(q) ||
      p.metadata.grade.toLowerCase().includes(q);
    const matchGrade = !gradeFilter || p.metadata.grade.toLowerCase().includes(gradeFilter.toLowerCase());
    return matchSearch && matchGrade;
  });

  const grades = Array.from(new Set(papers.map((p) => p.metadata.grade))).sort();

  return (
    <AppShell breadcrumbs={[{ label: 'Answer Keys' }]}>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-ink-900">Answer Keys</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Search and view answer keys for generated question papers.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search by subject, topic, class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-ink-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-ink-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 text-ink-700"
          >
            <option value="">All Classes</option>
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
              <p className="text-sm text-ink-500">Loading answer keys...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-ink-100 flex items-center justify-center">
              <KeyRound size={20} className="text-ink-400" />
            </div>
            <p className="text-sm font-medium text-ink-700">
              {papers.length === 0 ? 'No papers generated yet' : 'No results found'}
            </p>
            <p className="text-xs text-ink-400">
              {papers.length === 0
                ? 'Generate a question paper first to see its answer key here.'
                : 'Try a different search term or class filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((paper) => (
              <PaperAnswerKey
                key={paper._id}
                paper={paper}
                expanded={expandedId === paper._id}
                onToggle={() => setExpandedId(expandedId === paper._id ? null : paper._id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function PaperAnswerKey({
  paper,
  expanded,
  onToggle,
}: {
  paper: QuestionPaper;
  expanded: boolean;
  onToggle: () => void;
}) {
  const allQuestions = paper.sections.flatMap((s) =>
    s.questions.map((q) => ({ ...q, sectionTitle: s.title }))
  );
  const hasAnswers = allQuestions.some((q) => q.correctAnswer);
  const date = new Date(paper.generatedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-ink-50 transition-colors text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{paper.metadata.subject}</p>
            <p className="text-xs text-ink-500 mt-0.5">
              {paper.metadata.grade} · {paper.metadata.topic}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-ink-400">{date}</p>
            <p className="text-xs text-ink-500 mt-0.5">{paper.metadata.totalMarks} marks</p>
          </div>
          {hasAnswers ? (
            expanded ? (
              <ChevronUp size={16} className="text-ink-400" />
            ) : (
              <ChevronDown size={16} className="text-ink-400" />
            )
          ) : (
            <span className="text-xs text-ink-400 italic">No key available</span>
          )}
        </div>
      </button>

      {/* Answer key body */}
      <AnimatePresence>
        {expanded && hasAnswers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-ink-100">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-3">Answer Key</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                {allQuestions.map((q) => (
                  <div key={q.number} className="flex items-start gap-2.5 text-sm">
                    <span className="font-semibold text-ink-600 flex-shrink-0 w-7">Q{q.number}.</span>
                    <span className="text-ink-800">{q.correctAnswer || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
