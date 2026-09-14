// ============================================================
// Turso (libsql) database access
// ============================================================
import { createClient, type Client } from '@libsql/client';

const DATABASE_URL_KEY = 'TURSO_DATABASE_URL';
const AUTH_TOKEN_KEY = 'TURSO_AUTH_TOKEN';

export function isDbConfigured(): boolean {
  const url = process.env[DATABASE_URL_KEY];
  return Boolean(
    url &&
      !url.includes('TU_') &&
      !url.includes('TU_URL') &&
      process.env[AUTH_TOKEN_KEY] &&
      !process.env[AUTH_TOKEN_KEY].includes('TU_')
  );
}

type DbGlobal = { __sysdictDb?: Client };

export function getDb(): Client {
  if (!isDbConfigured()) {
    throw new Error(
      'Turso no está configurado. Define TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env.local'
    );
  }
  const g = globalThis as unknown as DbGlobal;
  if (!g.__sysdictDb) {
    g.__sysdictDb = createClient({
      url: process.env[DATABASE_URL_KEY]!,
      authToken: process.env[AUTH_TOKEN_KEY],
    });
  }
  return g.__sysdictDb;
}

// ============================================================
// Row value helpers (libsql returns null | number | bigint | string | ArrayBuffer)
// ============================================================
export type SqlRow = Record<string, unknown>;

export function toStr(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (value instanceof ArrayBuffer) return Buffer.from(value).toString('utf8');
  return String(value);
}

export function toNum(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value instanceof ArrayBuffer) return Number(Buffer.from(value).toString('utf8')) || 0;
  return Number(value ?? 0) || 0;
}

export function toBool(value: unknown): boolean {
  return value === 1 || value === true || value === '1';
}