'use client';

import { AssignmentFormData } from '@/lib/api';
import { BookOpen, Clock, Calendar, FileText, BarChart3, Paperclip } from 'lucide-react';
import { formatDate, formatDuration } from '@/lib/utils';

interface Props {
  form: AssignmentFormData;
  file?: File;
  totalMarks: number;
  totalQuestions: number;
}

export default function StepReview({ form, file, totalMarks, totalQuestions }: Props) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink-900">Review & Generate</h2>
        <p className="text-sm text-ink-500 mt-0.5">Confirm your settings before generating the paper</p>
      </div>

      <div className="space-y-4">
        {/* Basic info */}
        <div className="bg-ink-50 rounded-xl p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-3">Assignment Info</h3>
          <InfoRow icon={<FileText size={14} />} label="Title" value={form.title} />
          <InfoRow icon={<BookOpen size={14} />} label="Subject" value={`${form.subject} · ${form.grade}`} />
          <InfoRow icon={<BookOpen size={14} />} label="Topic" value={form.topic} />
          <InfoRow icon={<Clock size={14} />} label="Time Limit" value={formatDuration(form.timeLimit)} />
          {form.dueDate && (
            <InfoRow icon={<Calendar size={14} />} label="Due Date" value={formatDate(form.dueDate)} />
          )}
          {file && (
            <InfoRow icon={<Paperclip size={14} />} label="File" value={file.name} />
          )}
        </div>

        {/* Question types */}
        <div className="bg-ink-50 rounded-xl p-4">
          <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-3">Questions</h3>
          <div className="space-y-2">
            {form.questionTypes.map((qt, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{qt.label}</span>
                <span className="text-ink-500 font-medium">
                  {qt.count} × {qt.marksEach} = <span className="text-ink-800 font-bold">{qt.count * qt.marksEach} marks</span>
                </span>
              </div>
            ))}
            <div className="border-t border-ink-200 mt-2 pt-2 flex justify-between font-bold text-sm">
              <span className="text-ink-700">Total</span>
              <span className="text-ink-900">{totalQuestions} questions · {totalMarks} marks</span>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-ink-50 rounded-xl p-4">
          <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-3">
            <BarChart3 size={12} className="inline mr-1" />Difficulty
          </h3>
          <div className="flex gap-3">
            <DiffBadge label="Easy" value={form.difficultyDistribution.easy} color="bg-emerald-500" />
            <DiffBadge label="Medium" value={form.difficultyDistribution.medium} color="bg-amber-500" />
            <DiffBadge label="Hard" value={form.difficultyDistribution.hard} color="bg-red-500" />
          </div>
        </div>

        <div className="rounded-xl bg-ink-900 text-white p-4 text-sm">
          <p className="font-semibold mb-1">✦ Ready to generate</p>
          <p className="text-ink-300 text-xs">
            VedaAI will create a structured exam paper with {totalQuestions} questions across {form.questionTypes.length} section{form.questionTypes.length > 1 ? 's' : ''} for {form.subject} – {form.topic}.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-ink-400 mt-0.5">{icon}</span>
      <span className="text-xs text-ink-500 w-20 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-ink-800 flex-1">{value}</span>
    </div>
  );
}

function DiffBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-ink-100">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-ink-600">{label}</span>
      <span className="text-sm font-bold text-ink-800">{value}%</span>
    </div>
  );
}
