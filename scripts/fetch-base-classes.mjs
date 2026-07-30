import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const BASE = 'https://mw2.wiki';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const BASE_CLASSES = [
  { mw2Id: 0, slug: 'fighter', name: 'Fighter', race: 'Human' },
  { mw2Id: 10, slug: 'mage', name: 'Mage', race: 'Human' },
  { mw2Id: 18, slug: 'elvenfighter', name: 'Elven Fighter', race: 'Elf' },
  { mw2Id: 25, slug: 'elvenmage', name: 'Elven Mage', race: 'Elf' },
  { mw2Id: 31, slug: 'darkfighter', name: 'Dark Fighter', race: 'Dark Elf' },
  { mw2Id: 38, slug: 'darkmage', name: 'Dark Mage', race: 'Dark Elf' },
  { mw2Id: 44, slug: 'orcfighter', name: 'Orc Fighter', race: 'Orc' },
  { mw2Id: 49, slug: 'orcmage', name: 'Orc Mage', race: 'Orc' },
  { mw2Id: 53, slug: 'dwarvenfighter', name: 'Dwarven Fighter', race: 'Dwarf' },
  { mw2Id: 208, slug: 'dwarvenmystic', name: 'Dwarven Mystic', race: 'Dwarf' },
];

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`, {
    signal: AbortSignal.timeout(15000),
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseSkills(html) {
  const skills = [];
  const panelRegex = /<div id="icon_type-\d+"[^>]*class="accordion-collapse[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  let m;
  while ((m = panelRegex.exec(html)) !== null) {
    const skillRegex = /<a[^>]*href="\/lu4\/skill\/(\d+)-([^"\/]+)\/\d+"[^>]*>[\s\S]*?<span class="item-name__content">([\s\S]*?)<\/span>/g;
    let s;
    while ((s = skillRegex.exec(m[1])) !== null) {
      const name = s[3].replace(/<[^>]+>/g, '').replace(/\s*Lv\.\s*\d+\s*$/, '').trim();
      if (!skills.find((x) => x.id === s[1])) {
        skills.push({ id: s[1], slug: s[2], name });
      }
    }
  }
  return skills;
}

function decodeEntities(text) {
  return text.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c)).replace(/&amp;/g, '&');
}

async function fetchSkillDetails(id, slug) {
  const html = await fetchHtml(`/lu4/skill/${id}-${slug}/1`);
  const result = {};

  const statsStart = html.indexOf('id="result-stats"');
  const descSection = html.slice(0, statsStart > 0 ? statsStart : html.length);
  const descLines = descSection.match(/<div class="stat_line">\s*([\s\S]*?)<\/div>/);
  if (descLines) {
    const text = descLines[1].replace(/<[^>]+>/g, '').trim();
    if (text && !text.startsWith('Consumes') && !text.startsWith('Reuse') && !text.startsWith('Available')) {
      result.description = text;
    }
  }

  const statsHtml = html.slice(html.indexOf('id="result-stats"'), html.indexOf('<div id="available-table"'));
  if (statsHtml) {
    const statRegex = /<div class="stat_line">\s*<div class="stat_name">([\s\S]*?)<\/div>\s*<span>([\s\S]*?)<\/span>/g;
    let st;
    while ((st = statRegex.exec(statsHtml)) !== null) {
      const name = st[1].replace(/<[^>]+>/g, '').trim();
      const value = st[2].replace(/<[^>]+>/g, '').trim();
      if (name === 'Consumes') { const mp = value.match(/(\d+)\s*MP/); if (mp) result.mpConsume = mp[1]; }
      else if (name === 'Reuse Time') result.reuseTime = value;
      else if (name === 'Can be used on Olympiad') result.olympiadUsable = value;
      else if (name === 'Attribute' && value !== 'None') result.attribute = value;
      else if (name === 'Trait') { const t = value.replace(/^trait_/, ''); if (t !== 'none') result.trait = t; }
      else if (name === 'Cast Range') result.castRange = value;
    }
  }

  const iconMatch = html.match(/<img[^>]*src="(\/i64\/[^"\/]+\.png)"[^>]*alt="[^"]*"/);
  if (iconMatch && !iconMatch[1].includes('/assets/')) result.icon = iconMatch[1];

  const levelsHtml = html.slice(html.indexOf('id="levels"'), html.indexOf('</section>', html.indexOf('id="levels"')));
  if (levelsHtml && levelsHtml.length > 10) {
    const levels = [];
    const flexRows = levelsHtml.match(/<div class="flex-row">([\s\S]*?)<\/div>\s*<\/div>/g);
    if (flexRows) {
      for (const row of flexRows) {
        const lvMatch = row.match(/Lv\.\s*(\d+)/);
        const lv = lvMatch ? parseInt(lvMatch[1], 10) : null;
        const descM = row.match(/<\/a>\s*<\/div>\s*<div class="flex-cell">([\s\S]*?)<\/div>/);
        const desc = descM ? descM[1].replace(/<[^>]+>/g, '').trim() : '';
        if (lv) levels.push({ level: lv, description: desc });
      }
    }
    if (levels.length > 0) result.levels = levels;
  }

  return result;
}

const existing = JSON.parse(readFileSync(resolve(ROOT, 'src/data/SKILLS.json'), 'utf-8'));

for (const bc of BASE_CLASSES) {
  process.stdout.write(`  [${bc.mw2Id}] ${bc.name.padEnd(20)} `);

  try {
    const html = await fetchHtml(`/lu4/class/${bc.mw2Id}-${bc.slug}/all`);
    await delay(500 + Math.random() * 500);
    const baseSkills = parseSkills(html);
    const skills = [];

    for (const sk of baseSkills) {
      const detail = await fetchSkillDetails(sk.id, sk.slug);
      await delay(500 + Math.random() * 500);

      const skill = {
        id: sk.id,
        name: sk.name,
        slug: sk.slug,
        type: 'active',
        subtype: '',
        firstClassLevel: 1,
        imageUrl: detail.icon || '',
        stats: [],
        levels: [],
        maxLevel: 1,
      };

      if (detail.description) skill.description = decodeEntities(detail.description);
      if (detail.mpConsume) skill.mpConsume = detail.mpConsume;
      if (detail.reuseTime) skill.reuseTime = detail.reuseTime;
      if (detail.castRange) skill.castRange = detail.castRange;
      if (detail.trait) skill.trait = detail.trait;
      if (detail.attribute) skill.attribute = detail.attribute;
      if (detail.olympiadUsable) skill.olympiadUsable = detail.olympiadUsable;

      if (detail.levels) {
        skill.levels = detail.levels.map(l => ({
          skillLevel: l.level,
          classLevel: l.level,
          changes: [],
          description: decodeEntities(l.description || ''),
        }));
        skill.maxLevel = detail.levels.length;
      } else {
        skill.levels = [{ skillLevel: 1, classLevel: 1, changes: [] }];
      }

      skills.push(skill);
    }

    if (existing[bc.name]) {
      existing[bc.name].skills = skills;
    } else {
      existing[bc.name] = { id: bc.slug, slug: bc.slug, race: bc.race, className: bc.name, skills };
    }

    console.log(`✓ ${skills.length} skills`);
  } catch (e) {
    console.log(`✗ ${e.message}`);
  }
}

writeFileSync(resolve(ROOT, 'src/data/SKILLS.json'), JSON.stringify(existing, null, 2));
console.log('\nSaved');
