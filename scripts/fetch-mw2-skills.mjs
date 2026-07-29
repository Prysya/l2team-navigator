import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const BASE = 'https://mw2.wiki';

function decodeEntities(text) {
  return text.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c)).replace(/&amp;/g, '&');
}

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

// All mw2 class IDs and slugs from the classes page
const MW2_CLASSES = [
  { id: 0, slug: 'fighter', name: 'Fighter', base: true },
  { id: 1, slug: 'warrior', name: 'Warrior' },
  { id: 2, slug: 'gladiator', name: 'Gladiator' },
  { id: 3, slug: 'warlord', name: 'Warlord' },
  { id: 4, slug: 'knight', name: 'Knight' },
  { id: 5, slug: 'paladin', name: 'Paladin' },
  { id: 6, slug: 'darkavenger', name: 'Dark Avenger' },
  { id: 7, slug: 'rogue', name: 'Rogue' },
  { id: 8, slug: 'treasurehunter', name: 'Treasure Hunter' },
  { id: 9, slug: 'hawkeye', name: 'Hawkeye' },
  { id: 10, slug: 'mage', name: 'Mage', base: true },
  { id: 11, slug: 'wizard', name: 'Wizard' },
  { id: 12, slug: 'sorcerer', name: 'Sorcerer' },
  { id: 13, slug: 'necromancer', name: 'Necromancer' },
  { id: 14, slug: 'warlock', name: 'Warlock' },
  { id: 15, slug: 'cleric', name: 'Cleric' },
  { id: 16, slug: 'bishop', name: 'Bishop' },
  { id: 17, slug: 'prophet', name: 'Prophet' },
  { id: 18, slug: 'elvenfighter', name: 'Elven Fighter', base: true },
  { id: 19, slug: 'elvenknight', name: 'Elven Knight' },
  { id: 20, slug: 'templeknight', name: 'Temple Knight' },
  { id: 21, slug: 'swordsinger', name: 'Swordsinger' },
  { id: 22, slug: 'elvenscout', name: 'Elven Scout' },
  { id: 23, slug: 'plainwalker', name: 'Plains Walker' },
  { id: 24, slug: 'silverranger', name: 'Silver Ranger' },
  { id: 25, slug: 'elvenmage', name: 'Elven Mage', base: true },
  { id: 26, slug: 'elvenwizard', name: 'Elven Wizard' },
  { id: 27, slug: 'spellsinger', name: 'Spellsinger' },
  { id: 28, slug: 'elementalsummoner', name: 'Elemental Summoner' },
  { id: 29, slug: 'oracle', name: 'Elven Oracle' },
  { id: 30, slug: 'elder', name: 'Elven Elder' },
  { id: 31, slug: 'darkfighter', name: 'Dark Fighter', base: true },
  { id: 32, slug: 'palusknight', name: 'Palus Knight' },
  { id: 33, slug: 'shillienknight', name: 'Shillien Knight' },
  { id: 34, slug: 'bladedancer', name: 'Bladedancer' },
  { id: 35, slug: 'assasin', name: 'Assassin' },
  { id: 36, slug: 'abysswalker', name: 'Abyss Walker' },
  { id: 37, slug: 'phantomranger', name: 'Phantom Ranger' },
  { id: 38, slug: 'darkmage', name: 'Dark Mage', base: true },
  { id: 39, slug: 'darkwizard', name: 'Dark Wizard' },
  { id: 40, slug: 'spellhowler', name: 'Spellhowler' },
  { id: 41, slug: 'phantomsummoner', name: 'Phantom Summoner' },
  { id: 42, slug: 'shillienoracle', name: 'Shillien Oracle' },
  { id: 43, slug: 'shillienelder', name: 'Shillien Elder' },
  { id: 44, slug: 'orcfighter', name: 'Orc Fighter', base: true },
  { id: 45, slug: 'orcraider', name: 'Orc Raider' },
  { id: 46, slug: 'destroyer', name: 'Destroyer' },
  { id: 47, slug: 'orcmonk', name: 'Orc Monk' },
  { id: 48, slug: 'tyrant', name: 'Tyrant' },
  { id: 49, slug: 'orcmage', name: 'Orc Mage', base: true },
  { id: 50, slug: 'orcshaman', name: 'Orc Shaman' },
  { id: 51, slug: 'overlord', name: 'Overlord' },
  { id: 52, slug: 'warcryer', name: 'Warcryer' },
  { id: 53, slug: 'dwarvenfighter', name: 'Dwarven Fighter', base: true },
  { id: 54, slug: 'scavenger', name: 'Scavenger' },
  { id: 55, slug: 'bountyhunter', name: 'Bounty Hunter' },
  { id: 56, slug: 'artisan', name: 'Artisan' },
  { id: 57, slug: 'warsmith', name: 'Warsmith' },
  { id: 208, slug: 'dwarvenmystic', name: 'Dwarven Mystic', base: true },
  { id: 209, slug: 'geomancer', name: 'Geomancer' },
  { id: 210, slug: 'terramancer', name: 'Terramancer' },
];

