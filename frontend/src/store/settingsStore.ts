'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClassSection {
  id: string;
  className: string;
  section: string;
}

export interface Settings {
  teacherName: string;
  email: string;
  subject: string;
  schoolName: string;
  schoolCity: string;
  schoolAddress: string;
  classes: ClassSection[];
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  addClass: () => void;
  updateClass: (id: string, patch: Partial<ClassSection>) => void;
  removeClass: (id: string) => void;
}

const defaultSettings: Settings = {
  teacherName: 'John Doe',
  email: '',
  subject: '',
  schoolName: 'Delhi Public School',
  schoolCity: 'Bokaro Steel City',
  schoolAddress: 'Sector-4, Bokaro Steel City',
  classes: [
    { id: '1', className: 'Grade 8', section: 'A' },
    { id: '2', className: 'Grade 9', section: 'B' },
  ],
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      addClass: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            classes: [
              ...state.settings.classes,
              { id: Date.now().toString(), className: '', section: '' },
            ],
          },
        })),

      updateClass: (id, patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            classes: state.settings.classes.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          },
        })),

      removeClass: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            classes: state.settings.classes.filter((c) => c.id !== id),
          },
        })),
    }),
    { name: 'vedaai-settings' }
  )
);
