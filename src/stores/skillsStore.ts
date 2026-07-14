import { create } from 'zustand';

interface SkillsStore {
  selectedRace: string;
  selectedClass: string;
  searchQuery: string;
  filterType: 'all' | 'active' | 'passive';
  setSelectedRace: (race: string) => void;
  setSelectedClass: (cls: string) => void;
  setSearchQuery: (q: string) => void;
  setFilterType: (t: 'all' | 'active' | 'passive') => void;
  handleRaceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const useSkillsStore = create<SkillsStore>((set) => ({
  selectedRace: '',
  selectedClass: '',
  searchQuery: '',
  filterType: 'all',
  setSelectedRace: (race) => set({ selectedRace: race }),
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterType: (t) => set({ filterType: t }),
  handleRaceChange: (e) => set({ selectedRace: e.target.value, selectedClass: '' }),
}));
