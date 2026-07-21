import { readFileSync, writeFileSync } from 'fs';

/**
 * Builds src/data/ITEM_ICONS_BY_ID.json — a map wiki item id -> icon filename,
 * e.g. { "4200": "etc_spell_books_i00.png", "1872": "etc_bone_i00.png" }.
 *
 * Covers items referenced by id in two places that lack icons:
 *   - spellbooks   (SPELLBOOKS.json -> item_wiki_id)
 *   - resources    (LOCATIONS_RESOURCES.json -> resource items' item_url)
 *
 * Icons are read from the item page header on mw2.wiki (accessible mirror of
 * masterwork.wiki) and hotlinked in the app from masterwork.wiki/i64.
 */

const WIKI_MIRROR = 'https://mw2.wiki';
const SPELLBOOKS_FILE = 'src/data/SPELLBOOKS.json';
const RESOURCES_FILE = 'src/data/LOCATIONS_RESOURCES.json';
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

function collectIds() {
  const ids = new Set();
  const spellbooks = JSON.parse(readFileSync(SPELLBOOKS_FILE, 'utf-8'));
  for (const sb of spellbooks) {
    const id = sb.item_wiki_id || idFromUrl(sb.spellbook_url);
    if (id) ids.add(id);
  }
  const resources = JSON.parse(readFileSync(RESOURCES_FILE, 'utf-8'));
  for (const loc of resources) {
    for (const it of loc.items || []) {
      if (it.item_type !== 'resource') continue;
      const id = idFromUrl(it.item_url);
      if (id) ids.add(id);
    }
  }
  return [...ids].sort((a, b) => a - b);
}

async function main() {
  const ids = collectIds();
  console.log(`Fetching icons for ${ids.length} item ids...`);

  const out = {};
  let done = 0;
  for (const id of ids) {
    try {
      const html = await fetchText(`${WIKI_MIRROR}/lu4/item/${id}`);
      const icon = parseHeaderIcon(html);
      if (icon) out[id] = icon;
    } catch (e) {
      console.error(`  item ${id}: ${e.message}`);
    }
    if (++done % 40 === 0) console.log(`  ${done}/${ids.length}`);
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
