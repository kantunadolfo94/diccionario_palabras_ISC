import Link from 'next/link';
import { GitFork, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[rgba(0,140,255,0.1)] bg-[#061026]/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <Logo size="sm" />
            <p className="mt-3 max-w-xs text-sm text-[#8BA3BF]">
              Diccionario técnico especializado para estudiantes y docentes de
              Ingeniería en Sistemas Computacionales.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <Link href="/categorias" className="text-[#8BA3BF] transition-colors hover:text-white">
              Categorías
            </Link>
            <Link href="/buscar" className="text-[#8BA3BF] transition-colors hover:text-white">
              Buscar término
            </Link>
            <Link href="/historial" className="text-[#8BA3BF] transition-colors hover:text-white">
              Historial de búsqueda
            </Link>
            <Link href="/favoritos" className="text-[#8BA3BF] transition-colors hover:text-white">
              Favoritos
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4A6A8A]">
              Acceso
            </span>
            <Link
              href="/login"
              className="flex items-center gap-2 text-[#8BA3BF] transition-colors hover:text-white"
            >
              <ShieldCheck size={14} className="text-[#008CFF]" />
              Acceso administrativo
            </Link>
            <span className="flex items-center gap-2 text-[#8BA3BF]">
              <GitFork size={14} className="text-[#008CFF]" />
              SysDictionary
            </span>
          </div>
        </div>

        <div className="border-t border-[rgba(0,140,255,0.08)] pt-5 text-center text-xs text-[#4A6A8A]">
          SysDictionary · Diccionario técnico de Ingeniería en Sistemas
          Computacionales · {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}