import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const BASE = 'https://mw2.wiki';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const PLAYABLE_CLASSES = [
  { id: 1, slug: 'warrior', name: 'Warrior' },
  { id: 2, slug: 'gladiator', name: 'Gladiator' },
  { id: 3, slug: 'warlord', name: 'Warlord' },
  { id: 4, slug: 'knight', name: 'Knight' },
  { id: 5, slug: 'paladin', name: 'Paladin' },
  { id: 6, slug: 'darkavenger', name: 'Dark Avenger' },
  { id: 7, slug: 'rogue', name: 'Rogue' },
  { id: 8, slug: 'treasurehunter', name: 'Treasure Hunter' },
  { id: 9, slug: 'hawkeye', name: 'Hawkeye' },
  { id: 11, slug: 'wizard', name: 'Wizard' },
  { id: 12, slug: 'sorcerer', name: 'Sorcerer' },
  { id: 13, slug: 'necromancer', name: 'Necromancer' },
  { id: 14, slug: 'warlock', name: 'Warlock' },
  { id: 15, slug: 'cleric', name: 'Cleric' },
  { id: 16, slug: 'bishop', name: 'Bishop' },
  { id: 17, slug: 'prophet', name: 'Prophet' },
  { id: 19, slug: 'elvenknight', name: 'Elven Knight' },
  { id: 20, slug: 'templeknight', name: 'Temple Knight' },
  { id: 21, slug: 'swordsinger', name: 'Swordsinger' },
  { id: 22, slug: 'elvenscout', name: 'Elven Scout' },
  { id: 23, slug: 'plainwalker', name: 'Plains Walker' },
  { id: 24, slug: 'silverranger', name: 'Silver Ranger' },
  { id: 26, slug: 'elvenwizard', name: 'Elven Wizard' },
  { id: 27, slug: 'spellsinger', name: 'Spellsinger' },
  { id: 28, slug: 'elementalsummoner', name: 'Elemental Summoner' },
  { id: 29, slug: 'oracle', name: 'Elven Oracle' },
  { id: 30, slug: 'elder', name: 'Elven Elder' },
  { id: 32, slug: 'palusknight', name: 'Palus Knight' },
  { id: 33, slug: 'shillienknight', name: 'Shillien Knight' },
  { id: 34, slug: 'bladedancer', name: 'Bladedancer' },
  { id: 35, slug: 'assasin', name: 'Assassin' },
  { id: 36, slug: 'abysswalker', name: 'Abyss Walker' },
  { id: 37, slug: 'phantomranger', name: 'Phantom Ranger' },
  { id: 39, slug: 'darkwizard', name: 'Dark Wizard' },
  { id: 40, slug: 'spellhowler', name: 'Spellhowler' },
  { id: 41, slug: 'phantomsummoner', name: 'Phantom Summoner' },
  { id: 42, slug: 'shillienoracle', name: 'Shillien Oracle' },
  { id: 43, slug: 'shillienelder', name: 'Shillien Elder' },
  { id: 45, slug: 'orcraider', name: 'Orc Raider' },
  { id: 46, slug: 'destroyer', name: 'Destroyer' },
  { id: 47, slug: 'orcmonk', name: 'Orc Monk' },
  { id: 48, slug: 'tyrant', name: 'Tyrant' },
  { id: 50, slug: 'orcshaman', name: 'Orc Shaman' },
  { id: 51, slug: 'overlord', name: 'Overlord' },
  { id: 52, slug: 'warcryer', name: 'Warcryer' },
  { id: 54, slug: 'scavenger', name: 'Scavenger' },
  { id: 55, slug: 'bountyhunter', name: 'Bounty Hunter' },
  { id: 56, slug: 'artisan', name: 'Artisan' },
  { id: 57, slug: 'warsmith', name: 'Warsmith' },
  { id: 209, slug: 'geomancer', name: 'Geomancer' },
  { id: 210, slug: 'terramancer', name: 'Terramancer' },
];

