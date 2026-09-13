'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from '@/lib/utils';
import type { FavoriteItem } from '@/lib/types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setFavorites(getFavorites());
      setLoaded(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const add = useCallback((item: Omit<FavoriteItem, 'id' | 'added_at'>) => {
    addFavorite(item);
    setFavorites(getFavorites());
  }, []);

  const remove = useCallback((term_id: string) => {
    removeFavorite(term_id);
    setFavorites(getFavorites());
  }, []);

  const toggle = useCallback((item: Omit<FavoriteItem, 'id' | 'added_at'>) => {
    if (isFavorite(item.term_id)) {
      removeFavorite(item.term_id);
    } else {
      addFavorite(item);
    }
    setFavorites(getFavorites());
  }, []);

  const check = useCallback((term_id: string) => isFavorite(term_id), []);

  return { favorites, loaded, add, remove, toggle, check };
}
