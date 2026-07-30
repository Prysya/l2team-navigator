import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

const RU_TO_EN = {
  Воитель: 'Warrior', Гладиатор: 'Gladiator', Копейщик: 'Warlord',
  Рыцарь: 'Knight', Паладин: 'Paladin', Мститель: 'Dark Avenger',
  Разбойник: 'Rogue', 'Искатель Сокровищ': 'Treasure Hunter', Стрелок: 'Hawkeye',
  Маг: 'Wizard', Волшебник: 'Sorcerer', Некромант: 'Necromancer',
  Колдун: 'Warlock', Призыватель: 'Necromancer',
  Клерик: 'Cleric', Епископ: 'Bishop', Проповедник: 'Prophet',
  'Светлый Рыцарь': 'Elven Knight', 'Рыцарь Евы': 'Temple Knight', Менестрель: 'Swordsinger',
  Разведчик: 'Elven Scout', Следопыт: 'Plains Walker', 'Серебрянный Рейнджер': 'Silver Ranger',
  'Светлый Маг': 'Elven Wizard', 'Певец Заклинаний': 'Spellsinger',
  'Последователь Стихий': 'Elemental Summoner', 'Мудрец Евы': 'Elder',
  'Оракул Евы': 'Oracle',
  'Тёмный Рыцарь': 'Palus Knight', 'Рыцарь Шилен': 'Shillien Knight',
  'Танцор Смерти': 'Bladedancer', Ассасин: 'Assassin',
  'Странник Бездны': 'Abyss Walker', 'Призрачный Рейнджер': 'Phantom Ranger',
  'Тёмный Маг': 'Dark Wizard', 'Заклинатель Ветра': 'Spellhowler',
  'Последователь Тьмы': 'Phantom Summoner', 'Оракул Шилен': 'Shillien Oracle',
  'Мудрец Шилен': 'Shillien Elder',
  Налётчик: 'Orc Raider', Разрушитель: 'Destroyer',
  Монах: 'Orc Monk', Тиран: 'Tyrant',
  Шаман: 'Orc Shaman', 'Верховный Шаман': 'Overlord', 'Вестник Войны': 'Warcryer',
  Собиратель: 'Scavenger', 'Охотник за Наградой': 'Bounty Hunter',
  Ремесленник: 'Artisan', Кузнец: 'Warsmith',
  Геомант: 'Geomancer', Террамант: 'Terramancer',
};

const existing = JSON.parse(readFileSync(resolve(ROOT, 'src/data/SKILLS.json'), 'utf-8'));
const raw = JSON.parse(readFileSync(resolve(ROOT, 'scripts/tmp/mw2-skills-raw.json'), 'utf-8'));
const classSkillMap = raw.classSkillMap;

// For each shared skill in each class, truncate levels to match known classLevel
let fixed = 0;
let truncated = 0;

for (const [ruName, clsData] of Object.entries(existing)) {
  const mw2En = RU_TO_EN[ruName];
  const mw2SkillIds = mw2En ? new Set((classSkillMap[mw2En] || []).map(String)) : new Set();

  for (const sk of clsData.skills) {
    const known = sk.levels.filter(l => l.classLevel);
    const unknown = sk.levels.filter(l => !l.classLevel);
    if (known.length === 0 || unknown.length === 0) continue;

    // Case 1: 2nd profession — early levels (from base class) before first known level → remove
    const firstKnown = known.sort((a, b) => a.skillLevel - b.skillLevel)[0];
    const beforeKnown = unknown.filter(l => l.skillLevel < firstKnown.skillLevel);
    if (beforeKnown.length > 0) {
      sk.levels = sk.levels.filter(l => l.classLevel || l.skillLevel >= firstKnown.skillLevel);
      truncated += beforeKnown.length;
      fixed++;
    }

    // Case 2: 1st profession — high levels after last known level that exist in a 2nd prof class → remove
    const lastKnown = known.sort((a, b) => b.skillLevel - a.skillLevel)[0];
    const afterKnown = unknown.filter(l => l.skillLevel > lastKnown.skillLevel);
    if (afterKnown.length > 0) {
      // Only remove if this skill also exists in a 2nd profession class
      // Find 2nd prof classes for this class
      const is1stProf = Object.entries(RU_TO_EN).some(
        ([ru, en]) => ru !== ruName && en !== mw2En && classSkillMap[en]?.includes(sk.id),
      );
      if (is1stProf) {
        sk.levels = sk.levels.filter(l => l.classLevel || l.skillLevel <= lastKnown.skillLevel);
        truncated += afterKnown.length;
        fixed++;
      }
    }
  }
}

console.log('Skills fixed:', fixed);
console.log('Levels truncated:', truncated);

// Verify
let totalZero = 0;
for (const cls of Object.values(existing)) {
  for (const sk of cls.skills) {
    totalZero += sk.levels.filter(l => !l.classLevel).length;
  }
}
console.log('Remaining levels with classLevel=0:', totalZero);

writeFileSync(resolve(ROOT, 'src/data/SKILLS.json'), JSON.stringify(existing, null, 2));
console.log('Saved SKILLS.json');
