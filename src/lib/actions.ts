'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { UserRole, Term } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/data';
import {
  mockStore,
  mockAddTerm,
  mockUpdateTerm,
  mockDeleteTerm,
  mockAddCategory,
  mockUpdateCategory,
  mockDeleteCategory,
  mockSetDailyWord,
  mockUnsetDailyWord,
  mockGenerateId,
} from '@/lib/data/mockStore';

const DEMO_ADMIN_EMAIL = 'admin@sysdict.test';
const DEMO_ADMIN_PASSWORD = 'admin123';
const DEMO_COOKIE = 'sysdict_demo_user';

export interface ActionResult {
  error?: string;
  success?: string;
}

// ============================================================
// Auth
// ============================================================
export async function login(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/admin').trim();

  if (!email || !password) {
    return { error: 'Ingresa tu correo y contraseña.' };
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: 'Credenciales incorrectas. Verifica tus datos e intenta de nuevo.' };
    }
    redirect(redirectTo.startsWith('/') ? redirectTo : '/admin');
  }

  // Modo demostración (Supabase no configurado)
  if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_COOKIE, 'admin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    redirect(redirectTo.startsWith('/') ? redirectTo : '/admin');
  }

  return { error: 'Credenciales incorrectas. Verifica tus datos e intenta de nuevo.' };
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    await supabase.auth.signOut();
  } else {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_COOKIE);
  }
  redirect('/login');
}

// ============================================================
// Authorization helper
// ============================================================
type AuthContext = {
  userId: string;
  role: UserRole;
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>> | null;
};

async function requireRole(
  roles: UserRole[] = ['admin', 'docente']
): Promise<AuthContext> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('No autorizado');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();
    if (!profile || !profile.is_active || !roles.includes(profile.role)) {
      throw new Error('Sin permisos suficientes');
    }
    return { userId: user.id, role: profile.role, supabase };
  }

  const cookieStore = await cookies();
  const demo = (await cookieStore.get(DEMO_COOKIE))?.value;
  if (demo !== 'admin') throw new Error('No autorizado');
  return { userId: 'demo-admin', role: 'admin', supabase: null };
}

async function logActivity(
  ctx: AuthContext,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  if (!ctx.supabase) return;
  try {
    await ctx.supabase.from('activity_logs').insert({
      user_id: ctx.userId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? {},
    });
  } catch {
    // logs are best-effort
  }
}

// ============================================================
// Terms CRUD
// ============================================================
function requiredString(formData: FormData, name: string): { value: string; error?: string } {
  const value = String(formData.get(name) ?? '').trim();
  if (!value) return { value: '', error: `El campo "${name}" es obligatorio.` };
  return { value };
}

