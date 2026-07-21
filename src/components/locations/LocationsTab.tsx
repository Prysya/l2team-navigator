import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LOCATIONS_ALL_DATA from '@data/LOCATIONS_ALL.json';
import { RACES } from '@data/races';
import RECIPE_ENRICHMENT_DATA from '@data/RECIPE_ENRICHMENT.json';
import CustomSelect from '@shared/CustomSelect';
import EmptyState from '@shared/EmptyState';
import FloatingLabel from '@shared/FloatingLabel';
import ItemIcon from '@shared/ItemIcon';
import NumberInput from '@shared/NumberInput';
import { formatChance, getPartyText } from '@utils/helpers';
import cx from 'classnames';

import type { TypeFilter } from '@/stores/locationsStore';
import { useLocationsStore } from '@/stores/locationsStore';
import type { LocationEntry, LocationItem, LocationMonster, RecipeGrade, RecipeType } from '@/types';

import styles from './LocationsTab.module.scss';

const LOCATIONS_ALL = LOCATIONS_ALL_DATA as LocationEntry[];

interface RecipeEnrichmentEntry {
  g: RecipeGrade;
  t: RecipeType;
  r: string;
  u: string;
}

const RECIPE_ENRICHMENT = RECIPE_ENRICHMENT_DATA as Record<string, RecipeEnrichmentEntry>;

const TYPE_BUTTONS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'recipe', label: '📜 Рецепты' },
  { key: 'spellbook', label: '📚 Книги' },
  { key: 'piece', label: '📦 Куски' },
  { key: 'resource', label: '🧱 Ресурсы' },
];

const TYPE_TOOLTIP: Record<string, string> = {
  S: 'Одиночный (solo)',
  SG: 'Минигруппа (small group)',
  G: 'Полная группа (group)',
};

const PARTY_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'S', label: 'Соло' },
  { value: 'SG', label: 'Мини-группа' },
  { value: 'G', label: 'Пати' },
];

interface RecipeInfo {
  grade: RecipeGrade;
  type: RecipeType;
  resultName: string;
  resultUrl: string;
}

const GRADE_COLORS: Record<string, string> = {
  NG: '#9e9e9e',
  D: '#81c784',
  C: '#ffd54f',
  B: '#ef5350',
  A: '#ce93d8',
};

const GRADE_LABELS: Record<string, string> = {
  NG: 'NG',
  D: 'D',
  C: 'C',
  B: 'B',
  A: 'A',
};

function getRecipeInfo(itemName: string): RecipeInfo | undefined {
  const entry = RECIPE_ENRICHMENT[itemName];
  if (!entry) return undefined;
  return {
    grade: entry.g,
    type: entry.t,
    resultName: entry.r,
    resultUrl: entry.u,
  };
}

function LocationMonsterRow({ m }: { m: LocationMonster }) {
  const drop = formatChance(m.drop_chance);
  const spoil = formatChance(m.spoil_chance);
  return (
    <div className={styles.locMonster}>
      {m.monster_url ? (
        <a href={m.monster_url} target="_blank" rel="noopener noreferrer">
          {m.monster_name}
        </a>
      ) : (
        m.monster_name
      )}{' '}
      {m.monster_lvl ? <span className="stat-badge stat-lvl">Lvl {m.monster_lvl}</span> : null}{' '}
      {m.is_boss ? <span className="stat-badge stat-boss">💀 BOSS</span> : null}
      <div className={styles.locChances}>
        дроп: <span className={cx('chance', styles.chanceLoc)}>{drop.text}</span>
        {' | спойл'}: <span className={cx('chance', styles.chanceLoc)}>{spoil.text}</span>
      </div>
    </div>
  );
}

