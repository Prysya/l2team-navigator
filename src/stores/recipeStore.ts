import { create } from 'zustand';

import type { RecipeGrade, RecipeType } from '@/types';

export type FilterType = 'all' | RecipeType;
export type FilterGrade = 'all' | RecipeGrade;

interface RecipeStore {
  selectedType: FilterType;
  selectedGrade: FilterGrade;
  selectedRecipeId: number | null;
  searchQuery: string;
  setSelectedType: (t: FilterType) => void;
  setSelectedGrade: (g: FilterGrade) => void;
  setSelectedRecipeId: (n: number | null) => void;
  setSearchQuery: (q: string) => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  selectedType: 'all',
  selectedGrade: 'all',
  selectedRecipeId: null,
  searchQuery: '',
  setSelectedType: (t) => set({ selectedType: t, selectedRecipeId: null }),
  setSelectedGrade: (g) => set({ selectedGrade: g, selectedRecipeId: null }),
  setSelectedRecipeId: (n) => set({ selectedRecipeId: n }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
