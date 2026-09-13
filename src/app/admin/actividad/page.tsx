import type { Metadata } from 'next';
import { PlusCircle, Pencil, Trash2, CalendarDays, ShieldCheck, UserCheck, UserX, Activity } from 'lucide-react';
import { fetchActivityLogs } from '@/lib/data';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Actividad',
};

const ACTION_META: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ size?: number }> }
> = {
  create: { label: 'Creó', color: '#34D399', icon: PlusCircle },
  update: { label: 'Actualizó', color: '#00AAFF', icon: Pencil },
  delete: { label: 'Eliminó', color: '#F87171', icon: Trash2 },
  set_daily_word: { label: 'Asignó la palabra del día', color: '#FCD34D', icon: CalendarDays },
  update_role: { label: 'Cambió el rol de', color: '#A78BFA', icon: ShieldCheck },
  activate_user: { label: 'Activó a', color: '#34D399', icon: UserCheck },
  deactivate_user: { label: 'Desactivó a', color: '#F87171', icon: UserX },
};

const ENTITY_LABELS: Record<string, string> = {
  term: 'el término',
  category: 'la categoría',
  profile: 'usuario',
  daily_word: 'palabra del día',
};

export default async function AdminActividadPage() {
  const logs = await fetchActivityLogs();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Actividad</h2>
        <p className="text-sm text-[#8BA3BF]">
          Registro de los cambios realizados en el panel de administración.
        </p>
      </div>

      <div className="rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32]">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Activity size={28} className="text-[#4A6A8A]" />
            <p className="text-sm text-[#4A6A8A]">Aún no hay actividad registrada.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(0,140,255,0.08)]">
            {logs.map((log) => {
              const meta = ACTION_META[log.action] ?? {
                label: log.action,
                color: '#8BA3BF',
                icon: Activity,
              };
              const Icon = meta.icon;
              const entityLabel =
                ENTITY_LABELS[log.entity_type] + (log.entity_id ? ` «${log.entity_id}»` : '');
              const detail =
                typeof log.details?.name === 'string'
                  ? `«${log.details.name}»`
                  : typeof log.details?.english_word === 'string'
                    ? `«${log.details.english_word}»`
                    : '';

              return (
                <li key={log.id} className="flex items-start gap-3.5 px-5 py-4">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `${meta.color}1a`,
                      border: `1px solid ${meta.color}44`,
                    }}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">
                      <span className="font-semibold">{log.user?.name ?? 'Usuario'}</span>{' '}
                      <span style={{ color: meta.color }}>{meta.label}</span>{' '}
                      <span className="text-[#8BA3BF]">
                        {entityLabel} {detail}
                      </span>
                    </p>
                    <p className="text-xs text-[#4A6A8A]">{timeAgo(log.created_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}