'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowLeftRight, BookOpen, Cpu, Info } from 'lucide-react';
import type { Term } from '@/lib/types';
import { useHistory } from '@/lib/hooks/useHistory';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { CategoryIcon } from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';

interface TermViewProps {
  term: Term;
}

export function TermView({ term }: TermViewProps) {
  const history = useHistory();
  const favorites = useFavorites();
  const isFav = favorites.check(term.id);

  useEffect(() => {
    history.add({
      term_id: term.id,
      english_word: term.english_word,
      spanish_word: term.spanish_word,
      category_name: term.category?.name ?? '',
      category_icon: term.category?.icon ?? 'Code',
      category_color: term.category?.color ?? '#008CFF',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term.id]);

  const related = term.related_terms ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(0,140,255,0.18)] bg-[#081B32] shadow-[0_8px_40px_rgba(0,80,255,0.12)]">
        <div className="h-1 bg-gradient-to-r from-[#008CFF] via-[#00AAFF] to-[#147EFF]" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4A6A8A]">
                <span className="rounded-full bg-[rgba(0,140,255,0.12)] px-3 py-1 text-[#00AAFF]">
                  🇬🇧 Inglés
                </span>
                <ArrowLeftRight size={13} className="text-[#008CFF]" />
                <span className="rounded-full bg-[rgba(0,140,255,0.12)] px-3 py-1 text-[#00AAFF]">
                  🇲🇽 Español
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {term.english_word}
              </h1>
              <p className="mt-1 text-xl font-medium text-[#00AAFF]">
                {term.spanish_word}
              </p>
              {term.category && (
                <div className="mt-4 flex items-center gap-2">
                  <CategoryIcon
                    icon={term.category.icon}
                    color={term.category.color}
                    size={16}
                  />
                  <span className="text-sm text-[#8BA3BF]">
                    Categoría:{' '}
                    <Link
                      href={`/categorias/${term.category_id}`}
                      className="font-semibold text-white transition-colors hover:text-[#00AAFF]"
                    >
                      {term.category.name}
                    </Link>
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() =>
                favorites.toggle({
                  term_id: term.id,
                  english_word: term.english_word,
                  spanish_word: term.spanish_word,
                  category_name: term.category?.name ?? '',
                  category_icon: term.category?.icon ?? 'Code',
                  category_color: term.category?.color ?? '#008CFF',
                })
              }
              className={cn(
                'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all',
                isFav
                  ? 'border-[#F59E0B] bg-[rgba(245,158,11,0.12)] text-[#FCD34D]'
                  : 'border-[rgba(0,140,255,0.25)] text-[#8BA3BF] hover:border-[rgba(0,140,255,0.5)] hover:text-white'
              )}
            >
              <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'En favoritos' : 'Agregar a favoritos'}
            </button>
          </div>
        </div>
      </div>

      {/* Definitions */}
      <div className="mt-6 space-y-5">
        <section className="rounded-2xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#00AAFF]">
            <BookOpen size={16} />
            Significado en sistemas
          </h2>
          <p className="leading-relaxed text-white/90">{term.definition}</p>
        </section>

        {term.technical_definition && (
          <section className="rounded-2xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#00AAFF]">
              <Cpu size={16} />
              Definición técnica
            </h2>
            <p className="leading-relaxed text-[#8BA3BF]">{term.technical_definition}</p>
          </section>
        )}

        {related.length > 0 && (
          <section className="rounded-2xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#00AAFF]">
              <Info size={16} />
              Términos relacionados
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => {
                const rt = r.related_term;
                if (!rt) return null;
                return (
                  <Link
                    key={rt.id}
                    href={`/termino/${rt.id}`}
                    className="group flex items-center gap-2 rounded-full border border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.06)] px-3.5 py-1.5 text-sm font-medium text-[#9DD7FF] transition-all hover:border-[#008CFF] hover:bg-[rgba(0,140,255,0.15)]"
                  >
                    <CategoryIcon
                      icon={rt.category?.icon ?? 'Code'}
                      color={rt.category?.color ?? '#008CFF'}
                      size={13}
                    />
                    {rt.english_word}
                    <span className="text-[#4A6A8A] transition-colors group-hover:text-[#008CFF]">
                      → {rt.spanish_word}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}