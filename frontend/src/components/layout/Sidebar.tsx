'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, Wand2, Library, Settings, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

const navItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'My Groups', icon: Users, href: '/groups' },
  { label: 'Assignments', icon: BookOpen, href: '/assignments' },
  { label: 'Answer Keys', icon: KeyRound, href: '/answer-keys' },
  { label: "AI Teacher's Toolkit", icon: Wand2, href: '/toolkit' },
  { label: 'My Library', icon: Library, href: '/library' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { settings } = useSettingsStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-white shadow-sidebar flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-ink-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="text-ink-900 font-bold text-[15px] tracking-tight">VedaAI</span>
      </div>

      {/* Create Button */}
      <div className="px-3 py-3">
        <Link href="/create" className="btn-primary w-full justify-center">
          <span className="text-base leading-none">+</span>
          Create Assignment
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn('sidebar-nav-item', isActive(item.href) && 'active')}
          >
            <item.icon size={16} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom: Settings + Profile */}
      <div className="px-3 pb-3 space-y-0.5">
        <Link href="/settings" className="sidebar-nav-item">
          <Settings size={16} strokeWidth={2} />
          <span>Settings</span>
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">
              {settings.schoolName?.[0]?.toUpperCase() ?? 'S'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-800 truncate">{settings.schoolName || 'School Name'}</p>
            <p className="text-xs text-ink-400 truncate">{settings.schoolCity || 'City'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
