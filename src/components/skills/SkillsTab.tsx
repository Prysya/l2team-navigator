import { useEffect, useMemo } from 'react';
import { RACES } from '@data/races';
import skillsData from '@data/SKILLS.json';
import spellbooksData from '@data/SPELLBOOKS.json';
import CustomSelect from '@shared/CustomSelect';
import EmptyState from '@shared/EmptyState';
import FloatingLabel from '@shared/FloatingLabel';
import cx from 'classnames';

import { useSkillsStore } from '@/stores/skillsStore';
import type { ClassSkill, Spellbook } from '@/types';

import styles from './SkillsTab.module.scss';

const spellbookByName = new Map<string, Spellbook>();
(spellbooksData as Spellbook[]).forEach((sb) => {
  spellbookByName.set(sb.skill_name.toLowerCase(), sb);
});

const CLASS_RACE_MAP: Record<string, string> = {
  Fighter: 'Human',
  Mage: 'Human',
  Воитель: 'Human',
  Рыцарь: 'Human',
  Разбойник: 'Human',
  Копейщик: 'Human',
  Гладиатор: 'Human',
  Паладин: 'Human',
  Мститель: 'Human',
  'Искатель Сокровищ': 'Human',
  Стрелок: 'Human',
  Маг: 'Human',
  Клерик: 'Human',
  Волшебник: 'Human',
  Некромант: 'Human',
  Колдун: 'Human',
  Епископ: 'Human',
  Проповедник: 'Human',
  'Elven Fighter': 'Elf',
  'Elven Mage': 'Elf',
  'Светлый Рыцарь': 'Elf',
  Разведчик: 'Elf',
  'Рыцарь Евы': 'Elf',
  Менестрель: 'Elf',
  Следопыт: 'Elf',
  'Серебрянный Рейнджер': 'Elf',
  'Светлый Маг': 'Elf',
  'Оракул Евы': 'Elf',
  'Певец Заклинаний': 'Elf',
  'Последователь Стихий': 'Elf',
  'Мудрец Евы': 'Elf',
  'Dark Fighter': 'Dark Elf',
  'Dark Mage': 'Dark Elf',
  'Тёмный Рыцарь': 'Dark Elf',
  Ассасин: 'Dark Elf',
  'Рыцарь Шилен': 'Dark Elf',
  'Танцор Смерти': 'Dark Elf',
  'Странник Бездны': 'Dark Elf',
  'Призрачный Рейнджер': 'Dark Elf',
  'Тёмный Маг': 'Dark Elf',
  'Оракул Шилен': 'Dark Elf',
  'Заклинатель Ветра': 'Dark Elf',
  'Последователь Тьмы': 'Dark Elf',
  'Мудрец Шилен': 'Dark Elf',
  'Orc Fighter': 'Orc',
  'Orc Mage': 'Orc',
  Налётчик: 'Orc',
  Монах: 'Orc',
  Разрушитель: 'Orc',
  Тиран: 'Orc',
  Шаман: 'Orc',
  'Верховный Шаман': 'Orc',
  'Вестник Войны': 'Orc',
  'Dwarven Fighter': 'Dwarf',
  'Dwarven Mystic': 'Dwarf',
  Собиратель: 'Dwarf',
  Ремесленник: 'Dwarf',
  'Охотник за Наградой': 'Dwarf',
  Кузнец: 'Dwarf',
  Геомант: 'Dwarf',
  Террамант: 'Dwarf',
};

