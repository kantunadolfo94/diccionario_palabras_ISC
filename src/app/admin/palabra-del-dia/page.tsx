import type { Metadata } from 'next';
import { fetchAllTermsForForm, fetchDailyWord } from '@/lib/data';
import { DailyWordForm } from '@/components/admin/DailyWordForm';

export const metadata: Metadata = {
  title: 'Palabra del día',
};

export default async function AdminPalabraDelDiaPage() {
  const [terms, current] = await Promise.all([
    fetchAllTermsForForm(),
    fetchDailyWord(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Palabra del día</h2>
        <p className="text-sm text-[#8BA3BF]">
          Elige qué término se destaca en la página principal para hoy.
        </p>
      </div>

      <DailyWordForm terms={terms} current={current} />
    </div>
  );
}