import Link from 'next/link';
import { PlusCircle, Eye, Pencil } from 'lucide-react';
import { fetchAdminTerms } from '@/lib/data';
import { deleteTerm } from '@/lib/actions';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DeleteActionButton } from '@/components/admin/DeleteActionButton';
import { CategoryIcon } from '@/components/CategoryIcon';

export const metadata = { title: 'Términos' };

export default async function AdminTerminosPage() {
  const terms = await fetchAdminTerms();

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Términos</h2>
          <p className="text-sm text-[#8BA3BF]">
            Administra las palabras del diccionario técnico.
          </p>
        </div>
        <Link href="/admin/terminos/nuevo" className="btn-primary">
          <PlusCircle size={16} />+ Nuevo término
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32]">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Palabra</th>
              <th>Traducción</th>
              <th>Categoría</th>
              <th>Idioma</th>
              <th>Fecha de creación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {terms.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-[#4A6A8A]">
                  Aún no hay términos. Crea el primero.
                </td>
              </tr>
            )}
            {terms.map((term) => (
              <tr key={term.id}>
                <td className="font-medium text-white">{term.english_word}</td>
                <td className="text-[#8BA3BF]">{term.spanish_word || '—'}</td>
                <td>
                  {term.category ? (
                    <span className="category-badge">
                      <CategoryIcon
                        icon={(term.category as { icon?: string }).icon}
                        color={(term.category as { color?: string }).color}
                        size={11}
                      />
                      {(term.category as { name?: string }).name}
                    </span>
                  ) : (
                    <span className="text-[#4A6A8A]">—</span>
                  )}
                </td>
                <td className="text-[#8BA3BF]">EN → ES</td>
                <td className="text-[#8BA3BF]">{fmtDate(term.created_at)}</td>
                <td>
                  <StatusBadge status={term.status} />
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/termino/${term.id}`}
                      title="Ver"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(0,140,255,0.2)] text-[#8BA3BF] transition-colors hover:border-[#008CFF] hover:text-white"
                    >
                      <Eye size={14} />
                    </Link>
                    <Link
                      href={`/admin/terminos/${term.id}/editar`}
                      title="Editar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(0,140,255,0.2)] text-[#8BA3BF] transition-colors hover:border-[#008CFF] hover:text-[#00AAFF]"
                    >
                      <Pencil size={14} />
                    </Link>
                    <DeleteActionButton
                      action={deleteTerm}
                      id={term.id}
                      confirmMessage={
                        "¿Seguro que deseas eliminar «" + term.english_word + "»?"
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}