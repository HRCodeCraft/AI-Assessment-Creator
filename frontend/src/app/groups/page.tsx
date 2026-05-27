import AppShell from '@/components/layout/AppShell';
import ComingSoon from '@/components/ComingSoon';
import { Users } from 'lucide-react';

export default function GroupsPage() {
  return (
    <AppShell breadcrumbs={[{ label: 'My Groups' }]}>
      <ComingSoon
        icon={Users}
        title="My Groups"
        description="Organize your students into groups for easier assignment management and tracking."
      />
    </AppShell>
  );
}
