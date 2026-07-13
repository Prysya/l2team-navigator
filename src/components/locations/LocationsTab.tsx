import cx from 'classnames';
import { useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { LocationEntry, LocationItem, LocationMonster } from '../../types';
import LOCATIONS_ALL_DATA from '../../data/LOCATIONS_ALL.json';
import FloatingLabel from '../../components/shared/FloatingLabel';
import CustomSelect from '../../components/shared/CustomSelect';
import { RACES } from '../../data/races';
import { escapeHtml, formatChance, getPartyText } from '../../utils/helpers';
import styles from './LocationsTab.module.scss';
import { useLocationsStore } from '../../stores/locationsStore';

const LOCATIONS_ALL = LOCATIONS_ALL_DATA as LocationEntry[];

type TypeFilter = 'all' | 'recipe' | 'spellbook';

const TYPE_BUTTONS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: '\u0412\u0441\u0435' },
  { key: 'recipe', label: '\uD83D\uDCDC \u0420\u0435\u0446\u0435\u043F\u0442\u044B' },
  { key: 'spellbook', label: '\uD83D\uDCDA \u041A\u043D\u0438\u0433\u0438' },
];

function renderLocationMonster(m: LocationMonster): string {
  const name = m.monster_url
    ? `<a href="${escapeHtml(m.monster_url)}" target="_blank" rel="noopener">${escapeHtml(m.monster_name)}</a>`
    : escapeHtml(m.monster_name);
  const levelBadge = m.monster_lvl
    ? `<span class="stat-badge stat-lvl">Lvl ${m.monster_lvl}</span>`
    : '';
  const bossBadge = m.is_boss
    ? `<span class="stat-badge stat-boss">\uD83D\uDC80 BOSS</span>`
    : '';
  const drop = formatChance(m.drop_chance);
  const spoil = formatChance(m.spoil_chance);
  return `<div class="${styles.locMonster}">${name} ${levelBadge} ${bossBadge}
    <div class="${styles.locChances}">\u0434\u0440\u043E\u043F: <span class="chance ${drop.cls}">${drop.text}</span> | \u0441\u043F\u043E\u0439\u043B: <span class="chance ${spoil.cls}">${spoil.text}</span></div>
  </div>`;
}

function renderItem(item: LocationItem): string {
  const name = item.item_url
    ? `<a href="${escapeHtml(item.item_url)}" target="_blank" rel="noopener" class="${styles.itemName}">${escapeHtml(item.item_name)}</a>`
    : `<span class="${styles.itemName}">${escapeHtml(item.item_name)}</span>`;

  const typeBadgeCss =
    item.item_type === 'recipe'
      ? `${styles.itemTypeBadge} ${styles.itemTypeRecipe}`
      : `${styles.itemTypeBadge} ${styles.itemTypeSpellbook}`;
  const typeLabel = item.item_type === 'recipe' ? '\u0420\u0435\u0446\u0435\u043F\u0442' : '\u041A\u043D\u0438\u0433\u0430';

  const classTags =
    item.classes.length > 0
      ? item.classes
          .map(
            (c) =>
              `<span class="class-tag">${escapeHtml(c.race)} \u2014 ${escapeHtml(c.class_name)}</span>`
          )
          .join(' ')
      : '';

  const monstersHtml = item.monsters.map(renderLocationMonster).join('');

  const totalDrop = item.monsters.reduce((s, m) => s + (m.drop_chance || 0), 0);
  const totalSpoil = item.monsters.reduce((s, m) => s + (m.spoil_chance || 0), 0);
  const totalHtml = `<div class="${styles.itemTotal}">\u0434\u0440\u043E\u043F: <b>${totalDrop.toFixed(2)}%</b> | \u0441\u043F\u043E\u0439\u043B: <b>${totalSpoil.toFixed(2)}%</b></div>`;

  return `<div class="${styles.locItem}">
    <div class="${styles.itemHeader}">
      <span class="${typeBadgeCss}">${typeLabel}</span>
      ${name}
    </div>
    ${classTags ? `<div class="${styles.itemClasses}">${classTags}</div>` : ''}
    <div class="${styles.itemMonsters}">${monstersHtml}</div>
    ${totalHtml}
  </div>`;
}

function getTypeTooltip(t: string): string {
  const map: Record<string, string> = {
    S: 'Одиночный (solo)',
    SG: 'Минигруппа (small group)',
    G: 'Полная группа (group)',
  };
  return map[t] ?? t;
}

