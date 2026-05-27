'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AppShell({ children, breadcrumbs }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Topbar breadcrumbs={breadcrumbs} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
