import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function ComingSoon({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-ink-400" />
      </div>
      <h2 className="text-xl font-bold text-ink-800 mb-2">{title}</h2>
      <p className="text-sm text-ink-500 max-w-xs">{description}</p>
      <span className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Coming Soon
      </span>
    </div>
  );
}
