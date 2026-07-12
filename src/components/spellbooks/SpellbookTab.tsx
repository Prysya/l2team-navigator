import { useState, useMemo } from 'react';
import type { Spellbook } from '../../types';
import SPELLBOOKS_DATA from '../../data/SPELLBOOKS.json';
import { RACES } from '../../data/races';
import { renderMonsterRow, sortMonsters, escapeHtml } from '../../utils/helpers';
import styles from './SpellbookTab.module.scss';

const SPELLBOOKS = SPELLBOOKS_DATA as Spellbook[];

type Lang = 'en' | 'ru';

const RACE_LABELS_RU: Record<string, string> = {
  Human: 'Человек', Elf: 'Светлый Эльф', 'Dark Elf': 'Тёмный Эльф', Orc: 'Орк', Dwarf: 'Гном',
};

const RACE_LABELS_EN: Record<string, string> = {
  Human: 'Human', Elf: 'Elf', 'Dark Elf': 'Dark Elf', Orc: 'Orc', Dwarf: 'Dwarf',
};

const RU_CLASS_NAMES: Record<string, string> = {
  'Abyss Walker': 'Странник Бездны',
  Bishop: 'Епископ',
  Bladedancer: 'Танцор Смерти',
  'Bounty Hunter': 'Охотник за Наградой',
  'Dark Avenger': 'Мститель',
  Destroyer: 'Разрушитель',
  'Elemental Summoner': 'Последователь Стихий',
  'Elven Elder': 'Мудрец Евы',
  Gladiator: 'Гладиатор',
  Necromancer: 'Некромант',
  Overlord: 'Верховный Шаман',
  Paladin: 'Паладин',
  'Phantom Ranger': 'Призрачный Рейнджер',
  'Phantom Summoner': 'Последователь Тьмы',
  Prophet: 'Проповедник',
  'Shillien Elder': 'Мудрец Шилен',
  'Shillien Knight': 'Рыцарь Шилен',
  Sorcerer: 'Волшебник',
  Spellhowler: 'Заклинатель Ветра',
  Spellsinger: 'Певец Заклинаний',
  Swordsinger: 'Менестрель',
  'Temple Knight': 'Рыцарь Евы',
  Terramancer: 'Террамант',
  Tyrant: 'Тиран',
  Warcryer: 'Вестник Войны',
  Warlock: 'Колдун',
  Warlord: 'Копейщик',
  Warsmith: 'Кузнец',
};

function getRaceLabel(race: string, lang: Lang): string {
  const map = lang === 'en' ? RACE_LABELS_EN : RACE_LABELS_RU;
  return map[race] ?? race;
}

function getClassName(cls: string, lang: Lang): string {
  return lang === 'ru' ? (RU_CLASS_NAMES[cls] ?? cls) : cls;
}

export default function SpellbookTab() {
  const [lang, setLang] = useState<Lang>('en');
  const [selectedRace, setSelectedRace] = useState(
    () => new URLSearchParams(window.location.search).get('sbRace') ?? ''
  );
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState(
    () => new URLSearchParams(window.location.search).get('sbQ') ?? ''
  );

  const classesForRace = useMemo(() => {
    if (!selectedRace) return [];
    const set = new Set<string>();
    for (const sb of SPELLBOOKS) {
      for (const c of sb.classes) {
        if (c.race === selectedRace) set.add(c.class_name);
      }
    }
    return Array.from(set).sort();
  }, [selectedRace]);

  const filtered = useMemo(() => {
    let list = SPELLBOOKS;
    if (selectedRace) {
      list = list.filter((sb) => sb.classes.some((c) => c.race === selectedRace));
    }
    if (selectedClass) {
      list = list.filter((sb) => sb.classes.some((c) => c.class_name === selectedClass));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (sb) =>
          sb.spellbook_name.toLowerCase().includes(q) ||
          (sb.smart_name && sb.smart_name.toLowerCase().includes(q)) ||
          sb.skill_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedRace, selectedClass, searchQuery]);

  const totalMonsters = useMemo(
    () => filtered.reduce((sum, sb) => sum + sb.monster.length, 0),
    [filtered]
  );

  const tableHtml = useMemo(
    () =>
      filtered
        .map((sb) => {
          const sorted = sortMonsters(sb.monster);
          const rowspan = sorted.length || 1;

          const classTags = sb.classes
            .map(
              (c) =>
                `<span class="class-tag">${escapeHtml(getRaceLabel(c.race, lang))} — ${escapeHtml(getClassName(c.class_name, lang))}</span>`
            )
            .join(' ');

          const classesRow = `<div class="spellbook-classes">${classTags}</div>`;

          const bookCell = `<div class="spellbook-name"><a href="${escapeHtml(sb.spellbook_url)}" target="_blank" rel="noopener">${escapeHtml(sb.spellbook_name)}</a>${classesRow}</div>`;

          return sorted
            .map((m, idx) => {
              const cells = renderMonsterRow(m);
              return `<tr>
            ${idx === 0 ? `<td rowspan="${rowspan}">${bookCell}</td><td rowspan="${rowspan}">${sb.lvl}</td>` : ''}
            <td>${cells.monsterCell}</td>
            <td>${cells.locationsCell}</td>
            <td>${cells.dropCell}</td>
            <td>${cells.spoilCell}</td>
            <td>${cells.commentCell}</td>
          </tr>`;
            })
            .join('');
        })
        .join(''),
    [filtered, lang]
  );

  const handleRaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRace(e.target.value);
    setSelectedClass('');
  };

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.langBar}>
          <span className={styles.langLabel}>Язык рас и профессий:</span>
          <button
            className={`${styles.langOpt} ${lang === 'en' ? styles.langOptActive : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`${styles.langOpt} ${lang === 'ru' ? styles.langOptActive : ''}`}
            onClick={() => setLang('ru')}
          >
            RU
          </button>
        </div>

        <label className={styles.label}>🧙 Раса:</label>
        <select className={styles.select} value={selectedRace} onChange={handleRaceChange}>
          <option value="">Все расы</option>
          {RACES.map((r) => (
            <option key={r} value={r}>
              {getRaceLabel(r, lang)}
            </option>
          ))}
        </select>

        <label className={styles.label}>⚔️ Профессия:</label>
        <select
          className={styles.select}
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          disabled={!selectedRace}
        >
          <option value="">Все профессии</option>
          {classesForRace.map((c) => (
            <option key={c} value={c}>
              {getClassName(c, lang)}
            </option>
          ))}
        </select>

        <input
          className={styles.input}
          type="text"
          placeholder="🔍 Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div
          className={styles.count}
          dangerouslySetInnerHTML={{
            __html: `Найдено книг: <b>${filtered.length}</b>`,
          }}
        />
      </div>

      <div className={styles.summary}>
        Книг: <b>{filtered.length}</b> | Мобов: <b>{totalMonsters}</b>
      </div>

      {filtered.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Книга</th>
                <th>Lvl</th>
                <th>Монстр</th>
                <th>Локации</th>
                <th>Шанс дропа</th>
                <th>Шанс спойла</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody dangerouslySetInnerHTML={{ __html: tableHtml }} />
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>Книги не найдены</div>
      )}
    </div>
  );
}