export async function createTerm(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin', 'docente']);
    const en = requiredString(formData, 'english_word');
    const es = requiredString(formData, 'spanish_word');
    const def = requiredString(formData, 'definition');
    if (en.error || es.error || def.error) return { error: en.error || es.error || def.error };

    const category_id = String(formData.get('category_id') ?? '').trim() || null;
    const status = (String(formData.get('status') ?? 'published') || 'published') as Term['status'];
    const is_daily_word = formData.get('is_daily_word') === 'on';
    const relatedIds = formData
      .getAll('related_term_ids')
      .map((v) => String(v))
      .filter(Boolean);

    const payload = {
      english_word: en.value,
      spanish_word: es.value,
      definition: def.value,
      technical_definition: String(formData.get('technical_definition') ?? '').trim(),
      example: String(formData.get('example') ?? '').trim(),
      category_id,
      status,
      is_daily_word,
    };

    if (ctx.supabase) {
      const { data, error } = await ctx.supabase
        .from('terms')
        .insert({ ...payload, created_by: ctx.userId })
        .select('id')
        .single();
      if (error) {
        return { error: `Error al guardar el término: ${error.message}` };
      }
      const termId = data.id;
      if (relatedIds.length > 0) {
        await ctx.supabase.from('related_terms').insert(
          relatedIds
            .filter((rid) => rid !== termId)
            .map((rid) => ({ term_id: termId, related_term_id: rid }))
        );
      }
      if (is_daily_word) {
        await ctx.supabase
          .from('daily_words')
          .upsert({ term_id: termId, date: new Date().toISOString().slice(0, 10) });
      }
      await logActivity(ctx, 'create', 'term', termId, { english_word: en.value });
      revalidatePath('/admin/terminos');
      revalidatePath('/');
      revalidatePath('/buscar');
      redirect('/admin/terminos');
    }

    // Modo demostración
    const newId = mockGenerateId('trm');
    const catName = mockStore.categories.find((c) => c.id === category_id)?.name;
    mockAddTerm({
      id: newId,
      ...payload,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (is_daily_word) mockSetDailyWord(newId);
    revalidatePath('/admin/terminos');
    revalidatePath('/');
    revalidatePath('/buscar');
    if (catName) revalidatePath(`/categorias/${category_id}`);
    redirect('/admin/terminos');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al guardar el término.' };
  }
}

export async function updateTerm(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin', 'docente']);
    const id = String(formData.get('id') ?? '');
    const en = requiredString(formData, 'english_word');
    const es = requiredString(formData, 'spanish_word');
    if (en.error || es.error) return { error: en.error || es.error };
    const category_id = String(formData.get('category_id') ?? '').trim() || null;
    const status = (String(formData.get('status') ?? 'published') || 'published') as Term['status'];
    const is_daily_word = formData.get('is_daily_word') === 'on';
    const relatedIds = formData
      .getAll('related_term_ids')
      .map((v) => String(v))
      .filter(Boolean);

    const payload = {
      english_word: en.value,
      spanish_word: es.value,
      definition: String(formData.get('definition') ?? '').trim(),
      technical_definition: String(formData.get('technical_definition') ?? '').trim(),
      example: String(formData.get('example') ?? '').trim(),
      category_id,
      status,
      is_daily_word,
    };

    if (ctx.supabase) {
      const { error } = await ctx.supabase.from('terms').update(payload).eq('id', id);
      if (error) return { error: `Error al actualizar el término: ${error.message}` };
      await ctx.supabase.from('related_terms').delete().eq('term_id', id);
      if (relatedIds.length > 0) {
        await ctx.supabase.from('related_terms').insert(
          relatedIds
            .filter((rid) => rid !== id)
            .map((rid) => ({ term_id: id, related_term_id: rid }))
        );
      }
      if (is_daily_word) {
        await ctx.supabase
          .from('daily_words')
          .upsert({ term_id: id, date: new Date().toISOString().slice(0, 10) });
      }
      await logActivity(ctx, 'update', 'term', id, { english_word: en.value });
      revalidatePath('/admin/terminos');
      revalidatePath('/');
      revalidatePath('/buscar');
      revalidatePath(`/termino/${id}`);
      if (category_id) revalidatePath(`/categorias/${category_id}`);
      redirect('/admin/terminos');
    }

    mockUpdateTerm(id, payload);
    if (is_daily_word) mockSetDailyWord(id);
    else mockUnsetDailyWord(id);
    revalidatePath('/admin/terminos');
    revalidatePath('/');
    revalidatePath('/buscar');
    revalidatePath(`/termino/${id}`);
    if (category_id) revalidatePath(`/categorias/${category_id}`);
    redirect('/admin/terminos');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al actualizar el término.' };
  }
}

export async function deleteTerm(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const id = String(formData.get('id') ?? '');
    if (ctx.supabase) {
      const { error } = await ctx.supabase.from('terms').delete().eq('id', id);
      if (error) return { error: `Error al eliminar el término: ${error.message}` };
      await logActivity(ctx, 'delete', 'term', id, {});
      revalidatePath('/admin/terminos');
      revalidatePath('/');
      revalidatePath('/buscar');
      return { success: 'Término eliminado correctamente.' };
    }
    mockDeleteTerm(id);
    revalidatePath('/admin/terminos');
    revalidatePath('/');
    revalidatePath('/buscar');
    return { success: 'Término eliminado correctamente.' };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al eliminar el término.' };
  }
}

// ============================================================
// Categories CRUD
// ============================================================
export async function createCategory(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const name = requiredString(formData, 'name');
    if (name.error) return { error: name.error };
    const payload = {
      name: name.value,
      description: String(formData.get('description') ?? '').trim(),
      icon: String(formData.get('icon') ?? 'Code').trim() || 'Code',
      color: String(formData.get('color') ?? '#008CFF').trim() || '#008CFF',
      accent: String(formData.get('accent') ?? '#147EFF').trim() || '#147EFF',
      is_active: formData.get('is_active') !== 'off',
      sort_order: Number(formData.get('sort_order') ?? 0),
    };
    if (ctx.supabase) {
      const { data, error } = await ctx.supabase
        .from('categories')
        .insert(payload)
        .select('id')
        .single();
      if (error) return { error: `Error al crear la categoría: ${error.message}` };
      await logActivity(ctx, 'create', 'category', data.id, { name: name.value });
      revalidatePath('/admin/categorias');
      revalidatePath('/');
      revalidatePath('/categorias');
      redirect('/admin/categorias');
    }
    mockAddCategory({
      id: mockGenerateId('cat'),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    revalidatePath('/admin/categorias');
    revalidatePath('/');
    revalidatePath('/categorias');
    redirect('/admin/categorias');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al crear la categoría.' };
  }
}

export async function updateCategory(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const id = String(formData.get('id') ?? '');
    const name = requiredString(formData, 'name');
    if (name.error) return { error: name.error };
    const payload = {
      name: name.value,
      description: String(formData.get('description') ?? '').trim(),
      icon: String(formData.get('icon') ?? 'Code').trim() || 'Code',
      color: String(formData.get('color') ?? '#008CFF').trim() || '#008CFF',
      accent: String(formData.get('accent') ?? '#147EFF').trim() || '#147EFF',
      is_active: formData.get('is_active') !== 'off',
      sort_order: Number(formData.get('sort_order') ?? 0),
    };
    if (ctx.supabase) {
      const { error } = await ctx.supabase.from('categories').update(payload).eq('id', id);
      if (error) return { error: `Error al actualizar la categoría: ${error.message}` };
      await logActivity(ctx, 'update', 'category', id, { name: name.value });
      revalidatePath('/admin/categorias');
      revalidatePath('/');
      revalidatePath('/categorias');
      revalidatePath(`/categorias/${id}`);
      redirect('/admin/categorias');
    }
    mockUpdateCategory(id, payload);
    revalidatePath('/admin/categorias');
    revalidatePath('/');
    revalidatePath('/categorias');
    revalidatePath(`/categorias/${id}`);
    redirect('/admin/categorias');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al actualizar la categoría.' };
  }
}