function renderLocation(loc: LocationEntry, typeFilter: TypeFilter, selectedRace: string, selectedClass: string): string {
  const partyInfo = getPartyText(loc.location_types, loc.has_boss);

  const typesHtml =
    loc.location_types.length > 0
      ? loc.location_types
          .map((t) => `<span class="type-badge" data-tooltip="${escapeHtml(getTypeTooltip(t))}">${escapeHtml(t)}</span>`)
          .join('')
      : '';

  const spoilHtml = loc.has_spoil ? '<span class="spoil-badge">\u2705 \u0415\u0441\u0442\u044C \u0441\u043F\u043E\u0439\u043B</span>' : '';
  const bossHtml = loc.has_boss ? '<span class="boss-badge">\u26A0\uFE0F \u0411\u043E\u0441\u0441</span>' : '';

  let items = loc.items;
  if (typeFilter !== 'all') {
    items = items.filter((i) => i.item_type === typeFilter);
  }
  if (typeFilter !== 'recipe' && (selectedRace || selectedClass)) {
    items = items.filter((i) => {
      if (i.item_type === 'recipe') return true;
      return i.classes.some(
        (c) =>
          (!selectedRace || c.race === selectedRace) &&
          (!selectedClass || c.class_name === selectedClass)
      );
    });
  }
  if (items.length === 0) return '';

  const itemsHtml = items.map(renderItem).join('');

  return `<tr>
    <td class="${styles.locCell}">
      <div class="${styles.locName}">${escapeHtml(loc.location_name)}</div>
      <div class="${styles.locMeta}">
        ${typesHtml ? `<div class="${styles.locTypes}">${typesHtml}</div>` : ''}
        <div class="${styles.locParty} ${partyInfo.cls}">${escapeHtml(partyInfo.text)}</div>
        <div class="${styles.locMetaRow}">${spoilHtml} ${bossHtml}</div>
        <div class="${styles.locLevel}">Avg Lvl: ${loc.avg_level}</div>
      </div>
    </td>
    <td class="${styles.itemsCell}">${itemsHtml}</td>
  </tr>`;
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
    if (!target) { setTooltip(null); return; }
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
            (c) =>
              (!selectedRace || c.race === selectedRace) &&
              (!selectedClass || c.class_name === selectedClass)
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

  const totalItemCount = useMemo(
    () => filteredData.reduce((sum, loc) => sum + loc.items.length, 0),
    [filteredData]
  );

  const tableHtml = useMemo(
    () =>
      Object.entries(grouped)
        .map(([city, locations]) => {
          const locCount = locations.length;
          const itemCount = locations.reduce((s, loc) => s + loc.items.length, 0);

          const locationRows = locations
            .map((loc) => renderLocation(loc, typeFilter, selectedRace, selectedClass))
            .filter(Boolean)
            .join('');

          return `<tr class="${styles.citySeparator}">
            <td colspan="2">
              <span class="${styles.cityIcon}">\uD83C\uDFF0</span>
              ${escapeHtml(city)}
              <span class="${styles.cityMeta}">(${locCount} \u043B\u043E\u043A\u0430\u0446\u0438\u0439, ${itemCount} \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u043E\u0432)</span>
            </td>
          </tr>${locationRows}`;
        })
        .join(''),
    [grouped, typeFilter, selectedRace, selectedClass]
  );

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
              onChange={(v) => { setSelectedRace(v); setSelectedClass(''); }}
              options={RACES.map(r => ({ value: r, label: r }))}
            />

            <CustomSelect
              label="Класс"
              value={selectedClass}
              onChange={(v) => setSelectedClass(v)}
              options={classesForRace.map(c => ({ value: c, label: c }))}
              disabled={!selectedRace}
            />
          </>
        )}

        <CustomSelect
          label="Город"
          value={selectedCity}
          onChange={(v) => { setSelectedCity(v); setSelectedLocation(''); }}
          options={cities.map(c => ({ value: c, label: c }))}
        />

        <CustomSelect
          label="Локация"
          value={selectedLocation}
          onChange={(v) => setSelectedLocation(v)}
          options={locationsForCity.map(loc => ({ value: loc.location_name, label: loc.location_name }))}
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
            <tbody dangerouslySetInnerHTML={{ __html: tableHtml }} />
          </table>
          {tooltip && createPortal(
            <div style={{
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
            }}>
              {tooltip.text}
            </div>,
            document.body
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>Локации не найдены</div>
      )}
    </div>
  );
}
