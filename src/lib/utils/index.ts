import { type FavoriteItem, type HistoryItem } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================================
// Favorites (localStorage)
// ============================================================
const FAVORITES_KEY = 'sysdict_favorites';
const HISTORY_KEY = 'sysdict_history';
const MAX_HISTORY = 50;

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFavorite(item: Omit<FavoriteItem, 'id' | 'added_at'>): void {
  const favorites = getFavorites();
  const exists = favorites.find((f) => f.term_id === item.term_id);
  if (exists) return;
  const newItem: FavoriteItem = {
    ...item,
    id: crypto.randomUUID(),
    added_at: new Date().toISOString(),
  };
  favorites.unshift(newItem);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function removeFavorite(term_id: string): void {
  const favorites = getFavorites().filter((f) => f.term_id !== term_id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(term_id: string): boolean {
  return getFavorites().some((f) => f.term_id === term_id);
}

// ============================================================
// History (localStorage)
// ============================================================
export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<HistoryItem, 'id' | 'visited_at'>): void {
  const history = getHistory().filter((h) => h.term_id !== item.term_id);
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    visited_at: new Date().toISOString(),
  };
  history.unshift(newItem);
  const trimmed = history.slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ============================================================
// Date formatting
// ============================================================
export function timeAgo(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  } catch {
    return 'hace un momento';
  }
}

// ============================================================
// Category icon map
// ============================================================
export const CATEGORY_ICON_OPTIONS = [
  'Code', 'Database', 'Globe', 'Network', 'Shield', 'Cloud',
  'Cpu', 'GitBranch', 'Layers', 'BarChart2', 'Brain', 'MoreHorizontal',
  'Server', 'Lock', 'Wifi', 'Terminal', 'Bug', 'Boxes', 'Container', 'Infinity'
];

export const CATEGORY_COLOR_OPTIONS = [
  { label: 'Índigo', color: '#6366F1', accent: '#818CF8' },
  { label: 'Azul cielo', color: '#0EA5E9', accent: '#38BDF8' },
  { label: 'Esmeralda', color: '#10B981', accent: '#34D399' },
  { label: 'Ámbar', color: '#F59E0B', accent: '#FCD34D' },
  { label: 'Rojo', color: '#EF4444', accent: '#F87171' },
  { label: 'Violeta', color: '#8B5CF6', accent: '#A78BFA' },
  { label: 'Naranja', color: '#F97316', accent: '#FB923C' },
  { label: 'Teal', color: '#14B8A6', accent: '#2DD4BF' },
  { label: 'Rosa', color: '#EC4899', accent: '#F472B6' },
  { label: 'Gris', color: '#64748B', accent: '#94A3B8' },
];

// ============================================================
// Misc
// ============================================================
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}