const PLAYABLE_CLASSES = MW2_CLASSES.filter((c) => !c.base);

async function fetchHtml(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractBetween(text, start, end) {
  const i = text.indexOf(start);
  if (i === -1) return '';
  const j = text.indexOf(end, i + start.length);
  return j === -1 ? text.slice(i + start.length) : text.slice(i + start.length, j);
}

function parseClassSkills(html) {
  const skills = [];

  // Map accordion button labels → subcategory names by data-target
  const subcatMap = {};
  const btnRegex = /<button[^>]*data-target="#icon_type-(\d+)"[^>]*data-sort="(\d+)"[^>]*>([\s\S]*?)<\/button>/g;
  let btnMatch;
  while ((btnMatch = btnRegex.exec(html)) !== null) {
    const iconType = btnMatch[1];
    const sort = btnMatch[2];
    const label = btnMatch[3].replace(/<[^>]+>/g, '').trim();
    subcatMap[iconType] = { sort, label };
  }

  // Find all icon_type sections (accordion panels)
  // Each starts with <div id="icon_type-{N}" ...> and ends with </div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>
  const panelRegex = /<div id="icon_type-(\d+)"[^>]*class="accordion-collapse[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  let panelMatch;
  while ((panelMatch = panelRegex.exec(html)) !== null) {
    const iconType = panelMatch[1];
    const panelContent = panelMatch[2];
    const subcat = subcatMap[iconType];
    const subcatName = subcat ? subcat.label : '';

    // Parse all skill links in this panel
    const skillRegex = /<a[^>]*href="\/lu4\/skill\/(\d+)-([^"\/]+)\/\d+"[^>]*>[\s\S]*?<span class="item-name__content">([\s\S]*?)<\/span>/g;
    let sMatch;
    while ((sMatch = skillRegex.exec(panelContent)) !== null) {
      const [, skillId, skillSlug, nameHtml] = sMatch;
      const name = nameHtml.replace(/<[^>]+>/g, '').replace(/\s*Lv\.\s*\d+\s*$/, '').trim();
      const levelMatch = nameHtml.match(/Lv\.\s*(\d+)/);
      const level = levelMatch ? parseInt(levelMatch[1], 10) : 1;

      skills.push({
        id: skillId,
        slug: skillSlug,
        name,
        level,
        subcategory: subcatName,
      });
    }
  }

  return skills;
}

