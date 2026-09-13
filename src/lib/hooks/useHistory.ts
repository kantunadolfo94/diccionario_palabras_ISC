'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHistory, addToHistory, clearHistory } from '@/lib/utils';
import type { HistoryItem } from '@/lib/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHistory(getHistory());
      setLoaded(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const add = useCallback((item: Omit<HistoryItem, 'id' | 'visited_at'>) => {
    addToHistory(item);
    setHistory(getHistory());
  }, []);

  const clear = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  return { history, loaded, add, clear };
}
