'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Save, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import type { Category, Term } from '@/lib/types';
import type { ActionResult } from '@/lib/actions';
import { withPrevState } from '@/lib/actions/formState';

interface TermFormProps {
  categories: Category[];
  allTerms: Term[];
  term?: Term;
  action: (formData: FormData) => Promise<ActionResult>;
}

const initialState: ActionResult = { error: undefined, success: undefined };

export function TermForm({ categories, allTerms, term, action }: TermFormProps) {
  const [state, formAction, pending] = useActionState(withPrevState(action), initialState);
  const isEdit = Boolean(term);

  const relatedTermIds = term?.related_terms?.map((r) => r.related_term_id) ?? [];

  return (
    <form action={formAction} className="space-y-6">
      {term && <input type="hidden" name="id" value={term.id} />}

      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-4 py-3 text-sm text-[#F87171]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] px-4 py-3 text-sm text-[#34D399]">
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          {state.success}
        </div>
      )}

      {/* Palabras */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="english_word" className="text-sm font-medium text-[#9DD7FF]">
            Palabra en inglés *
          </label>
          <input
            id="english_word"
            name="english_word"
            defaultValue={term?.english_word ?? ''}
            required
            placeholder="e.g. Database"
            className="input-field"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="spanish_word" className="text-sm font-medium text-[#9DD7FF]">
            Palabra en español *
          </label>
          <input
            id="spanish_word"
            name="spanish_word"
            defaultValue={term?.spanish_word ?? ''}
            required
            placeholder="e.g. Base de datos"
            className="input-field"
          />
        </div>
      </div>

      {/* Categoría + estado */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="category_id" className="text-sm font-medium text-[#9DD7FF]">
            Categoría
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={term?.category_id ?? ''}
            className="input-field appearance-none"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-[#9DD7FF]">
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={term?.status ?? 'published'}
            className="input-field appearance-none"
          >
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Definiciones */}
      <div className="space-y-1.5">
        <label htmlFor="definition" className="text-sm font-medium text-[#9DD7FF]">
          Definición *
        </label>
        <textarea
          id="definition"
          name="definition"
          rows={3}
          defaultValue={term?.definition ?? ''}
          required
          placeholder="Describe el significado del término de forma general."
          className="input-field resize-y"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="technical_definition" className="text-sm font-medium text-[#9DD7FF]">
          Definición técnica
        </label>
        <textarea
          id="technical_definition"
          name="technical_definition"
          rows={3}
          defaultValue={term?.technical_definition ?? ''}
          placeholder="Descripción técnica más específica, apropiada para ingenieros."
          className="input-field resize-y"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="example" className="text-sm font-medium text-[#9DD7FF]">
          Ejemplo
        </label>
        <textarea
          id="example"
          name="example"
          rows={2}
          defaultValue={term?.example ?? ''}
          placeholder="Ejemplo de uso en contexto de ingeniería en sistemas."
          className="input-field resize-y font-mono text-sm"
        />
      </div>

      {/* Términos relacionados */}
      <div className="space-y-1.5">
        <label htmlFor="related_term_ids" className="text-sm font-medium text-[#9DD7FF]">
          Términos relacionados
        </label>
        <p className="text-xs text-[#4A6A8A]">
          Mantén Ctrl/Cmd para seleccionar varios. Los términos seleccionados se marcarán en azul.
        </p>
        <select
          id="related_term_ids"
          name="related_term_ids"
          multiple
          defaultValue={
            term ? relatedTermIds : []
          }
          className="input-field min-h-[120px] text-sm"
        >
          {allTerms
            .filter((t) => t.id !== term?.id)
            .map((t) => (
              <option
                key={t.id}
                value={t.id}
                selected={relatedTermIds.includes(t.id)}
              >
                {t.english_word} → {t.spanish_word}
              </option>
            ))}
        </select>
      </div>

      {/* Palabra del día */}
      <label className="flex items-center gap-3 rounded-lg border border-[rgba(0,140,255,0.15)] bg-[rgba(0,140,255,0.04)] px-4 py-3">
        <input
          type="checkbox"
          name="is_daily_word"
          defaultChecked={term?.is_daily_word ?? false}
          className="h-4 w-4 rounded border-[#4A6A8A] bg-[#0A203A] text-[#008CFF] focus:ring-[#008CFF]"
        />
        <span className="text-sm font-medium text-white">
          Marcar como palabra del día
        </span>
        <span className="text-xs text-[#4A6A8A]">
          (se mostrará en la página principal)
        </span>
      </label>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary px-6">
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={16} />
              {isEdit ? 'Actualizar término' : 'Guardar término'}
            </>
          )}
        </button>
        <Link
          href="/admin/terminos"
          className="flex items-center gap-2 rounded-lg border border-[rgba(0,140,255,0.2)] px-4 py-2.5 text-sm font-semibold text-[#8BA3BF] transition-colors hover:border-[rgba(0,140,255,0.5)] hover:text-white"
        >
          <ArrowLeft size={15} />
          Cancelar
        </Link>
      </div>
    </form>
  );
}