function parseSkillPage(html) {
  const result = {};

  // Description — first stat_line before #result-stats
  const statsStart = html.indexOf('id="result-stats"');
  const descSection = html.slice(0, statsStart > 0 ? statsStart : html.length);
  const descLines = descSection.match(/<div class="stat_line">\s*([\s\S]*?)<\/div>/);
  if (descLines) {
    const text = descLines[1].replace(/<[^>]+>/g, '').trim();
    if (text && !text.startsWith('Consumes') && !text.startsWith('Reuse') && !text.startsWith('Available')) {
      result.description = text;
    }
  }

  // Stats inside #result-stats
  const statsHtml = extractBetween(html, 'id="result-stats"', '<div id="available-table"');
  if (statsHtml) {
    const statRegex = /<div class="stat_line">\s*<div class="stat_name">([\s\S]*?)<\/div>\s*<span>([\s\S]*?)<\/span>/g;
    let stMatch;
    while ((stMatch = statRegex.exec(statsHtml)) !== null) {
      const name = stMatch[1].replace(/<[^>]+>/g, '').trim();
      const value = stMatch[2].replace(/<[^>]+>/g, '').trim();

      if (name === 'Consumes') {
        const mp = value.match(/(\d+)\s*MP/);
        if (mp) result.mpConsume = mp[1];
      } else if (name === 'Reuse Time') {
        result.reuseTime = value;
      } else if (name === 'Can be used on Olympiad') {
        result.olympiadUsable = value;
      } else if (name === 'Attribute') {
        result.attribute = value;
      } else if (name === 'Trait') {
        const t = value.replace(/^trait_/, '');
        if (t !== 'none') result.trait = t;
      } else if (name === 'Cast Range') {
        result.castRange = value;
      }
    }
  }

  // Skill icon
  const iconMatch = html.match(/<img[^>]*src="(\/i64\/[^"\/]+\.png)"[^>]*alt="[^"]*"/);
  if (iconMatch && !iconMatch[1].includes('/assets/')) result.icon = iconMatch[1];

  // Available For
  const availHtml = extractBetween(html, 'Available For', '</div>');
  if (availHtml) {
    const classes = [];
    const classRegex = /<a[^>]*href="\/lu4\/class\/\d+[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    let cMatch;
    while ((cMatch = classRegex.exec(availHtml)) !== null) {
      const cn = cMatch[1].replace(/<[^>]+>/g, '').trim();
      if (cn) classes.push(cn);
    }
    if (classes.length > 0) result.availableFor = classes;
  }

  // All levels from the page
  const levelsHtml = extractBetween(html, 'id="levels"', '</section>');
  if (levelsHtml) {
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

async function main() {
  console.log('=== MW2.WIKI Skills Parser ===\n');

  // Step 1: Fetch skills per class
  console.log('Step 1: Fetching skills for each playable class...\n');

  const allSkills = {}; // keyed by skill ID
  const classSkillMap = {}; // class en name → [skill IDs]

  for (const cls of PLAYABLE_CLASSES) {
    process.stdout.write(`  [${String(cls.id).padStart(3)}] ${cls.name.padEnd(22)} `);
    try {
      const url = `/lu4/class/${cls.id}-${cls.slug}/all`;
      const html = await fetchHtml(url);
      const skills = parseClassSkills(html);

      if (skills.length === 0) {
        console.log(`⚠ (0 skills — parsing may need update)`);
        continue;
      }

      classSkillMap[cls.name] = skills.map((s) => s.id);

      for (const sk of skills) {
        if (!allSkills[sk.id]) {
          allSkills[sk.id] = {
            id: sk.id,
            slug: sk.slug,
            name: sk.name,
            subcategory: sk.subcategory,
            description: sk.description,
            classes: [],
          };
        }
        if (!allSkills[sk.id].classes.includes(cls.name)) {
          allSkills[sk.id].classes.push(cls.name);
        }
        // Update subcategory if empty
        if (!allSkills[sk.id].subcategory && sk.subcategory) {
          allSkills[sk.id].subcategory = sk.subcategory;
        }
        if (!allSkills[sk.id].description && sk.description) {
          allSkills[sk.id].description = sk.description;
        }
      }

      console.log(`✓ ${skills.length} skills`);
    } catch (e) {
      console.log(`✗ FAILED: ${e.message}`);
    }
  }

  console.log(`\nTotal unique skills found: ${Object.keys(allSkills).length}`);

  // Step 2: Fetch details for each unique skill
  console.log('\nStep 2: Fetching details for each unique skill...\n');

  const skillIds = Object.keys(allSkills);
  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < skillIds.length; i++) {
    const id = skillIds[i];
    const sk = allSkills[id];
    process.stdout.write(`  [${i + 1}/${skillIds.length}] ${sk.name.padEnd(30)} `);

    try {
      const url = `/lu4/skill/${id}-${sk.slug}/1`;
      const html = await fetchHtml(url);
      const details = parseSkillPage(html);

      if (details.description) sk.fullDescription = details.description;
      if (details.mpConsume) sk.mpConsume = details.mpConsume;
      if (details.reuseTime) sk.reuseTime = details.reuseTime;
      if (details.castRange) sk.castRange = details.castRange;
      if (details.trait) sk.trait = details.trait;
      if (details.attribute) sk.attribute = details.attribute;
      if (details.olympiadUsable) sk.olympiadUsable = details.olympiadUsable;
      if (details.availableFor) sk.availableFor = details.availableFor;
      if (details.icon) sk.icon = details.icon;
      if (details.levels) sk.detailedLevels = details.levels;

      enriched++;
      console.log(`✓`);
    } catch (e) {
      failed++;
      console.log(`✗ ${e.message}`);
    }
  }

  console.log(`\nEnriched: ${enriched}, Failed: ${failed}`);

  // Step 3: Map to our existing data and build enriched output
  console.log('\nStep 3: Merging with existing SKILLS.json...\n');

  const existingRaw = readFileSync(resolve(ROOT, 'src/data/SKILLS.json'), 'utf-8');
  const existing = JSON.parse(existingRaw);

  const ourClassNames = Object.keys(existing);
  console.log(`Our classes: ${ourClassNames.length}`);

  // Build reverse map: mw2 EN name → our RU name
  const enToRu = {};
  for (const [en, ru] of Object.entries(EN_CLASS_NAMES)) {
    enToRu[en] = ru;
  }

  // For each of our classes, enrich skills
  let totalSkillsBefore = 0;
  let totalSkillsAfter = 0;
  let fieldsAdded = { description: 0, mp: 0, trait: 0, attribute: 0, icon: 0, levels: 0 };

  for (const ruName of ourClassNames) {
    const cls = existing[ruName];
    totalSkillsBefore += cls.skills.length;

    for (const skill of cls.skills) {
      const mw2 = allSkills[skill.id];
      if (!mw2) continue;

      totalSkillsAfter++;

      // Add fields that exist in mw2 but not in our data
      if (mw2.fullDescription) {
        const desc = decodeEntities(mw2.fullDescription);
        if (!skill.description) {
          skill.description = desc;
          fieldsAdded.description++;
        }
      }
      if (mw2.mpConsume && !skill.mpConsume) {
        skill.mpConsume = mw2.mpConsume;
        fieldsAdded.mp++;
      }
      if (mw2.reuseTime && !skill.reuseTime) {
        skill.reuseTime = mw2.reuseTime;
      }
      if (mw2.castRange && !skill.castRange) {
        skill.castRange = mw2.castRange;
      }
      if (mw2.trait && !skill.trait) {
        skill.trait = mw2.trait;
        fieldsAdded.trait++;
      }
      if (mw2.attribute && mw2.attribute !== 'None' && !skill.attribute) {
        skill.attribute = mw2.attribute;
        fieldsAdded.attribute++;
      }
      if (mw2.olympiadUsable && mw2.olympiadUsable !== 'No' && !skill.olympiadUsable) {
        skill.olympiadUsable = mw2.olympiadUsable;
      }
      if (mw2.icon && !skill.imageUrl.startsWith('/i64/')) {
        skill.imageUrl = mw2.icon;
        fieldsAdded.icon++;
      }
      if (mw2.detailedLevels && skill.levels) {
        for (const lv of skill.levels) {
          const mw2Lv = mw2.detailedLevels.find((l) => l.level === lv.skillLevel);
          if (mw2Lv && mw2Lv.description && !lv.description) {
            lv.description = decodeEntities(mw2Lv.description);
          }
        }
        fieldsAdded.levels++;
      }
    }
  }

  console.log('\n=== Enrichment Summary ===');
  console.log(`Skills before: ${totalSkillsBefore}`);
  console.log(`Skills matched in mw2: ${totalSkillsAfter}`);
  console.log(`Fields added:`);
  for (const [field, count] of Object.entries(fieldsAdded)) {
    console.log(`  ${field}: ${count}`);
  }

  // Step 4: Save enriched data
  const outPath = resolve(ROOT, 'src/data/SKILLS_ENRICHED.json');
  writeFileSync(outPath, JSON.stringify(existing, null, 2));
  console.log(`\nSaved to ${outPath}`);

  // Also save raw mw2 data for reference
  const rawPath = resolve(ROOT, 'scripts/tmp/mw2-skills-raw.json');
  const rawData = { skills: allSkills, classSkillMap };
  writeFileSync(rawPath, JSON.stringify(rawData, null, 2));
  console.log(`Raw mw2 data saved to ${rawPath}`);
}

main().catch(console.error);