const EN_CLASS_NAMES: Record<string, string> = {
  Fighter: 'Fighter',
  Mage: 'Mage',
  Воитель: 'Warrior',
  Рыцарь: 'Knight',
  Разбойник: 'Rogue',
  Копейщик: 'Warlord',
  Гладиатор: 'Gladiator',
  Паладин: 'Paladin',
  Мститель: 'Dark Avenger',
  'Искатель Сокровищ': 'Treasure Hunter',
  Стрелок: 'Hawkeye',
  Маг: 'Wizard',
  Клерик: 'Cleric',
  Волшебник: 'Sorcerer',
  Некромант: 'Necromancer',
  Колдун: 'Warlock',
  Епископ: 'Bishop',
  Проповедник: 'Prophet',
  'Elven Fighter': 'Elven Fighter',
  'Elven Mage': 'Elven Mage',
  'Светлый Рыцарь': 'Elven Knight',
  Разведчик: 'Elven Scout',
  'Рыцарь Евы': 'Temple Knight',
  Менестрель: 'Swordsinger',
  Следопыт: 'Plains Walker',
  'Серебрянный Рейнджер': 'Silver Ranger',
  'Светлый Маг': 'Elven Wizard',
  'Оракул Евы': 'Oracle',
  'Певец Заклинаний': 'Spellsinger',
  'Последователь Стихий': 'Elemental Summoner',
  'Мудрец Евы': 'Elder',
  'Dark Fighter': 'Dark Fighter',
  'Dark Mage': 'Dark Mage',
  'Тёмный Рыцарь': 'Palus Knight',
  Ассасин: 'Assassin',
  'Рыцарь Шилен': 'Shillien Knight',
  'Танцор Смерти': 'Bladedancer',
  'Странник Бездны': 'Abyss Walker',
  'Призрачный Рейнджер': 'Phantom Ranger',
  'Тёмный Маг': 'Dark Wizard',
  'Оракул Шилен': 'Shillien Oracle',
  'Заклинатель Ветра': 'Spellhowler',
  'Последователь Тьмы': 'Phantom Summoner',
  'Мудрец Шилен': 'Shillien Elder',
  'Orc Fighter': 'Orc Fighter',
  'Orc Mage': 'Orc Mage',
  Налётчик: 'Orc Raider',
  Монах: 'Orc Monk',
  Разрушитель: 'Destroyer',
  Тиран: 'Tyrant',
  Шаман: 'Orc Shaman',
  'Верховный Шаман': 'Overlord',
  'Вестник Войны': 'Warcryer',
  'Dwarven Fighter': 'Dwarven Fighter',
  'Dwarven Mystic': 'Dwarven Mystic',
  Собиратель: 'Scavenger',
  Ремесленник: 'Artisan',
  'Охотник за Наградой': 'Bounty Hunter',
  Кузнец: 'Warsmith',
  Геомант: 'Geomancer',
  Террамант: 'Terramancer',
};

const RACE_LABELS: Record<string, string> = {
  Human: 'Human',
  Elf: 'Elf',
  'Dark Elf': 'Dark Elf',
  Orc: 'Orc',
  Dwarf: 'Dwarf',
};

const PROFESSION_TIERS: Record<string, string> = {
  Fighter: 'Без профессии',
  Mage: 'Без профессии',
  'Elven Fighter': 'Без профессии',
  'Elven Mage': 'Без профессии',
  'Dark Fighter': 'Без профессии',
  'Dark Mage': 'Без профессии',
  'Orc Fighter': 'Без профессии',
  'Orc Mage': 'Без профессии',
  'Dwarven Fighter': 'Без профессии',
  'Dwarven Mystic': 'Без профессии',
  Воитель: '1 профессия',
  Рыцарь: '1 профессия',
  Разбойник: '1 профессия',
  Маг: '1 профессия',
  Клерик: '1 профессия',
  'Светлый Рыцарь': '1 профессия',
  Разведчик: '1 профессия',
  'Светлый Маг': '1 профессия',
  'Оракул Евы': '1 профессия',
  'Тёмный Рыцарь': '1 профессия',
  Ассасин: '1 профессия',
  'Тёмный Маг': '1 профессия',
  'Оракул Шилен': '1 профессия',
  Налётчик: '1 профессия',
  Монах: '1 профессия',
  Шаман: '1 профессия',
  Собиратель: '1 профессия',
  Ремесленник: '1 профессия',
  Геомант: '1 профессия',
};

const TIER_ORDER = ['Без профессии', '1 профессия', '2 профессия'];

const skillsMap = skillsData as Record<string, { className: string; race: string; skills: ClassSkill[] }>;
const ALL_CLASSES = Object.keys(skillsMap);

