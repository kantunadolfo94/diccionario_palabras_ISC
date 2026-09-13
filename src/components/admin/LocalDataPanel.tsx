'use client';

import { useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import {
  clearHistory,
  removeFavorite,
  getFavorites,
} from '@/lib/utils';

export function LocalDataPanel() {
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    getFavorites().forEach((f) => removeFavorite(f.term_id));
    clearHistory();
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  return (
    <button
      onClick={handleClear}
      className="flex items-center gap-2 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-4 py-2.5 text-sm font-semibold text-[#F87171] transition-colors hover:bg-[rgba(239,68,68,0.16)]"
    >
      {cleared ? <Check size={15} /> : <Trash2 size={15} />}
      {cleared ? 'Datos locales borrados' : 'Borrar datos locales'}
    </button>
  );
}