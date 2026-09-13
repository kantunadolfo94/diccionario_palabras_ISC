import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchTermById } from '@/lib/data';
import { TermView } from '@/components/TermView';

export async function generateMetadata({
  params,
}: PageProps<'/termino/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const term = await fetchTermById(id);
  return {
    title: term
      ? `${term.english_word} → ${term.spanish_word}`
      : 'Término no encontrado',
  };
}

export default async function TerminoPage({
  params,
}: PageProps<'/termino/[id]'>) {
  const { id } = await params;
  const term = await fetchTermById(id);
  if (!term) notFound();

  return (
    <div className="min-w-0 px-4 py-10 sm:px-6 lg:px-8">
      <TermView term={term} />
    </div>
  );
}