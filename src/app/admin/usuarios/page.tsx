import type { Metadata } from 'next';
import { fetchProfiles } from '@/lib/data';
import { UserRowActions } from '@/components/admin/UserRowActions';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Usuarios',
};

export default async function AdminUsuariosPage() {
  const profiles = await fetchProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Usuarios</h2>
        <p className="text-sm text-[#8BA3BF]">
          Administra los roles y el acceso del personal docente y administrativo.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32]">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-[#4A6A8A]">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
            {profiles.map((user) => {
              const initial = (user.name || 'U').charAt(0).toUpperCase();
              return (
                <tr key={user.id} className={cn(!user.is_active && 'opacity-50')}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(0,140,255,0.15)] text-sm font-bold text-[#00AAFF]">
                        {initial}
                      </span>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="text-[#8BA3BF]">{user.email}</td>
                  <td>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                        user.role === 'admin'
                          ? 'border-[rgba(0,140,255,0.3)] bg-[rgba(0,140,255,0.1)] text-[#00AAFF]'
                          : 'border-[rgba(139,163,191,0.3)] bg-[rgba(139,163,191,0.1)] text-[#8BA3BF]'
                      )}
                    >
                      {user.role === 'admin' && <ShieldIcon />}
                      {user.role === 'admin' ? 'Administrador' : 'Docente'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                        user.is_active
                          ? 'border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.12)] text-[#34D399]'
                          : 'border-[rgba(100,116,139,0.3)] bg-[rgba(100,116,139,0.12)] text-[#94A3B8]'
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-[#8BA3BF]">
                    {new Date(user.created_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <UserRowActions user={user} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}