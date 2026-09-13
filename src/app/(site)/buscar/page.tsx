import type { Metadata } from 'next';
import { fetchCategories, fetchTerms } from '@/lib/data';
import { SearchResults } from '@/components/SearchResults';
import { PageHeader } from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'Buscar términos',
  description:
    'Busca términos técnicos de Ingeniería en Sistemas Computacionales en inglés o español.',
};

export default async function BuscarPage({
  searchParams,
}: PageProps<'/buscar'>) {
  const { q = '', direction = 'en-es', category: cat } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  const dir = Array.isArray(direction) ? direction[0] : direction;
  const category = Array.isArray(cat) ? cat[0] : cat;

  const [terms, categories] = await Promise.all([fetchTerms(), fetchCategories()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Buscar"
        description="Encuentra términos técnicos en inglés o español. Los resultados se filtran en tiempo real."
      />
      <SearchResults
        key={`${query}|${dir}|${category}`}
        terms={terms}
        categories={categories}
        initialQuery={query}
        initialDirection={dir === 'es-en' ? 'es-en' : 'en-es'}
        initialCategory={category}
      />
    </div>
  );
}