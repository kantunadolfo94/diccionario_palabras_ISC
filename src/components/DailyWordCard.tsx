import Link from 'next/link';
import { Lightbulb, ArrowRight } from 'lucide-react';
import type { Term } from '@/lib/types';
import { CategoryIcon } from '@/components/CategoryIcon';

export function DailyWordCard({ term }: { term: Term | null }) {
  if (!term) return null;
  return (
    <section className="rounded-2xl border border-[rgba(245,158,11,0.2)] bg-gradient-to-br from-[#0B2340] to-[#081226] p-5 shadow-[0_8px_32px_rgba(0,80,255,0.1)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(245,158,11,0.15)]">
          <Lightbulb size={16} className="text-[#FCD34D]" />
        </span>
        <h2 className="text-sm font-bold text-white">Palabra del día</h2>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-white">{term.english_word}</p>
          <p className="mt-0.5 text-xs text-[#4A6A8A]">Inglés → Español</p>
        </div>
        <CategoryIcon
          icon={term.category?.icon ?? 'Code'}
          color={term.category?.color ?? '#008CFF'}
          size={28}
        />
      </div>

      <p className="mt-2 text-xl font-semibold text-[#00AAFF]">{term.spanish_word}</p>

      <p className="mt-3 text-sm leading-relaxed text-[#8BA3BF]">
        {term.definition}
      </p>

      <Link
        href={`/termino/${term.id}`}
        className="mt-4 flex items-center gap-2 rounded-lg border border-[rgba(0,140,255,0.3)] bg-[rgba(0,140,255,0.08)] px-4 py-2.5 text-sm font-semibold text-[#9DD7FF] transition-all hover:border-[#008CFF] hover:bg-[rgba(0,140,255,0.15)] hover:text-white"
      >
        Ver más detalles <ArrowRight size={15} />
      </Link>
    </section>
  );
}