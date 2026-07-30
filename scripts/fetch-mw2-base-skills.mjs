import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const BASE = 'https://mw2.wiki';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Base classes with their children (1st professions)
// Tree: base → 1st prof → 2nd prof
const BASE_LINEAGE = {
  fighter: {
    id: 0, slug: 'fighter',
    children: [
      { slug: 'warrior', children: ['warlord', 'gladiator'] },
      { slug: 'knight', children: ['paladin', 'darkavenger'] },
      { slug: 'rogue', children: ['treasurehunter', 'hawkeye'] },
    ],
  },
  mage: {
    id: 10, slug: 'mage',
    children: [
      { slug: 'wizard', children: ['sorcerer', 'necromancer', 'warlock'] },
      { slug: 'cleric', children: ['bishop', 'prophet'] },
    ],
  },
  elvenfighter: {
    id: 18, slug: 'elvenfighter',
    children: [
      { slug: 'elvenknight', children: ['templeknight', 'swordsinger'] },
      { slug: 'elvenscout', children: ['plainwalker', 'silverranger'] },
    ],
  },
  elvenmage: {
    id: 25, slug: 'elvenmage',
    children: [
      { slug: 'elvenwizard', children: ['spellsinger', 'elementalsummoner'] },
      { slug: 'oracle', children: ['elder'] },
    ],
  },
  darkfighter: {
    id: 31, slug: 'darkfighter',
    children: [
      { slug: 'palusknight', children: ['shillienknight', 'bladedancer'] },
      { slug: 'assasin', children: ['abysswalker', 'phantomranger'] },
    ],
  },
  darkmage: {
    id: 38, slug: 'darkmage',
    children: [
      { slug: 'darkwizard', children: ['spellhowler', 'phantomsummoner'] },
      { slug: 'shillienoracle', children: ['shillienelder'] },
    ],
  },
  orcfighter: {
    id: 44, slug: 'orcfighter',
    children: [
      { slug: 'orcraider', children: ['destroyer'] },
      { slug: 'orcmonk', children: ['tyrant'] },
    ],
  },
  orcmage: {
    id: 49, slug: 'orcmage',
    children: [
      { slug: 'orcshaman', children: ['overlord', 'warcryer'] },
    ],
  },
  dwarvenfighter: {
    id: 53, slug: 'dwarvenfighter',
    children: [
      { slug: 'scavenger', children: ['bountyhunter'] },
      { slug: 'artisan', children: ['warsmith'] },
    ],
  },
  dwarvenmystic: {
    id: 208, slug: 'dwarvenmystic',
    children: [
      { slug: 'geomancer', children: ['terramancer'] },
    ],
  },
};

// Slug → Russian class name
const SLUG_TO_RU = {
  warrior: 'Воитель', gladiator: 'Гладиатор', warlord: 'Копейщик',
  knight: 'Рыцарь', paladin: 'Паладин', darkavenger: 'Мститель',
  rogue: 'Разбойник', treasurehunter: 'Искатель Сокровищ', hawkeye: 'Стрелок',
  wizard: 'Маг', sorcerer: 'Колдун', necromancer: 'Некромант', warlock: 'Призыватель',
  cleric: 'Клерик', bishop: 'Епископ', prophet: 'Проповедник',
  elvenknight: 'Светлый Рыцарь', templeknight: 'Рыцарь Евы', swordsinger: 'Менестрель',
  elvenscout: 'Разведчик', plainwalker: 'Следопыт', silverranger: 'Серебрянный Рейнджер',
  elvenwizard: 'Светлый Маг', spellsinger: 'Певец Заклинаний', elementalsummoner: 'Последователь Стихий',
  oracle: 'Оракул Евы', elder: 'Мудрец Евы',
  palusknight: 'Тёмный Рыцарь', shillienknight: 'Рыцарь Шилен', bladedancer: 'Танцор Смерти',
  assasin: 'Ассасин', abysswalker: 'Странник Бездны', phantomranger: 'Призрачный Рейнджер',
  darkwizard: 'Тёмный Маг', spellhowler: 'Заклинатель Ветра', phantomsummoner: 'Последователь Тьмы',
  shillienoracle: 'Оракул Шилен', shillienelder: 'Мудрец Шилен',
  orcraider: 'Налётчик', destroyer: 'Разрушитель',
  orcmonk: 'Монах', tyrant: 'Тиран',
  orcshaman: 'Шаман', overlord: 'Верховный Шаман', warcryer: 'Вестник Войны',
  scavenger: 'Собиратель', bountyhunter: 'Охотник за Наградой',
  artisan: 'Ремесленник', warsmith: 'Кузнец',
  geomancer: 'Геомант', terramancer: 'Террамант',
};

function allDescendantSlugs(base) {
  const slugs = [];
  for (const fp of base.children) {
    slugs.push(fp.slug);
    for (const sp of fp.children) slugs.push(sp);
  }
  return slugs;
}

async function fetchHtml(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseBaseSkills(html) {
  const skills = [];
  const panelRegex = /<div id="icon_type-\d+"[^>]*class="accordion-collapse[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  let m;
  while ((m = panelRegex.exec(html)) !== null) {
    const panelContent = m[1];
    const skillRegex = /<a[^>]*href="\/lu4\/skill\/(\d+)-([^"\/]+)\/\d+"[^>]*>[\s\S]*?<span class="item-name__content">([\s\S]*?)<\/span>/g;
    let s;
    while ((s = skillRegex.exec(panelContent)) !== null) {
      const name = s[3].replace(/<[^>]+>/g, '').replace(/\s*Lv\.\s*\d+\s*$/, '').trim();
      if (!skills.find((x) => x.id === s[1])) {
        skills.push({ id: s[1], slug: s[2], name });
      }
    }
  }
  return skills;
}

async function main() {
  console.log('=== MW2.WIKI Base Class Skills Merger ===\n');

  const existing = JSON.parse(readFileSync(resolve(ROOT, 'src/data/SKILLS.json'), 'utf-8'));

  for (const [baseSlug, base] of Object.entries(BASE_LINEAGE)) {
    process.stdout.write(`  [${base.id}] ${base.slug.padEnd(18)} `);

    try {
      const html = await fetchHtml(`/lu4/class/${base.id}-${base.slug}/all`);
      await delay(500 + Math.random() * 500);
      const baseSkills = parseBaseSkills(html);

      const descendantSlugs = allDescendantSlugs(base);
      let added = 0;
      let skipped = 0;

      for (const dSlug of descendantSlugs) {
        const ruName = SLUG_TO_RU[dSlug];
        if (!ruName || !existing[ruName]) { skipped++; continue; }

        const existingIds = new Set(existing[ruName].skills.map((s) => s.id));

        for (const sk of baseSkills) {
          if (!existingIds.has(sk.id)) {
            existing[ruName].skills.push({
              id: sk.id,
              name: sk.name,
              slug: sk.slug,
              type: 'active',
              subtype: '',
              firstClassLevel: 0,
              imageUrl: '',
              stats: [],
              levels: [{ skillLevel: 1, classLevel: 0, changes: [] }],
              maxLevel: 1,
            });
            added++;
          }
        }
      }

      console.log(`✓ ${baseSkills.length} base skills → ${added} added to ${descendantSlugs.length} classes`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }

  writeFileSync(resolve(ROOT, 'src/data/SKILLS.json'), JSON.stringify(existing, null, 2));
  console.log('\nSaved SKILLS.json');
}

main().catch(console.error);
