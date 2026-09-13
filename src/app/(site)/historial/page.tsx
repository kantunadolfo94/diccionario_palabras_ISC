'use client';

import Link from 'next/link';
import { Trash2, ChevronRight } from 'lucide-react';
import { useHistory } from '@/lib/hooks/useHistory';
import { timeAgo } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { CategoryIcon } from '@/components/CategoryIcon';

export default function HistorialPage() {
  const { history, loaded, clear } = useHistory();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Historial"
        description="Términos consultados recientemente. Se almacenan localmente en tu navegador."
      >
        {loaded && history.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-2 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-3.5 py-2 text-sm font-semibold text-[#F87171] transition-all hover:bg-[rgba(239,68,68,0.2)]"
          >
            <Trash2 size={15} />
            Limpiar historial
          </button>
        )}
      </PageHeader>

      {!loaded ? (
        <div className="space-y-3">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon="history"
          title="No hay historial todavía"
          description="Los términos que consultes aparecerán aquí para que puedas regresar a ellos fácilmente."
          actionLabel="Buscar un término"
          actionHref="/buscar"
        />
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li key={item.id}>
              <Link
                href={`/termino/${item.term_id}`}
                className="group flex items-center gap-4 rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-4 transition-all hover:border-[rgba(0,140,255,0.35)] hover:bg-[#0A203A]"
              >
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
                    {item.category_name} · {timeAgo(item.visited_at)}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-[#4A6A8A] transition-all group-hover:translate-x-0.5 group-hover:text-[#008CFF]"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}