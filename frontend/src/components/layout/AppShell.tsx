'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AppShell({ children, breadcrumbs }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <Sidebar />

      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        <Topbar breadcrumbs={breadcrumbs} />
        {/* pb-20 = space for bottom nav on mobile */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
