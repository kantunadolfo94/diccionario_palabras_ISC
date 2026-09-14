import type {
  Category,
  Term,
  RelatedTerm,
  AdminStats,
  Profile,
  ActivityLog,
} from '@/lib/types';
import { MOCK_RELATED } from '@/lib/data/mockData';
import { mockStore } from '@/lib/data/mockStore';
import {
  getDb,
  isDbConfigured,
  toBool,
  toNum,
  toStr,
  type SqlRow,
} from '@/lib/db';

export { isDbConfigured };

// ============================================================
// Row -> entity mappers
// ============================================================
function mapCategoryRow(row: SqlRow): Category {
  return {
    id: toStr(row.id),
    name: toStr(row.name),
    description: toStr(row.description),
    icon: toStr(row.icon),
    color: toStr(row.color),
    accent: toStr(row.accent),
    is_active: toBool(row.is_active),
    sort_order: toNum(row.sort_order),
    created_at: toStr(row.created_at),
    updated_at: toStr(row.updated_at),
    term_count: row.term_count != null ? toNum(row.term_count) : undefined,
  };
}

function mapTermRow(row: SqlRow, categories: Map<string, Category>): Term {
  const categoryId = row.category_id ? toStr(row.category_id) : null;
  return {
    id: toStr(row.id),
    english_word: toStr(row.english_word),
    spanish_word: toStr(row.spanish_word),
    definition: toStr(row.definition),
    technical_definition: toStr(row.technical_definition),
    example: toStr(row.example),
    category_id: categoryId,
    created_by: row.created_by ? toStr(row.created_by) : null,
    status: (row.status === 'pending' || row.status === 'draft' ? row.status : 'published'),
    is_daily_word: toBool(row.is_daily_word),
    created_at: toStr(row.created_at),
    updated_at: toStr(row.updated_at),
    category: categoryId ? categories.get(categoryId) ?? null : null,
    related_terms: undefined,
  };
}

async function categoriesMap(): Promise<Map<string, Category>> {
  const { rows } = await getDb().execute('SELECT * FROM categories');
  return new Map(rows.map((r) => [toStr(r.id), mapCategoryRow(r)]));
}

async function relatedIdsFor(termId: string): Promise<string[]> {
  if (!isDbConfigured()) return MOCK_RELATED[termId] ?? [];
  try {
    const { rows } = await getDb().execute({
      sql: 'SELECT related_term_id FROM related_terms WHERE term_id = ?',
      args: [termId],
    });
    return rows.map((r) => toStr(r.related_term_id));
  } catch {
    return [];
  }
}

