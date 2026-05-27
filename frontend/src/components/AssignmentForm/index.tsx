'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assignmentsApi, AssignmentFormData, QuestionTypeRow } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import GenerationProgress from '@/components/GenerationProgress';
import StepBasicInfo from './StepBasicInfo';
import StepQuestions from './StepQuestions';
import StepDifficulty from './StepDifficulty';
import StepReview from './StepReview';

const STEPS = ['Basic Info', 'Question Setup', 'Difficulty', 'Review'];

const defaultForm: AssignmentFormData = {
  title: '',
  subject: '',
  grade: '',
  topic: '',
  dueDate: '',
  timeLimit: 60,
  additionalInstructions: '',
  questionTypes: [{ label: 'Multiple Choice Questions', type: 'mcq', count: 5, marksEach: 1 }],
  difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
};

export default function AssignmentForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AssignmentFormData>(defaultForm);
  const [file, setFile] = useState<File | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProgress, setShowProgress] = useState(false);

  const { generation, startGeneration, resetGeneration } = useAssignmentStore();
  const { joinAssignment } = useWebSocket();

  function updateForm(patch: Partial<AssignmentFormData>) {
    setForm((f) => ({ ...f, ...patch }));
    setErrors({});
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!form.title.trim()) errs.title = 'Title is required';
      if (!form.subject.trim()) errs.subject = 'Subject is required';
      if (!form.grade.trim()) errs.grade = 'Grade is required';
      if (!form.topic.trim()) errs.topic = 'Topic is required';
      if (!form.timeLimit || form.timeLimit < 10) errs.timeLimit = 'Minimum 10 minutes';
    }

    if (step === 1) {
      if (form.questionTypes.length === 0) {
        errs.questionTypes = 'Add at least one question type';
      }
      for (const qt of form.questionTypes) {
        if (qt.count < 1) errs.questionTypes = 'All question counts must be ≥ 1';
        if (qt.marksEach < 0.5) errs.questionTypes = 'All marks must be ≥ 0.5';
      }
    }

    if (step === 2) {
      const sum =
        form.difficultyDistribution.easy +
        form.difficultyDistribution.medium +
        form.difficultyDistribution.hard;
      if (Math.abs(sum - 100) > 1) errs.difficulty = 'Percentages must add up to 100%';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function handlePrev() {
    setStep((s) => Math.max(s - 1, 0));
    setErrors({});
  }

  async function handleGenerate() {
    try {
      setShowProgress(true);
      const res = await assignmentsApi.create(form, file);
      const { assignmentId } = res.data.data;

      startGeneration(assignmentId);
      joinAssignment(assignmentId);

      // Poll as fallback for WebSocket
      const poll = setInterval(async () => {
        try {
          const progress = await assignmentsApi.getProgress(assignmentId);
          const d = progress.data.data;
          if (d.status === 'completed' && d.paperId) {
            clearInterval(poll);
            setTimeout(() => {
              setShowProgress(false);
              resetGeneration();
              router.push(`/paper/${d.paperId}`);
            }, 1200);
          } else if (d.status === 'failed') {
            clearInterval(poll);
          }
        } catch {
          // silently ignore poll errors
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setShowProgress(false);
    }
  }

  function handleDismissError() {
    setShowProgress(false);
    resetGeneration();
  }

  const totalMarks = form.questionTypes.reduce((s, qt) => s + qt.count * qt.marksEach, 0);
  const totalQuestions = form.questionTypes.reduce((s, qt) => s + qt.count, 0);

  return (
    <>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i === step ? 'bg-ink-900 text-white shadow-btn' :
                  i < step ? 'bg-emerald-500 text-white' :
                  'bg-white border-2 border-ink-200 text-ink-400'}`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-medium transition-colors whitespace-nowrap
                ${i === step ? 'text-ink-800' : i < step ? 'text-emerald-600' : 'text-ink-400'}`}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-14 h-0.5 mx-1 mb-5 transition-colors
                ${i < step ? 'bg-emerald-400' : 'bg-ink-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-card border border-ink-100/60 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <StepBasicInfo form={form} errors={errors} onChange={updateForm} />
            )}
            {step === 1 && (
              <StepQuestions
                form={form}
                errors={errors}
                file={file}
                onChange={updateForm}
                onFileChange={setFile}
                totalMarks={totalMarks}
                totalQuestions={totalQuestions}
              />
            )}
            {step === 2 && (
              <StepDifficulty form={form} errors={errors} onChange={updateForm} />
            )}
            {step === 3 && (
              <StepReview
                form={form}
                file={file}
                totalMarks={totalMarks}
                totalQuestions={totalQuestions}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2 border-t border-ink-100">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all
              ${step === 0
                ? 'border-ink-200 text-ink-300 cursor-not-allowed'
                : 'border-ink-300 text-ink-700 hover:bg-ink-50 hover:border-ink-400 cursor-pointer'}`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={handleNext} className="btn-primary">
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleGenerate} className="btn-primary px-6 py-2.5">
              <span className="text-base">✦</span>
              Generate Paper
            </button>
          )}
        </div>
      </div>

      <GenerationProgress
        isOpen={showProgress}
        percentage={generation.percentage}
        message={generation.message}
        error={generation.error}
        onDismissError={handleDismissError}
      />
    </>
  );
}
