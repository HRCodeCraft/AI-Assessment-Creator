import AppShell from '@/components/layout/AppShell';
import ComingSoon from '@/components/ComingSoon';
import { Library } from 'lucide-react';

export default function LibraryPage() {
  return (
    <AppShell breadcrumbs={[{ label: 'My Library' }]}>
      <ComingSoon
        icon={Library}
        title="My Library"
        description="Save and reuse your best question papers, rubrics, and assignment templates."
      />
    </AppShell>
  );
}
