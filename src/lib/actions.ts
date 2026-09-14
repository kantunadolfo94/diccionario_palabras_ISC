'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import type { UserRole, Term } from '@/lib/types';
import {
  isDbConfigured,
  getDb,
  toBool,
  toStr,
  type SqlRow,
} from '@/lib/db';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
  createSession,
  deleteSession,
  getUserFromCookie,
} from '@/lib/auth';
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

const todayIso = () => new Date().toISOString().slice(0, 10);

function mapUserRow(row: SqlRow): {
  id: string;
  name: string;
  role: UserRole;
  is_active: boolean;
} {
  return {
    id: toStr(row.id),
    name: toStr(row.name),
    role: (row.role === 'admin' ? 'admin' : 'docente') as UserRole,
    is_active: toBool(row.is_active),
  };
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

  if (isDbConfigured()) {
    try {
      const { rows } = await getDb().execute({
        sql: 'SELECT * FROM users WHERE lower(email) = ? LIMIT 1',
        args: [email],
      });
      const userRow = rows[0];
      const valid = Boolean(
        userRow && verifyPassword(password, toStr(userRow.password_hash))
      );
      if (!valid) {
        return { error: 'Credenciales incorrectas. Verifica tus datos e intenta de nuevo.' };
      }
      const user = mapUserRow(userRow);
      if (!user.is_active) {
        return { error: 'Tu cuenta está desactivada. Contacta al administrador.' };
      }
      const sessionToken = await createSession(user.id);
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });
      await insertActivityLog(user.id, 'login', 'auth', null, { email });
      redirect(redirectTo.startsWith('/') ? redirectTo : '/admin');
    } catch (err) {
      if (isRedirectError(err)) throw err;
      return { error: 'No se pudo iniciar sesión. Intenta de nuevo.' };
    }
  }

  // Modo demostración (Turso no configurado)
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
  if (isDbConfigured()) {
    await deleteSession();
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
};

async function requireRole(
  roles: UserRole[] = ['admin', 'docente']
): Promise<AuthContext> {
  if (isDbConfigured()) {
    const user = await getUserFromCookie();
    if (!user || !user.is_active || !roles.includes(user.role)) {
      throw new Error('No autorizado');
    }
    return { userId: user.id, role: user.role };
  }

  const cookieStore = await cookies();
  const demo = (await cookieStore.get(DEMO_COOKIE))?.value;
  if (demo !== 'admin') throw new Error('No autorizado');
  return { userId: 'demo-admin', role: 'admin' };
}

