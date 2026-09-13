import type {
  Category,
  Term,
  RelatedTerm,
  AdminStats,
  Profile,
  ActivityLog,
  TermWithCategory,
} from '@/lib/types';
import {
  MOCK_TERMS,
  MOCK_RELATED,
} from '@/lib/data/mockData';
import { mockStore } from '@/lib/data/mockStore';

// ============================================================
// Config detection
// ============================================================
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('TU_PROYECTO') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('TU_ANON_KEY')
  );
}

function resolveRelated(termId: string, source: Term[]): Term[] {
  const ids = MOCK_RELATED[termId] ?? [];
  return ids
    .map((id) => source.find((t) => t.id === id))
    .filter((t): t is Term => Boolean(t));
}

// ============================================================
// Public data access (works with Supabase or mock fallback)
// ============================================================
export async function getSupabase() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

export async function fetchCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('categories')
        .select('*, terms:terms(count)')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data ?? []).map((c) => ({
        ...c,
        term_count: (c.terms as { count: number }[] | undefined)?.length ?? 0,
      }));
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('terms_with_category')
        .select('*')
        .order('english_word');
      if (error) throw error;
      if (data && data.length > 0) {
        const categories = await fetchCategories();
        return (data as TermWithCategory[]).map((t) => ({
          id: t.id,
          english_word: t.english_word,
          spanish_word: t.spanish_word,
          definition: t.definition,
          technical_definition: t.technical_definition,
          example: t.example,
          category_id: t.category_id,
          created_by: t.created_by,
          status: t.status ?? 'published',
          is_daily_word: t.is_daily_word,
          created_at: t.created_at,
          updated_at: t.updated_at,
          category: categories.find((c) => c.id === t.category_id) ?? null,
        }));
      }
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
    related_terms: resolveRelated(id, terms).map((rt): RelatedTerm => ({
      id: `rel-${base.id}-${rt.id}`,
      term_id: base.id,
      related_term_id: rt.id,
      related_term: rt,
    })),
  };
}

export async function fetchRelatedTerms(termId: string): Promise<Term[]> {
  const terms = await fetchTerms();
  return resolveRelated(termId, terms);
}

export async function fetchDailyWord(): Promise<Term | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('daily_words')
        .select('*, term:terms(*)')
        .eq('date', new Date().toISOString().slice(0, 10))
        .single();
      if (error) throw error;
      if (data?.term) {
        const category = await fetchCategories();
        return {
          ...(data.term as Term),
          category:
            category.find((c) => c.id === (data.term as Term).category_id) ??
            null,
        };
      }
    } catch {
      // fallback
    }
  }
  const daily = MOCK_TERMS.find((t) => t.id === 'trm-006')!;
  const terms = await fetchTerms();
  const targetId = mockStore.dailyWordIds[0] ?? daily.id;
  const selected = terms.find((t) => t.id === targetId) ?? daily;
  return {
    ...selected,
    related_terms: resolveRelated(selected.id, terms).map((rt): RelatedTerm => ({
      id: `rel-${selected.id}-${rt.id}`,
      term_id: selected.id,
      related_term_id: rt.id,
      related_term: rt,
    })),
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

export async function fetchAdminStats(): Promise<AdminStats> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabase();
      const [terms, categories, recent, docentes, pending] = await Promise.all([
        supabase
          .from('terms')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase
          .from('terms')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'docente')
          .eq('is_active', true),
        supabase
          .from('terms')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);
      return {
        total_terms: terms.count ?? 0,
        total_categories: categories.count ?? 0,
        recent_terms: recent.count ?? 0,
        total_docentes: docentes.count ?? 0,
        pending_terms: pending.count ?? 0,
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('terms')
        .select('*, category:categories(name, icon, color), author:profiles(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Term[];
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data ?? []) as Category[];
    } catch {
      // fallback
    }
  }
  return mockStore.categories.map((c) => ({ ...c, term_count: 0 }));
}

export async function fetchProfiles(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    } catch {
      // fallback
    }
  }
  return [];
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, user:profiles(name, email)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as ActivityLog[];
    } catch {
      // fallback
    }
  }
  return [];
}

export async function fetchAllTermsForForm(): Promise<Term[]> {
  const terms = await fetchTerms();
  return terms.map((t) => ({
    ...t,
    related_terms: resolveRelated(t.id, terms).map((rt): RelatedTerm => ({
      id: `rel-${t.id}-${rt.id}`,
      term_id: t.id,
      related_term_id: rt.id,
      related_term: rt,
    })),
  }));
}