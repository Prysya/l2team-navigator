import { create } from 'zustand';

interface SpellbookStore {
  selectedRace: string;
  selectedClass: string;
  searchQuery: string;
  setSelectedRace: (race: string) => void;
  setSelectedClass: (cls: string) => void;
  setSearchQuery: (q: string) => void;
  handleRaceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const useSpellbookStore = create<SpellbookStore>((set) => ({
  selectedRace: '',
  selectedClass: '',
  searchQuery: '',
  setSelectedRace: (race) => set({ selectedRace: race }),
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  handleRaceChange: (e) =>
    set({ selectedRace: e.target.value, selectedClass: '' }),
}));