async function resolveRelated(termId: string, source: Term[]): Promise<RelatedTerm[]> {
  const ids = await relatedIdsFor(termId);
  const result: RelatedTerm[] = [];
  for (const relatedTermId of ids) {
    const related = source.find((t) => t.id === relatedTermId);
    if (!related) continue;
    result.push({
      id: `rel-${termId}-${relatedTermId}`,
      term_id: termId,
      related_term_id: relatedTermId,
      related_term: related,
    });
  }
  return result;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

// ============================================================
// Public data access (Turso / libsql or mock fallback)
// ============================================================
export async function fetchCategories(): Promise<Category[]> {
  if (isDbConfigured()) {
    try {
      const { rows } = await getDb().execute(
        `SELECT c.*,
          (SELECT COUNT(*) FROM terms t WHERE t.category_id = c.id AND t.status = 'published') AS term_count
         FROM categories c
         WHERE c.is_active = 1
         ORDER BY c.sort_order ASC, c.name COLLATE NOCASE ASC`
      );
      return rows.map(mapCategoryRow);
    } catch {
      // fallback to mock
    }
  }
  return mockStore.categories.map((c) => ({
    ...c,
    term_count: mockStore.terms.filter(
      (t) => t.category_id === c.id && t.status === 'published'
    ).length,
  }));
}

export async function fetchTerms(): Promise<Term[]> {
  if (isDbConfigured()) {
    try {
      const [{ rows }, cats] = await Promise.all([
        getDb().execute('SELECT * FROM terms ORDER BY lower(english_word) ASC'),
        categoriesMap(),
      ]);
      return rows.map((r) => mapTermRow(r, cats));
    } catch {
      // fallback
    }
  }
  return mockStore.terms.map((t) => ({
    ...t,
    category:
      mockStore.categories.find((c) => c.id === t.category_id) ?? null,
    related_terms: undefined,
  }));
}

export async function fetchTermById(id: string): Promise<Term | null> {
  const terms = await fetchTerms();
  const base = terms.find((t) => t.id === id) ?? null;
  if (!base) return null;
  return {
    ...base,
    related_terms: await resolveRelated(id, terms),
  };
}

export async function fetchRelatedTerms(termId: string): Promise<Term[]> {
  const terms = await fetchTerms();
  const ids = await relatedIdsFor(termId);
  return ids
    .map((id) => terms.find((t) => t.id === id))
    .filter((t): t is Term => Boolean(t));
}

export async function fetchDailyWord(): Promise<Term | null> {
  let targetId: string | null = null;
  if (isDbConfigured()) {
    try {
      const { rows } = await getDb().execute({
        sql: 'SELECT term_id FROM daily_words WHERE date = ? ORDER BY created_at DESC LIMIT 1',
        args: [todayIso()],
      });
      if (rows.length) targetId = toStr(rows[0].term_id);
    } catch {
      // fallback
    }
  }
  const terms = await fetchTerms();
  const seedFallback = 'trm-006-prog-0000-000000000006';
  const id =
    targetId ??
    (terms.some((t) => t.id === seedFallback) ? seedFallback : terms[0]?.id);
  const selected = terms.find((t) => t.id === id) ?? null;
  if (!selected) return null;
  return {
    ...selected,
    related_terms: await resolveRelated(selected.id, terms),
  };
}

export async function searchTerms(query: string): Promise<Term[]> {
  const terms = await fetchTerms();
  const q = query.trim().toLowerCase();
  if (!q) return terms;
  return terms.filter((t) =>
    [
      t.english_word,
      t.spanish_word,
      t.definition,
      t.technical_definition,
      t.category?.name ?? '',
      t.example,
    ].some((field) => field.toLowerCase().includes(q))
  );
}

export async function fetchTermsByCategory(categoryId: string): Promise<Term[]> {
  const terms = await fetchTerms();
  return terms.filter((t) => t.category_id === categoryId);
}

// ============================================================
// Admin data access
// ============================================================
export async function fetchAdminStats(): Promise<AdminStats> {
  if (isDbConfigured()) {
    try {
      const db = getDb();
      const [terms, categories, recent, docentes, pending] = await Promise.all([
        db.execute("SELECT COUNT(*) AS n FROM terms WHERE status = 'published'"),
        db.execute('SELECT COUNT(*) AS n FROM categories'),
        db.execute({
          sql: 'SELECT COUNT(*) AS n FROM terms WHERE created_at >= ?',
          args: [new Date(Date.now() - 7 * 86400000).toISOString()],
        }),
        db.execute("SELECT COUNT(*) AS n FROM users WHERE role = 'docente' AND is_active = 1"),
        db.execute("SELECT COUNT(*) AS n FROM terms WHERE status = 'pending'"),
      ]);
      return {
        total_terms: toNum(terms.rows[0].n),
        total_categories: toNum(categories.rows[0].n),
        recent_terms: toNum(recent.rows[0].n),
        total_docentes: toNum(docentes.rows[0].n),
        pending_terms: toNum(pending.rows[0].n),
      };
    } catch {
      // fallback
    }
  }
  return {
    total_terms: mockStore.terms.filter((t) => t.status === 'published').length,
    total_categories: mockStore.categories.length,
    recent_terms: Math.min(mockStore.terms.length, 4),
    total_docentes: 0,
    pending_terms: mockStore.terms.filter((t) => t.status === 'pending').length,
  };
}

export async function fetchAdminTerms(): Promise<Term[]> {
  if (isDbConfigured()) {
    try {
      const db = getDb();
      const [{ rows }, cats] = await Promise.all([
        db.execute(
          `SELECT t.*, u.name AS author_name
           FROM terms t
           LEFT JOIN users u ON u.id = t.created_by
           ORDER BY t.created_at DESC`
        ),
        categoriesMap(),
      ]);
      return rows.map((r) => {
        const term = mapTermRow(r, cats);
        const authorId = r.created_by ? toStr(r.created_by) : null;
        const termAuthor: Profile | undefined = authorId
          ? {
              id: authorId,
              name: toStr(r.author_name),
              email: '',
              role: 'admin',
              avatar_url: null,
              is_active: true,
              created_at: '',
              updated_at: '',
            }
          : undefined;
        return { ...term, author: termAuthor };
      });
    } catch {
      // fallback
    }
  }
  return mockStore.terms.map((t) => ({
    ...t,
    category:
      mockStore.categories.find((c) => c.id === t.category_id) ?? null,
  }));
}

export async function fetchAdminCategories(): Promise<Category[]> {
  if (isDbConfigured()) {
    try {
      const { rows } = await getDb().execute(
        `SELECT c.*,
          (SELECT COUNT(*) FROM terms t WHERE t.category_id = c.id) AS term_count
         FROM categories c
         ORDER BY c.sort_order ASC, c.name COLLATE NOCASE ASC`
      );
      return rows.map(mapCategoryRow);
    } catch {
      // fallback
    }
  }
  return mockStore.categories.map((c) => ({ ...c, term_count: 0 }));
}

export async function fetchProfiles(): Promise<Profile[]> {
  if (isDbConfigured()) {
    try {
      const { rows } = await getDb().execute(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      return rows.map((r) => ({
        id: toStr(r.id),
        name: toStr(r.name),
        email: toStr(r.email),
        role: (r.role === 'admin' ? 'admin' : 'docente') as Profile['role'],
        avatar_url: r.avatar_url ? toStr(r.avatar_url) : null,
        is_active: toBool(r.is_active),
        created_at: toStr(r.created_at),
        updated_at: toStr(r.updated_at),
      }));
    } catch {
      // fallback
    }
  }
  return [];
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  if (isDbConfigured()) {
    try {
      const { rows } = await getDb().execute(
        `SELECT l.*, u.name AS user_name, u.email AS user_email
         FROM activity_logs l
         LEFT JOIN users u ON u.id = l.user_id
         ORDER BY l.created_at DESC
         LIMIT 50`
      );
      return rows.map((r) => {
        let details: Record<string, unknown> = {};
        try {
          details = JSON.parse(toStr(r.details) || '{}');
        } catch {
          details = {};
        }
        const userId = r.user_id ? toStr(r.user_id) : null;
        return {
          id: toStr(r.id),
          user_id: userId,
          action: toStr(r.action),
          entity_type: toStr(r.entity_type),
          entity_id: r.entity_id ? toStr(r.entity_id) : null,
          details,
          created_at: toStr(r.created_at),
          user: userId
            ? {
                id: userId,
                name: toStr(r.user_name),
                email: toStr(r.user_email),
                role: 'admin',
                avatar_url: null,
                is_active: true,
                created_at: '',
                updated_at: '',
              }
            : undefined,
        };
      });
    } catch {
      // fallback
    }
  }
  return [];
}

export async function fetchAllTermsForForm(): Promise<Term[]> {
  const terms = await fetchTerms();
  return Promise.all(
    terms.map(async (t) => ({
      ...t,
      related_terms: await resolveRelated(t.id, terms),
    }))
  );
}