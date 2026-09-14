import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { isDbConfigured } from '@/lib/db';
import { getUserFromCookie } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import type { Profile } from '@/lib/types';

const DEMO_COOKIE = 'sysdict_demo_user';

async function getSessionUser(): Promise<Profile | null> {
  if (isDbConfigured()) {
    return await getUserFromCookie();
  }
  const cookieStore = await cookies();
  const cookie = (await cookieStore.get(DEMO_COOKIE))?.value;
  if (cookie !== 'admin') return null;
  return {
    id: 'demo-admin',
    name: 'Administrador demo',
    email: 'admin@sysdict.test',
    role: 'admin',
    avatar_url: null,
    is_active: true,
    created_at: '',
    updated_at: '',
  };
}

export const metadata = {
  title: {
    default: 'Panel administrativo · SysDictionary',
    template: '%s · SysDictionary',
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const user = await getSessionUser();
  const configured = isDbConfigured();

  if (!user) {
    redirect('/login?redirect=%2Fadmin');
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#051222]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col lg:pl-[250px]">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!configured && (
            <div className="mb-6 rounded-xl border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] px-4 py-3 text-xs text-[#FCD34D]">
              <span className="font-bold">Modo demostración:</span> Turso no está
              configurado. Se usan datos de ejemplo en memoria; los cambios se
              reinician al reiniciar el servidor. Configura{' '}
              <code className="rounded bg-[rgba(245,158,11,0.15)] px-1">
                TURSO_DATABASE_URL
              </code>{' '}
              y{' '}
              <code className="rounded bg-[rgba(245,158,11,0.15)] px-1">
                TURSO_AUTH_TOKEN
              </code>{' '}
              en <code className="rounded bg-[rgba(245,158,11,0.15)] px-1">.env.local</code>{' '}
              para usar la base de datos real.
            </div>
          )}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">Panel administrativo</h1>
              <p className="text-sm text-[#8BA3BF]">
                Bienvenido, {user?.name ?? 'usuario'}. Administra el contenido del
                diccionario.
              </p>
            </div>
            <span className="rounded-full border border-[rgba(0,140,255,0.25)] bg-[rgba(0,140,255,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#9DD7FF]">
              {user?.role ?? '—'}
            </span>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}