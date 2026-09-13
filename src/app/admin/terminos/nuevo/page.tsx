import type { Metadata } from 'next';
import { fetchCategories, fetchAllTermsForForm } from '@/lib/data';
import { createTerm } from '@/lib/actions';
import { TermForm } from '@/components/admin/TermForm';

export const metadata: Metadata = {
  title: 'Agregar nuevo término',
};

export default async function NuevoTerminoPage() {
  const [categories, allTerms] = await Promise.all([
    fetchCategories(),
    fetchAllTermsForForm(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-6 sm:p-8">
        <h2 className="mb-1 text-xl font-bold text-white">Nuevo término</h2>
        <p className="mb-6 text-sm text-[#8BA3BF]">
          Completa los campos para agregar un nuevo término al diccionario.
        </p>
        <TermForm categories={categories} allTerms={allTerms} action={createTerm} />
      </div>
    </div>
  );
}