import { create } from 'zustand';

interface GuideStore {
  /** Раскрытые строки с шагами гайда (ключ — enName квеста) */
  expanded: Set<string>;
  /** Открытые аккордионы с инфо о квесте (ключ — enName квеста) */
  infoOpen: Set<string>;
  toggleExpanded: (key: string) => void;
  toggleInfo: (key: string) => void;
}

export const useGuideStore = create<GuideStore>((set) => ({
  expanded: new Set(),
  infoOpen: new Set(),
  toggleExpanded: (key) =>
    set((s) => {
      const next = new Set(s.expanded);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { expanded: next };
    }),
  toggleInfo: (key) =>
    set((s) => {
      const next = new Set(s.infoOpen);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { infoOpen: next };
    }),
}));
