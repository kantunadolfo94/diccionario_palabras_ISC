import type { Category, Term } from '@/lib/types';
import { MOCK_CATEGORIES, MOCK_TERMS } from '@/lib/data/mockData';

// ============================================================
// In-memory mock store.
// Se usa cuando Supabase no está configurado para que el panel
// administrativo sea funcional durante el desarrollo/demostración.
// ============================================================

export interface MockStore {
  terms: Term[];
  categories: Category[];
  dailyWordIds: string[];
}

function seedTerms(): Term[] {
  return MOCK_TERMS.map((t) => ({ ...t, category: undefined, related_terms: [] }));
}

export const mockStore: MockStore = {
  terms: seedTerms(),
  categories: MOCK_CATEGORIES.map((c) => ({ ...c })),
  dailyWordIds: ['trm-006'],
};

export function mockAddTerm(term: Term): void {
  mockStore.terms = [term, ...mockStore.terms];
}

export function mockUpdateTerm(id: string, patch: Partial<Term>): void {
  mockStore.terms = mockStore.terms.map((t) =>
    t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t
  );
}

export function mockDeleteTerm(id: string): void {
  mockStore.terms = mockStore.terms.filter((t) => t.id !== id);
  mockStore.dailyWordIds = mockStore.dailyWordIds.filter((w) => w !== id);
}

export function mockAddCategory(category: Category): void {
  mockStore.categories = [...mockStore.categories, category];
}

export function mockUpdateCategory(id: string, patch: Partial<Category>): void {
  mockStore.categories = mockStore.categories.map((c) =>
    c.id === id ? { ...c, ...patch, updated_at: new Date().toISOString() } : c
  );
}

export function mockDeleteCategory(id: string): void {
  mockStore.categories = mockStore.categories.filter((c) => c.id !== id);
}

export function mockSetDailyWord(termId: string): void {
  if (!mockStore.dailyWordIds.includes(termId)) {
    mockStore.dailyWordIds.push(termId);
  }
}

export function mockUnsetDailyWord(termId: string): void {
  mockStore.dailyWordIds = mockStore.dailyWordIds.filter((w) => w !== termId);
}

export function mockGenerateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}