const EN_CLASS_NAMES = {
  Warrior: 'Воитель', Warlord: 'Вождь', Gladiator: 'Гладиатор',
  Knight: 'Рыцарь', Paladin: 'Паладин', 'Dark Avenger': 'Тёмный Рыцарь',
  Rogue: 'Разбойник', 'Treasure Hunter': 'Искатель Сокровищ', Hawkeye: 'Соколиный Глаз',
  Wizard: 'Волшебник', Sorcerer: 'Колдун', Necromancer: 'Некромант', Warlock: 'Призыватель',
  Cleric: 'Священник', Bishop: 'Епископ', Prophet: 'Пророк',
  'Elven Knight': 'Рыцарь Евы', 'Temple Knight': 'Храмовник', Swordsinger: 'Певец Клинка',
  'Elven Scout': 'Следопыт', 'Plains Walker': 'Странник', 'Silver Ranger': 'Серебряный Рейнджер',
  'Elven Wizard': 'Волшебник Тёмных Эльфов', Spellsinger: 'Заклинатель', 'Elemental Summoner': 'Призыватель Стихий',
  'Elven Oracle': 'Оракул Евы', 'Elven Elder': 'Старейшина',
  'Palus Knight': 'Рыцарь', 'Shillien Knight': 'Рыцарь Шилен', Bladedancer: 'Танцор Смерти',
  Assassin: 'Ассасин', 'Abyss Walker': 'Странник Бездны', 'Phantom Ranger': 'Призрачный Рейнджер',
  'Dark Wizard': 'Тёмный Волшебник', Spellhowler: 'Заклинатель Ветра', 'Phantom Summoner': 'Призыватель Теней',
  'Shillien Oracle': 'Оракул Шилен', 'Shillien Elder': 'Старейшина Шилен',
  'Orc Raider': 'Рейдер Орков', Destroyer: 'Разрушитель',
  'Orc Monk': 'Монах Орков', Tyrant: 'Тиран',
  'Orc Shaman': 'Шаман Орков', Overlord: 'Повелитель', Warcryer: 'Крикун',
  Scavenger: 'Мусорщик', 'Bounty Hunter': 'Охотник за Головами',
  Artisan: 'Ремесленник', Warsmith: 'Кузнец',
  Geomancer: 'Геомант', Terramancer: 'Террамант',
};

async function fetchHtml(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function getClassLevels(cls) {
  const html = await fetchHtml(`/lu4/class/${cls.id}-${cls.slug}`);
  // Parse level tab links
  const levelNums = [];
  const tabRegex = /href="\/lu4\/class\/\d+[^"]*\/(\d+)"/g;
  let m;
  while ((m = tabRegex.exec(html)) !== null) {
    levelNums.push(parseInt(m[1], 10));
  }
  return [...new Set(levelNums)].sort((a, b) => a - b);
}

function parseLevelSkills(html) {
  const skills = [];
  const skillRegex = /href="\/lu4\/skill\/(\d+)-[^"]+\/\d+"[^>]*>[\s\S]*?Lv\.\s*(\d+)/g;
  let m;
  while ((m = skillRegex.exec(html)) !== null) {
    const [, skillId, skillLv] = m;
    skills.push({ skillId: parseInt(skillId, 10), skillLevel: parseInt(skillLv, 10) });
  }
  return skills;
}

async function main() {
  console.log('=== MW2.WIKI Class Level Scraper ===\n');

  const existing = JSON.parse(readFileSync(resolve(ROOT, 'src/data/SKILLS.json'), 'utf-8'));

  // Pre-check which classes have missing classLevel
  const classHasMissing = {};
  for (const [ruName, classData] of Object.entries(existing)) {
    classHasMissing[ruName] = classData.skills.some((sk) =>
      sk.levels.some((lv) => !lv.classLevel),
    );
  }

  const relevant = PLAYABLE_CLASSES.filter((cls) => {
    const ru = EN_CLASS_NAMES[cls.name];
    return ru && classHasMissing[ru];
  });
  const skipped = PLAYABLE_CLASSES.filter((cls) => {
    const ru = EN_CLASS_NAMES[cls.name];
    return !ru || !classHasMissing[ru];
  });

  console.log(`Classes to scrape: ${relevant.length} (skipping ${skipped.length} with full data)\n`);

  for (const cls of relevant) {
    const ruName = EN_CLASS_NAMES[cls.name];
    if (!ruName) {
      console.log(`[${cls.name}] → ✗ no mapping`);
      continue;
    }

    process.stdout.write(`  [${String(cls.id).padStart(3)}] ${cls.name.padEnd(22)} → ${ruName} `);

    try {
      const levels = await getClassLevels(cls);
      await delay(500 + Math.random() * 500);
      let updated = 0;

      for (const charLevel of levels) {
        const lvlHtml = await fetchHtml(`/lu4/class/${cls.id}-${cls.slug}/${charLevel}`);
        await delay(500 + Math.random() * 500);
        const levelSkills = parseLevelSkills(lvlHtml);

        for (const { skillId, skillLevel } of levelSkills) {
          const classData = existing[ruName];
          if (!classData) continue;

          const skill = classData.skills.find((s) => parseInt(s.id, 10) === skillId);
          if (!skill) continue;

          const lv = skill.levels.find((l) => l.skillLevel === skillLevel);
          if (lv && (!lv.classLevel || lv.classLevel > charLevel)) {
            lv.classLevel = charLevel;
            updated++;
          }
        }
      }

      console.log(`✓ ${levels.length} levels, ${updated} skills updated`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }

  writeFileSync(resolve(ROOT, 'src/data/SKILLS.json'), JSON.stringify(existing, null, 2));
  console.log('\nSaved SKILLS.json');
}

main().catch(console.error);
