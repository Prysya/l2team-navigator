import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LOCATIONS_ALL_DATA from '@data/LOCATIONS_ALL.json';
import { RACES } from '@data/races';
import CustomSelect from '@shared/CustomSelect';
import EmptyState from '@shared/EmptyState';
import FloatingLabel from '@shared/FloatingLabel';
import { formatChance, getPartyText } from '@utils/helpers';
import cx from 'classnames';

import { useLocationsStore } from '@/stores/locationsStore';
import type { LocationEntry, LocationItem, LocationMonster } from '@/types';

import styles from './LocationsTab.module.scss';

const LOCATIONS_ALL = LOCATIONS_ALL_DATA as LocationEntry[];

type TypeFilter = 'all' | 'recipe' | 'spellbook';

const TYPE_BUTTONS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: '\u0412\u0441\u0435' },
  { key: 'recipe', label: '\uD83D\uDCDC \u0420\u0435\u0446\u0435\u043F\u0442\u044B' },
  { key: 'spellbook', label: '\uD83D\uDCDA \u041A\u043D\u0438\u0433\u0438' },
];

const TYPE_TOOLTIP: Record<string, string> = {
  S: 'Одиночный (solo)',
  SG: 'Минигруппа (small group)',
  G: 'Полная группа (group)',
};

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
      {m.is_boss ? <span className="stat-badge stat-boss">{'\uD83D\uDC80'} BOSS</span> : null}
      <div className={styles.locChances}>
        {'\u0434\u0440\u043E\u043F'}: <span className={'chance ' + drop.cls}>{drop.text}</span>
        {' | \u0441\u043F\u043E\u0439\u043B'}: <span className={'chance ' + spoil.cls}>{spoil.text}</span>
      </div>
    </div>
  );
}

function LocationItemRow({ item }: { item: LocationItem }) {
  const totalDrop = item.monsters.reduce((s, m) => s + (m.drop_chance || 0), 0);
  const totalSpoil = item.monsters.reduce((s, m) => s + (m.spoil_chance || 0), 0);
  const isRecipe = item.item_type === 'recipe';
  return (
    <div className={styles.locItem}>
      <div className={styles.itemHeader}>
        <span className={`${styles.itemTypeBadge} ${isRecipe ? styles.itemTypeRecipe : styles.itemTypeSpellbook}`}>
          {isRecipe ? '\u0420\u0435\u0446\u0435\u043F\u0442' : '\u041A\u043D\u0438\u0433\u0430'}
        </span>
        {item.item_url ? (
          <a href={item.item_url} target="_blank" rel="noopener noreferrer" className={styles.itemName}>
            {item.item_name}
          </a>
        ) : (
          <span className={styles.itemName}>{item.item_name}</span>
        )}
      </div>
      {item.classes.length > 0 && (
        <div className={styles.itemClasses}>
          {item.classes.map((c, i) => (
            <span key={i} className="class-tag">
              {c.race} {'\u2014'} {c.class_name}
            </span>
          ))}
        </div>
      )}
      <div className={styles.itemMonsters}>
        {item.monsters.map((m, i) => (
          <LocationMonsterRow key={i} m={m} />
        ))}
      </div>
      <div className={styles.itemTotal}>
        {'\u0434\u0440\u043E\u043F'}: <b>{totalDrop.toFixed(2)}%</b>
        {' | \u0441\u043F\u043E\u0439\u043B'}: <b>{totalSpoil.toFixed(2)}%</b>
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
  if (typeFilter !== 'recipe' && (selectedRace || selectedClass)) {
    items = items.filter((i) => {
      if (i.item_type === 'recipe') return true;
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
            {loc.has_spoil && <span className="spoil-badge">{'\u2705'} {'\u0415\u0441\u0442\u044C \u0441\u043F\u043E\u0439\u043B'}</span>}{' '}
            {loc.has_boss && <span className="boss-badge">{'\u26A0\uFE0F'} {'\u0411\u043E\u0441\u0441'}</span>}
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
  const handleTypeChange = useLocationsStore((s) => s.handleTypeChange);

  const tableRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ text: string; top: number; left: number } | null>(null);

  const handleMouseOver = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-tooltip]') as HTMLElement | null;
    if (!target) {
      setTooltip(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    setTooltip({
      text: target.getAttribute('data-tooltip') ?? '',
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  }, []);

  const handleMouseOut = useCallback((e: React.MouseEvent) => {
    const related = (e.relatedTarget as HTMLElement)?.closest('[data-tooltip]');
    if (!related) setTooltip(null);
  }, []);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const loc of LOCATIONS_ALL) set.add(loc.main_location_name);
    return Array.from(set).sort();
  }, []);

  const locationsForCity = useMemo(() => {
    if (!selectedCity) return [];
    return LOCATIONS_ALL.filter((loc) => loc.main_location_name === selectedCity);
  }, [selectedCity]);

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

  const filteredData = useMemo(() => {
    let list = LOCATIONS_ALL;

    if (selectedCity) {
      list = list.filter((loc) => loc.main_location_name === selectedCity);
    }
    if (selectedLocation) {
      list = list.filter((loc) => loc.location_name === selectedLocation);
    }

    const result: LocationEntry[] = [];
    for (const loc of list) {
      let items = loc.items;
      if (typeFilter !== 'all') {
        items = items.filter((i) => i.item_type === typeFilter);
      }
      if (typeFilter !== 'recipe' && (selectedRace || selectedClass)) {
        items = items.filter((i) => {
          if (i.item_type === 'recipe') return true;
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
  }, [typeFilter, selectedRace, selectedClass, selectedCity, selectedLocation, searchQuery]);

  const grouped = useMemo(() => {
    const map: Record<string, LocationEntry[]> = {};
    for (const loc of filteredData) {
      if (!map[loc.main_location_name]) map[loc.main_location_name] = [];
      map[loc.main_location_name].push(loc);
    }
    return map;
  }, [filteredData]);

  const totalItemCount = useMemo(() => filteredData.reduce((sum, loc) => sum + loc.items.length, 0), [filteredData]);

  const isRecipeType = typeFilter === 'recipe';

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

        {!isRecipeType && (
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
          options={cities.map((c) => ({ value: c, label: c }))}
        />

        <CustomSelect
          label="Локация"
          value={selectedLocation}
          onChange={(v) => setSelectedLocation(v)}
          options={locationsForCity.map((loc) => ({ value: loc.location_name, label: loc.location_name }))}
          disabled={!selectedCity}
        />

        <FloatingLabel label="Поиск" value={searchQuery}>
          <input
            className={styles.input}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FloatingLabel>

        <div className={styles.count}>
          Найдено: <b>{totalItemCount}</b>
        </div>
      </div>

      {filteredData.length > 0 ? (
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
                        <span className={styles.cityIcon}>{'\uD83C\uDFF0'}</span>
                        {city}
                        <span className={styles.cityMeta}>
                          ({locCount} {'\u043B\u043E\u043A\u0430\u0446\u0438\u0439'}, {itemCount} {'\u043F\u0440\u0435\u0434\u043C\u0435\u0442\u043E\u0432'})
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
                  transform: 'translate(-50%, -100%)',
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
