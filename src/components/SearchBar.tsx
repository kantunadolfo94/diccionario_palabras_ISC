'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Direction = 'en-es' | 'es-en';

interface SearchBarProps {
  initialQuery?: string;
  initialDirection?: Direction;
  size?: 'lg' | 'md';
  autoFocus?: boolean;
}

export function SearchBar({
  initialQuery = '',
  initialDirection = 'en-es',
  size = 'lg',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [direction, setDirection] = useState<Direction>(initialDirection);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    params.set('direction', direction);
    router.push(`/buscar?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-[rgba(0,140,255,0.25)] bg-[#0A1F3E] shadow-[0_8px_40px_rgba(0,100,255,0.15)] transition-all focus-within:border-[#008CFF] focus-within:shadow-[0_0_0_4px_rgba(0,140,255,0.15)]',
          size === 'lg' ? 'p-2 pl-4' : 'p-1.5 pl-3.5'
        )}
      >
        <Search
          size={size === 'lg' ? 22 : 18}
          className="shrink-0 text-[#008CFF]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          placeholder={
            direction === 'en-es'
              ? 'Buscar una palabra en inglés...'
              : 'Buscar una palabra en español...'
          }
          className="w-full bg-transparent text-base text-white placeholder-[#4A6A8A] outline-none"
        />
        <button
          type="submit"
          className={cn(
            'btn-primary shrink-0',
            size === 'lg' ? 'px-5 py-2.5' : 'px-4 py-2'
          )}
        >
          Buscar
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-[#8BA3BF]">
          <ArrowRightLeft size={13} className="text-[#008CFF]" />
          Dirección de búsqueda:
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setDirection('en-es')}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
              direction === 'en-es'
                ? 'border-[#008CFF] bg-[#008CFF] text-white shadow-[0_0_12px_rgba(0,140,255,0.4)]'
                : 'border-[rgba(0,140,255,0.2)] text-[#8BA3BF] hover:border-[rgba(0,140,255,0.5)] hover:text-white'
            )}
          >
            🇬🇧 Inglés → 🇲🇽 Español
          </button>
          <button
            type="button"
            onClick={() => setDirection('es-en')}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
              direction === 'es-en'
                ? 'border-[#008CFF] bg-[#008CFF] text-white shadow-[0_0_12px_rgba(0,140,255,0.4)]'
                : 'border-[rgba(0,140,255,0.2)] text-[#8BA3BF] hover:border-[rgba(0,140,255,0.5)] hover:text-white'
            )}
          >
            🇲🇽 Español → 🇬🇧 Inglés
          </button>
        </div>
      </div>
    </form>
  );
}