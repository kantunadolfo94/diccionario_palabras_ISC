'use client';

import Link from 'next/link';
import { Trash2, ChevronRight } from 'lucide-react';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { timeAgo } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { CategoryIcon } from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';

export default function FavoritosPage() {
  const { favorites, loaded, remove } = useFavorites();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Favoritos"
        description="Tus términos guardados. Se almacenan localmente en tu navegador, sin necesidad de cuenta."
      />

      {!loaded ? (
        <div className="space-y-3">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="favorites"
          title="Aún no tienes favoritos"
          description="Cuando encuentres un término interesante, agrégalo a favoritos desde su página de detalle."
          actionLabel="Explorar el diccionario"
          actionHref="/buscar"
        />
      ) : (
        <ul className="space-y-3">
          {favorites.map((item) => (
            <li
              key={item.id}
              className="group flex items-center gap-4 rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-4 transition-all hover:border-[rgba(0,140,255,0.35)]"
            >
              <Link href={`/termino/${item.term_id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.08)]">
                  <CategoryIcon
                    icon={item.category_icon}
                    color={item.category_color}
                    size={19}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <p className="font-semibold text-white">{item.english_word}</p>
                    <p className="text-sm text-[#8BA3BF]">
                      <span className="text-[#008CFF]">→</span> {item.spanish_word}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-[#4A6A8A]">
                    {item.category_name} · Agregado {timeAgo(item.added_at)}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-[#4A6A8A] transition-all group-hover:translate-x-0.5 group-hover:text-[#008CFF]"
                />
              </Link>
              <button
                onClick={() => remove(item.term_id)}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-[#4A6A8A] transition-all hover:border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#F87171]'
                )}
                aria-label="Quitar de favoritos"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}