'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Check, User, School, BookOpen, Mail, MapPin, GraduationCap, Layers } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

const CLASS_OPTIONS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12',
];
const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function SettingsForm() {
  const { settings, updateSettings, addClass, updateClass, removeClass } = useSettingsStore();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500 mt-1">Manage your profile, school, and class information.</p>
      </div>

      {/* Teacher Profile */}
      <Section title="Teacher Profile" icon={<User size={16} />}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" icon={<User size={14} />}>
            <input
              type="text"
              value={settings.teacherName}
              onChange={(e) => updateSettings({ teacherName: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="input-field"
            />
          </Field>
          <Field label="Email Address" icon={<Mail size={14} />}>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => updateSettings({ email: e.target.value })}
              placeholder="teacher@school.edu"
              className="input-field"
            />
          </Field>
        </div>
        <Field label="Primary Subject" icon={<BookOpen size={14} />}>
          <input
            type="text"
            value={settings.subject}
            onChange={(e) => updateSettings({ subject: e.target.value })}
            placeholder="e.g. Mathematics, Science, English"
            className="input-field"
          />
        </Field>
      </Section>

      {/* School Info */}
      <Section title="School Information" icon={<School size={16} />}>
        <Field label="School Name" icon={<School size={14} />}>
          <input
            type="text"
            value={settings.schoolName}
            onChange={(e) => updateSettings({ schoolName: e.target.value })}
            placeholder="e.g. Delhi Public School"
            className="input-field"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Address / Sector" icon={<MapPin size={14} />}>
            <input
              type="text"
              value={settings.schoolAddress}
              onChange={(e) => updateSettings({ schoolAddress: e.target.value })}
              placeholder="e.g. Sector-4"
              className="input-field"
            />
          </Field>
          <Field label="City" icon={<MapPin size={14} />}>
            <input
              type="text"
              value={settings.schoolCity}
              onChange={(e) => updateSettings({ schoolCity: e.target.value })}
              placeholder="e.g. Bokaro Steel City"
              className="input-field"
            />
          </Field>
        </div>

        {/* Live preview */}
        <div className="mt-2 px-4 py-3 bg-ink-50 rounded-xl border border-ink-100">
          <p className="text-xs text-ink-500 mb-1 font-medium">Preview on question paper:</p>
          <p className="text-sm font-bold text-ink-800 text-center">
            {settings.schoolName || 'School Name'}{settings.schoolAddress ? `, ${settings.schoolAddress}` : ''}
          </p>
          <p className="text-xs text-ink-500 text-center">{settings.schoolCity}</p>
        </div>
      </Section>

      {/* Classes */}
      <Section title="My Classes" icon={<GraduationCap size={16} />}>
        <p className="text-xs text-ink-500 mb-3">
          Classes you teach — shown as options when creating assignments.
        </p>

        <div className="space-y-2">
          {settings.classes.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-ink-500">{i + 1}</span>
              </div>

              {/* Class dropdown */}
              <div className="relative flex-1">
                <GraduationCap size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                <select
                  value={cls.className}
                  onChange={(e) => updateClass(cls.id, { className: e.target.value })}
                  className="input-field pl-8 py-2.5 appearance-none text-sm"
                >
                  <option value="">Select Class</option>
                  {CLASS_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Section dropdown */}
              <div className="relative w-32">
                <Layers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                <select
                  value={cls.section}
                  onChange={(e) => updateClass(cls.id, { section: e.target.value })}
                  className="input-field pl-8 py-2.5 appearance-none text-sm"
                >
                  <option value="">Section</option>
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              {/* Badge preview */}
              {cls.className && cls.section && (
                <span className="text-xs font-semibold text-ink-600 bg-ink-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                  {cls.className} – {cls.section}
                </span>
              )}

              <button
                onClick={() => removeClass(cls.id)}
                disabled={settings.classes.length <= 1}
                className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-ink-400
                  flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        <button
          onClick={addClass}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600
            hover:text-brand-700 transition-colors"
        >
          <Plus size={14} />
          Add Class
        </button>
      </Section>

      {/* Save button */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
            shadow-btn transition-all duration-200
            ${saved
              ? 'bg-emerald-500 text-white'
              : 'bg-ink-900 text-white hover:bg-ink-800 hover:shadow-btn-hover'
            }`}
        >
          {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-ink-100/60 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-ink-100">
        <span className="text-ink-500">{icon}</span>
        <h2 className="text-sm font-bold text-ink-800">{title}</h2>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-600 mb-1.5">
        <span className="text-ink-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
