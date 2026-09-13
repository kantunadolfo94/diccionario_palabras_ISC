import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { fetchCategories } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { CategoryIcon } from '@/components/CategoryIcon';

export const metadata: Metadata = {
  title: 'Categorías',
  description:
    'Explora los términos de SysDictionary por área de especialización.',
};

export default async function CategoriasPage() {
  const categories = await fetchCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Categorías"
        description="Explora las palabras por área de especialización de Ingeniería en Sistemas Computacionales."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.id}`}
            className="group flex items-center gap-4 rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-5 transition-all hover:border-[rgba(0,140,255,0.4)] hover:bg-[#0A203A] hover:shadow-[0_6px_24px_rgba(0,140,255,0.15)]"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{
                background: `${cat.color}22`,
                border: `1px solid ${cat.color}55`,
              }}
            >
              <CategoryIcon icon={cat.icon} color={cat.color} size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{cat.name}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[#8BA3BF]">
                {cat.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-[rgba(0,140,255,0.1)] px-2.5 py-0.5 text-[11px] font-semibold text-[#9DD7FF]">
                  {cat.term_count ?? 0} términos
                </span>
              </div>
            </div>
            <ChevronRight
              size={18}
              className="shrink-0 text-[#4A6A8A] transition-all group-hover:translate-x-0.5 group-hover:text-[#008CFF]"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}