import { useMemo, useEffect } from 'react';
import type { ClassSkill, Spellbook } from '../../types';
import { RACES } from '../../data/races';
import skillsData from '../../data/SKILLS.json';
import spellbooksData from '../../data/SPELLBOOKS.json';
import styles from './SkillsTab.module.scss';
import CopyLink from '../../components/shared/CopyLink';
import FloatingLabel from '../../components/shared/FloatingLabel';
import CustomSelect from '../../components/shared/CustomSelect';
import { useSkillsStore } from '../../stores/skillsStore';
import cx from 'classnames';

const spellbookByName = new Map<string, Spellbook>();
(spellbooksData as Spellbook[]).forEach(sb => {
  spellbookByName.set(sb.skill_name.toLowerCase(), sb);
});

const CLASS_RACE_MAP: Record<string, string> = {
  'Воитель': 'Human', 'Рыцарь': 'Human', 'Разбойник': 'Human', 'Копейщик': 'Human',
  'Гладиатор': 'Human', 'Паладин': 'Human', 'Мститель': 'Human', 'Искатель Сокровищ': 'Human', 'Стрелок': 'Human',
  'Маг': 'Human', 'Клерик': 'Human', 'Волшебник': 'Human', 'Некромант': 'Human', 'Колдун': 'Human',
  'Епископ': 'Human', 'Проповедник': 'Human',
  'Светлый Рыцарь': 'Elf', 'Разведчик': 'Elf', 'Рыцарь Евы': 'Elf', 'Менестрель': 'Elf',
  'Следопыт': 'Elf', 'Серебрянный Рейнджер': 'Elf',
  'Светлый Маг': 'Elf', 'Оракул Евы': 'Elf', 'Певец Заклинаний': 'Elf', 'Последователь Стихий': 'Elf', 'Мудрец Евы': 'Elf',
  'Тёмный Рыцарь': 'Dark Elf', 'Ассасин': 'Dark Elf', 'Рыцарь Шилен': 'Dark Elf', 'Танцор Смерти': 'Dark Elf',
  'Странник Бездны': 'Dark Elf', 'Призрачный Рейнджер': 'Dark Elf',
  'Тёмный Маг': 'Dark Elf', 'Оракул Шилен': 'Dark Elf', 'Заклинатель Ветра': 'Dark Elf',
  'Последователь Тьмы': 'Dark Elf', 'Мудрец Шилен': 'Dark Elf',
  'Налётчик': 'Orc', 'Монах': 'Orc', 'Разрушитель': 'Orc', 'Тиран': 'Orc',
  'Шаман': 'Orc', 'Верховный Шаман': 'Orc', 'Вестник Войны': 'Orc',
  'Собиратель': 'Dwarf', 'Ремесленник': 'Dwarf', 'Охотник за Наградой': 'Dwarf', 'Кузнец': 'Dwarf',
  'Геомант': 'Dwarf', 'Террамант': 'Dwarf',
};

const EN_CLASS_NAMES: Record<string, string> = {
  'Воитель': 'Warrior', 'Рыцарь': 'Knight', 'Разбойник': 'Rogue', 'Копейщик': 'Warlord',
  'Гладиатор': 'Gladiator', 'Паладин': 'Paladin', 'Мститель': 'Dark Avenger',
  'Искатель Сокровищ': 'Treasure Hunter', 'Стрелок': 'Hawkeye',
  'Маг': 'Wizard', 'Клерик': 'Cleric', 'Волшебник': 'Sorcerer', 'Некромант': 'Necromancer',
  'Колдун': 'Warlock', 'Епископ': 'Bishop', 'Проповедник': 'Prophet',
  'Светлый Рыцарь': 'Elven Knight', 'Разведчик': 'Elven Scout', 'Рыцарь Евы': 'Temple Knight',
  'Менестрель': 'Swordsinger', 'Следопыт': 'Plains Walker', 'Серебрянный Рейнджер': 'Silver Ranger',
  'Светлый Маг': 'Elven Wizard', 'Оракул Евы': 'Oracle', 'Певец Заклинаний': 'Spellsinger',
  'Последователь Стихий': 'Elemental Summoner', 'Мудрец Евы': 'Elder',
  'Тёмный Рыцарь': 'Palus Knight', 'Ассасин': 'Assassin', 'Рыцарь Шилен': 'Shillien Knight',
  'Танцор Смерти': 'Bladedancer', 'Странник Бездны': 'Abyss Walker', 'Призрачный Рейнджер': 'Phantom Ranger',
  'Тёмный Маг': 'Dark Wizard', 'Оракул Шилен': 'Shillien Oracle', 'Заклинатель Ветра': 'Spellhowler',
  'Последователь Тьмы': 'Phantom Summoner', 'Мудрец Шилен': 'Shillien Elder',
  'Налётчик': 'Orc Raider', 'Монах': 'Orc Monk', 'Разрушитель': 'Destroyer', 'Тиран': 'Tyrant',
  'Шаман': 'Orc Shaman', 'Верховный Шаман': 'Overlord', 'Вестник Войны': 'Warcryer',
  'Собиратель': 'Scavenger', 'Ремесленник': 'Artisan', 'Охотник за Наградой': 'Bounty Hunter',
  'Кузнец': 'Warsmith', 'Геомант': 'Geomancer', 'Террамант': 'Terramancer',
};

