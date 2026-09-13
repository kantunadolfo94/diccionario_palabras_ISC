import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCategories, fetchAllTermsForForm } from '@/lib/data';
import { updateTerm } from '@/lib/actions';
import { TermForm } from '@/components/admin/TermForm';

export const metadata: Metadata = {
  title: 'Editar término',
};

export default async function EditarTerminoPage({
  params,
}: PageProps<'/admin/terminos/[id]/editar'>) {
  const { id } = await params;
  const [categories, allTerms] = await Promise.all([
    fetchCategories(),
    fetchAllTermsForForm(),
  ]);
  const term = allTerms.find((t) => t.id === id);
  if (!term) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-6 sm:p-8">
        <h2 className="mb-1 text-xl font-bold text-white">
          Editar: {term.english_word}
        </h2>
        <p className="mb-6 text-sm text-[#8BA3BF]">
          Modifica la información del término y guarda los cambios.
        </p>
        <TermForm
          categories={categories}
          allTerms={allTerms}
          term={term}
          action={updateTerm}
        />
      </div>
    </div>
  );
}