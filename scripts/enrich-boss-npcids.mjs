import { readFileSync, writeFileSync } from 'fs';

/**
 * Enriches src/data/RAIDBOSSES.json with the official wiki NPC id + url slug.
 *
 * Source: the "LU4 Raid Bosses" article (post #385) on the MasterWork wiki.
 * We read it from mw2.wiki (an accessible mirror of masterwork.wiki that serves
 * identical content and uses the same /lu4/npc/{id}-{slug} url scheme), then
 * store the id + slug so the app can deep-link to masterwork.wiki/lu4/npc/{id}-{slug}.
 *
 * Bosses that are not listed in the article (e.g. Zaken) are handled via OVERRIDES.
 */

const WIKI_MIRROR = 'https://mw2.wiki';
const ARTICLE_URL = `${WIKI_MIRROR}/lu4/posts/post/385-lu4-raid-bosses`;
const DATA_FILE = 'src/data/RAIDBOSSES.json';

// Bosses missing from article #385 but present on the wiki as standalone NPCs.
// Key = exact boss name in RAIDBOSSES.json, value = { npcId, slug }.
const OVERRIDES = {
  Zaken: { npcId: 29022, slug: 'zaken' },
};

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

/** Build a { lowercasedName: { npcId, slug } } map from the article html. */
function parseNpcMap(html) {
  const map = {};
  const linkRe = /<a href="\/lu4\/npc\/(\d+)-([^"]+)" class="item-name "/g;
  const parts = [];
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    parts.push({ npcId: +m[1], slug: m[2], idx: m.index });
  }
  for (let i = 0; i < parts.length; i++) {
    const start = parts[i].idx;
    const end = i + 1 < parts.length ? parts[i + 1].idx : html.length;
    const block = html.slice(start, end);
    const nameMatch = block.match(/alt="([^"]+)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1].replace(/\s+lu4$/i, '').trim();
    map[name.toLowerCase()] = { npcId: parts[i].npcId, slug: parts[i].slug };
  }
  return map;
}

async function main() {
  console.log('=== Fetching raid boss article ===');
  const html = await fetchText(ARTICLE_URL);
  const npcMap = parseNpcMap(html);
  console.log(`Parsed ${Object.keys(npcMap).length} NPC entries from article`);

  const raw = readFileSync(DATA_FILE, 'utf-8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const trailingNewline = /\n$/.test(raw);
  const bosses = JSON.parse(raw);

  let matched = 0;
  let overridden = 0;
  const unmatched = [];

  for (const boss of bosses) {
    const hit = npcMap[boss.name.toLowerCase()] || OVERRIDES[boss.name];
    if (!hit) {
      unmatched.push(`${boss.name} (lvl ${boss.level})`);
      // Ensure stale ids don't linger if a boss lost its match.
      delete boss.npcId;
      delete boss.slug;
      continue;
    }
    if (OVERRIDES[boss.name] && !npcMap[boss.name.toLowerCase()]) overridden++;
    boss.npcId = hit.npcId;
    boss.slug = hit.slug;
    matched++;
  }

  console.log(`\nMatched: ${matched}/${bosses.length} (of which ${overridden} via overrides)`);
  if (unmatched.length) {
    console.log('Unmatched (no wiki NPC id — app falls back to wiki search):');
    unmatched.forEach((u) => console.log(`  - ${u}`));
  }

  // Preserve the file's existing EOL / trailing-newline convention to keep the diff minimal.
  let out = JSON.stringify(bosses, null, 2);
  if (trailingNewline) out += '\n';
  if (eol === '\r\n') out = out.replace(/\n/g, '\r\n');
  writeFileSync(DATA_FILE, out, 'utf-8');
  console.log(`\nSaved ${DATA_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