function getClassesByRace(race: string): { label: string; options: { value: string; label: string }[] }[] {
  const raceClasses = ALL_CLASSES.filter((cls) => CLASS_RACE_MAP[cls] === race);
  const groups: Record<string, { value: string; label: string }[]> = {
    'Без профессии': [],
    '1 профессия': [],
    '2 профессия': [],
  };
  for (const cls of raceClasses) {
    const tier = PROFESSION_TIERS[cls] || '2 профессия';
    if (!groups[tier]) groups[tier] = [];
    groups[tier].push({ value: cls, label: getClassName(cls) });
  }
  return TIER_ORDER.filter((t) => groups[t]?.length).map((tier) => ({
    label: tier,
    options: groups[tier],
  }));
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
      return (
        <span key={i} className={styles.numHighlight}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export function cleanStatText(text: string): string {
  return text.replace(/\b0+(\d+)\b/g, '$1');
}
export function compressLevels(
  levels: ClassSkill['levels'],
): { levels: string; skillLevels: string; changes: string[]; description?: string; rowspan: number }[] {
  if (!levels.length) return [];
  const groups: { levels: string; skillLevels: string; changes: string[]; description?: string; rowspan: number }[] =
    [];
  let i = 0;
  while (i < levels.length) {
    const cur = levels[i];
    const descKey = cur.description ?? JSON.stringify(cur.changes);
    let j = i + 1;
    while (j < levels.length) {
      const next = levels[j];
      if ((next.description ?? JSON.stringify(next.changes)) !== descKey) break;
      j++;
    }
    const lvls = levels.slice(i, j);
    const lvlStr = lvls.map((l) => l.classLevel || l.skillLevel).join(', ');
    const skillStr =
      lvls.length === 1 ? `Lv. ${lvls[0].skillLevel}` : `Lv. ${lvls[0].skillLevel}-${lvls[lvls.length - 1].skillLevel}`;
    groups.push({
      levels: lvlStr,
      skillLevels: skillStr,
      changes: cur.changes,
      description: cur.description,
      rowspan: 1,
    });
    i = j;
  }
  return groups;
}

function parseRange(castRange: string): { range: string; maxRange?: string } {
  const m = castRange.match(/^(\d+)\s*\((\d+)\)/);
  if (m) return { range: m[1], maxRange: m[2] };
  return { range: castRange.replace(/\s*\(.*/, '').trim() };
}

function skillImageUrl(url: string): string {
  if (url.startsWith('/i64/')) return `https://mw2.wiki${url}`;
  if (url.startsWith('/media/')) return `https://lu4db.ru${url}`;
  return url;
}

interface SkillsTabProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function SkillsTab({ onNavigateToTab }: SkillsTabProps) {
  const selectedRace = useSkillsStore((s) => s.selectedRace);
  const selectedClass = useSkillsStore((s) => s.selectedClass);
  const searchQuery = useSkillsStore((s) => s.searchQuery);
  const filterType = useSkillsStore((s) => s.filterType);
  const setSearchQuery = useSkillsStore((s) => s.setSearchQuery);
  const setFilterType = useSkillsStore((s) => s.setFilterType);
  const setSelectedRace = useSkillsStore((s) => s.setSelectedRace);
  const setSelectedClass = useSkillsStore((s) => s.setSelectedClass);

  const classGroups = useMemo(() => {
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
      list = list.filter((s) => s.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list.filter((s) => s.levels.some((l) => l.classLevel));
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
            onChange={(v) => {
              setSelectedRace(v);
              setSelectedClass('');
            }}
            options={RACES.map((r) => ({ value: r, label: getRaceLabel(r) }))}
          />
        </div>

        <div className={styles.field}>
          <CustomSelect
            label="Класс"
            value={selectedClass}
            onChange={(v) => setSelectedClass(v)}
            groups={classGroups}
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FloatingLabel>
        </div>

        <div className={styles.skillsCount}>
          Навыков: <b>{filteredSkills.length}</b>
        </div>
      </div>

      {!selectedClass ? (
        <EmptyState
          message={
            selectedRace ? 'Выберите класс для просмотра скиллов' : 'Выберите расу и класс для просмотра скиллов'
          }
        />
      ) : filteredSkills.length > 0 ? (
        <div className={styles.skillsGrid}>
          {filteredSkills.map((skill) => (
            <div key={skill.id} className={styles.skillCard}>
              <div className={styles.skillHeader}>
                {skill.imageUrl && (
                  <img
                    className={styles.skillIcon}
                    src={skillImageUrl(skill.imageUrl)}
                    alt={skill.name}
                    loading="lazy"
                  />
                )}
                <div className={styles.skillInfo}>
                  <div className={styles.skillName}>{skill.name}</div>
                  <div className={styles.skillMeta}>
                    <span
                      className={cx({
                        [styles.typePassive]: skill.type === 'passive',
                        [styles.typeActive]: skill.type !== 'passive',
                      })}
                    >
                      {skill.type === 'passive' ? 'Пассивный' : 'Активный'}
                    </span>
                    {skill.subtype && <span className={styles.skillSubtype}>{skill.subtype}</span>}
                    <span className={styles.skillLvl}>Уровней: {skill.maxLevel}</span>
                    {skill.firstClassLevel > 0 && (
                      <span className={styles.skillLvl}>С {skill.firstClassLevel} lvl</span>
                    )}
                  </div>
                  <div className={styles.skillStats}>
                    {skill.mpConsume && (
                      <span className={styles.skillStat}>
                        💧 MP: <b>{skill.mpConsume}</b>
                      </span>
                    )}
                    {skill.reuseTime && (
                      <span className={styles.skillStat}>
                        🕐 КД: <b>{skill.reuseTime}</b>
                      </span>
                    )}
                    {skill.castRange &&
                      (() => {
                        const { range, maxRange } = parseRange(skill.castRange);
                        return (
                          <span className={styles.skillStat}>
                            🎯 Дальн.: <b>{range}</b>
                            {maxRange && (
                              <>
                                {' '}
                                (
                                <b title="Максимальная дистанция. При превышении произношение будет отменено.">
                                  {maxRange}
                                </b>
                                )
                              </>
                            )}
                          </span>
                        );
                      })()}
                    {skill.trait && (
                      <span className={styles.skillStat}>
                        ⚔️ Trait: <b>{skill.trait}</b>
                      </span>
                    )}
                    {skill.attribute && (
                      <span className={styles.skillStat}>
                        Attr: <b>{skill.attribute.replace(/\s+\d+.*/, '')}</b>
                      </span>
                    )}
                    {skill.stats
                      .filter((st) => !['MP', 'КД', 'Дальн.', 'HP'].includes(st.label))
                      .map((st, i) => (
                        <span key={i} className={styles.skillStat}>
                          {st.label}: <b>{cleanStatText(st.text)}</b>
                        </span>
                      ))}
                  </div>
                  {spellbookByName.has(skill.name.toLowerCase()) && (
                    <button
                      className={styles.sbLink}
                      onClick={() => {
                        onNavigateToTab?.(
                          'spellbooks?sbRace=' +
                            encodeURIComponent(selectedRace || '') +
                            '&sbQ=' +
                            encodeURIComponent(skill.name),
                        );
                      }}
                    >
                      📚 Где выбить книгу
                    </button>
                  )}
                </div>
              </div>
              {skill.levels.some((l) => l.classLevel) && (
                <div className={styles.skillLevels}>
                  <table className={styles.levelTable}>
                    <thead>
                      <tr>
                        <th>Ур. персонажа</th>
                        <th>Ур. скилла</th>
                        <th>Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compressLevels(skill.levels.filter((l) => l.classLevel)).map((g, gi) => (
                        <tr key={gi}>
                          <td className={styles.lvlClass}>{g.levels}</td>
                          <td className={styles.lvlSkill}>{g.skillLevels}</td>
                          <td className={styles.lvlDesc}>
                            {g.description ? (
                              <div className={styles.lvlChange}>{highlightNumbers(g.description)}</div>
                            ) : (
                              g.changes.map((ch, ci) => (
                                <div key={ci} className={styles.lvlChange}>
                                  {highlightNumbers(ch)}
                                </div>
                              ))
                            )}
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
        <EmptyState message="Скиллы не найдены" />
      )}
    </div>
  );
}
