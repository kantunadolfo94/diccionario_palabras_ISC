import { SearchX, FolderOpen, Star, History, FileQuestion, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'search' | 'categories' | 'favorites' | 'history' | 'generic';
  actionLabel?: string;
  actionHref?: string;
}

const ICONS: Record<NonNullable<EmptyStateProps['icon']>, LucideIcon> = {
  search: SearchX,
  categories: FolderOpen,
  favorites: Star,
  history: History,
  generic: FileQuestion,
};

export function EmptyState({
  title,
  description,
  icon = 'generic',
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const Icon = ICONS[icon];
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[rgba(0,140,255,0.2)] bg-[#081B32]/50 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.08)]">
        <Icon size={26} className="text-[#008CFF]" />
      </span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="max-w-md text-sm text-[#8BA3BF]">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}