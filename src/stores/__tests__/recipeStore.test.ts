import { beforeEach, describe, expect, it } from 'vitest';

import { useRecipeStore } from '../recipeStore';

beforeEach(() => {
  useRecipeStore.setState({ selectedType: 'all', selectedGrade: 'all', selectedRecipeId: null, searchQuery: '' });
});

describe('recipeStore', () => {
  it('sets type and resets recipe id', () => {
    useRecipeStore.getState().setSelectedRecipeId(500);
    useRecipeStore.getState().setSelectedType('Weapon');
    expect(useRecipeStore.getState().selectedType).toBe('Weapon');
    expect(useRecipeStore.getState().selectedRecipeId).toBeNull();
  });

  it('sets grade and resets recipe id', () => {
    useRecipeStore.getState().setSelectedRecipeId(500);
    useRecipeStore.getState().setSelectedGrade('A');
    expect(useRecipeStore.getState().selectedGrade).toBe('A');
    expect(useRecipeStore.getState().selectedRecipeId).toBeNull();
  });

  it('sets selected recipe id', () => {
    useRecipeStore.getState().setSelectedRecipeId(500);
    expect(useRecipeStore.getState().selectedRecipeId).toBe(500);
  });

  it('sets search query', () => {
    useRecipeStore.getState().setSearchQuery('bone');
    expect(useRecipeStore.getState().searchQuery).toBe('bone');
  });
});
