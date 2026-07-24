import { create } from 'zustand';

export type TypeFilter =
  'all' | 'recipe' | 'recipe_weapon' | 'recipe_armor' | 'recipe_accessory' | 'spellbook' | 'piece' | 'resource';
export type PartyFilter = '' | 'S' | 'SG' | 'G';

const RECIPE_SUBTABS: TypeFilter[] = ['recipe_weapon', 'recipe_armor', 'recipe_accessory'];

interface LocationsStore {
  typeFilter: TypeFilter;
  selectedRace: string;
  selectedClass: string;
  selectedCity: string;
  selectedLocation: string;
  searchQuery: string;
  partyFilter: PartyFilter;
  userLevel: string;
  recipeGrade: string;
  setTypeFilter: (t: TypeFilter) => void;
  setSelectedRace: (race: string) => void;
  setSelectedClass: (cls: string) => void;
  setSelectedCity: (city: string) => void;
  setSelectedLocation: (loc: string) => void;
  setSearchQuery: (q: string) => void;
  setPartyFilter: (p: PartyFilter) => void;
  setUserLevel: (lvl: string) => void;
  setRecipeGrade: (g: string) => void;
  handleTypeChange: (key: TypeFilter) => void;
}

export const useLocationsStore = create<LocationsStore>((set) => ({
  typeFilter: 'all',
  selectedRace: '',
  selectedClass: '',
  selectedCity: '',
  selectedLocation: '',
  searchQuery: '',
  partyFilter: '',
  userLevel: '',
  recipeGrade: '',
  setTypeFilter: (t) => set({ typeFilter: t }),
  setSelectedRace: (race) => set({ selectedRace: race }),
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setPartyFilter: (p) => set({ partyFilter: p }),
  setUserLevel: (lvl) => set({ userLevel: lvl }),
  setRecipeGrade: (g) => set({ recipeGrade: g }),
  handleTypeChange: (key) =>
    set((state) => ({
      typeFilter: key,
      selectedRace: '',
      selectedClass: '',
      recipeGrade: RECIPE_SUBTABS.includes(key) ? state.recipeGrade : '',
    })),
}));