function LocationItemRow({ item }: { item: LocationItem }) {
  const isRecipe = item.item_type === 'recipe';
  const isPiece = item.item_type === 'piece';
  const isResource = item.item_type === 'resource';

  const recipeInfo = isRecipe ? getRecipeInfo(item.item_name) : undefined;

  let typeBadgeClass = styles.itemTypeSpellbook;
  let typeBadgeLabel = 'Книга';
  if (isRecipe) {
    typeBadgeClass = styles.itemTypeRecipe;
    typeBadgeLabel = 'Рецепт';
  } else if (isPiece) {
    typeBadgeClass = styles.itemTypePiece;
    typeBadgeLabel = 'Кусок';
  } else if (isResource) {
    typeBadgeClass = styles.itemTypeResource;
    typeBadgeLabel = 'Ресурс';
  }

  return (
    <div className={styles.locItem}>
      <div className={styles.itemHeader}>
        <span className={`${styles.itemTypeBadge} ${typeBadgeClass}`}>{typeBadgeLabel}</span>
        {isResource && (
          <ItemIcon
            id={Number(item.item_url?.match(/\/item\/(\d+)/)?.[1]) || undefined}
            name={item.item_name}
            size={20}
          />
        )}
        {item.item_url ? (
          <a href={item.item_url} target="_blank" rel="noopener noreferrer" className={styles.itemName}>
            {item.item_name}
          </a>
        ) : (
          <span className={styles.itemName}>{item.item_name}</span>
        )}
        {recipeInfo && (
          <span className={styles.recipeGradeBadge} style={{ background: GRADE_COLORS[recipeInfo.grade] || '#9e9e9e' }}>
            {GRADE_LABELS[recipeInfo.grade] || recipeInfo.grade}
          </span>
        )}
        {recipeInfo && (
          <span className={styles.recipeResult}>
            → {recipeInfo.type}
            {recipeInfo.resultUrl ? (
              <a
                href={recipeInfo.resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.recipeResultLink}
              >
                {' '}
                {recipeInfo.resultName}
              </a>
            ) : (
              <> {recipeInfo.resultName}</>
            )}
          </span>
        )}
      </div>
      {item.classes.length > 0 && (
        <div className={styles.itemClasses}>
          {item.classes.map((c, i) => (
            <span key={i} className="class-tag">
              {c.race} — {c.class_name}
            </span>
          ))}
        </div>
      )}
      <div className={styles.itemMonsters}>
        {item.monsters.map((m, i) => (
          <LocationMonsterRow key={i} m={m} />
        ))}
      </div>
    </div>
  );
}

