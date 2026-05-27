'use client';

import { useRef } from 'react';
import { Plus, X, Upload, Calendar, Mic } from 'lucide-react';
import { AssignmentFormData, QuestionTypeRow } from '@/lib/api';

const QUESTION_TYPE_OPTIONS: { label: string; type: string }[] = [
  { label: 'Multiple Choice Questions', type: 'mcq' },
  { label: 'Short Answer Questions', type: 'short' },
  { label: 'Long Answer Questions', type: 'long' },
  { label: 'True / False Questions', type: 'true-false' },
  { label: 'Diagram / Graph-Based Questions', type: 'diagram' },
  { label: 'Numerical Problems', type: 'numerical' },
  { label: 'Essay Questions', type: 'essay' },
  { label: 'Fill in the Blanks', type: 'fill-blank' },
];

interface Props {
  form: AssignmentFormData;
  errors: Record<string, string>;
  file?: File;
  onChange: (patch: Partial<AssignmentFormData>) => void;
  onFileChange: (file: File | undefined) => void;
  totalMarks: number;
  totalQuestions: number;
}

export default function StepQuestions({
  form, errors, file, onChange, onFileChange, totalMarks, totalQuestions,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateRow(index: number, patch: Partial<QuestionTypeRow>) {
    const updated = form.questionTypes.map((qt, i) =>
      i === index ? { ...qt, ...patch } : qt
    );
    onChange({ questionTypes: updated });
  }

  function removeRow(index: number) {
    onChange({ questionTypes: form.questionTypes.filter((_, i) => i !== index) });
  }

  function addRow() {
    const used = new Set(form.questionTypes.map((qt) => qt.type));
    const next = QUESTION_TYPE_OPTIONS.find((o) => !used.has(o.type));
    if (!next) return;
    onChange({
      questionTypes: [
        ...form.questionTypes,
        { label: next.label, type: next.type, count: 5, marksEach: 2 },
      ],
    });
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onFileChange(f);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink-900">Assignment Details</h2>
        <p className="text-sm text-ink-500 mt-0.5">Basic information about your assignment</p>
      </div>

      <div className="space-y-5">
        {/* File Upload */}
        <div>
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-ink-200 rounded-xl p-8 text-center cursor-pointer
              hover:border-ink-400 hover:bg-ink-50 transition-all duration-150 group"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-ink-100 group-hover:bg-ink-200 flex items-center justify-center transition-colors">
                <Upload size={20} className="text-ink-500" />
              </div>
              {file ? (
                <>
                  <p className="text-sm font-semibold text-ink-700">{file.name}</p>
                  <p className="text-xs text-ink-400">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-ink-700">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-xs text-ink-400">PDF, PNG, jpg, and more</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-ink-200 rounded-lg
                text-xs font-semibold text-ink-700 hover:bg-ink-50 transition-colors shadow-sm"
            >
              Browse Files
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-1.5 text-center">
            Upload images of your preferred document/image
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.png,.jpg,.jpeg"
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Due Date</label>
          <div className="relative">
            <input
              type="date"
              value={form.dueDate || ''}
              onChange={(e) => onChange({ dueDate: e.target.value })}
              className="input-field pr-10"
            />
            <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          </div>
        </div>

        {/* Question Types Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-ink-700">Question Type</label>
            <div className="grid grid-cols-2 gap-8 pr-8">
              <span className="text-sm font-semibold text-ink-700">No. of Questions</span>
              <span className="text-sm font-semibold text-ink-700">Marks</span>
            </div>
          </div>

          <div className="space-y-2">
            {form.questionTypes.map((qt, i) => (
              <div key={i} className="flex items-center gap-3">
                {/* Type dropdown */}
                <div className="flex-1 relative">
                  <select
                    value={qt.type}
                    onChange={(e) => {
                      const opt = QUESTION_TYPE_OPTIONS.find((o) => o.type === e.target.value);
                      if (opt) updateRow(i, { type: opt.type, label: opt.label });
                    }}
                    className="input-field appearance-none pr-7 text-sm py-2.5"
                  >
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                      bg-ink-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
                  >
                    <X size={11} />
                  </button>
                </div>

                {/* Count */}
                <div className="flex items-center gap-1 w-28">
                  <button
                    type="button"
                    onClick={() => updateRow(i, { count: Math.max(1, qt.count - 1) })}
                    className="w-7 h-7 rounded-lg bg-ink-100 hover:bg-ink-200 flex items-center justify-center text-ink-600 font-bold transition-colors"
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    value={qt.count}
                    onChange={(e) => updateRow(i, { count: Math.max(1, Number(e.target.value)) })}
                    className="w-10 text-center text-sm font-semibold text-ink-800 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateRow(i, { count: qt.count + 1 })}
                    className="w-7 h-7 rounded-lg bg-ink-100 hover:bg-ink-200 flex items-center justify-center text-ink-600 font-bold transition-colors"
                  >+</button>
                </div>

                {/* Marks */}
                <div className="flex items-center gap-1 w-28">
                  <button
                    type="button"
                    onClick={() => updateRow(i, { marksEach: Math.max(1, qt.marksEach - 1) })}
                    className="w-7 h-7 rounded-lg bg-ink-100 hover:bg-ink-200 flex items-center justify-center text-ink-600 font-bold transition-colors"
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    value={qt.marksEach}
                    onChange={(e) => updateRow(i, { marksEach: Math.max(1, Number(e.target.value)) })}
                    className="w-10 text-center text-sm font-semibold text-ink-800 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateRow(i, { marksEach: qt.marksEach + 1 })}
                    className="w-7 h-7 rounded-lg bg-ink-100 hover:bg-ink-200 flex items-center justify-center text-ink-600 font-bold transition-colors"
                  >+</button>
                </div>
              </div>
            ))}
          </div>

          {errors.questionTypes && (
            <p className="text-xs text-red-500 mt-2">{errors.questionTypes}</p>
          )}

          <button
            type="button"
            onClick={addRow}
            disabled={form.questionTypes.length >= QUESTION_TYPE_OPTIONS.length}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600
              hover:text-brand-700 disabled:text-ink-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={14} />
            Add Question Type
          </button>

          {/* Totals */}
          <div className="mt-3 pt-3 border-t border-ink-100 flex justify-end gap-6 text-sm">
            <span className="text-ink-500">
              Total Questions : <span className="font-bold text-ink-800">{totalQuestions}</span>
            </span>
            <span className="text-ink-500">
              Total Marks : <span className="font-bold text-ink-800">{totalMarks}</span>
            </span>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">
            Additional Information{' '}
            <span className="font-normal text-ink-400">(For better output)</span>
          </label>
          <div className="relative">
            <textarea
              value={form.additionalInstructions || ''}
              onChange={(e) => onChange({ additionalInstructions: e.target.value })}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              rows={3}
              className="input-field resize-none pr-10"
            />
            <Mic size={15} className="absolute right-3.5 bottom-3 text-ink-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
