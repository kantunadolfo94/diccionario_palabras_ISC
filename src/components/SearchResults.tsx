'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Category, Term } from '@/lib/types';
import { SearchBar } from '@/components/SearchBar';
import { TermResultItem } from '@/components/TermResultItem';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

type Direction = 'en-es' | 'es-en';

interface SearchResultsProps {
  terms: Term[];
  categories: Category[];
  initialQuery: string;
  initialDirection: Direction;
  initialCategory?: string;
}

export function SearchResults({
  terms,
  categories,
  initialQuery,
  initialDirection,
  initialCategory,
}: SearchResultsProps) {
  const query = initialQuery;
  const direction = initialDirection;
  const [categoryFilter, setCategoryFilter] = useState<string>(
    initialCategory ?? 'all'
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = terms.filter(
      (t) =>
        t.status === 'published' &&
        (categoryFilter === 'all' || t.category_id === categoryFilter)
    );
    if (q) {
      list = list.filter((t) =>
        [
          t.english_word,
          t.spanish_word,
          t.definition,
          t.technical_definition,
          t.example,
          t.category?.name ?? '',
        ].some((field) => field.toLowerCase().includes(q))
      );
    }
    const sorted = [...list].sort((a, b) =>
      direction === 'en-es'
        ? a.english_word.localeCompare(b.english_word)
        : a.spanish_word.localeCompare(b.spanish_word)
    );
    return sorted;
  }, [terms, query, direction, categoryFilter]);

  const filters = [
    { id: 'all', label: 'Todos' },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6">
      <SearchBar
        initialQuery={initialQuery}
        initialDirection={initialDirection}
        size="md"
      />

      {/* Live search state */}
      <div className="flex items-center gap-2 text-xs text-[#4A6A8A]">
        <Search size={13} className="text-[#008CFF]" />
        Refinando resultados en tiempo real
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setCategoryFilter(f.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
              categoryFilter === f.id
                ? 'border-[#008CFF] bg-[#008CFF] text-white shadow-[0_0_12px_rgba(0,140,255,0.35)]'
                : 'border-[rgba(0,140,255,0.2)] bg-transparent text-[#8BA3BF] hover:border-[rgba(0,140,255,0.5)] hover:text-white'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Resultado de búsqueda</h2>
        <span className="rounded-full border border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.06)] px-3 py-1 text-xs font-semibold text-[#9DD7FF]">
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon="search"
          title="No encontramos este término."
          description="Intenta con otra palabra o revisa las categorías disponibles."
          actionLabel="Explorar categorías"
          actionHref="/categorias"
        />
      ) : (
        <ul className="animate-[fadeIn_0.3s_ease] space-y-3">
          {results.map((term) => (
            <TermResultItem key={term.id} term={term} query={query} />
          ))}
        </ul>
      )}
    </div>
  );
}