const RACE_LABELS: Record<string, string> = {
  Human: 'Human', Elf: 'Elf', 'Dark Elf': 'Dark Elf', Orc: 'Orc', Dwarf: 'Dwarf',
};

const skillsMap = skillsData as Record<string, { className: string; race: string; skills: ClassSkill[] }>;
const ALL_CLASSES = Object.keys(skillsMap).sort();

function getClassesByRace(race: string): string[] {
  return ALL_CLASSES.filter(cls => CLASS_RACE_MAP[cls] === race);
}

function getClassName(cls: string): string {
  return EN_CLASS_NAMES[cls] ?? cls;
}

function getRaceLabel(race: string): string {
  return RACE_LABELS[race] ?? race;
}

function highlightNumbers(text: string): React.ReactNode {
  const parts = text.split(/([+-]?\d+(?:\.\d+)?%?)/g);
  return parts.map((part, i) => {
    if (/^[+-]?\d+(?:\.\d+)?%?$/.test(part)) {
      return <span key={i} className={styles.numHighlight}>{part}</span>;
    }
    return part;
  });
}

function cleanStatText(text: string): string {
  return text.replace(/\b0+(\d+)\b/g, '$1');
}

function compressLevels(levels: ClassSkill['levels']): { levels: string; changes: string[]; rowspan: number }[] {
  if (!levels.length) return [];
  const groups: { levels: string; changes: string[]; rowspan: number }[] = [];
  let i = 0;
  while (i < levels.length) {
    const cur = levels[i];
    const changeKey = JSON.stringify(cur.changes);
    let j = i + 1;
    while (j < levels.length && JSON.stringify(levels[j].changes) === changeKey) j++;
    const lvls = levels.slice(i, j);
    const lvlStr = lvls.map(l => l.classLevel).join(', ');
    groups.push({ levels: lvlStr, changes: cur.changes, rowspan: 1 });
    i = j;
  }
  return groups;
}

function getStatIcon(label: string): string {
  if (label === 'MP') return '💧';
  if (label === 'КД') return '⏱';
  if (label === 'Длит.') return '⏳';
  return '';
}

interface SkillsTabProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function SkillsTab({ onNavigateToTab }: SkillsTabProps) {
  const selectedRace = useSkillsStore(s => s.selectedRace);
  const selectedClass = useSkillsStore(s => s.selectedClass);
  const searchQuery = useSkillsStore(s => s.searchQuery);
  const filterType = useSkillsStore(s => s.filterType);
  const setSearchQuery = useSkillsStore(s => s.setSearchQuery);
  const setFilterType = useSkillsStore(s => s.setFilterType);
  const setSelectedRace = useSkillsStore(s => s.setSelectedRace);
  const setSelectedClass = useSkillsStore(s => s.setSelectedClass);

  const availableClasses = useMemo(() => {
    if (!selectedRace) return [];
    return getClassesByRace(selectedRace);
  }, [selectedRace]);

  const currentSkills = useMemo(() => {
    if (!selectedClass || !skillsMap[selectedClass]) return [];
    return skillsMap[selectedClass].skills;
  }, [selectedClass]);

