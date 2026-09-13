import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Term } from '@/lib/types';
import { CategoryIcon } from '@/components/CategoryIcon';
import { cn, truncate } from '@/lib/utils';

interface TermResultItemProps {
  term: Term;
  query?: string;
  className?: string;
}

export function TermResultItem({ term, query, className }: TermResultItemProps) {
  const highlight = (text: string) => {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'ig'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <Link
      href={`/termino/${term.id}`}
      className={cn(
        'group flex items-center gap-4 rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#0A1F3E]/60 p-4 transition-all hover:border-[rgba(0,140,255,0.4)] hover:bg-[#0A1F3E] hover:shadow-[0_4px_20px_rgba(0,140,255,0.12)]',
        className
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.08)]">
        <CategoryIcon
          icon={term.category?.icon ?? 'Code'}
          color={term.category?.color ?? '#008CFF'}
          size={20}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h3 className="truncate font-semibold text-white group-hover:text-[#00AAFF]">
            {highlight(term.english_word)}
          </h3>
          <span className="text-sm font-medium text-[#8BA3BF]">
            <span className="text-[#008CFF]">→</span> {term.spanish_word}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="category-badge">
            <CategoryIcon
              icon={term.category?.icon ?? 'Code'}
              color={term.category?.color ?? '#008CFF'}
              size={11}
            />
            {term.category?.name ?? 'Sin categoría'}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-[#8BA3BF]">
          {truncate(term.definition, 120)}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-[#4A6A8A] transition-all group-hover:translate-x-0.5 group-hover:text-[#008CFF]"
      />
    </Link>
  );
}