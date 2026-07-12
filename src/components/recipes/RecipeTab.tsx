import { useState, useMemo } from 'react';
import type { Resource } from '../../types';
import RESOURCES_DATA from '../../data/RESOURCES.json';
import { GROUP_NAMES } from '../../utils/constants';
import { renderMonsterRow, sortMonsters, escapeHtml } from '../../utils/helpers';
import styles from './RecipeTab.module.scss';

const RESOURCES = RESOURCES_DATA as Resource[];

function recipeSelectLabel(recipe: Resource): string {
  return recipe.recipe_name;
}

export default function RecipeTab() {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return RESOURCES;
    const q = searchQuery.toLowerCase().trim();
    return RESOURCES.filter(
      (r) =>
        r.recipe_name.toLowerCase().includes(q) ||
        (r.smart_name && r.smart_name.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const currentRecipe = useMemo(() => {
    if (selectedNumber === null) return null;
    return RESOURCES.find((r) => r.number === selectedNumber) ?? null;
  }, [selectedNumber]);

  const monsterRowsHtml = useMemo(() => {
    if (!currentRecipe) return '';
    const sorted = sortMonsters(currentRecipe.monster);
    return sorted
      .map((m) => {
        const cells = renderMonsterRow(m);
        return `<tr>
          <td>${cells.monsterCell}</td>
          <td>${cells.locationsCell}</td>
          <td>${cells.dropCell}</td>
          <td>${cells.spoilCell}</td>
          <td>${cells.commentCell}</td>
        </tr>`;
      })
      .join('');
  }, [currentRecipe]);

  const materialMonsterRowsHtml = useMemo(() => {
    if (!currentRecipe?.material) return '';
    const sorted = sortMonsters(currentRecipe.material.monster);
    return sorted
      .map((m) => {
        const cells = renderMonsterRow(m);
        return `<tr>
          <td>${cells.monsterCell}</td>
          <td>${cells.locationsCell}</td>
          <td>${cells.dropCell}</td>
          <td>${cells.spoilCell}</td>
          <td>${cells.commentCell}</td>
        </tr>`;
      })
      .join('');
  }, [currentRecipe]);

  const filteredGrouped = useMemo(() => {
    const groups: Record<number, Resource[]> = {};
    for (const r of filteredResources) {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    }
    return groups;
  }, [filteredResources]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedNumber(val ? Number(val) : null);
  };

  return (
    <div>
      <div className={styles.controls}>
        <label className={styles.label}>Рецепт:</label>
        <select
          className={`${styles.select} ${styles.selectWide}`}
          value={selectedNumber ?? ''}
          onChange={handleSelect}
        >
          <option value="">-- Выберите рецепт --</option>
          {Object.entries(filteredGrouped).map(([groupKey, recipes]) => {
            const groupNum = Number(groupKey);
            return (
              <optgroup key={groupKey} label={GROUP_NAMES[groupNum] || `Group ${groupKey}`}>
                {recipes.map((r) => (
                  <option key={r.number} value={r.number}>
                    {recipeSelectLabel(r)}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        <input
          className={styles.input}
          type="text"
          placeholder="🔍 Поиск по названию рецепта..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {currentRecipe ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>{currentRecipe.recipe_name}</h3>
            <span className={styles.badge}>
              {GROUP_NAMES[currentRecipe.group] || `Группа ${currentRecipe.group}`}
            </span>
            {currentRecipe.recipe_url && (
              <a
                href={currentRecipe.recipe_url}
                target="_blank"
                rel="noopener"
                className={styles.wikiLink}
              >
                Wiki
              </a>
            )}
          </div>

          <div className={styles.monsterCount}>
            Мобов: {currentRecipe.monster.length}
            {currentRecipe.material
              ? ` + материал: ${currentRecipe.material.monster.length}`
              : ''}
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Монстр</th>
                  <th>Локации</th>
                  <th>Шанс дропа</th>
                  <th>Шанс спойла</th>
                  <th>Комментарий</th>
                </tr>
              </thead>
              <tbody dangerouslySetInnerHTML={{ __html: monsterRowsHtml }} />
            </table>
          </div>

          {currentRecipe.group === 2 && currentRecipe.material && (
            <div className={styles.materialSection}>
              <h4>
                Материал:{' '}
                {currentRecipe.material.url ? (
                  <a
                    href={currentRecipe.material.url}
                    target="_blank"
                    rel="noopener"
                    className={styles.materialLink}
                  >
                    {escapeHtml(currentRecipe.material.name)}
                  </a>
                ) : (
                  escapeHtml(currentRecipe.material.name)
                )}
              </h4>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Монстр</th>
                      <th>Локации</th>
                      <th>Шанс дропа</th>
                      <th>Шанс спойла</th>
                      <th>Комментарий</th>
                    </tr>
                  </thead>
                  <tbody dangerouslySetInnerHTML={{ __html: materialMonsterRowsHtml }} />
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          {searchQuery.trim() && filteredResources.length === 0
            ? 'Рецепты не найдены'
            : 'Выберите рецепт для просмотра'}
        </div>
      )}
    </div>
  );
}
