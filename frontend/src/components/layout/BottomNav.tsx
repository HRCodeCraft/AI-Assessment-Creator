'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Library, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Assignments', icon: BookOpen, href: '/assignments' },
  { label: 'Library', icon: Library, href: '/library' },
  { label: 'AI Toolkit', icon: Wand2, href: '/toolkit' },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-900 z-40 pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[56px] px-2"
            >
              <item.icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-white' : 'text-ink-500'}
              />
              <span className={cn('text-[10px] font-medium leading-none', active ? 'text-white' : 'text-ink-500')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
