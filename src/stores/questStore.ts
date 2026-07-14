import { create } from 'zustand';

type Race = 'Human Mage' | 'Human Fighter' | 'Elf' | 'Dark Elf' | 'Orc Fighter' | 'Orc Shaman' | 'Dwarf' | 'Dwarf Mage';
type QuestCategory = 'racial' | 'profession' | 'temple';
type ProfType = 'first' | 'second';

interface QuestStore {
  category: QuestCategory;
  selectedRace: Race;
  profRace: string;
  profType: ProfType;
  selectedClass: string;
  expanded: Set<string>;
  mapNpc: { name: string; x: number; y: number } | null;
  setCategory: (c: QuestCategory) => void;
  setSelectedRace: (r: Race) => void;
  setProfRace: (r: string) => void;
  setProfType: (t: ProfType) => void;
  setSelectedClass: (c: string) => void;
  toggleRow: (name: string) => void;
  setMapNpc: (npc: { name: string; x: number; y: number } | null) => void;
}

export const useQuestStore = create<QuestStore>((set) => ({
  category: 'racial',
  selectedRace: 'Human Mage',
  profRace: 'Human',
  profType: 'first',
  selectedClass: '',
  expanded: new Set(),
  mapNpc: null,
  setCategory: (category) => set({ category, selectedClass: '' }),
  setSelectedRace: (selectedRace) => set({ selectedRace }),
  setProfRace: (profRace) => set({ profRace, selectedClass: '' }),
  setProfType: (profType) => set({ profType, selectedClass: '' }),
  setSelectedClass: (selectedClass) => set({ selectedClass }),
  toggleRow: (name) =>
    set((s) => {
      const next = new Set(s.expanded);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { expanded: next };
    }),
  setMapNpc: (mapNpc) => set({ mapNpc }),
}));
