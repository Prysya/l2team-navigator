import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const BASE = 'https://mw2.wiki';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const BASE_CLASSES = [
  { mw2Id: 0, slug: 'fighter', name: 'Fighter' },
  { mw2Id: 10, slug: 'mage', name: 'Mage' },
  { mw2Id: 18, slug: 'elvenfighter', name: 'Elven Fighter' },
  { mw2Id: 25, slug: 'elvenmage', name: 'Elven Mage' },
  { mw2Id: 31, slug: 'darkfighter', name: 'Dark Fighter' },
  { mw2Id: 38, slug: 'darkmage', name: 'Dark Mage' },
  { mw2Id: 44, slug: 'orcfighter', name: 'Orc Fighter' },
  { mw2Id: 49, slug: 'orcmage', name: 'Orc Mage' },
  { mw2Id: 53, slug: 'dwarvenfighter', name: 'Dwarven Fighter' },
  { mw2Id: 208, slug: 'dwarvenmystic', name: 'Dwarven Mystic' },
];

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`, {
    signal: AbortSignal.timeout(15000),
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function getBaseLevels(cls) {
  const html = await fetchHtml(`/lu4/class/${cls.mw2Id}-${cls.slug}`);
  const levels = [];
  const tabRegex = /href="\/lu4\/class\/\d+[^"]*\/(\d+)"/g;
  let m;
  while ((m = tabRegex.exec(html)) !== null) {
    const lv = parseInt(m[1], 10);
    if (lv < 20) levels.push(lv);
  }
  return [...new Set(levels)].sort((a, b) => a - b);
}

function parseLevelSkills(html) {
  const skills = [];
  const skillRegex = /href="\/lu4\/skill\/(\d+)-[^"]+\/\d+"[^>]*>[\s\S]*?Lv\.\s*(\d+)/g;
  let m;
  while ((m = skillRegex.exec(html)) !== null) {
    skills.push({ skillId: m[1], skillLevel: parseInt(m[2], 10) });
  }
  return skills;
}

const existing = JSON.parse(readFileSync(resolve(ROOT, 'src/data/SKILLS.json'), 'utf-8'));

for (const bc of BASE_CLASSES) {
  process.stdout.write(`  [${bc.mw2Id}] ${bc.name.padEnd(20)} `);

  try {
    const levels = await getBaseLevels(bc);
    await delay(500 + Math.random() * 500);
    let updated = 0;

    const classData = existing[bc.name];
    if (!classData) { console.log('✗ not in SKILLS.json'); continue; }

    // First reset all classLevel to 0
    for (const sk of classData.skills) {
      for (const lv of sk.levels) {
        lv.classLevel = 0;
      }
    }

    for (const charLevel of levels) {
      const lvlHtml = await fetchHtml(`/lu4/class/${bc.mw2Id}-${bc.slug}/${charLevel}`);
      await delay(500 + Math.random() * 500);
      const levelSkills = parseLevelSkills(lvlHtml);

      for (const { skillId, skillLevel } of levelSkills) {
        const skill = classData.skills.find(s => s.id === skillId);
        if (!skill) continue;

        const lv = skill.levels.find(l => l.skillLevel === skillLevel);
        if (lv) {
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
console.log('\nSaved');
