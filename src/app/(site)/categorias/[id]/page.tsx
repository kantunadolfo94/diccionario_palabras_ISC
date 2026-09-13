import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchCategories, fetchTermsByCategory } from '@/lib/data';
import { TermResultItem } from '@/components/TermResultItem';
import { EmptyState } from '@/components/EmptyState';
import { CategoryIcon } from '@/components/CategoryIcon';

export async function generateMetadata({
  params,
}: PageProps<'/categorias/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const categories = await fetchCategories();
  const cat = categories.find((c) => c.id === id);
  return {
    title: cat ? `Categoría: ${cat.name}` : 'Categoría',
  };
}

export default async function CategoriaPage({
  params,
}: PageProps<'/categorias/[id]'>) {
  const { id } = await params;
  const [categories, terms] = await Promise.all([
    fetchCategories(),
    fetchTermsByCategory(id),
  ]);
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/categorias"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8BA3BF] transition-colors hover:text-white"
      >
        <ArrowLeft size={15} />
        Todas las categorías
      </Link>

      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-6">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `${category.color}22`,
            border: `1px solid ${category.color}55`,
          }}
        >
          <CategoryIcon icon={category.icon} color={category.color} size={26} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">{category.name}</h1>
          <p className="mt-1 text-sm text-[#8BA3BF]">{category.description}</p>
          <p className="mt-1 text-xs font-semibold text-[#9DD7FF]">
            {terms.length} {terms.length === 1 ? 'término' : 'términos'}
          </p>
        </div>
      </div>

      {terms.length === 0 ? (
        <EmptyState
          icon="categories"
          title="Aún no hay términos en esta categoría"
          description="Pronto se agregarán más términos. Mientras tanto, explora otras categorías."
          actionLabel="Explorar categorías"
          actionHref="/categorias"
        />
      ) : (
        <ul className="space-y-3">
          {terms.map((term) => (
            <TermResultItem key={term.id} term={term} />
          ))}
        </ul>
      )}
    </div>
  );
}