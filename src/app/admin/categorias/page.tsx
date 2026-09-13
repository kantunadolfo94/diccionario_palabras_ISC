import type { Metadata } from 'next';
import { fetchAdminCategories } from '@/lib/data';
import { deleteCategory } from '@/lib/actions';
import { CategoriesManager } from '@/components/admin/CategoriesManager';

export const metadata: Metadata = {
  title: 'Categorías',
};

export default async function AdminCategoriasPage() {
  const categories = await fetchAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Categorías</h2>
        <p className="text-sm text-[#8BA3BF]">
          Organiza los términos del diccionario por área de conocimiento.
        </p>
      </div>

      <CategoriesManager
        initialCategories={categories}
        deleteCategoryAction={deleteCategory}
      />
    </div>
  );
}