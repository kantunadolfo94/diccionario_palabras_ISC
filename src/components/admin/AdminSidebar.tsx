'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FolderKanban,
  CalendarDays,
  Users,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { logout } from '@/lib/actions';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/terminos', label: 'Términos', icon: BookOpen },
  { href: '/admin/terminos/nuevo', label: 'Agregar término', icon: PlusCircle },
  { href: '/admin/categorias', label: 'Categorías', icon: FolderKanban },
  { href: '/admin/palabra-del-dia', label: 'Palabra del día', icon: CalendarDays },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/actividad', label: 'Actividad', icon: Activity },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-4">
        <Link href="/admin" className="flex items-center gap-3 group" onClick={onNavigate}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#008CFF] to-[#147EFF] shadow-[0_0_16px_rgba(0,100,255,0.35)]">
            <Code2 size={20} className="text-white" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-bold text-white">
              Sys<span className="text-[#00AAFF]">Dictionary</span>
            </span>
            <span className="text-[10px] text-[#8BA3BF]">Panel administrativo</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn('nav-item w-full', isActive && 'active')}
            >
              <Icon size={17} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 px-4 pb-5">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-[rgba(0,140,255,0.15)] px-3 py-2.5 text-xs font-semibold text-[#8BA3BF] transition-colors hover:border-[rgba(0,140,255,0.4)] hover:text-white"
        >
          <ExternalLink size={13} className="text-[#008CFF]" />
          Ver sitio público
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-3 py-2.5 text-xs font-semibold text-[#F87171] transition-colors hover:bg-[rgba(239,68,68,0.16)]"
          >
            <LogOut size={13} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] border-r border-[rgba(0,140,255,0.12)] bg-[#061026] lg:block">
        <AdminNav />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[rgba(0,140,255,0.12)] bg-[#061026]/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <span className="flex items-center gap-2 font-bold text-white">
          <Code2 size={18} className="text-[#00AAFF]" />
          Sys<span className="text-[#00AAFF]">Dictionary</span>
        </span>
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(0,140,255,0.2)] text-white"
          aria-label="Abrir menú administrativo"
        >
          <Menu size={18} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[270px] border-r border-[rgba(0,140,255,0.15)] bg-[#061026] transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#8BA3BF] hover:text-white"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        <AdminNav onNavigate={() => setOpen(false)} />
      </div>
    </>
  );
}