import { readFileSync, writeFileSync } from 'fs';

/**
 * Phase 1: builds src/data/ITEM_WIKI.json — a deduplicated catalog mapping
 * item name (lowercased) -> { id, slug, icon }, e.g.
 *   "proof of loyalty": { id: 9910, slug: "proof-of-loyalty", icon: "etc_broken_crystal_red_i00.png" }
 *
 * Powers two things for boss-drop items:
 *   - a non-clickable item icon, hotlinked from https://masterwork.wiki/i64/{icon}
 *   - a direct item link  https://masterwork.wiki/lu4/item/{id}-{slug}  (instead of a search url)
 *
 * Source: the drop tables on each raid boss NPC page. We read them from mw2.wiki
 * (an accessible mirror of masterwork.wiki; the HTML is identical and curl-friendly,
 * whereas masterwork.wiki gates HTML behind Cloudflare).
 *
 * The catalog doubles as the list of direct icon links for a future public/ download.
 */

const WIKI_MIRROR = 'https://mw2.wiki';
const DATA_FILE = 'src/data/RAIDBOSSES.json';
const OUT_FILE = 'src/data/ITEM_WIKI.json';
const DELAY_MS = 250;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

/** Extract item name -> { id, slug, icon } from an NPC page's item links. */
function parseItemIcons(html, into) {
  // Restrict to item links (/lu4/item/…); skills reuse the same item-name/item-icon markup.
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

async function main() {
  const bosses = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  const targets = bosses.filter((b) => b.npcId && b.slug);
  console.log(`Fetching drop tables from ${targets.length} boss pages...`);

  const catalog = {};
  let done = 0;
  for (const b of targets) {
    try {
      const html = await fetchText(`${WIKI_MIRROR}/lu4/npc/${b.npcId}-${b.slug}`);
      parseItemIcons(html, catalog);
    } catch (e) {
      console.error(`  ${b.name} (${b.npcId}): ${e.message}`);
    }
    if (++done % 20 === 0) console.log(`  ${done}/${targets.length} — ${Object.keys(catalog).length} items so far`);
    await sleep(DELAY_MS);
  }

  // Coverage report against actual drop rows.
  const dropNames = new Set();
  for (const b of bosses) for (const g of b.drops || []) for (const it of g.items) dropNames.add(it.name.toLowerCase());
  const covered = [...dropNames].filter((n) => catalog[n]).length;
  console.log(`\nItems collected: ${Object.keys(catalog).length}`);
  console.log(`Drop items covered: ${covered}/${dropNames.size}`);

  // Stable, sorted output for a clean diff.
  const sorted = Object.fromEntries(Object.keys(catalog).sort().map((k) => [k, catalog[k]]));
  writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`Saved ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
