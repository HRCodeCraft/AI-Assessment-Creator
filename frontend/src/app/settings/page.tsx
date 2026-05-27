import AppShell from '@/components/layout/AppShell';
import SettingsForm from '@/components/SettingsForm';

export default function SettingsPage() {
  return (
    <AppShell breadcrumbs={[{ label: 'Settings' }]}>
      <SettingsForm />
    </AppShell>
  );
}
