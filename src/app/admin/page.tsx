import Link from 'next/link';
import {
  BookOpen,
  FolderKanban,
  Sparkles,
  GraduationCap,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { fetchAdminStats, fetchAdminTerms } from '@/lib/data';
import { isDbConfigured } from '@/lib/data';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const [stats, recentTerms] = await Promise.all([
    fetchAdminStats(),
    fetchAdminTerms(),
  ]);

  const cards = [
    {
      label: 'Total de términos',
      value: stats.total_terms,
      icon: BookOpen,
      color: '#008CFF',
      href: '/admin/terminos',
    },
    {
      label: 'Categorías',
      value: stats.total_categories,
      icon: FolderKanban,
      color: '#38BDF8',
      href: '/admin/categorias',
    },
    {
      label: 'Términos agregados recientemente',
      value: stats.recent_terms,
      icon: Sparkles,
      color: '#34D399',
      href: '/admin/terminos',
    },
    {
      label: 'Docentes',
      value: stats.total_docentes,
      icon: GraduationCap,
      color: '#A78BFA',
      href: '/admin/usuarios',
    },
    {
      label: 'Palabras pendientes',
      value: stats.pending_terms,
      icon: Clock,
      color: '#FCD34D',
      href: '/admin/terminos',
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#4A6A8A]">
          Resumen general
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-5 transition-all hover:border-[rgba(0,140,255,0.4)] hover:shadow-[0_6px_24px_rgba(0,140,255,0.12)]"
              >
                <span
                  className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${card.color}22`, border: `1px solid ${card.color}55` }}
                >
                  <Icon size={19} style={{ color: card.color }} />
                </span>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="mt-1 text-xs text-[#8BA3BF]">{card.label}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#00AAFF]">
              <BookOpen size={16} />
              Términos recientes
            </h2>
            <Link
              href="/admin/terminos"
              className="flex items-center gap-1 text-xs font-medium text-[#8BA3BF] transition-colors hover:text-white"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="space-y-2">
            {recentTerms.slice(0, 6).map((term) => (
              <li
                key={term.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-[rgba(0,140,255,0.15)] hover:bg-[rgba(0,140,255,0.05)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {term.english_word}{' '}
                    <span className="text-[#008CFF]">→</span>{' '}
                    <span className="text-[#8BA3BF]">{term.spanish_word}</span>
                  </p>
                  <p className="text-xs text-[#4A6A8A]">
                    {term.category ? term.category.name : 'Sin categoría'}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#4A6A8A]">
                  {new Date(term.created_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[rgba(0,140,255,0.12)] bg-[#081B32] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#00AAFF]">
            <Sparkles size={16} />
            Acciones rápidas
          </h2>
          <div className="space-y-2.5">
            <Link
              href="/admin/terminos/nuevo"
              className="flex items-center gap-3 rounded-lg border border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.06)] px-4 py-3 text-sm font-medium text-white transition-all hover:border-[#008CFF] hover:bg-[rgba(0,140,255,0.12)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,140,255,0.15)]">
                <BookOpen size={14} className="text-[#00AAFF]" />
              </span>
              Agregar nuevo término
            </Link>
            <Link
              href="/admin/palabra-del-dia"
              className="flex items-center gap-3 rounded-lg border border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.06)] px-4 py-3 text-sm font-medium text-white transition-all hover:border-[#008CFF] hover:bg-[rgba(0,140,255,0.12)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,140,255,0.15)]">
                <Clock size={14} className="text-[#00AAFF]" />
              </span>
              Asignar palabra del día
            </Link>
            <Link
              href="/admin/categorias"
              className="flex items-center gap-3 rounded-lg border border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.06)] px-4 py-3 text-sm font-medium text-white transition-all hover:border-[#008CFF] hover:bg-[rgba(0,140,255,0.12)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,140,255,0.15)]">
                <FolderKanban size={14} className="text-[#00AAFF]" />
              </span>
              Administrar categorías
            </Link>
          </div>
          <div className="mt-5 rounded-lg border border-dashed border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.03)] p-3 text-xs text-[#8BA3BF]">
            {isDbConfigured() ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#34D399]" />
                Conectado a Turso
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FCD34D]" />
                Turso no configurado · modo demostración
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}