  const filteredSkills = useMemo(() => {
    let list = currentSkills;
    if (filterType !== 'all') {
      list = list.filter(s => s.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [currentSkills, filterType, searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const race = params.get('race');
    const cls = params.get('class');
    const skill = params.get('skill');
    if (race) setSelectedRace(race);
    if (cls) setSelectedClass(cls);
    if (skill) setSearchQuery(skill);
  }, [setSelectedRace, setSelectedClass, setSearchQuery]);

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.field}>
          <CustomSelect
            label="Раса"
            value={selectedRace}
            onChange={(v) => { setSelectedRace(v); setSelectedClass(''); }}
            options={RACES.map(r => ({ value: r, label: getRaceLabel(r) }))}
          />
        </div>

        <div className={styles.field}>
          <CustomSelect
            label="Класс"
            value={selectedClass}
            onChange={(v) => setSelectedClass(v)}
            options={availableClasses.map(c => ({ value: c, label: getClassName(c) }))}
            disabled={!selectedRace}
          />
        </div>

        <div className={styles.filterGroup}>
          <button
            className={cx(styles.filterBtn, filterType === 'all' && styles.filterBtnActive)}
            onClick={() => setFilterType('all')}
          >
            Все
          </button>
          <button
            className={cx(styles.filterBtn, filterType === 'active' && styles.filterBtnActive)}
            onClick={() => setFilterType('active')}
          >
            Активные
          </button>
          <button
            className={cx(styles.filterBtn, filterType === 'passive' && styles.filterBtnActive)}
            onClick={() => setFilterType('passive')}
          >
            Пассивные
          </button>
        </div>

        <div className={styles.searchWrap}>
          <FloatingLabel className={styles.searchField} label="Поиск по названию скилла" value={searchQuery}>
            <input
              className={styles.input}
              type="text"
              name="skill-search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </FloatingLabel>
        </div>

        <div className={styles.skillsCount}>
          Навыков: <b>{filteredSkills.length}</b>
        </div>
      </div>

      {!selectedClass ? (
        <div className={styles.emptyState}>
          {selectedRace
            ? 'Выберите класс для просмотра скиллов'
            : 'Выберите расу и класс для просмотра скиллов'}
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className={styles.skillsGrid}>
          {filteredSkills.map(skill => (
            <div key={skill.id} className={styles.skillCard}>
              <div className={styles.skillHeader}>
                {skill.imageUrl && (
                  <img
                    className={styles.skillIcon}
                    src={`https://lu4db.ru${skill.imageUrl}`}
                    alt={skill.name}
                    loading="lazy"
                  />
                )}
                <div className={styles.skillInfo}>
                  <div className={styles.skillName}>
                    {skill.name}
                    <CopyLink getUrl={() => window.location.origin + import.meta.env.BASE_URL + 'skills?race=' + encodeURIComponent(selectedRace) + '&class=' + encodeURIComponent(selectedClass) + '&skill=' + encodeURIComponent(skill.name)} />
                  </div>
                  <div className={styles.skillMeta}>
                    <span className={skill.type === 'passive' ? styles.typePassive : styles.typeActive}>
                      {skill.type === 'passive' ? 'Пассивный' : 'Активный'}
                    </span>
                    {skill.subtype && (
                      <span className={styles.skillSubtype}>{skill.subtype}</span>
                    )}
                    <span className={styles.skillLvl}>
                      Уровней: {skill.maxLevel}
                    </span>
                    {skill.firstClassLevel > 0 && (
                      <span className={styles.skillLvl}>
                        С {skill.firstClassLevel} lvl
                      </span>
                    )}
                  </div>
                  {skill.stats.length > 0 && (
                    <div className={styles.skillStats}>
                      {skill.stats.filter(st => st.label !== 'HP').map((st, i) => (
                        <span key={i} className={styles.skillStat}>
                          {getStatIcon(st.label)} {st.label}: <b>{cleanStatText(st.text)}</b>
                        </span>
                      ))}
                    </div>
                  )}
                  {spellbookByName.has(skill.name.toLowerCase()) && (
                    <button
                      className={styles.sbLink}
                      onClick={() => {
                        onNavigateToTab?.('spellbooks?sbRace=' + encodeURIComponent(selectedRace || '') + '&sbQ=' + encodeURIComponent(skill.name));
                      }}
                    >
                      📚 Где выбить книгу
                    </button>
                  )}
                </div>
              </div>
              {skill.levels.length > 0 && (
                <div className={styles.skillLevels}>
                  <table className={styles.levelTable}>
                    <thead>
                      <tr>
                        <th>Ур. персонажа</th>
                        <th>Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compressLevels(skill.levels).map((g, gi) => (
                        <tr key={gi}>
                          <td className={styles.lvlClass}>{g.levels}</td>
                          <td className={styles.lvlDesc}>
                            {g.changes.map((ch, ci) => (
                              <div key={ci} className={styles.lvlChange}>{highlightNumbers(ch)}</div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>Скиллы не найдены</div>
      )}
    </div>
  );
}
