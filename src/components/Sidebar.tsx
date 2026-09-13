'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  LayoutGrid,
  Star,
  History,
  Menu,
  X,
  ShieldCheck,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/buscar', label: 'Buscar', icon: Search },
  { href: '/categorias', label: 'Categorías', icon: LayoutGrid },
  { href: '/favoritos', label: 'Favoritos', icon: Star },
  { href: '/historial', label: 'Historial', icon: History },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-4">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn('nav-item w-full', isActive && 'active')}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5">
        <div className="rounded-xl border border-[rgba(0,140,255,0.18)] bg-gradient-to-br from-[#0A1F3E] to-[#081226] p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(0,140,255,0.15)]">
            <Lightbulb size={16} className="text-[#00AAFF]" />
          </div>
          <p className="text-sm font-semibold leading-snug text-white">
            Un mejor vocabulario,
            <br />
            mejores proyectos.
          </p>
          <p className="mt-1 text-[11px] text-[#8BA3BF]">
            Domina el lenguaje técnico de tu carrera.
          </p>
        </div>

        <Link
          href="/login"
          onClick={onNavigate}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,140,255,0.2)] px-3 py-2.5 text-xs font-semibold text-[#8BA3BF] transition-colors hover:border-[rgba(0,140,255,0.5)] hover:text-white hover:bg-[rgba(0,140,255,0.08)]"
        >
          <ShieldCheck size={14} className="text-[#008CFF]" />
          Acceso administrativo
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-[rgba(0,140,255,0.12)] bg-[#081226] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[rgba(0,140,255,0.12)] bg-[#081226]/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Logo size="sm" />
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(0,140,255,0.2)] text-white transition-colors hover:bg-[rgba(0,140,255,0.1)]"
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[rgba(0,140,255,0.15)] bg-[#061026] transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#8BA3BF] transition-colors hover:text-white hover:bg-[rgba(0,140,255,0.1)]"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>
    </>
  );
}