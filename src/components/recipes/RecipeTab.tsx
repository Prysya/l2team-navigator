import { useEffect, useMemo, useState } from 'react';
import CustomSelect from '@shared/CustomSelect';
import EmptyState from '@shared/EmptyState';
import FloatingLabel from '@shared/FloatingLabel';
import { goal } from '@utils/metrics';
import cx from 'classnames';

import type { FilterGrade, FilterType } from '@/stores/recipeStore';
import { useRecipeStore } from '@/stores/recipeStore';
import type { RecipeComponent, RecipeEntry } from '@/types';

import MonsterTable from './MonsterTable';

import styles from './RecipeTab.module.scss';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Все типы' },
  { value: 'Weapon', label: 'Оружие' },
  { value: 'Armor', label: 'Броня' },
  { value: 'Accessory', label: 'Аксессуары' },
  { value: 'Soulshot', label: 'Soulshots/Spiritshots' },
  { value: 'Material', label: 'Ресурсы' },
  { value: 'Elixir', label: 'Эликсиры' },
  { value: 'Other', label: 'Прочее' },
];

const GRADE_OPTIONS_ALL = [
  { value: 'all', label: 'Все грейды' },
  { value: 'NG', label: 'NG' },
  { value: 'D', label: 'D' },
  { value: 'C', label: 'C' },
  { value: 'B', label: 'B' },
  { value: 'A', label: 'A' },
];

const GRADE_OPTIONS_NO_NG = [
  { value: 'all', label: 'Все грейды' },
  { value: 'D', label: 'D' },
  { value: 'C', label: 'C' },
  { value: 'B', label: 'B' },
  { value: 'A', label: 'A' },
];

const ARMOR_SUBTYPE_LABELS: Record<string, string> = {
  Heavy: 'Тяжелая броня',
  Light: 'Легкая броня',
  Robe: 'Роба',
  Helmet: 'Шлемы',
  Gloves: 'Перчатки',
  Boots: 'Сапоги',
  None: 'Щиты',
  HairAccessory: 'Аксессуары',
};

const ARMOR_SUBTYPE_ORDER = ['Heavy', 'Light', 'Robe', 'Helmet', 'Gloves', 'Boots', 'None', 'HairAccessory'];

const WEAPON_SUBTYPE_LABELS: Record<string, string> = {
  Sword: 'Мечи',
  Blunt: 'Дробящее',
  Dagger: 'Кинжалы',
  Bow: 'Луки',
  Polearm: 'Древковое',
  Fist: 'Кастеты',
  'Misc.': 'Прочее',
};

const WEAPON_SUBTYPE_ORDER = ['Sword', 'Blunt', 'Dagger', 'Bow', 'Polearm', 'Fist', 'Misc.'];

const ACCESSORY_SUBTYPE_LABELS: Record<string, string> = {
  Earring: 'Серьги',
  Ring: 'Кольца',
  Necklace: 'Ожерелья',
};

const ACCESSORY_SUBTYPE_ORDER = ['Earring', 'Ring', 'Necklace'];

const SUBTYPE_LABELS: Record<string, string> = {
  Sword: 'Меч',
  Blunt: 'Дробящее',
  Dagger: 'Кинжал',
  Bow: 'Лук',
  Polearm: 'Древковое',
  Fist: 'Кастет',
  'Misc.': 'Прочее',
  Heavy: 'Тяжелая',
  Light: 'Легкая',
  Robe: 'Роба',
  Helmet: 'Шлем',
  Gloves: 'Перчатки',
  Boots: 'Сапоги',
  None: 'Щит',
  HairAccessory: 'Аксессуар',
  Earring: 'Серьга',
  Ring: 'Кольцо',
  Necklace: 'Ожерелье',
};

const OTHER_CATEGORY_LABELS: Record<string, string> = {
  material: 'Ресурс',
  dye: 'Краска',
  arrow: 'Стрелы',
  fishing: 'Рыбалка',
  other: 'Прочее',
};

const OTHER_CATEGORY_CLASS: Record<string, string> = {
  material: styles.catMaterial,
  dye: styles.catDye,
  arrow: styles.catArrow,
  fishing: styles.catFishing,
  other: styles.catOther,
};

const TYPE_LABEL: Record<string, string> = {
  Weapon: 'Оружие',
  Armor: 'Броня',
  Accessory: 'Аксессуар',
  Soulshot: 'Soulshots/Spiritshots',
  Material: 'Ресурс',
  Elixir: 'Эликсир',
  Other: 'Прочее',
};

