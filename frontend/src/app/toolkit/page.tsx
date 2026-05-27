import AppShell from '@/components/layout/AppShell';
import ComingSoon from '@/components/ComingSoon';
import { Wand2 } from 'lucide-react';

export default function ToolkitPage() {
  return (
    <AppShell breadcrumbs={[{ label: "AI Teacher's Toolkit" }]}>
      <ComingSoon
        icon={Wand2}
        title="AI Teacher's Toolkit"
        description="A suite of AI-powered tools to help you create rubrics, grade submissions, and generate lesson plans."
      />
    </AppShell>
  );
}
