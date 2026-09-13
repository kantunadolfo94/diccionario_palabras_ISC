'use client';

import { useActionState } from 'react';
import { UserX, UserCheck, AlertCircle } from 'lucide-react';
import { updateUserRole, toggleUserActive } from '@/lib/actions';
import { withPrevState } from '@/lib/actions/formState';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UserRowActionsProps {
  user: Profile;
}

const initialState = { error: undefined as string | undefined, success: undefined };

export function UserRowActions({ user }: UserRowActionsProps) {
  const [roleState, roleAction, rolePending] = useActionState(
    withPrevState(updateUserRole),
    initialState
  );
  const [toggleState, toggleAction, togglePending] = useActionState(
    withPrevState(toggleUserActive),
    initialState
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <form action={roleAction} className="flex items-center gap-1.5">
          <input type="hidden" name="id" value={user.id} />
          <select
            name="role"
            defaultValue={user.role}
            disabled={rolePending}
            className={cn(
              'rounded-lg border bg-[#0A203A] px-2 py-1.5 text-xs font-semibold transition-colors focus:outline-none',
              user.role === 'admin'
                ? 'border-[rgba(0,140,255,0.3)] text-[#00AAFF]'
                : 'border-[rgba(139,163,191,0.3)] text-[#8BA3BF]'
            )}
          >
            <option value="admin">Admin</option>
            <option value="docente">Docente</option>
          </select>
          <button
            type="submit"
            disabled={rolePending}
            className="rounded-lg border border-[rgba(0,140,255,0.2)] px-2 py-1.5 text-xs font-semibold text-[#8BA3BF] transition-colors hover:border-[#008CFF] hover:text-[#00AAFF]"
          >
            {rolePending ? '...' : 'Guardar'}
          </button>
        </form>
      </div>

      <form
        action={toggleAction}
        onSubmit={(e) => {
          if (togglePending) return;
          if (!window.confirm(user.is_active ? `¿Desactivar a ${user.name}?` : `¿Activar a ${user.name}?`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={user.id} />
        <input type="hidden" name="is_active" value={String(user.is_active)} />
        <button
          type="submit"
          disabled={togglePending}
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline',
            user.is_active ? 'text-[#F87171]' : 'text-[#34D399]'
          )}
        >
          {user.is_active ? (
            <>
              <UserX size={12} /> Desactivar
            </>
          ) : (
            <>
              <UserCheck size={12} /> Activar
            </>
          )}
        </button>
      </form>

      {(roleState?.error || toggleState?.error) && (
        <span className="flex items-center gap-1 text-[11px] text-[#F87171]">
          <AlertCircle size={11} />
          {roleState.error ?? toggleState.error}
        </span>
      )}
    </div>
  );
}