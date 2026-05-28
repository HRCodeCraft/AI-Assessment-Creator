'use client';

import { useRef } from 'react';
import { Plus, X, Upload, Calendar, Mic, CheckCircle2, FileText, ChevronDown } from 'lucide-react';
import { AssignmentFormData, QuestionTypeRow } from '@/lib/api';

const QUESTION_TYPE_OPTIONS: { label: string; type: string }[] = [
  { label: 'Multiple Choice Questions', type: 'mcq' },
  { label: 'Short Questions', type: 'short' },
  { label: 'Long Answer Questions', type: 'long' },
  { label: 'True / False Questions', type: 'true-false' },
  { label: 'Diagram/Graph-Based Questions', type: 'diagram' },
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

function Stepper({
  value,
  onDec,
  onInc,
  onChange,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center bg-[#f0f0f0] rounded-full px-1 py-1 gap-1 w-[110px]">
      <button
        type="button"
        onClick={onDec}
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-ink-700 text-lg font-medium hover:bg-ink-100 transition-colors flex-shrink-0"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className="flex-1 text-center text-sm font-semibold text-ink-800 bg-transparent outline-none w-0"
      />
      <button
        type="button"
        onClick={onInc}
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-ink-700 text-lg font-medium hover:bg-ink-100 transition-colors flex-shrink-0"
      >
        +
      </button>
    </div>
  );
}

export default function StepQuestions({
  form, errors, file, onChange, onFileChange, totalMarks, totalQuestions,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateRow(index: number, patch: Partial<QuestionTypeRow>) {
    onChange({ questionTypes: form.questionTypes.map((qt, i) => i === index ? { ...qt, ...patch } : qt) });
  }

  function removeRow(index: number) {
    onChange({ questionTypes: form.questionTypes.filter((_, i) => i !== index) });
  }

  function addRow() {
    const used = new Set(form.questionTypes.map((qt) => qt.type));
    const next = QUESTION_TYPE_OPTIONS.find((o) => !used.has(o.type));
    if (!next) return;
    onChange({
      questionTypes: [...form.questionTypes, { label: next.label, type: next.type, count: 5, marksEach: 1 }],
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
        <p className="text-sm text-ink-500 mt-0.5">Configure question types and marks for your paper</p>
      </div>

      <div className="space-y-5">
        {/* File Upload */}
        <div>
          {file ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-800 truncate">{file.name}</p>
                <p className="text-xs text-ink-500">{file.size >= 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(1) + ' KB'} · Uploaded successfully</p>
              </div>
              <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
              <button
                type="button"
                onClick={() => onFileChange(undefined)}
                className="w-6 h-6 rounded-full bg-ink-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-ink-200 rounded-xl p-7 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-ink-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                  <Upload size={20} className="text-ink-500 group-hover:text-brand-600" />
                </div>
                <p className="text-sm font-semibold text-ink-700">Choose a file or drag & drop it here</p>
                <p className="text-xs text-ink-400">PDF or TXT for best results · Images are not supported for content extraction</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="mt-1 px-4 py-1.5 bg-white border border-ink-200 rounded-lg text-xs font-semibold text-ink-700 hover:bg-ink-50 transition-colors shadow-sm"
                >
                  Browse Files
                </button>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt,.png,.jpg,.jpeg"
            onChange={(e) => onFileChange(e.target.files?.[0])} />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Due Date</label>
          <div className="relative">
            <input type="date" value={form.dueDate || ''} onChange={(e) => onChange({ dueDate: e.target.value })}
              className="input-field pr-10" />
            <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          </div>
        </div>

        {/* Question Types */}
        <div>
          {/* Column headers */}
          <div className="flex items-center mb-2 px-1">
            <span className="flex-1 text-sm font-bold text-ink-800">Question Type</span>
            <span className="w-[110px] text-center text-sm font-bold text-ink-800 mr-3">No. of Questions</span>
            <span className="w-[110px] text-center text-sm font-bold text-ink-800">Marks</span>
          </div>

          {/* Rows */}
          <div className="space-y-2.5">
            {form.questionTypes.map((qt, i) => (
              <div key={i} className="flex items-center gap-3">
                {/* Dropdown */}
                <div className="flex-1 flex items-center gap-2 bg-white border border-ink-200 rounded-xl px-3 py-2.5 shadow-sm">
                  <select
                    value={qt.type}
                    onChange={(e) => {
                      const opt = QUESTION_TYPE_OPTIONS.find((o) => o.type === e.target.value);
                      if (opt) updateRow(i, { type: opt.type, label: opt.label });
                    }}
                    className="flex-1 text-sm text-ink-800 bg-transparent outline-none appearance-none cursor-pointer"
                  >
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-ink-400 pointer-events-none flex-shrink-0" />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={form.questionTypes.length === 1}
                    className="w-5 h-5 rounded-full bg-ink-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <X size={11} />
                  </button>
                </div>

                {/* Count stepper */}
                <Stepper
                  value={qt.count}
                  onDec={() => updateRow(i, { count: Math.max(1, qt.count - 1) })}
                  onInc={() => updateRow(i, { count: qt.count + 1 })}
                  onChange={(v) => updateRow(i, { count: v })}
                />

                {/* Marks stepper */}
                <Stepper
                  value={qt.marksEach}
                  onDec={() => updateRow(i, { marksEach: Math.max(1, qt.marksEach - 1) })}
                  onInc={() => updateRow(i, { marksEach: qt.marksEach + 1 })}
                  onChange={(v) => updateRow(i, { marksEach: v })}
                />
              </div>
            ))}
          </div>

          {errors.questionTypes && (
            <p className="text-xs text-red-500 mt-2">{errors.questionTypes}</p>
          )}

          {/* Add button */}
          <button
            type="button"
            onClick={addRow}
            disabled={form.questionTypes.length >= QUESTION_TYPE_OPTIONS.length}
            className="mt-4 flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <div className="w-8 h-8 rounded-full bg-ink-900 group-hover:bg-ink-700 flex items-center justify-center transition-colors flex-shrink-0">
              <Plus size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-ink-800">Add Question Type</span>
          </button>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t border-ink-100 flex justify-end gap-6 text-sm">
            <span className="text-ink-600">
              Total Questions : <span className="font-bold text-ink-900">{totalQuestions}</span>
            </span>
            <span className="text-ink-600">
              Total Marks : <span className="font-bold text-ink-900">{totalMarks}</span>
            </span>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">
            Additional Information <span className="font-normal text-ink-400">(For better output)</span>
          </label>
          <div className="relative">
            <textarea value={form.additionalInstructions || ''} onChange={(e) => onChange({ additionalInstructions: e.target.value })}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              rows={3} className="input-field resize-none pr-10" />
            <Mic size={15} className="absolute right-3.5 bottom-3 text-ink-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
