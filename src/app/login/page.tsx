import { Suspense } from 'react';
import { Code2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#051222] px-4">
      {/* Grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,140,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,140,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-60 w-60 rounded-full bg-[#008CFF]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#008CFF] to-[#147EFF] shadow-[0_0_24px_rgba(0,100,255,0.4)]">
              <Code2 size={26} className="text-white" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-white">
                Sys<span className="text-[#00AAFF]">Dictionary</span>
              </span>
              <span className="text-xs text-[#8BA3BF]">Diccionario técnico · ISC</span>
            </span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[rgba(0,140,255,0.2)] bg-[#081B32] shadow-[0_12px_60px_rgba(0,80,255,0.18)]">
          <div className="h-1 bg-gradient-to-r from-[#008CFF] via-[#00AAFF] to-[#147EFF]" />
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(0,140,255,0.12)]">
                <KeyRound size={16} className="text-[#00AAFF]" />
              </span>
              <h1 className="text-lg font-bold text-white">Acceso administrativo</h1>
            </div>
            <p className="mb-6 text-sm text-[#8BA3BF]">
              Inicia sesión con tus credenciales de administrador o docente para
              administrar el diccionario.
            </p>
            <Suspense
              fallback={
                <div className="space-y-5">
                  <div className="skeleton h-10" />
                  <div className="skeleton h-10" />
                  <div className="skeleton h-11" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#4A6A8A]">
          <Link href="/" className="transition-colors hover:text-[#8BA3BF]">
            ← Volver al diccionario
          </Link>
        </p>
      </div>
    </div>
  );
}