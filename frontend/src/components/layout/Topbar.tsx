'use client';

import { Bell, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

interface TopbarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Topbar({ breadcrumbs = [] }: TopbarProps) {
  const { settings } = useSettingsStore();
  const firstName = settings.teacherName?.split(' ')[0] || 'Teacher';
  const initial = settings.teacherName?.[0]?.toUpperCase() || 'T';

  return (
    <header className="h-[56px] bg-white/80 backdrop-blur-sm border-b border-ink-100 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-ink-300" />}
            <span className={i === breadcrumbs.length - 1 ? 'text-ink-800 font-medium' : 'text-ink-400'}>
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 rounded-full hover:bg-ink-100 flex items-center justify-center transition-colors">
          <Bell size={16} className="text-ink-600" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{initial}</span>
          </div>
          <span className="text-sm font-medium text-ink-700">{settings.teacherName || 'Teacher'}</span>
        </div>
      </div>
    </header>
  );
}
