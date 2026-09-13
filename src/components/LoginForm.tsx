'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ShieldCheck, LockKeyhole, Mail, LogIn, KeyRound } from 'lucide-react';
import { login } from '@/lib/actions';
import { withPrevState } from '@/lib/actions/formState';

const initialState = { error: undefined as string | undefined, success: undefined };

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/admin';
  const errorParam = searchParams.get('error');
  const [state, formAction, pending] = useActionState(withPrevState(login), initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#9DD7FF]">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A6A8A]"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="docente@instituto.edu.mx"
            className="input-field pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[#9DD7FF]">
          Contraseña
        </label>
        <div className="relative">
          <LockKeyhole
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A6A8A]"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="input-field pl-10"
            required
          />
        </div>
      </div>

      {(state?.error || errorParam) && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-3.5 py-2.5 text-sm text-[#F87171]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            {errorParam === 'unauthorized'
              ? 'Tu cuenta no tiene permisos administrativos.'
              : state?.error}
          </span>
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full justify-center py-2.5">
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Iniciando sesión...
          </>
        ) : (
          <>
            <LogIn size={17} />
            Iniciar sesión
          </>
        )}
      </button>

      <div className="text-center">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-sm font-medium text-[#8BA3BF] transition-colors hover:text-white"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <div className="flex items-center gap-2 border-t border-[rgba(0,140,255,0.1)] pt-4 text-xs text-[#4A6A8A]">
        <ShieldCheck size={13} className="text-[#008CFF]" />
        Solo administradores y docentes autorizados pueden acceder.
      </div>

      <div className="rounded-lg border border-dashed border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.04)] p-3 text-xs text-[#8BA3BF]">
        <span className="flex items-center gap-1.5 font-semibold text-[#9DD7FF]">
          <KeyRound size={12} />
          Modo demostración
        </span>
        Usa <code className="rounded bg-[rgba(0,140,255,0.12)] px-1 py-0.5 text-[#00AAFF]">admin@sysdict.test</code> y{' '}
        <code className="rounded bg-[rgba(0,140,255,0.12)] px-1 py-0.5 text-[#00AAFF]">admin123</code> para
        explorar el panel (sin configurar Supabase).
      </div>
    </form>
  );
}