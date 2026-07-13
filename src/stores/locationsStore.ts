import { create } from 'zustand';

type TypeFilter = 'all' | 'recipe' | 'spellbook';

interface LocationsStore {
  typeFilter: TypeFilter;
  selectedRace: string;
  selectedClass: string;
  selectedCity: string;
  selectedLocation: string;
  searchQuery: string;
  setTypeFilter: (t: TypeFilter) => void;
  setSelectedRace: (race: string) => void;
  setSelectedClass: (cls: string) => void;
  setSelectedCity: (city: string) => void;
  setSelectedLocation: (loc: string) => void;
  setSearchQuery: (q: string) => void;
  handleTypeChange: (key: TypeFilter) => void;
}

export const useLocationsStore = create<LocationsStore>((set) => ({
  typeFilter: 'all',
  selectedRace: '',
  selectedClass: '',
  selectedCity: '',
  selectedLocation: '',
  searchQuery: '',
  setTypeFilter: (t) => set({ typeFilter: t }),
  setSelectedRace: (race) => set({ selectedRace: race }),
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  handleTypeChange: (key) =>
    set({ typeFilter: key, selectedRace: '', selectedClass: '' }),
}));
