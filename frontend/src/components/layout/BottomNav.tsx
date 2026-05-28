'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Library, Wand2, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Assignments', icon: BookOpen, href: '/' },
  { label: 'Answer Keys', icon: KeyRound, href: '/answer-keys' },
  { label: 'Library', icon: Library, href: '/library' },
  { label: 'AI Toolkit', icon: Wand2, href: '/toolkit' },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-900 z-40 pb-safe">
      <div className="flex items-center justify-around px-1 py-2.5">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 flex-1 px-1"
            >
              <item.icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-white' : 'text-ink-500'}
              />
              <span className={cn('text-[9px] font-medium leading-none text-center', active ? 'text-white' : 'text-ink-500')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
