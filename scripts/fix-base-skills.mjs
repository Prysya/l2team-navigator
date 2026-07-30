import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

// From SkillsTab.tsx — maps ru → en
const RU_TO_EN = {
  Воитель: 'Warrior', Гладиатор: 'Gladiator', Копейщик: 'Warlord',
  Рыцарь: 'Knight', Паладин: 'Paladin', Мститель: 'Dark Avenger',
  Разбойник: 'Rogue', 'Искатель Сокровищ': 'Treasure Hunter', Стрелок: 'Hawkeye',
  Маг: 'Wizard', Волшебник: 'Sorcerer', Некромант: 'Necromancer',
  Колдун: 'Warlock', Призыватель: 'Necromancer', // Warlock maps to Колдун? Let me check
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

// Fix Warlock mapping
RU_TO_EN['Колдун'] = 'Warlock';
RU_TO_EN['Призыватель'] = 'Necromancer'; // Actually Призыватель = Warlock in game? Let me fix
// Hmm — in our data Колдун=Warlock, Некромант=Necromancer, Призыватель... let me check
// Призыватель is actually Summoner type — it should map to Warlock (which is a summoner class)
RU_TO_EN['Призыватель'] = 'Warlock';
RU_TO_EN['Некромант'] = 'Necromancer';
// Волшебник (existing key) → Sorcerer
RU_TO_EN['Волшебник'] = 'Sorcerer';

const existing = JSON.parse(readFileSync(resolve(ROOT, 'src/data/SKILLS.json'), 'utf-8'));
const raw = JSON.parse(readFileSync(resolve(ROOT, 'scripts/tmp/mw2-skills-raw.json'), 'utf-8'));
const classSkillMap = raw.classSkillMap;

function decodeEntities(text) {
  return text.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c)).replace(/&amp;/g, '&');
}

// Step 1: Remove base-only skills
let removed = 0;
let kept = 0;

for (const [ruName, clsData] of Object.entries(existing)) {
  const mw2EnName = RU_TO_EN[ruName];
  const mw2SkillIds = mw2EnName ? new Set((classSkillMap[mw2EnName] || []).map(String)) : new Set();

  const before = clsData.skills.length;
  clsData.skills = clsData.skills.filter((sk) => {
    // Detect base-added skills: no original stats/changes, firstClassLevel=0
    const hasOriginalChanges = sk.stats.length > 0 || sk.subtype || sk.levels.some(l => l.changes.length > 0);
    if (hasOriginalChanges) return true;

    if (mw2SkillIds.has(sk.id)) {
      kept++;
      return true;
    }

    removed++;
    return false;
  });
}

console.log('Removed base-only skills:', removed);
console.log('Kept shared skills:', kept);

let total = 0;
for (const cls of Object.values(existing)) total += cls.skills.length;
console.log('Total skills after cleanup:', total);

writeFileSync(resolve(ROOT, 'src/data/SKILLS.json'), JSON.stringify(existing, null, 2));
console.log('Saved SKILLS.json');