async function insertActivityLog(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await getDb().execute({
      sql: 'INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      args: [
        randomUUID(),
        userId,
        action,
        entityType,
        entityId ?? null,
        JSON.stringify(details ?? {}),
      ],
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

    if (isDbConfigured()) {
      const termId = randomUUID();
      await getDb().execute({
        sql: `INSERT INTO terms
                (id, english_word, spanish_word, definition, technical_definition, example, category_id, created_by, status, is_daily_word)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          termId,
          payload.english_word,
          payload.spanish_word,
          payload.definition,
          payload.technical_definition,
          payload.example,
          payload.category_id,
          ctx.userId,
          payload.status,
          payload.is_daily_word ? 1 : 0,
        ],
      });
      for (const rid of relatedIds) {
        if (rid === termId) continue;
        await getDb().execute({
          sql: 'INSERT INTO related_terms (id, term_id, related_term_id) VALUES (?, ?, ?)',
          args: [randomUUID(), termId, rid],
        });
      }
      if (is_daily_word) {
        await upsertDailyWord(termId, todayIso());
      }
      await insertActivityLog(ctx.userId, 'create', 'term', termId, { english_word: en.value });
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

    if (isDbConfigured()) {
      await getDb().execute({
        sql: `UPDATE terms SET
                english_word = ?, spanish_word = ?, definition = ?, technical_definition = ?, example = ?,
                category_id = ?, status = ?, is_daily_word = ?,
                updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
              WHERE id = ?`,
        args: [
          payload.english_word,
          payload.spanish_word,
          payload.definition,
          payload.technical_definition,
          payload.example,
          payload.category_id,
          payload.status,
          payload.is_daily_word ? 1 : 0,
          id,
        ],
      });
      await getDb().execute({
        sql: 'DELETE FROM related_terms WHERE term_id = ?',
        args: [id],
      });
      for (const rid of relatedIds) {
        if (rid === id) continue;
        await getDb().execute({
          sql: 'INSERT INTO related_terms (id, term_id, related_term_id) VALUES (?, ?, ?)',
          args: [randomUUID(), id, rid],
        });
      }
      if (is_daily_word) {
        await upsertDailyWord(id, todayIso());
      } else {
        await getDb().execute({
          sql: 'DELETE FROM daily_words WHERE term_id = ? AND date = ?',
          args: [id, todayIso()],
        });
      }
      await insertActivityLog(ctx.userId, 'update', 'term', id, { english_word: en.value });
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
    if (isDbConfigured()) {
      await getDb().execute({
        sql: 'DELETE FROM terms WHERE id = ?',
        args: [id],
      });
      await insertActivityLog(ctx.userId, 'delete', 'term', id, {});
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
function readCategoryPayload(formData: FormData) {
  const name = requiredString(formData, 'name');
  return {
    name,
    payload: {
      description: String(formData.get('description') ?? '').trim(),
      icon: String(formData.get('icon') ?? 'Code').trim() || 'Code',
      color: String(formData.get('color') ?? '#008CFF').trim() || '#008CFF',
      accent: String(formData.get('accent') ?? '#147EFF').trim() || '#147EFF',
      is_active: formData.get('is_active') !== 'off',
      sort_order: Number(formData.get('sort_order') ?? 0),
    },
  };
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const { name, payload } = readCategoryPayload(formData);
    if (name.error) return { error: name.error };
    if (isDbConfigured()) {
      const id = randomUUID();
      await getDb().execute({
        sql: 'INSERT INTO categories (id, name, description, icon, color, accent, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          id,
          name.value,
          payload.description,
          payload.icon,
          payload.color,
          payload.accent,
          payload.is_active ? 1 : 0,
          payload.sort_order,
        ],
      });
      await insertActivityLog(ctx.userId, 'create', 'category', id, { name: name.value });
      revalidatePath('/admin/categorias');
      revalidatePath('/');
      revalidatePath('/categorias');
      redirect('/admin/categorias');
    }
    mockAddCategory({
      id: mockGenerateId('cat'),
      name: name.value,
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
    const { name, payload } = readCategoryPayload(formData);
    if (name.error) return { error: name.error };
    if (isDbConfigured()) {
      await getDb().execute({
        sql: `UPDATE categories SET
                name = ?, description = ?, icon = ?, color = ?, accent = ?, is_active = ?, sort_order = ?,
                updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
              WHERE id = ?`,
        args: [
          name.value,
          payload.description,
          payload.icon,
          payload.color,
          payload.accent,
          payload.is_active ? 1 : 0,
          payload.sort_order,
          id,
        ],
      });
      await insertActivityLog(ctx.userId, 'update', 'category', id, { name: name.value });
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
    if (isDbConfigured()) {
      await getDb().execute({
        sql: 'DELETE FROM categories WHERE id = ?',
        args: [id],
      });
      await insertActivityLog(ctx.userId, 'delete', 'category', id, {});
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
async function upsertDailyWord(termId: string, date: string): Promise<void> {
  await getDb().execute({
    sql: `INSERT INTO daily_words (id, term_id, date) VALUES (?, ?, ?)
          ON CONFLICT(date) DO UPDATE SET term_id = excluded.term_id`,
    args: [randomUUID(), termId, date],
  });
}

export async function setDailyWord(formData: FormData): Promise<ActionResult> {
  try {
    const ctx = await requireRole(['admin']);
    const termId = String(formData.get('term_id') ?? '');
    const date = String(formData.get('date') ?? '').trim();
    if (!termId) return { error: 'Selecciona un término.' };
    if (isDbConfigured()) {
      await upsertDailyWord(termId, date || todayIso());
      await insertActivityLog(ctx.userId, 'set_daily_word', 'daily_word', termId, { date });
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
    if (isDbConfigured()) {
      await getDb().execute({
        sql: "UPDATE users SET role = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        args: [role, id],
      });
      await insertActivityLog(ctx.userId, 'update_role', 'profile', id, { role });
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
    if (isDbConfigured()) {
      await getDb().execute({
        sql: "UPDATE users SET is_active = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        args: [isActive ? 1 : 0, id],
      });
      await insertActivityLog(ctx.userId, isActive ? 'deactivate_user' : 'activate_user', 'profile', id, {});
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