function LocationRow({
  loc,
  typeFilter,
  selectedRace,
  selectedClass,
}: {
  loc: LocationEntry;
  typeFilter: TypeFilter;
  selectedRace: string;
  selectedClass: string;
}) {
  const partyInfo = getPartyText(loc.location_types, loc.has_boss);

  let items = loc.items;
  if (typeFilter !== 'all') {
    items = items.filter((i) => i.item_type === typeFilter);
  }
  if (
    typeFilter !== 'recipe' &&
    typeFilter !== 'piece' &&
    typeFilter !== 'resource' &&
    (selectedRace || selectedClass)
  ) {
    items = items.filter((i) => {
      if (i.item_type === 'recipe' || i.item_type === 'piece' || i.item_type === 'resource') return true;
      return i.classes.some(
        (c) => (!selectedRace || c.race === selectedRace) && (!selectedClass || c.class_name === selectedClass),
      );
    });
  }
  if (items.length === 0) return null;

  return (
    <tr>
      <td className={styles.locCell}>
        <div className={styles.locName}>{loc.location_name}</div>
        <div className={styles.locMeta}>
          {loc.location_types.length > 0 && (
            <div className={styles.locTypes}>
              {loc.location_types.map((t, i) => (
                <span key={i} className="type-badge" data-tooltip={TYPE_TOOLTIP[t] ?? t}>
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className={`${styles.locParty} ${partyInfo.cls}`}>{partyInfo.text}</div>
          <div className={styles.locMetaRow}>
            {loc.has_spoil && <span className="spoil-badge">✅ Есть спойл</span>}{' '}
            {loc.has_boss && <span className="boss-badge">⚠️ Босс</span>}
          </div>
          <div className={styles.locLevel}>Avg Lvl: {loc.avg_level}</div>
        </div>
      </td>
      <td className={styles.itemsCell}>
        {items.map((item, i) => (
          <LocationItemRow key={i} item={item} />
        ))}
      </td>
    </tr>
  );
}

export default function LocationsTab() {
  const typeFilter = useLocationsStore((s) => s.typeFilter);
  const selectedRace = useLocationsStore((s) => s.selectedRace);
  const setSelectedRace = useLocationsStore((s) => s.setSelectedRace);
  const selectedClass = useLocationsStore((s) => s.selectedClass);
  const setSelectedClass = useLocationsStore((s) => s.setSelectedClass);
  const selectedCity = useLocationsStore((s) => s.selectedCity);
  const setSelectedCity = useLocationsStore((s) => s.setSelectedCity);
  const selectedLocation = useLocationsStore((s) => s.selectedLocation);
  const setSelectedLocation = useLocationsStore((s) => s.setSelectedLocation);
  const searchQuery = useLocationsStore((s) => s.searchQuery);
  const setSearchQuery = useLocationsStore((s) => s.setSearchQuery);
  const partyFilter = useLocationsStore((s) => s.partyFilter);
  const setPartyFilter = useLocationsStore((s) => s.setPartyFilter);
  const userLevel = useLocationsStore((s) => s.userLevel);
  const setUserLevel = useLocationsStore((s) => s.setUserLevel);
  const handleTypeChange = useLocationsStore((s) => s.handleTypeChange);

  const tableRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ text: string; top: number; left: number } | null>(null);

  const [piecesData, setPiecesData] = useState<LocationEntry[]>([]);
  const [piecesLoaded, setPiecesLoaded] = useState(false);
  const [resourcesData, setResourcesData] = useState<LocationEntry[]>([]);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  useEffect(() => {
    if ((typeFilter === 'piece' || typeFilter === 'all') && !piecesLoaded) {
      import('@data/LOCATIONS_PIECES.json')
        .then((m) => {
          setPiecesData(m.default as LocationEntry[]);
          setPiecesLoaded(true);
        })
        .catch(() => setPiecesLoaded(true));
    }
  }, [typeFilter, piecesLoaded]);

  useEffect(() => {
    if ((typeFilter === 'resource' || typeFilter === 'all') && !resourcesLoaded) {
      import('@data/LOCATIONS_RESOURCES.json')
        .then((m) => {
          setResourcesData(m.default as LocationEntry[]);
          setResourcesLoaded(true);
        })
        .catch(() => setResourcesLoaded(true));
    }
  }, [typeFilter, resourcesLoaded]);

  const handleMouseOver = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-tooltip]') as HTMLElement | null;
    if (!target) {
      setTooltip(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    setTooltip({
      text: target.getAttribute('data-tooltip') ?? '',
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
  }, []);

  const handleMouseOut = useCallback((e: React.MouseEvent) => {
    const related = (e.relatedTarget as HTMLElement)?.closest('[data-tooltip]');
    if (!related) setTooltip(null);
  }, []);

  const activeLocations = useMemo(() => {
    if (typeFilter === 'piece' && piecesData.length > 0) return piecesData;
    if (typeFilter === 'resource' && resourcesData.length > 0) return resourcesData;
    if (typeFilter !== 'all' || piecesData.length === 0) return LOCATIONS_ALL;

    const merged = LOCATIONS_ALL.map((loc) => ({ ...loc, items: [...loc.items] }));
    const pieceByName = new Map<string, LocationEntry>();
    for (const pl of piecesData) {
      pieceByName.set(pl.location_name, pl);
    }
    for (const rl of resourcesData) {
      const existing = pieceByName.get(rl.location_name);
      if (existing) {
        for (const item of rl.items) existing.items.push(item);
      } else {
        pieceByName.set(rl.location_name, rl);
      }
    }

    for (const loc of merged) {
      const extra = pieceByName.get(loc.location_name);
      if (extra) {
        for (const item of extra.items) {
          loc.items.push(item);
        }
        pieceByName.delete(loc.location_name);
      }
    }

    for (const extra of pieceByName.values()) {
      merged.push(extra);
    }

    return merged;
  }, [typeFilter, piecesData, resourcesData]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const loc of activeLocations) set.add(loc.main_location_name);
    return Array.from(set).sort();
  }, [activeLocations]);

  const locationsForCity = useMemo(() => {
    if (!selectedCity) return [];
    return activeLocations.filter((loc) => loc.main_location_name === selectedCity);
  }, [selectedCity, activeLocations]);

  const classesForRace = useMemo(() => {
    if (!selectedRace) return [];
    const set = new Set<string>();
    for (const loc of LOCATIONS_ALL) {
      for (const item of loc.items) {
        for (const c of item.classes) {
          if (c.race === selectedRace) set.add(c.class_name);
        }
      }
    }
    return Array.from(set).sort();
  }, [selectedRace]);

  const levelNum = useMemo(() => {
    const n = parseInt(userLevel, 10);
    return isNaN(n) ? null : n;
  }, [userLevel]);

  const filteredData = useMemo(() => {
    let list = activeLocations;

    if (selectedCity) {
      list = list.filter((loc) => loc.main_location_name === selectedCity);
    }
    if (selectedLocation) {
      list = list.filter((loc) => loc.location_name === selectedLocation);
    }
    if (partyFilter) {
      list = list.filter((loc) => loc.location_types.includes(partyFilter));
    }
    if (levelNum !== null) {
      list = list.filter((loc) => loc.avg_level >= levelNum - 7 && loc.avg_level <= levelNum + 4);
    }

    const result: LocationEntry[] = [];
    for (const loc of list) {
      let items = loc.items;
      if (typeFilter !== 'all') {
        items = items.filter((i) => i.item_type === typeFilter);
      }
      if (
        typeFilter !== 'recipe' &&
        typeFilter !== 'piece' &&
        typeFilter !== 'resource' &&
        (selectedRace || selectedClass)
      ) {
        items = items.filter((i) => {
          if (i.item_type === 'recipe' || i.item_type === 'piece' || i.item_type === 'resource') return true;
          return i.classes.some(
            (c) => (!selectedRace || c.race === selectedRace) && (!selectedClass || c.class_name === selectedClass),
          );
        });
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        items = items.filter((i) => i.item_name.toLowerCase().includes(q));
      }
      if (items.length > 0) {
        result.push({ ...loc, items });
      }
    }
    return result;
  }, [
    typeFilter,
    selectedRace,
    selectedClass,
    selectedCity,
    selectedLocation,
    searchQuery,
    partyFilter,
    levelNum,
    activeLocations,
  ]);

  const grouped = useMemo(() => {
    const map: Record<string, LocationEntry[]> = {};
    for (const loc of filteredData) {
      if (!map[loc.main_location_name]) map[loc.main_location_name] = [];
      map[loc.main_location_name].push(loc);
    }
    return map;
  }, [filteredData]);

  const hideRaceClass = typeFilter !== 'spellbook';

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const findTimerRef = useRef<number>(0);

  useEffect(() => {
    setSubmitted(false);
  }, [typeFilter, selectedCity, selectedLocation, partyFilter, userLevel, searchQuery]);

  useEffect(() => {
    return () => {
      if (findTimerRef.current) clearTimeout(findTimerRef.current);
    };
  }, []);

  const handleFind = useCallback(() => {
    setLoading(true);
    if (findTimerRef.current) clearTimeout(findTimerRef.current);
    const delay = 500 + Math.random() * 500;
    findTimerRef.current = setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, delay);
  }, []);

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.typeSwitcher}>
          {TYPE_BUTTONS.map((btn) => (
            <button
              key={btn.key}
              className={cx(styles.typeBtn, typeFilter === btn.key && styles.typeBtnActive)}
              onClick={() => handleTypeChange(btn.key)}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {!hideRaceClass && (
          <>
            <CustomSelect
              label="Раса"
              value={selectedRace}
              onChange={(v) => {
                setSelectedRace(v);
                setSelectedClass('');
              }}
              options={RACES.map((r) => ({ value: r, label: r }))}
            />

            <CustomSelect
              label="Класс"
              value={selectedClass}
              onChange={(v) => setSelectedClass(v)}
              options={classesForRace.map((c) => ({ value: c, label: c }))}
              disabled={!selectedRace}
            />
          </>
        )}

        <CustomSelect
          label="Город"
          value={selectedCity}
          onChange={(v) => {
            setSelectedCity(v);
            setSelectedLocation('');
          }}
          options={[{ value: '', label: 'Все' }, ...cities.map((c) => ({ value: c, label: c }))]}
        />

        <CustomSelect
          label="Локация"
          value={selectedLocation}
          onChange={(v) => setSelectedLocation(v)}
          options={[
            { value: '', label: 'Все' },
            ...locationsForCity
              .map((loc) => ({ value: loc.location_name, label: loc.location_name }))
              .sort((a, b) => a.label.localeCompare(b.label)),
          ]}
          disabled={!selectedCity}
        />

        <CustomSelect
          label="Тип пати"
          value={partyFilter}
          onChange={(v) => setPartyFilter(v as '' | 'S' | 'SG' | 'G')}
          options={PARTY_OPTIONS}
        />

        <FloatingLabel label="Ваш уровень" value={userLevel}>
          <NumberInput value={userLevel} onChange={setUserLevel} min={1} max={75} />
        </FloatingLabel>

        <FloatingLabel label="Поиск" value={searchQuery}>
          <input
            className={styles.input}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FloatingLabel>

        <button className={styles.findBtn} onClick={handleFind} disabled={loading}>
          {loading ? 'Поиск…' : 'Найти'}
        </button>

        {submitted && (
          <div className={styles.count}>
            Найдено: <b>{filteredData.length} локаций</b>
            {levelNum !== null && (
              <span className={styles.countLevel}>
                {' '}
                (Lvl {levelNum - 7}–{levelNum + 4})
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
        </div>
      ) : !submitted ? (
        <EmptyState message="Нажмите «Найти» для поиска" />
      ) : filteredData.length > 0 ? (
        <div className={styles.tableWrap} ref={tableRef} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Локация</th>
                <th>Предметы</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([city, locations]) => {
                const locCount = locations.length;
                const itemCount = locations.reduce((s, loc) => s + loc.items.length, 0);
                return (
                  <Fragment key={city}>
                    <tr className={styles.citySeparator}>
                      <td colSpan={2}>
                        <span className={styles.cityIcon}>🏰</span>
                        {city}
                        <span className={styles.cityMeta}>
                          ({locCount} локаций, {itemCount} предметов)
                        </span>
                      </td>
                    </tr>
                    {locations.map((loc) => (
                      <LocationRow
                        key={loc.location_name}
                        loc={loc}
                        typeFilter={typeFilter}
                        selectedRace={selectedRace}
                        selectedClass={selectedClass}
                      />
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {tooltip &&
            createPortal(
              <div
                style={{
                  position: 'fixed',
                  top: tooltip.top,
                  left: tooltip.left,
                  transform: 'translate(0, -50%)',
                  background: '#1a2338',
                  color: '#dbe4f0',
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #24304a',
                  pointerEvents: 'none',
                  zIndex: 99999,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                {tooltip.text}
              </div>,
              document.body,
            )}
        </div>
      ) : (
        <EmptyState message="Локации не найдены" />
      )}
    </div>
  );
}
