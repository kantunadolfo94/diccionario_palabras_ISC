// ============================================================
// Autenticación propia (Turso no incluye auth)
// - passwords con scrypt (node:crypto), formato "salt:hash" en hex
// - sesiones en tabla `sessions` + cookie httpOnly
// ============================================================
import { cookies } from 'next/headers';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { getDb, toBool, toStr, type SqlRow } from '@/lib/db';
import type { Profile, UserRole } from '@/lib/types';

export const SESSION_COOKIE = 'sysdict_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

// ============================================================
// Password hashing
// ============================================================
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function mapUserFromRow(row: SqlRow): Profile {
  return {
    id: toStr(row.id),
    name: toStr(row.name),
    email: toStr(row.email),
    role: (row.role === 'admin' ? 'admin' : 'docente') as UserRole,
    avatar_url: row.avatar_url ? toStr(row.avatar_url) : null,
    is_active: toBool(row.is_active),
    created_at: toStr(row.created_at),
    updated_at: toStr(row.updated_at),
  };
}

// ============================================================
// Sessions
// ============================================================
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  await getDb().execute({
    sql: 'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, userId, expiresAt],
  });
  return token;
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = (await cookieStore.get(SESSION_COOKIE))?.value;
  if (!token) return null;
  try {
    const { rows } = await getDb().execute({
      sql: 'SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?',
      args: [token, new Date().toISOString()],
    });
    return rows.length ? toStr(rows[0].user_id) : null;
  } catch {
    return null;
  }
}

export async function getUserFromCookie(): Promise<Profile | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  try {
    const { rows } = await getDb().execute({
      sql: 'SELECT * FROM users WHERE id = ? AND is_active = 1',
      args: [userId],
    });
    return rows.length ? mapUserFromRow(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = (await cookieStore.get(SESSION_COOKIE))?.value;
  if (token) {
    try {
      await getDb().execute({
        sql: 'DELETE FROM sessions WHERE id = ?',
        args: [token],
      });
    } catch {
      // best-effort
    }
  }
  cookieStore.delete(SESSION_COOKIE);
}