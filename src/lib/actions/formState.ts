import type { ActionResult } from '@/lib/actions';

export function withPrevState(
  action: (formData: FormData) => Promise<ActionResult>
) {
  return (_prevState: ActionResult, formData: FormData): Promise<ActionResult> =>
    action(formData);
}