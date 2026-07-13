import { create } from 'zustand';

interface RecipeStore {
  selectedGroup: number | null;
  selectedNumber: number | null;
  searchQuery: string;
  setSelectedGroup: (g: number | null) => void;
  setSelectedNumber: (n: number | null) => void;
  setSearchQuery: (q: string) => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  selectedGroup: null,
  selectedNumber: null,
  searchQuery: '',
  setSelectedGroup: (g) => set({ selectedGroup: g, selectedNumber: null }),
  setSelectedNumber: (n) => set({ selectedNumber: n }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
