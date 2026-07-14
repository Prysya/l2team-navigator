import { useMemo } from 'react';
import RESOURCES_DATA from '@data/RESOURCES.json';
import CustomSelect from '@shared/CustomSelect';
import EmptyState from '@shared/EmptyState';
import FloatingLabel from '@shared/FloatingLabel';
import { GROUP_NAMES } from '@utils/constants';

import { useRecipeStore } from '@/stores/recipeStore';
import type { Resource } from '@/types';

import MonsterTable from './MonsterTable';

import styles from './RecipeTab.module.scss';

const RESOURCES = RESOURCES_DATA as Resource[];

function recipeSelectLabel(recipe: Resource): string {
  return recipe.recipe_name;
}

export default function RecipeTab() {
  const selectedGroup = useRecipeStore((s) => s.selectedGroup);
  const selectedNumber = useRecipeStore((s) => s.selectedNumber);
  const searchQuery = useRecipeStore((s) => s.searchQuery);
  const setSelectedGroup = useRecipeStore((s) => s.setSelectedGroup);
  const setSelectedNumber = useRecipeStore((s) => s.setSelectedNumber);
  const setSearchQuery = useRecipeStore((s) => s.setSearchQuery);

  const availableGroups = useMemo(() => {
    const set = new Set<number>();
    for (const r of RESOURCES) {
      set.add(r.group);
    }
    return Array.from(set).sort();
  }, []);

  const filteredResources = useMemo(() => {
    let list = RESOURCES;
    if (selectedGroup !== null) {
      list = list.filter((r) => r.group === selectedGroup);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) => r.recipe_name.toLowerCase().includes(q) || (r.smart_name && r.smart_name.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [selectedGroup, searchQuery]);

  const currentRecipe = useMemo(() => {
    if (selectedNumber === null) return null;
    return RESOURCES.find((r) => r.number === selectedNumber) ?? null;
  }, [selectedNumber]);

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.field}>
          <CustomSelect
            label="Группа"
            value={selectedGroup !== null ? String(selectedGroup) : ''}
            onChange={(v) => setSelectedGroup(v ? Number(v) : null)}
            options={availableGroups.map((g) => ({ value: String(g), label: GROUP_NAMES[g] || `Группа ${g}` }))}
          />
        </div>
        <div className={styles.field}>
          <CustomSelect
            label="Рецепт"
            value={String(selectedNumber ?? '')}
            onChange={(v) => setSelectedNumber(v ? Number(v) : null)}
            options={filteredResources.map((r) => ({ value: String(r.number), label: recipeSelectLabel(r) }))}
          />
        </div>
        <div className={styles.searchWrap}>
          <FloatingLabel className={styles.searchField} label="Поиск по названию рецепта" value={searchQuery}>
            <input
              className={styles.input}
              type="text"
              name="recipe-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FloatingLabel>
        </div>
      </div>

      {currentRecipe ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            {currentRecipe.recipe_url ? (
              <h3>
                <a
                  href={currentRecipe.recipe_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.recipeLink}
                >
                  {currentRecipe.recipe_name}
                </a>
              </h3>
            ) : (
              <h3>{currentRecipe.recipe_name}</h3>
            )}
            <span className={styles.badge}>{GROUP_NAMES[currentRecipe.group] || `Группа ${currentRecipe.group}`}</span>
          </div>

          <div className={styles.monsterCount}>
            Мобов: {currentRecipe.monster.length}
            {currentRecipe.material ? ` + материал: ${currentRecipe.material.monster.length}` : ''}
          </div>

          <MonsterTable monsters={currentRecipe.monster} className={styles.tableWrap} />

          {currentRecipe.group === 2 && currentRecipe.material && (
            <div className={styles.materialSection}>
              <h4>
                Материал:{' '}
                {currentRecipe.material.url ? (
                  <a
                    href={currentRecipe.material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.materialLink}
                  >
                    {currentRecipe.material.name}
                  </a>
                ) : (
                  currentRecipe.material.name
                )}
              </h4>
              <MonsterTable monsters={currentRecipe.material.monster} className={styles.tableWrap} />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          message={
            searchQuery.trim() && filteredResources.length === 0
              ? 'Рецепты не найдены'
              : 'Выберите рецепт для просмотра'
          }
        />
      )}
    </div>
  );
}
