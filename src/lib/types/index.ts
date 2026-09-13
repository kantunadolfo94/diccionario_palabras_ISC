// ============================================================
// Types - SysDictionary
// ============================================================

export type UserRole = 'admin' | 'docente';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  accent: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  term_count?: number;
}

export interface Term {
  id: string;
  english_word: string;
  spanish_word: string;
  definition: string;
  technical_definition: string;
  example: string;
  category_id: string | null;
  created_by: string | null;
  status: 'published' | 'draft' | 'pending';
  is_daily_word: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category | null;
  related_terms?: RelatedTerm[];
  author?: Profile;
}

export interface TermWithCategory extends Term {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
}

export interface RelatedTerm {
  id: string;
  term_id: string;
  related_term_id: string;
  related_term?: Term;
}

export interface DailyWord {
  id: string;
  term_id: string;
  date: string;
  created_by: string | null;
  created_at: string;
  term?: Term;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  user?: Profile;
}

// Local storage types (for public users)
export interface FavoriteItem {
  id: string;
  term_id: string;
  english_word: string;
  spanish_word: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  added_at: string;
}

export interface HistoryItem {
  id: string;
  term_id: string;
  english_word: string;
  spanish_word: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  visited_at: string;
}

export interface SearchFilters {
  query: string;
  category_id?: string;
  direction?: 'en-es' | 'es-en';
}

export interface AdminStats {
  total_terms: number;
  total_categories: number;
  recent_terms: number;
  total_docentes: number;
  pending_terms: number;
}

export interface TermFormData {
  english_word: string;
  spanish_word: string;
  definition: string;
  technical_definition: string;
  example: string;
  category_id: string;
  status: 'published' | 'draft' | 'pending';
  is_daily_word: boolean;
  related_term_ids: string[];
}

export interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  accent: string;
  is_active: boolean;
}
