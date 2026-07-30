import { readFileSync, writeFileSync } from 'fs';

const WIKI_MIRROR = 'https://mw2.wiki';
const DELAY_MS = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const idFromUrl = (u) => {
  const m = u && u.match(/\/item\/(\d+)/);
  return m ? +m[1] : null;
};

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJson(path, obj) {
  const sorted = Object.fromEntries(
    Object.keys(obj).sort((a, b) => {
      const na = +a, nb = +b;
      return !isNaN(na) && !isNaN(nb) ? na - nb : a.localeCompare(b);
    }).map(k => [k, obj[k]])
  );
  writeFileSync(path, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
}

// ── Phase 1: ITEM_WIKI.json — item name → {id, slug, icon} from boss drops ──

function parseItemIcons(html, into) {
  const re =
    /href="\/lu4\/item\/(\d+)-([^"]*)"\s+class="item-name[^"]*"[^>]*>\s*<span class="item-icon">\s*<img src="\/i64\/([^"]+)"\s+alt="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const id = +m[1];
    const slug = m[2].trim();
    const icon = m[3].trim();
    const name = m[4].replace(/\s+lu4$/i, '').trim();
    if (name && icon) into[name.toLowerCase()] = { id, slug, icon };
  }
}

async function buildItemWiki() {
  const bosses = readJson('src/data/RAIDBOSSES.json');
  if (!bosses) { console.log('  SKIP — no RAIDBOSSES.json'); return null; }

  const targets = bosses.filter((b) => b.npcId && b.slug);
  console.log(`Phase 1: ITEM_WIKI.json — ${targets.length} boss pages...`);

  const catalog = {};
  let done = 0;
  for (const b of targets) {
    try {
      const html = await fetchText(`${WIKI_MIRROR}/lu4/npc/${b.npcId}-${b.slug}`);
      parseItemIcons(html, catalog);
    } catch (e) {
      console.error(`  ${b.name}: ${e.message}`);
    }
    if (++done % 30 === 0) console.log(`  ${done}/${targets.length} — ${Object.keys(catalog).length} items`);
    await sleep(DELAY_MS);
  }

  writeJson('src/data/ITEM_WIKI.json', catalog);
  console.log(`  Done: ${Object.keys(catalog).length} items → src/data/ITEM_WIKI.json`);
  return catalog;
}

// ── Phase 2: ITEM_ICONS_BY_ID.json — wiki item id → icon filename ──

function parseHeaderIcon(html) {
  return (html.match(/<div class="item-icon">\s*<img src="\/i64\/([^"]+)"/) || [])[1] || null;
}

function collectItemIds() {
  const ids = new Set();
  const spellbooks = readJson('src/data/SPELLBOOKS.json');
  if (spellbooks) {
    for (const sb of spellbooks) {
      const id = sb.item_wiki_id || idFromUrl(sb.spellbook_url);
      if (id) ids.add(id);
    }
  }

  const locFiles = [
    'src/data/LOCATIONS_ALL.json',
    'src/data/LOCATIONS_PIECES.json',
    'src/data/LOCATIONS_RECIPES.json',
    'src/data/LOCATIONS_SPELLBOOKS.json',
    'src/data/LOCATIONS_RESOURCES.json',
  ];
  for (const file of locFiles) {
    const data = readJson(file);
    if (!data) continue;
    for (const loc of data) {
      for (const it of loc.items || []) {
        const id = idFromUrl(it.item_url);
        if (id) ids.add(id);
      }
    }
  }
  return [...ids].sort((a, b) => a - b);
}

async function buildItemIconsById() {
  const ids = collectItemIds();
  const out = readJson('src/data/ITEM_ICONS_BY_ID.json') || {};
  const missing = ids.filter((id) => !out[id]);
  console.log(`\nPhase 2: ITEM_ICONS_BY_ID.json — ${ids.length} ids, ${missing.length} to fetch...`);

  let done = 0;
  for (const id of missing) {
    try {
      const html = await fetchText(`${WIKI_MIRROR}/lu4/item/${id}`);
      const icon = parseHeaderIcon(html);
      if (icon) out[id] = icon;
    } catch (e) {
      console.error(`  item ${id}: ${e.message}`);
    }
    if (++done % 40 === 0) console.log(`  ${done}/${missing.length}`);
    await sleep(DELAY_MS);
  }

  writeJson('src/data/ITEM_ICONS_BY_ID.json', out);
  console.log(`  Done: ${Object.keys(out).length}/${ids.length} resolved → src/data/ITEM_ICONS_BY_ID.json`);
}

// ── Phase 3: RECIPE_ICONS.json — recipeId → {recipe, result} icon ──

function parseRecipeIcons(html) {
  const recipe = (html.match(/<div class="item-icon">\s*<img src="\/i64\/([^"]+)"/) || [])[1] || null;
  const rr = html.slice(html.indexOf('recipe_result'));
  const result = (rr.match(/>Result<\/div>[\s\S]*?<img src="\/i64\/([^"]+)"/) || [])[1] || null;
  return { recipe, result };
}

async function buildRecipeIcons() {
  const recipes = readJson('src/data/RECIPES.json');
  if (!recipes) { console.log('  SKIP — no RECIPES.json'); return; }

  console.log(`\nPhase 3: RECIPE_ICONS.json — ${recipes.length} recipes...`);
  const out = {};
  let withRecipe = 0, withResult = 0;

  for (const r of recipes) {
    try {
      const html = await fetchText(`${WIKI_MIRROR}/lu4/item/${r.recipeId}`);
      const icons = parseRecipeIcons(html);
      const entry = {};
      if (icons.recipe) { entry.recipe = icons.recipe; withRecipe++; }
      if (icons.result) { entry.result = icons.result; withResult++; }
      if (entry.recipe || entry.result) out[r.recipeId] = entry;
    } catch (e) {
      console.error(`  ${r.recipeName} (${r.recipeId}): ${e.message}`);
    }
    if (++done % 40 === 0) console.log(`  ${done}/${recipes.length}`);
    await sleep(DELAY_MS);
  }

  writeJson('src/data/RECIPE_ICONS.json', out);
  console.log(`  Done: ${withRecipe} recipe icons, ${withResult} result icons → src/data/RECIPE_ICONS.json`);
}

// ── Main ──

async function main() {
  const phases = process.argv[2]
    ? process.argv.slice(2)
    : ['item-wiki', 'item-icons-by-id', 'recipe-icons'];

  for (const phase of phases) {
    if (phase === 'item-wiki') await buildItemWiki();
    else if (phase === 'item-icons-by-id') await buildItemIconsById();
    else if (phase === 'recipe-icons') await buildRecipeIcons();
    else console.error(`Unknown phase: ${phase}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
