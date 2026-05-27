'use client';

import AppShell from '@/components/layout/AppShell';
import AssignmentForm from '@/components/AssignmentForm';

export default function CreatePage() {
  return (
    <AppShell
      breadcrumbs={[
        { label: 'Assignment', href: '/' },
        { label: 'Create New' },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-900">Create Assignment</h1>
          <p className="text-sm text-ink-500 mt-1">Set up a new assignment for your students</p>
        </div>

        <AssignmentForm />
      </div>
    </AppShell>
  );
}
