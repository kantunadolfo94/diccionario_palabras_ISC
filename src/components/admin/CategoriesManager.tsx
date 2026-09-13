'use client';

import { useState, useActionState } from 'react';
import { Save, Pencil, PlusCircle, AlertCircle, CheckCircle, X } from 'lucide-react';
import type { Category } from '@/lib/types';
import { createCategory, updateCategory } from '@/lib/actions';
import { withPrevState } from '@/lib/actions/formState';
import type { ActionResult } from '@/lib/actions';
import { DeleteActionButton } from '@/components/admin/DeleteActionButton';
import { CategoryIcon } from '@/components/CategoryIcon';
import { CATEGORY_ICON_OPTIONS, CATEGORY_COLOR_OPTIONS } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CategoriesManagerProps {
  initialCategories: Category[];
  deleteCategoryAction: (formData: FormData) => Promise<ActionResult>;
}

const initialState = { error: undefined as string | undefined, success: undefined };
const DEFAULT_COLOR = CATEGORY_COLOR_OPTIONS[0];

export function CategoriesManager({
  initialCategories,
  deleteCategoryAction,
}: CategoriesManagerProps) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [icon, setIcon] = useState('Code');
  const [color, setColor] = useState(DEFAULT_COLOR.color);
  const [accent, setAccent] = useState(DEFAULT_COLOR.accent);

  const [state, formAction, pending] = useActionState(
    withPrevState(editing ? updateCategory : createCategory),
    initialState
  );

  const isEdit = Boolean(editing);

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setIcon(cat.icon);
    setColor(cat.color);
    setAccent(cat.accent);
  };

  const startNew = () => {
    setEditing(null);
    setIcon('Code');
    setColor(DEFAULT_COLOR.color);
    setAccent(DEFAULT_COLOR.accent);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* List */}
      <div className="overflow-x-auto rounded-xl border border-[rgba(0,140,255,0.12)] bg-[#081B32]">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Icono</th>
              <th>Nombre</th>
              <th>Términos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {initialCategories.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-[#4A6A8A]">
                  No hay categorías todavía.
                </td>
              </tr>
            )}
            {initialCategories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: `${cat.color}22`,
                      border: `1px solid ${cat.color}55`,
                    }}
                  >
                    <CategoryIcon icon={cat.icon} color={cat.color} size={17} />
                  </span>
                </td>
                <td className="font-medium text-white">{cat.name}</td>
                <td className="text-[#8BA3BF]">{cat.term_count ?? 0}</td>
                <td>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                      cat.is_active
                        ? 'border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.12)] text-[#34D399]'
                        : 'border-[rgba(100,116,139,0.3)] bg-[rgba(100,116,139,0.12)] text-[#94A3B8]'
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {cat.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEdit(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(0,140,255,0.2)] text-[#8BA3BF] transition-colors hover:border-[#008CFF] hover:text-[#00AAFF]"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <DeleteActionButton
                      action={deleteCategoryAction}
                      id={cat.id}
                      label=""
                      confirmMessage={'¿Seguro que deseas eliminar la categoría «' + cat.name + '»?'}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form */}
      <div className="h-fit rounded-xl border border-[rgba(0,140,255,0.15)] bg-[#081B32] p-5 lg:sticky lg:top-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            {isEdit ? (
              <>
                <Pencil size={15} className="text-[#00AAFF]" /> Editar categoría
              </>
            ) : (
              <>
                <PlusCircle size={15} className="text-[#00AAFF]" /> Nueva categoría
              </>
            )}
          </h3>
          {isEdit && (
            <button
              onClick={startNew}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4A6A8A] transition-colors hover:bg-[rgba(0,140,255,0.1)] hover:text-white"
              title="Cancelar edición"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={editing?.id} />}

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium text-[#9DD7FF]">
              Nombre *
            </label>
            <input
              id="name"
              name="name"
              key={'name-' + (editing?.id ?? 'new')}
              defaultValue={editing?.name ?? ''}
              required
              placeholder="e.g. Programación"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-medium text-[#9DD7FF]">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              key={'desc-' + (editing?.id ?? 'new')}
              defaultValue={editing?.description ?? ''}
              rows={2}
              placeholder="Describe la categoría"
              className="input-field resize-y"
            />
          </div>

          <input type="hidden" name="icon" value={icon} />
          <input type="hidden" name="color" value={color} />
          <input type="hidden" name="accent" value={accent} />
          <input
            type="hidden"
            name="is_active"
            value={editing?.is_active === false ? 'off' : 'on'}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#9DD7FF]">Icono</label>
            <div className="grid grid-cols-6 gap-1.5">
              {CATEGORY_ICON_OPTIONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border transition-all',
                    icon === iconName
                      ? 'border-[#008CFF] bg-[rgba(0,140,255,0.15)] text-[#00AAFF]'
                      : 'border-[rgba(0,140,255,0.15)] text-[#4A6A8A] hover:border-[rgba(0,140,255,0.4)] hover:text-white'
                  )}
                  title={iconName}
                >
                  <CategoryIcon icon={iconName} color="#00AAFF" size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#9DD7FF]">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => {
                    setColor(c.color);
                    setAccent(c.accent);
                  }}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition-all',
                    color === c.color
                      ? 'scale-110 border-white shadow-[0_0_10px_rgba(0,140,255,0.4)]'
                      : 'border-transparent hover:scale-110'
                  )}
                  style={{ background: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          {(state?.error || state?.success) && (
            <div
              className={cn(
                'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs',
                state.error
                  ? 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[#F87171]'
                  : 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] text-[#34D399]'
              )}
            >
              {state.success ? (
                <CheckCircle size={14} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
              )}
              {state.error ?? state.success}
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="btn-primary flex-1 justify-center text-sm"
            >
              {pending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={15} /> {isEdit ? 'Actualizar' : 'Crear categoría'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}