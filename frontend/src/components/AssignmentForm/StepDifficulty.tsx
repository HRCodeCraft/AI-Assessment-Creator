'use client';

import { AssignmentFormData } from '@/lib/api';

interface Props {
  form: AssignmentFormData;
  errors: Record<string, string>;
  onChange: (patch: Partial<AssignmentFormData>) => void;
}

type Level = 'easy' | 'medium' | 'hard';

const LEVELS: { key: Level; label: string; color: string; bg: string; description: string }[] = [
  { key: 'easy', label: 'Easy', color: 'text-emerald-700', bg: 'bg-emerald-500', description: 'Recall and basic understanding' },
  { key: 'medium', label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-500', description: 'Application and analysis' },
  { key: 'hard', label: 'Hard', color: 'text-red-700', bg: 'bg-red-500', description: 'Evaluation and synthesis' },
];

export default function StepDifficulty({ form, errors, onChange }: Props) {
  const { difficultyDistribution: d } = form;

  function handleChange(key: Level, value: number) {
    const clamped = Math.max(0, Math.min(100, value));
    const remaining = 100 - clamped;
    const others = LEVELS.filter((l) => l.key !== key);
    const otherSum = d[others[0].key] + d[others[1].key];

    let patch: typeof d = { ...d, [key]: clamped };

    if (otherSum === 0) {
      patch[others[0].key] = Math.floor(remaining / 2);
      patch[others[1].key] = remaining - Math.floor(remaining / 2);
    } else {
      const ratio0 = d[others[0].key] / otherSum;
      patch[others[0].key] = Math.round(remaining * ratio0);
      patch[others[1].key] = remaining - patch[others[0].key];
    }

    onChange({ difficultyDistribution: patch });
  }

  const total = d.easy + d.medium + d.hard;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink-900">Difficulty Distribution</h2>
        <p className="text-sm text-ink-500 mt-0.5">Set how questions are distributed by difficulty level</p>
      </div>

      {/* Visual bar */}
      <div className="flex rounded-xl overflow-hidden h-4 mb-6 gap-0.5">
        {d.easy > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-300 flex items-center justify-center"
            style={{ width: `${d.easy}%` }}
          />
        )}
        {d.medium > 0 && (
          <div
            className="bg-amber-500 transition-all duration-300"
            style={{ width: `${d.medium}%` }}
          />
        )}
        {d.hard > 0 && (
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${d.hard}%` }}
          />
        )}
      </div>

      <div className="space-y-5">
        {LEVELS.map(({ key, label, color, bg, description }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className={`text-sm font-semibold ${color}`}>{label}</span>
                <span className="text-xs text-ink-400 ml-2">{description}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={d[key]}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="w-14 text-center text-sm font-bold text-ink-800 border border-ink-200
                    rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-ink-900/20"
                />
                <span className="text-sm text-ink-500 w-4">%</span>
              </div>
            </div>
            <div className="relative h-2 bg-ink-100 rounded-full overflow-hidden">
              <div
                className={`${bg} h-full rounded-full transition-all duration-300`}
                style={{ width: `${d[key]}%` }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={d[key]}
                onChange={(e) => handleChange(key, Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              />
            </div>
          </div>
        ))}
      </div>

      {errors.difficulty && (
        <p className="text-xs text-red-500 mt-3">{errors.difficulty}</p>
      )}

      <div className={`mt-4 text-center text-xs font-semibold ${Math.abs(total - 100) <= 1 ? 'text-emerald-600' : 'text-red-500'}`}>
        Total: {total}% {Math.abs(total - 100) <= 1 ? '✓' : '(must equal 100%)'}
      </div>
    </div>
  );
}
