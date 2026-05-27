'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronRight, Settings, LogOut, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';

interface TopbarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

const NOTIFICATIONS = [
  { id: 1, text: 'Question paper generated successfully', sub: 'Quiz on Electricity · just now', read: false },
  { id: 2, text: 'Assignment created', sub: 'Chapter 5 – Algebra · 2 min ago', read: false },
  { id: 3, text: 'Welcome to VedaAI!', sub: 'Get started by creating your first assignment', read: true },
];

export default function Topbar({ breadcrumbs = [] }: TopbarProps) {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const initial = settings.teacherName?.[0]?.toUpperCase() || 'T';

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function markAllRead() {
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.1 } },
  };

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

      <div className="flex items-center gap-2">

        {/* Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="relative w-8 h-8 rounded-full hover:bg-ink-100 flex items-center justify-center transition-colors"
          >
            <Bell size={16} className="text-ink-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full border border-white" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-lg border border-ink-100 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
                  <span className="text-sm font-bold text-ink-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      <CheckCheck size={13} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-ink-50 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-ink-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}
                      onClick={() => setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, read: true } : item))}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-ink-200' : 'bg-brand-500'}`} />
                      <div>
                        <p className={`text-xs font-semibold ${n.read ? 'text-ink-600' : 'text-ink-800'}`}>{n.text}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{n.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {unreadCount === 0 && (
                  <p className="text-xs text-ink-400 text-center py-4">All caught up!</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-ink-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{initial}</span>
            </div>
            <span className="text-sm font-medium text-ink-700 max-w-[120px] truncate">
              {settings.teacherName || 'Teacher'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-lg border border-ink-100 overflow-hidden z-50"
              >
                {/* Profile header */}
                <div className="px-4 py-3 border-b border-ink-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{initial}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-800 truncate">{settings.teacherName || 'Teacher'}</p>
                      <p className="text-xs text-ink-400 truncate">{settings.email || settings.subject || 'Teacher'}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { router.push('/settings'); setProfileOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                  >
                    <Settings size={15} className="text-ink-400" />
                    Settings
                  </button>
                  <div className="border-t border-ink-100 my-1" />
                  <button
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
