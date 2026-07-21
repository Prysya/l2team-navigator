import { readFileSync, writeFileSync } from 'fs';

/**
 * Builds src/data/ITEM_ICONS_BY_ID.json — a map wiki item id -> icon filename,
 * e.g. { "4200": "etc_spell_books_i00.png", "1872": "etc_bone_i00.png" }.
 *
 * Covers every item referenced by id that lacks an icon:
 *   - spellbooks tab (SPELLBOOKS.json -> item_wiki_id)
 *   - all Locations-tab items (LOCATIONS_*.json -> items' item_url): recipes,
 *     pieces, spellbooks, resources.
 *
 * Icons are read from the item page header on mw2.wiki (accessible mirror of
 * masterwork.wiki) and hotlinked in the app from masterwork.wiki/i64.
 *
 * Incremental: ids already present in the output file are kept as-is and skipped,
 * so re-runs only fetch newly-referenced items.
 */

const WIKI_MIRROR = 'https://mw2.wiki';
const SPELLBOOKS_FILE = 'src/data/SPELLBOOKS.json';
const LOCATION_FILES = [
  'src/data/LOCATIONS_ALL.json',
  'src/data/LOCATIONS_PIECES.json',
  'src/data/LOCATIONS_RECIPES.json',
  'src/data/LOCATIONS_SPELLBOOKS.json',
  'src/data/LOCATIONS_RESOURCES.json',
];
const OUT_FILE = 'src/data/ITEM_ICONS_BY_ID.json';
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

function parseHeaderIcon(html) {
  return (html.match(/<div class="item-icon">\s*<img src="\/i64\/([^"]+)"/) || [])[1] || null;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function collectIds() {
  const ids = new Set();
  const spellbooks = JSON.parse(readFileSync(SPELLBOOKS_FILE, 'utf-8'));
  for (const sb of spellbooks) {
    const id = sb.item_wiki_id || idFromUrl(sb.spellbook_url);
    if (id) ids.add(id);
  }
  for (const file of LOCATION_FILES) {
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

async function main() {
  const ids = collectIds();
  const out = readJson(OUT_FILE) || {};
  const missing = ids.filter((id) => !out[id]);
  console.log(`${ids.length} ids referenced, ${Object.keys(out).length} already known, fetching ${missing.length}...`);

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

  console.log(`\nIcons resolved: ${Object.keys(out).length}/${ids.length}`);
  const sorted = Object.fromEntries(Object.keys(out).sort((a, b) => +a - +b).map((k) => [k, out[k]]));
  writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`Saved ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