const GRADE_BADGE_CLASS: Record<string, string> = {
  NG: styles.gradeNg,
  D: styles.gradeD,
  C: styles.gradeC,
  B: styles.gradeB,
  A: styles.gradeA,
};

interface TabItem {
  key: string;
  label: string;
}

function ResultItem({ result }: { result: RecipeEntry }) {
  const descLines = useMemo(() => {
    if (!result.resultDescription) return null;
    const raw = result.resultDescription;
    const parts = raw.split(/\.(?=\s*[A-Z][a-zA-Z\s]+:)/);
    return parts.map((s) => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  }, [result.resultDescription]);

  return (
    <div className={styles.resultSection}>
      <div className={styles.resultHeader}>
        <span className={styles.resultLabel}>Результат:</span>
        <a href={result.resultUrl} target="_blank" rel="noopener noreferrer" className={styles.resultLink}>
          {result.resultName}
        </a>
        {result.recipeType === 'Other' && result.otherCategory ? (
          <span className={cx(styles.gradeBadgeSmall, OTHER_CATEGORY_CLASS[result.otherCategory])}>
            {OTHER_CATEGORY_LABELS[result.otherCategory] || 'Прочее'}
          </span>
        ) : (
          <span className={cx(styles.gradeBadgeSmall, GRADE_BADGE_CLASS[result.resultGrade])}>
            {result.resultGrade}
          </span>
        )}
      </div>
      <div className={styles.resultBody}>
        <table className={styles.resultTable}>
          <tbody>
            <tr>
              <td className={styles.resultTableLabel}>Вес</td>
              <td className={styles.resultTableValue}>
                {result.resultWeight != null ? `${result.resultWeight}` : '—'}
              </td>
            </tr>
            <tr>
              <td className={styles.resultTableLabel}>Цена продажи</td>
              <td className={styles.resultTableValue}>
                {result.resultPrice != null ? `${result.resultPrice.toLocaleString()} Adena` : '—'}
              </td>
            </tr>
            {result.resultParameter && (
              <tr>
                <td className={styles.resultTableLabel}>Параметр</td>
                <td className={styles.resultTableValue}>{result.resultParameter}</td>
              </tr>
            )}
            {descLines && (
              <tr>
                <td className={styles.resultTableLabel}>Описание</td>
                <td className={styles.resultTableValue}>
                  {descLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipeTabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (k: string) => void;
}) {
  return (
    <div className={styles.tabBar}>
      {tabs.map((t) => (
        <button
          key={t.key}
          className={cx(styles.tabBtn, activeTab === t.key && styles.tabBtnActive)}
          onClick={() => onTabChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ComponentTree({ components, depth }: { components: RecipeComponent[]; depth: number }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (components.length === 0) {
    return (
      <div className={styles.noData} style={{ margin: 0 }}>
        Нет данных о компонентах
      </div>
    );
  }

  return (
    <table className={styles.compTable}>
      <thead>
        <tr>
          <th>Предмет</th>
          <th>Кол-во</th>
        </tr>
      </thead>
      <tbody>
        {components.map((c) => (
          <ComponentRow key={c.itemId} component={c} depth={depth} expanded={expanded} toggle={toggle} />
        ))}
      </tbody>
    </table>
  );
}

function ComponentRow({
  component: c,
  depth,
  expanded,
  toggle,
}: {
  component: RecipeComponent;
  depth: number;
  expanded: Record<number, boolean>;
  toggle: (id: number) => void;
}) {
  return (
    <>
      <tr className={depth > 0 ? styles.compRowNested : undefined}>
        <td className={styles.compNameCell}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingLeft: depth * 20 }}>
            {c.isComposite ? (
              <svg
                className={cx(styles.compToggle, expanded[c.itemId] && styles.compToggleOpen)}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                onClick={() => toggle(c.itemId)}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            ) : (
              <span style={{ width: 18, flexShrink: 0 }} />
            )}
            {c.name}
          </span>
        </td>
        <td className={styles.compQtyCell}>x{c.amount}</td>
      </tr>
      {c.isComposite &&
        expanded[c.itemId] &&
        c.children.length > 0 &&
        c.children.map((child) => (
          <ComponentRow key={child.itemId} component={child} depth={depth + 1} expanded={expanded} toggle={toggle} />
        ))}
    </>
  );
}

export default function RecipeTab() {
  const [allRecipes, setAllRecipes] = useState<RecipeEntry[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    Promise.all([import('@data/RECIPES.json'), import('@data/RECIPES_NODROP.json')]).then(([r, nr]) => {
      setAllRecipes([...(r.default as RecipeEntry[]), ...(nr.default as RecipeEntry[])]);
      setDataLoaded(true);
    });
  }, []);

  const selectedType = useRecipeStore((s) => s.selectedType);
  const selectedGrade = useRecipeStore((s) => s.selectedGrade);
  const selectedRecipeId = useRecipeStore((s) => s.selectedRecipeId);
  const searchQuery = useRecipeStore((s) => s.searchQuery);
  const setSelectedType = useRecipeStore((s) => s.setSelectedType);
  const setSelectedGrade = useRecipeStore((s) => s.setSelectedGrade);
  const setSelectedRecipeId = useRecipeStore((s) => s.setSelectedRecipeId);
  const setSearchQuery = useRecipeStore((s) => s.setSearchQuery);
  const [activeTab, setActiveTab] = useState<'recipe' | 'piece' | 'craft' | 'info'>('recipe');

  useEffect(() => {
    setActiveTab('recipe');
  }, [selectedRecipeId]);

  const hideGrade = selectedType === 'Material' || selectedType === 'Other';
  const gradeOptions = selectedType === 'Soulshot' ? GRADE_OPTIONS_NO_NG : GRADE_OPTIONS_ALL;

  const filteredRecipes = useMemo(() => {
    let list = allRecipes;

    if (selectedType !== 'all') {
      list = list.filter((r) => r.recipeType === selectedType);
    }

    if (!hideGrade && selectedGrade !== 'all') {
      list = list.filter((r) => r.resultGrade === selectedGrade);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => r.recipeName.toLowerCase().includes(q) || r.resultName.toLowerCase().includes(q));
    }

    return list;
  }, [allRecipes, selectedType, selectedGrade, searchQuery, hideGrade]);

  const recipeSelectProps = useMemo(() => {
    let subtypeOrder: string[] | null = null;
    let subtypeLabels: Record<string, string> | null = null;

    if (selectedType === 'Armor') {
      subtypeOrder = ARMOR_SUBTYPE_ORDER;
      subtypeLabels = ARMOR_SUBTYPE_LABELS;
    } else if (selectedType === 'Weapon') {
      subtypeOrder = WEAPON_SUBTYPE_ORDER;
      subtypeLabels = WEAPON_SUBTYPE_LABELS;
    } else if (selectedType === 'Accessory') {
      subtypeOrder = ACCESSORY_SUBTYPE_ORDER;
      subtypeLabels = ACCESSORY_SUBTYPE_LABELS;
    }

    if (subtypeOrder && subtypeLabels) {
      const grouped: Record<string, RecipeEntry[]> = {};
      for (const st of subtypeOrder) {
        grouped[st] = [];
      }

      for (const r of filteredRecipes) {
        const st =
          r.resultItemSubtype && subtypeOrder.includes(r.resultItemSubtype)
            ? r.resultItemSubtype
            : subtypeOrder[subtypeOrder.length - 1] || 'None';
        if (grouped[st]) {
          grouped[st].push(r);
        } else {
          const last = subtypeOrder[subtypeOrder.length - 1];
          if (!grouped[last]) grouped[last] = [];
          grouped[last].push(r);
        }
      }

      const groups = subtypeOrder
        .filter((st) => grouped[st] && grouped[st].length > 0)
        .map((st) => ({
          label: subtypeLabels[st] || st,
          options: grouped[st].map((r) => ({
            value: String(r.recipeId),
            label: r.recipeName,
          })),
        }));

      return { groups, flat: null as null };
    }

    return {
      groups: null as null,
      flat: filteredRecipes.map((r) => ({
        value: String(r.recipeId),
        label: r.recipeName,
      })),
    };
  }, [filteredRecipes, selectedType]);

  const currentRecipe = useMemo(() => {
    if (selectedRecipeId === null) return null;
    return allRecipes.find((r) => r.recipeId === selectedRecipeId) ?? null;
  }, [allRecipes, selectedRecipeId]);

  if (!dataLoaded) {
    return <EmptyState message="Загрузка данных..." />;
  }

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.field}>
          <CustomSelect
            label="Тип"
            value={selectedType}
            onChange={(v) => setSelectedType(v as FilterType)}
            options={TYPE_OPTIONS}
          />
        </div>
        {!hideGrade && (
          <div className={styles.field}>
            <CustomSelect
              label="Грейд"
              value={selectedGrade}
              onChange={(v) => setSelectedGrade(v as FilterGrade)}
              options={gradeOptions}
            />
          </div>
        )}
        <div className={styles.field}>
          <CustomSelect
            label="Рецепт"
            value={selectedRecipeId !== null ? String(selectedRecipeId) : ''}
            onChange={(v) => {
              setSelectedRecipeId(v ? Number(v) : null);
              if (v) goal('recipe_select');
            }}
            options={recipeSelectProps.flat ?? undefined}
            groups={recipeSelectProps.groups ?? undefined}
          />
        </div>
        <div className={styles.searchWrap}>
          <FloatingLabel className={styles.searchField} label="Поиск по названию" value={searchQuery}>
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
            <div className={styles.cardHeaderLeft}>
              {currentRecipe.recipeUrl ? (
                <h3>
                  <a
                    href={currentRecipe.recipeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.recipeLink}
                  >
                    {currentRecipe.recipeName}
                  </a>
                </h3>
              ) : (
                <h3>{currentRecipe.recipeName}</h3>
              )}
              {currentRecipe.recipeType === 'Other' && currentRecipe.otherCategory ? (
                <span className={cx(styles.gradeBadge, OTHER_CATEGORY_CLASS[currentRecipe.otherCategory])}>
                  {OTHER_CATEGORY_LABELS[currentRecipe.otherCategory] || 'Прочее'}
                </span>
              ) : (
                <span className={cx(styles.gradeBadge, GRADE_BADGE_CLASS[currentRecipe.resultGrade])}>
                  {currentRecipe.resultGrade}
                </span>
              )}
            </div>
          </div>

          <RecipeTabBar
            tabs={[
              { key: 'recipe', label: 'Рецепт' },
              ...(currentRecipe.mainPieceMonsters.length > 0 ? [{ key: 'piece' as const, label: 'Куски' }] : []),
              { key: 'craft' as const, label: 'Крафт' },
              { key: 'info' as const, label: 'Информация о предмете' },
            ]}
            activeTab={activeTab}
            onTabChange={(k) => setActiveTab(k as 'recipe' | 'piece' | 'craft' | 'info')}
          />

          <div className={styles.tabContent}>
            {activeTab === 'recipe' &&
              (currentRecipe.monsters.length > 0 ? (
                <>
                  <div className={styles.craftInfo}>
                    <span className={styles.infoItem}>
                      Мобов: <strong className={styles.accentColor}>{currentRecipe.monsters.length}</strong>
                    </span>
                  </div>
                  <MonsterTable monsters={currentRecipe.monsters} className={styles.tableWrap} />
                </>
              ) : (
                <div className={styles.noData}>Нет данных о дропе/спойле этого рецепта</div>
              ))}

            {activeTab === 'piece' && currentRecipe.mainPieceMonsters.length > 0 && (
              <>
                <div className={styles.craftInfo}>
                  <span className={styles.infoItem}>
                    Кусок:{' '}
                    <strong className={styles.accentColor}>
                      {currentRecipe.requiredItems[0]?.name || 'Основной кусок'}
                    </strong>
                  </span>
                  <span className={styles.infoItem}>
                    Мобов: <strong className={styles.accentColor}>{currentRecipe.mainPieceMonsters.length}</strong>
                  </span>
                </div>
                <MonsterTable monsters={currentRecipe.mainPieceMonsters} className={styles.tableWrap} />
              </>
            )}

            {activeTab === 'craft' && (
              <>
                <div className={styles.craftInfo}>
                  <span className={styles.infoItem}>
                    Уровень крафта: <strong className={styles.accentColor}>{currentRecipe.craftLevel}</strong>
                  </span>
                  <span className={styles.infoItem}>
                    MP: <strong className={styles.accentColor}>{currentRecipe.manaCost}</strong>
                  </span>
                  <span className={styles.infoItem}>
                    Шанс: <strong className={styles.accentColor}>{currentRecipe.successRate}%</strong>
                  </span>
                  <span className={styles.infoItem}>
                    Тип:{' '}
                    <strong className={styles.accentColor}>
                      {TYPE_LABEL[currentRecipe.recipeType] || currentRecipe.recipeType}
                    </strong>
                    {currentRecipe.resultItemSubtype && currentRecipe.resultItemSubtype !== 'None' && (
                      <>
                        {' '}
                        &middot;{' '}
                        <strong className={styles.accentColor}>
                          {SUBTYPE_LABELS[currentRecipe.resultItemSubtype] || currentRecipe.resultItemSubtype}
                        </strong>
                      </>
                    )}
                  </span>
                </div>
                <ComponentTree components={currentRecipe.requiredItems} depth={0} />
              </>
            )}

            {activeTab === 'info' && <ResultItem result={currentRecipe} />}
          </div>
        </div>
      ) : (
        <EmptyState
          message={
            searchQuery.trim() && filteredRecipes.length === 0 ? 'Рецепты не найдены' : 'Выберите рецепт для просмотра'
          }
        />
      )}
    </div>
  );
}
