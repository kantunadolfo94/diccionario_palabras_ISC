-- ============================================================
-- SysDictionary - Turso (SQLite) Schema
-- Ejecutar con: node scripts/turso-setup.mjs
-- ============================================================

PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. USERS (autenticación propia de la app)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'docente' CHECK (role IN ('admin', 'docente')),
  avatar_url    TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
-- 2. SESSIONS (cookie de sesión)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT NOT NULL
);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'Code',
  color       TEXT NOT NULL DEFAULT '#008CFF',
  accent      TEXT NOT NULL DEFAULT '#147EFF',
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
-- 4. TERMS
-- ============================================================
CREATE TABLE IF NOT EXISTS terms (
  id                   TEXT PRIMARY KEY,
  english_word         TEXT NOT NULL,
  spanish_word         TEXT NOT NULL,
  definition           TEXT NOT NULL DEFAULT '',
  technical_definition TEXT NOT NULL DEFAULT '',
  example              TEXT NOT NULL DEFAULT '',
  category_id          TEXT REFERENCES categories(id) ON DELETE SET NULL,
  created_by           TEXT REFERENCES users(id) ON DELETE SET NULL,
  status               TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'pending')),
  is_daily_word        INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
-- 5. RELATED TERMS
-- ============================================================
CREATE TABLE IF NOT EXISTS related_terms (
  id              TEXT PRIMARY KEY,
  term_id         TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  related_term_id TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (term_id, related_term_id),
  CHECK (term_id != related_term_id)
);

-- ============================================================
-- 6. DAILY WORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_words (
  id         TEXT PRIMARY KEY,
  term_id    TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  date       TEXT NOT NULL UNIQUE,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
-- 7. ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT '',
  entity_id   TEXT,
  details     TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry  ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_terms_english    ON terms(lower(english_word));
CREATE INDEX IF NOT EXISTS idx_terms_spanish    ON terms(lower(spanish_word));
CREATE INDEX IF NOT EXISTS idx_terms_category   ON terms(category_id);
CREATE INDEX IF NOT EXISTS idx_terms_status     ON terms(status);
CREATE INDEX IF NOT EXISTS idx_related_term_id  ON related_terms(term_id);
CREATE INDEX IF NOT EXISTS idx_daily_words_date ON daily_words(date);