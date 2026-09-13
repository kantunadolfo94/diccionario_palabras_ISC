import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  published: 'status-published',
  draft: 'status-draft',
  pending: 'status-pending',
};

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    published: 'Publicado',
    draft: 'Borrador',
    pending: 'Pendiente',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        STYLES[status] ?? 'status-pending'
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </span>
  );
}