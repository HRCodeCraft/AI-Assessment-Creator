'use client';

import { AssignmentFormData } from '@/lib/api';
import { BookOpen, GraduationCap, Layers, Clock, FileText } from 'lucide-react';

interface Props {
  form: AssignmentFormData;
  errors: Record<string, string>;
  onChange: (patch: Partial<AssignmentFormData>) => void;
}

const GRADE_OPTIONS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'Undergraduate', 'Postgraduate',
];

const TIME_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '2.5 hours', value: 150 },
  { label: '3 hours', value: 180 },
];

export default function StepBasicInfo({ form, errors, onChange }: Props) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink-900">Basic Info</h2>
        <p className="text-sm text-ink-500 mt-0.5">Tell us about your assignment</p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">
            Assignment Title *
          </label>
          <div className="relative">
            <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              type="text"
              value={form.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. Chapter 5 – Electric Circuits Quiz"
              className={`input-field pl-9 ${errors.title ? 'error' : ''}`}
            />
          </div>
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Subject + Grade row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">
              Subject *
            </label>
            <div className="relative">
              <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <input
                type="text"
                value={form.subject}
                onChange={(e) => onChange({ subject: e.target.value })}
                placeholder="e.g. Science, Mathematics"
                className={`input-field pl-9 ${errors.subject ? 'error' : ''}`}
              />
            </div>
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">
              Grade / Class *
            </label>
            <div className="relative">
              <GraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <select
                value={form.grade}
                onChange={(e) => onChange({ grade: e.target.value })}
                className={`input-field pl-9 appearance-none ${errors.grade ? 'error' : ''}`}
              >
                <option value="">Select grade</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            {errors.grade && <p className="text-xs text-red-500 mt-1">{errors.grade}</p>}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">
            Topic / Chapter *
          </label>
          <div className="relative">
            <Layers size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              type="text"
              value={form.topic}
              onChange={(e) => onChange({ topic: e.target.value })}
              placeholder="e.g. Electric Circuits, Photosynthesis, Linear Equations"
              className={`input-field pl-9 ${errors.topic ? 'error' : ''}`}
            />
          </div>
          {errors.topic && <p className="text-xs text-red-500 mt-1">{errors.topic}</p>}
        </div>

        {/* Time Limit */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">
            Time Limit *
          </label>
          <div className="relative">
            <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <select
              value={form.timeLimit}
              onChange={(e) => onChange({ timeLimit: Number(e.target.value) })}
              className={`input-field pl-9 appearance-none ${errors.timeLimit ? 'error' : ''}`}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {errors.timeLimit && <p className="text-xs text-red-500 mt-1">{errors.timeLimit}</p>}
        </div>
      </div>
    </div>
  );
}
