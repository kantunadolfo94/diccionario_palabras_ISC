'use client';

import { useActionState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { ActionResult } from '@/lib/actions';
import { withPrevState } from '@/lib/actions/formState';

interface DeleteActionButtonProps {
  action: (formData: FormData) => Promise<ActionResult>;
  id: string;
  label?: string;
  confirmMessage?: string;
}

const initialState: ActionResult = { error: undefined, success: undefined };

export function DeleteActionButton({
  action,
  id,
  label = 'Eliminar',
  confirmMessage = '¿Seguro que deseas eliminar este elemento? Esta acción no se puede deshacer.',
}: DeleteActionButtonProps) {
  const [state, formAction, pending] = useActionState(withPrevState(action), initialState);

  return (
    <div className="inline-flex items-center gap-2">
      <form
        action={formAction}
        onSubmit={(e) => {
          if (pending) {
            e.preventDefault();
            return;
          }
          if (!window.confirm(confirmMessage)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={pending}
          className="btn-danger inline-flex items-center gap-1.5"
        >
          <Trash2 size={13} />
          {label}
        </button>
      </form>
      {state?.error && (
        <span className="flex items-center gap-1 text-xs text-[#F87171]" title={state.error}>
          <AlertTriangle size={12} />
        </span>
      )}
    </div>
  );
}