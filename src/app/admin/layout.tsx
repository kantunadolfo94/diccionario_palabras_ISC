import { isSupabaseConfigured } from '@/lib/data';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

async function getSessionUser() {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', user.id)
        .single();
      return profile ?? { name: user.email ?? 'Usuario', email: user.email, role: 'docente' };
    } catch {
      return null;
    }
  }
  return { name: 'Administrador demo', email: 'admin@sysdict.test', role: 'admin' };
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
  const demoMode = !isSupabaseConfigured();

  return (
    <div className="flex min-h-screen flex-col bg-[#051222]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col lg:pl-[250px]">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {demoMode && (
            <div className="mb-6 rounded-xl border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] px-4 py-3 text-xs text-[#FCD34D]">
              <span className="font-bold">Modo demostración:</span> Supabase no está
              configurado. Se usan datos de ejemplo en memoria; los cambios se
              reinician al reiniciar el servidor. Configura supabase/schema.sql y
              seed.sql en {'"Settings → API"'} para usar la base de datos real.
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