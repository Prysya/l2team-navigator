import { readFileSync, writeFileSync, existsSync } from 'fs';

const MW2_BASE = 'https://mw2.wiki';
const ARTICLE_URL = `${MW2_BASE}/lu4/posts/post/385-lu4-raid-bosses`;
const IMG_DIR = 'public/images/bosses';
const DATA_FILE = 'src/data/RAIDBOSSES.json';
const DELAY_MS = 300;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function parseStatsTable(tableHtml) {
  const stats = {};
  const rows = [...tableHtml.matchAll(/<tr>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/gis)];
  const keyMap = {
    'HP': 'hp', 'MP': 'mp',
    'P. Atk.': 'pAtk', 'M. Atk.': 'mAtk',
    'P. Def.': 'pDef', 'M. Def.': 'mDef',
    'Exp': 'exp', 'SP': 'sp',
    'Attack Attribute': 'atkAttr', 'Defense Attribute': 'defAttr',
  };
  for (const [, label1, val1, label2, val2] of rows) {
    const k1 = keyMap[label1.trim()];
    const k2 = keyMap[label2.trim()];
    if (k1) stats[k1] = val1.replace(/<[^>]+>/g, '').trim();
    if (k2) stats[k2] = val2.replace(/<[^>]+>/g, '').trim();
  }
  return Object.keys(stats).length ? stats : null;
}

async function fetchCoords(npcId, nameSlug) {
  try {
    const html = await fetchText(`${MW2_BASE}/lu4/npc/spawn/${npcId}-${nameSlug}`);
    const m = html.match(/top:\s*([\d.]+)px.*?left:\s*([\d.]+)px/);
    if (m) return { x: Math.round(+m[2] * 100) / 100, y: Math.round(+m[1] * 100) / 100 };
  } catch (e) {
    console.error(`  Coords fail ${npcId}: ${e.message}`);
  }
  return null;
}

async function downloadImage(url, filepath) {
  if (existsSync(filepath)) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(filepath, Buffer.from(await res.arrayBuffer()));
    console.log(`  Downloaded: ${filepath}`);
  } catch (e) {
    console.error(`  Image fail: ${e.message}`);
  }
}

async function main() {
  console.log('=== Fetching article ===');
  const html = await fetchText(ARTICLE_URL);
  console.log(`Size: ${(html.length / 1024 / 1024).toFixed(1)} MB`);

  // Split by level sections
  const sections = html.split(/<h2>Level \d+-\d+<\/h2>/);
  console.log(`Sections: ${sections.length}`);

  const mw2Bosses = [];

  for (const section of sections) {
    // Find all boss blocks by npc link
    const parts = [...section.matchAll(/<a href="\/lu4\/npc\/(\d+)-([^"]+)" class="item-name "/g)];
    for (const part of parts) {
      const npcId = +part[1];
      const nameSlug = part[2];

      // Extract the boss block: from this npc link to next npc link or end of section
      const startIdx = part.index;
      const nextPart = [...parts].find(p => p.index > startIdx);
      const endIdx = nextPart ? nextPart.index : section.length;
      const block = section.slice(startIdx, endIdx);

      // Name and level
      const nameMatch = block.match(/alt="([^"]+)"/);
      const lvlMatch = block.match(/Lv\.\s*(\d+)/);
      if (!nameMatch || !lvlMatch) continue;
      const name = nameMatch[1].trim();
      const level = +lvlMatch[1];

      // Boss image
      const imgMatch = block.match(/<figure>[\s\S]*?<img src="(\/file\/[^"]+)"/);
      const imageUrl = imgMatch ? `${MW2_BASE}${imgMatch[1]}` : null;

      // Stats
      const statsMatch = block.match(/<div class="npc-stats">([\s\S]*?)<\/div>/);
      const stats = statsMatch ? parseStatsTable(statsMatch[1]) : null;

      mw2Bosses.push({
        npcId, name, level, imageUrl,
        imageFile: `images/bosses/${slug(name)}.jpg`,
        stats,
      });
    }
  }

  console.log(`Parsed ${mw2Bosses.length} bosses`);

  // Load existing data
  console.log('\n=== Merging with RAIDBOSSES.json ===');
  const existing = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  const nameMap = {};
  for (const b of existing) nameMap[b.name.toLowerCase()] = b;

  let matched = 0;
  for (const mw2 of mw2Bosses) {
    const key = mw2.name.toLowerCase();
    const boss = nameMap[key];
    if (!boss) {
      console.log(`  No match: ${mw2.name}`);
      continue;
    }
    matched++;

    if (mw2.imageUrl) {
      const imgPath = `${IMG_DIR}/${slug(mw2.name)}.jpg`;
      await downloadImage(mw2.imageUrl, imgPath);
      if (!boss.image) boss.image = mw2.imageFile;
    }

    const coords = await fetchCoords(mw2.npcId, slug(mw2.name));
    if (coords) boss.coords = coords;

    if (!boss.stats && mw2.stats) boss.stats = mw2.stats;

    await sleep(DELAY_MS);
  }

  console.log(`\nMatched: ${matched}/${existing.length}`);

  writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  console.log('Saved!');
}

main().catch(console.error);
