'use client';

import { useActionState } from 'react';
import { CalendarDays, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { setDailyWord } from '@/lib/actions';
import { withPrevState } from '@/lib/actions/formState';
import type { Term } from '@/lib/types';

interface DailyWordFormProps {
  terms: Term[];
  current: Term | null;
}

const initialState = { error: undefined as string | undefined, success: undefined };

export function DailyWordForm({ terms, current }: DailyWordFormProps) {
  const [state, formAction, pending] = useActionState(withPrevState(setDailyWord), initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Actual */}
      <div className="rounded-xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <Sparkles size={15} className="text-[#00AAFF]" />
          Palabra actual del día
        </h3>
        {current ? (
          <div className="rounded-lg border border-[rgba(0,140,255,0.12)] bg-[#0A203A] p-4">
            <p className="text-sm font-bold text-white">{current.english_word}</p>
            <p className="text-xs text-[#8BA3BF]">
              {current.spanish_word} · {current.category?.name ?? 'Sin categoría'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#6B87A6]">{current.definition}</p>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-[rgba(0,140,255,0.2)] p-4 text-sm text-[#4A6A8A]">
            No hay palabra del día asignada.
          </p>
        )}
      </div>

      {/* Asignar */}
      <div className="rounded-xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <CalendarDays size={15} className="text-[#00AAFF]" />
          Asignar palabra del día
        </h3>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="term_id" className="text-xs font-medium text-[#9DD7FF]">
              Término *
            </label>
            <select id="term_id" name="term_id" required className="input-field appearance-none">
              <option value="">Selecciona un término</option>
              {terms
                .filter((t) => t.status === 'published')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.english_word} → {t.spanish_word}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="date" className="text-xs font-medium text-[#9DD7FF]">
              Fecha
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={today}
              className="input-field"
            />
          </div>

          {(state?.error || state?.success) && (
            <div
              className={
                'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs ' +
                (state.error
                  ? 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[#F87171]'
                  : 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] text-[#34D399]')
              }
            >
              {state.success ? (
                <CheckCircle size={14} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
              )}
              {state.error ?? state.success}
            </div>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Guardando...
              </>
            ) : (
              'Asignar palabra del día'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}