export async function deleteCategory(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const id = String(formData.get('id') ?? '');
    if (ctx.supabase) {
      const { error } = await ctx.supabase.from('categories').delete().eq('id', id);
      if (error) return { error: `Error al eliminar la categoría: ${error.message}` };
      await logActivity(ctx, 'delete', 'category', id, {});
      revalidatePath('/admin/categorias');
      revalidatePath('/');
      revalidatePath('/categorias');
      return { success: 'Categoría eliminada correctamente.' };
    }
    mockDeleteCategory(id);
    revalidatePath('/admin/categorias');
    revalidatePath('/');
    revalidatePath('/categorias');
    return { success: 'Categoría eliminada correctamente.' };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al eliminar la categoría.' };
  }
}

// ============================================================
// Daily word
// ============================================================
export async function setDailyWord(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const termId = String(formData.get('term_id') ?? '');
    const date = String(formData.get('date') ?? '').trim();
    if (!termId) return { error: 'Selecciona un término.' };
    if (ctx.supabase) {
      const { error } = await ctx.supabase
        .from('daily_words')
        .upsert({ term_id: termId, date: date || new Date().toISOString().slice(0, 10) });
      if (error) return { error: `Error al asignar la palabra del día: ${error.message}` };
      await logActivity(ctx, 'set_daily_word', 'daily_word', termId, { date });
      revalidatePath('/admin/palabra-del-dia');
      revalidatePath('/');
      return { success: 'Palabra del día asignada.' };
    }
    mockSetDailyWord(termId);
    revalidatePath('/admin/palabra-del-dia');
    revalidatePath('/');
    return { success: 'Palabra del día asignada. (modo demostración)' };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al asignar la palabra del día.' };
  }
}

// ============================================================
// Users (admin only)
// ============================================================
export async function updateUserRole(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const id = String(formData.get('id') ?? '');
    const role = String(formData.get('role') ?? '');
    if (!['admin', 'docente'].includes(role)) return { error: 'Rol inválido.' };
    if (id === ctx.userId && role !== 'admin') {
      return { error: 'No puedes quitarte el rol de administrador a ti mismo.' };
    }
    if (ctx.supabase) {
      const { error } = await ctx.supabase.from('profiles').update({ role }).eq('id', id);
      if (error) return { error: `Error al actualizar el rol: ${error.message}` };
      await logActivity(ctx, 'update_role', 'profile', id, { role });
      revalidatePath('/admin/usuarios');
      return { success: 'Rol actualizado.' };
    }
    revalidatePath('/admin/usuarios');
    return { success: 'Rol actualizado. (modo demostración)' };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al actualizar el rol.' };
  }
}

export async function toggleUserActive(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const id = String(formData.get('id') ?? '');
    const isActive = formData.get('is_active') === 'true';
    if (id === ctx.userId) return { error: 'No puedes desactivar tu propia cuenta.' };
    if (ctx.supabase) {
      const { error } = await ctx.supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) return { error: `Error al actualizar el usuario: ${error.message}` };
      await logActivity(ctx, isActive ? 'deactivate_user' : 'activate_user', 'profile', id, {});
      revalidatePath('/admin/usuarios');
      return { success: isActive ? 'Usuario activado.' : 'Usuario desactivado.' };
    }
    revalidatePath('/admin/usuarios');
    return { success: isActive ? 'Usuario activado. (modo demostración)' : 'Usuario desactivado. (modo demostración)' };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: (err as Error).message || 'Error al actualizar el usuario.' };
  }
}

// ============================================================
// Helper
// ============================================================
function isRedirectError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof (err as { digest?: string }).digest === 'string' &&
    (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}