'use client';

import { RefObject } from 'react';
import { QuestionPaper, Section } from '@/lib/api';
import { useSettingsStore } from '@/store/settingsStore';

interface Props {
  paper: QuestionPaper;
  paperRef?: RefObject<HTMLDivElement>;
}

export default function QuestionPaperView({ paper, paperRef }: Props) {
  const { settings } = useSettingsStore();

  const schoolLine = [settings.schoolName, settings.schoolAddress, settings.schoolCity]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      ref={paperRef}
      className="bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden"
    >
      {/* Paper header */}
      <div className="px-5 md:px-10 pt-8 pb-4 text-center border-b border-ink-200">
        <h1 className="text-xl font-bold text-ink-900">{schoolLine || 'School Name'}</h1>
        <p className="text-sm text-ink-700 mt-1">Subject: {paper.metadata.subject}</p>
        <p className="text-sm text-ink-700">Class: {paper.metadata.grade}</p>
      </div>

      {/* Meta row */}
      <div className="px-5 md:px-10 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-ink-200">
        <span className="text-sm text-ink-700">Time Allowed: {paper.metadata.duration}</span>
        <span className="text-sm text-ink-700">Maximum Marks: {paper.metadata.totalMarks}</span>
      </div>

      <div className="px-5 md:px-10 py-4">
        {/* General instructions */}
        <div className="mb-4">
          {paper.metadata.instructions.map((inst, i) => (
            <p key={i} className="text-sm text-ink-700 font-medium">{inst}</p>
          ))}
        </div>

        {/* Student info lines */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-3 text-sm text-ink-700 min-w-0">
            <span className="font-medium flex-shrink-0">Name:</span>
            <span className="flex-1 border-b border-ink-700 min-w-0" />
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-700 min-w-0">
            <span className="font-medium flex-shrink-0">Roll Number:</span>
            <span className="flex-1 border-b border-ink-700 min-w-0" />
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-700 flex-wrap">
            <span className="font-medium">Class:</span>
            <span className="text-ink-500">{paper.metadata.grade}</span>
            <span className="font-medium ml-2">Section:</span>
            <span className="flex-1 border-b border-ink-700 min-w-[48px]" />
          </div>
        </div>

        {/* Sections */}
        {paper.sections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}

        <p className="text-center text-sm font-semibold text-ink-700 mt-6 pt-4 border-t border-ink-200">
          *** End of Question Paper ***
        </p>

        {/* Answer Key */}
        <AnswerKey sections={paper.sections} />
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: Section }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-ink-900 text-center mb-1">{section.title}</h2>
      <p className="text-sm font-semibold text-ink-800 mb-0.5">{section.questionType}</p>
      <p className="text-xs text-ink-500 italic mb-3">{section.instruction}</p>

      <ol className="space-y-2.5">
        {section.questions.map((q) => (
          <li key={q.number} className="text-sm min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <span className="font-medium text-ink-800 flex-shrink-0 w-6">{q.number}.</span>
              <div className="flex-1 min-w-0">
                <span className="text-ink-800 break-words">{q.text}</span>
                <span className="ml-1.5 text-ink-500 font-medium">[{q.marks} Mark{q.marks !== 1 ? 's' : ''}]</span>
                {q.options && (
                  <ul className="mt-1.5 ml-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                    {q.options.map((opt, i) => (
                      <li key={i} className="text-xs text-ink-700">{opt}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AnswerKey({ sections }: { sections: Section[] }) {
  const allQuestions = sections.flatMap((s) => s.questions);
  const hasAnswers = allQuestions.some((q) => q.correctAnswer);
  if (!hasAnswers) return null;

  return (
    <div className="mt-8 pt-6 border-t-2 border-dashed border-ink-300">
      <h3 className="text-base font-bold text-ink-900 mb-4 text-center">ANSWER KEY</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
        {allQuestions.map((q) => (
          <div key={q.number} className="flex items-start gap-2.5 text-sm min-w-0">
            <span className="font-semibold text-ink-600 flex-shrink-0 w-8">Q{q.number}.</span>
            <span className="text-ink-800 break-words min-w-0 flex-1">{q.correctAnswer || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
