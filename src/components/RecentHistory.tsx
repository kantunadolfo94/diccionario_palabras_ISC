'use client';

import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { useHistory } from '@/lib/hooks/useHistory';
import { timeAgo } from '@/lib/utils';
import { CategoryIcon } from '@/components/CategoryIcon';

export function RecentHistory() {
  const { history, loaded } = useHistory();
  const recent = history.slice(0, 4);

  return (
    <section className="rounded-2xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#00AAFF]">
          <History size={16} />
          Historial reciente
        </h2>
        {history.length > 0 && (
          <Link
            href="/historial"
            className="flex items-center gap-1 text-xs font-medium text-[#8BA3BF] transition-colors hover:text-white"
          >
            Ver todo <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {!loaded ? (
        <div className="space-y-3">
          <div className="skeleton h-14" />
          <div className="skeleton h-14" />
        </div>
      ) : recent.length === 0 ? (
        <p className="py-4 text-sm text-[#4A6A8A]">
          Aún no has consultado términos. Tu historial aparecerá aquí.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {recent.map((item) => (
            <li key={item.id}>
              <Link
                href={`/termino/${item.term_id}`}
                className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 transition-all hover:border-[rgba(0,140,255,0.2)] hover:bg-[rgba(0,140,255,0.06)]"
              >
                <CategoryIcon
                  icon={item.category_icon}
                  color={item.category_color}
                  size={15}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white group-hover:text-[#00AAFF]">
                    {item.english_word}
                  </p>
                  <p className="truncate text-xs text-[#4A6A8A]">
                    {item.category_name} · {timeAgo(item.visited_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}