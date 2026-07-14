import { create } from 'zustand';

import type { RaidBoss } from '@/types';

interface RaidBossStore {
  searchQuery: string;
  expanded: Set<string>;
  epicSortAsc: boolean;
  raidSortAsc: boolean;
  mapBoss: RaidBoss | null;
  previewBoss: RaidBoss | null;
  setSearchQuery: (q: string) => void;
  toggleRow: (id: string) => void;
  toggleEpicSort: () => void;
  toggleRaidSort: () => void;
  setMapBoss: (boss: RaidBoss | null) => void;
  setPreviewBoss: (boss: RaidBoss | null) => void;
}

export const useRaidBossStore = create<RaidBossStore>((set) => ({
  searchQuery: '',
  expanded: new Set(),
  epicSortAsc: true,
  raidSortAsc: true,
  mapBoss: null,
  previewBoss: null,
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleRow: (id) =>
    set((state) => {
      const next = new Set(state.expanded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expanded: next };
    }),
  toggleEpicSort: () => set((state) => ({ epicSortAsc: !state.epicSortAsc })),
  toggleRaidSort: () => set((state) => ({ raidSortAsc: !state.raidSortAsc })),
  setMapBoss: (boss) => set({ mapBoss: boss }),
  setPreviewBoss: (boss) => set({ previewBoss: boss }),
}));
