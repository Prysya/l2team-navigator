import { beforeEach, describe, expect, it } from 'vitest';

import { useRecipeStore } from '../recipeStore';

beforeEach(() => {
  useRecipeStore.setState({ selectedGroup: null, selectedNumber: null, searchQuery: '' });
});

describe('recipeStore', () => {
  it('sets group and resets number', () => {
    useRecipeStore.getState().setSelectedNumber(500);
    useRecipeStore.getState().setSelectedGroup(1);
    expect(useRecipeStore.getState().selectedGroup).toBe(1);
    expect(useRecipeStore.getState().selectedNumber).toBeNull();
  });

  it('sets selected number', () => {
    useRecipeStore.getState().setSelectedNumber(500);
    expect(useRecipeStore.getState().selectedNumber).toBe(500);
  });

  it('sets search query', () => {
    useRecipeStore.getState().setSearchQuery('bone');
    expect(useRecipeStore.getState().searchQuery).toBe('bone');
  });
});
