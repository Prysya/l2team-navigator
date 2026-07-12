import { useState, useCallback, useMemo } from 'react';
import type { Resource } from '../types';
import { sortMonsters } from '../utils/helpers';
import { GROUP_NAMES } from '../utils/constants';
import resourcesData from '../data/RESOURCES.json';

const RESOURCES = resourcesData as Resource[];

interface RecipeGroup {
  groupNumber: number;
  groupName: string;
  recipes: Resource[];
}

export function useRecipes() {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return RESOURCES;
    const q = searchQuery.trim().toLowerCase();
    return RESOURCES.filter(
      (r) =>
        r.recipe_name.toLowerCase().includes(q) ||
        (r.smart_name && r.smart_name.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const groups: RecipeGroup[] = useMemo(() => {
    const map = new Map<number, Resource[]>();
    for (const r of filtered) {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    }
    return [1, 2, 3]
      .filter((g) => map.has(g))
      .map((groupNumber) => ({
        groupNumber,
        groupName: GROUP_NAMES[groupNumber] || `Group ${groupNumber}`,
        recipes: map.get(groupNumber)!,
      }));
  }, [filtered]);

  const totalFound = filtered.length;

  const selectedRecipe = useMemo(() => {
    if (selectedIndex < 0 || selectedIndex >= filtered.length) return null;
    const recipe = filtered[selectedIndex];
    return { ...recipe, monster: sortMonsters(recipe.monster) };
  }, [selectedIndex, filtered]);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
  }, []);

  return { groups, totalFound, selectedRecipe, handleSelect, handleSearch };
}
