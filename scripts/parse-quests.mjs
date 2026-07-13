/**
 * Quest data parser for mw2.wiki
 *
 * Extracts: full walkthrough steps, NPC IDs, NPC names, coordinates
 * Usage: node scripts/parse-quests.mjs
 *
 * Output: src/data/QUEST_DATA.json
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, '../src/data/QUEST_DATA.json');

// ─── Config ───
const DELAY_MIN = 1500;
const DELAY_MAX = 3000;
const SEMAPHORE = 4;

// ─── Quest list ───
const QUESTS = {
  // Racial quests (from QUEST_IDS mapping)
  quest: {
    'Letters of Love': 1, 'What Women Want': 2, 'Mass of Darkness': 166,
    'Long Live the Pa\'agrio Lord!': 4, 'Miner\'s Favor': 5,
    'Deliver Goods': 153, 'Sacrifice to the Sea': 154,
    'Find Sir Windawood': 155, 'Deliver Supplies': 168,
    'Fruit of the Mother Tree': 161, 'Nerupa\'s Request': 160,
    'The Guard is Busy': 257, 'Hunt the Orcs': 260,
    'Invaders of the Holy Land': 273, 'Bonds of Slavery': 265,
    'The Hidden Veins': 293, 'Collect Spores': 313,
    'Sword of Solidarity': 101, 'Spirit of Mirrors': 104,
    'Skirmish with the Orcs': 105, 'Forgotten Truth': 106,
    'Spirit of Craftsman': 103, 'Merciless Punishment': 107,
    'Jumble, Tumble, Diamond Fuss': 108,
    'Sea of Spores Fever': 102,
    'Offspring of Nightmares': 169, 'Millennium Love': 156,
    'Cure for Fever Disease': 151, 'Dwarven Kinship': 167,
    'Totem of the Hestui': 276,
    'Dragon Fangs': 38, 'Red-Eyed Invaders': 169,
    'Blood Fiend': 170, 'Seed of evil': 171,
  },
  // 1st profession quests post IDs
  posts: {
    'Path of the Warrior': 618, 'Path of the Human Knight': 445, 'Path of the Rogue': 619,
    'Path of the Human Wizard': 620, 'Path of the Cleric': 621,
    'Path of the Elven Knight': 622, 'Path of the Elven Scout': 623,
    'Path of the Elven Wizard': 624, 'Path of the Elven Oracle': 625,
    'Path of the Palus Knight': 626, 'Path of the Assassin': 627,
    'Path of the Dark Wizard': 628, 'Path of the Shillien Oracle': 629,
    'Path of the Orc Raider': 630, 'Path of the Orc Monk': 631,
    'Path of the Orc Shaman': 632, 'Path of the Scavenger': 633,
    'Path of the Artisan': 634, 'Trial of Geomancer': 153,
  },
};

// ─── Helpers ───
function fetch(url) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'en',
        'Accept': 'text/html,application/xhtml+xml',
      },
    };
    https.get(url, opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomDelay() {
  return delay(Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1) + DELAY_MIN));
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<li[^>]*>/gi, '\n')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSteps(html) {
  // Extract the Quest guide section (after "Quest guide" heading)
  const guideIdx = html.indexOf('Quest guide');
  if (guideIdx === -1) return [];

  const section = html.substring(guideIdx);

  // Extract all <p> blocks (steps are inside <p> tags)
  const pBlocks = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(section)) !== null) {
    pBlocks.push(match[1]);
  }

  // Process each block: strip HTML tags but keep inner text
  const steps = [];
  for (const block of pBlocks) {
    // Remove HTML tags, keep text
    const text = block
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) continue;

    // Check if this block starts with a step number
    if (/^\d+\.\s+/.test(text)) {
      // Skip tips/warnings
      if (/Lu4 is currently|all quest items drop|guides are written|Pay Attention|Characters above/i.test(text)) continue;
      steps.push(text);
    }
  }

  return steps;
}

function stripHtmlForSteps(html) {
  // For quest pages (not posts) we need different extraction
  const guideIdx = html.indexOf('Quest guide');
  if (guideIdx === -1) return '';

  const section = html.substring(guideIdx);
  return section
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function extractNpcIds(html) {
  const ids = new Set();
  const regex = /\/lu4\/npc\/(\d+)/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    ids.add(parseInt(match[1]));
  }
  return [...ids];
}

function extractNpcName(html) {
  const idx = html.indexOf('Starting NPC');
  if (idx === -1) return '';

  // Get the Starting NPC row content
  const section = html.substring(idx, idx + 2000);

  // Find NPC name: it's the first item-name__content that contains a single NPC name
  // (items have nested span.item-name__class-1, NPC names don't)
  const contentRegex = /item-name__content">\s*\n?\s*([A-Z][a-zA-Z\u00C0-\u024F\s.'-]{2,60}?)\s*\n?\s*<span\s+class="item-name__additional/;
  const match = section.match(contentRegex);
  if (match) {
    const name = match[1].trim();
    // Filter out item/consumable names
    const badPrefixes = ['Scroll', 'Exp', 'SP NG', 'Lesser', 'Soulshot', 'Spiritshot', 'Healing',
      'Personal', 'Haste', 'Alacrity', 'Necklace', 'Ring', 'Medallion', 'Wand', 'Bone',
      'Sword', 'Club', 'Adena', 'Weapon', 'CP', 'Elixir', 'Greater', 'Sweet', 'Fresh',
      'Vitality', 'Lucky', 'Blessed', 'Proof', 'Medal', 'Stone', 'Mithril', 'Iron',
      'Wooden', 'Bronze', 'Puma', 'Cursed', 'Ring Mail', 'Apprentice', 'Eldritch',
      'Blood Saber', 'Red Sunset', 'Staff', 'Butcher'];
    if (!badPrefixes.some(p => name.startsWith(p)) && name.length < 50) {
      return name;
    }
  }
  return '';
}

async function getNpcInfo(npcId) {
  try {
    const html = await fetch(`https://mw2.wiki/lu4/npc/${npcId}`);
    // NPC page has format: <title>Lu4 Wiki: NPC Name</title>
    const nameMatch = html.match(/<title>Lu4 Wiki: NPC ([^<]+)<\/title>/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    const spawnHtml = await fetch(`https://mw2.wiki/lu4/npc/spawn/${npcId}`);
    const coordsMatch = spawnHtml.match(/style="top:\s*([\d.]+)px;\s*left:\s*([\d.]+)px/);
    const coords = coordsMatch ? { x: parseFloat(coordsMatch[2]), y: parseFloat(coordsMatch[1]) } : null;

    return { name, coords };
  } catch {
    return { name: '', coords: null };
  }
}

// ─── Main ───
async function processQuest(name, id, type) {
  const url = type === 'quest'
    ? `https://mw2.wiki/lu4/quest/${id}`
    : `https://mw2.wiki/lu4/posts/post/${id}`;

  console.log(`Fetching ${name} (${type} ${id})...`);

  try {
    const html = await fetch(url);

    // Extract steps
    const steps = extractSteps(html);

    // Extract NPC IDs
    const npcIds = extractNpcIds(html);
    const startNpcId = npcIds.length > 0 ? npcIds[0] : null;

    // Get NPC info
    let npcName = '';
    let coords = null;
    if (startNpcId) {
      const info = await getNpcInfo(startNpcId);
      npcName = info.name;
      coords = info.coords;
    }

    return {
      name,
      id,
      type,
      npcId: startNpcId,
      npcName,
      coords,
      steps,
      allNpcIds: npcIds,
    };
  } catch (err) {
    console.error(`Error fetching ${name}: ${err.message}`);
    return null;
  }
}

async function runWithSemaphore(tasks, limit) {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }
  return results;
}

async function main() {
  console.log('=== Parsing quest data from mw2.wiki ===\n');

  // Build task list
  const tasks = [];

  // Quest-type pages
  for (const [name, id] of Object.entries(QUESTS.quest)) {
    tasks.push(() => processQuest(name, id, 'quest'));
  }

  // Post-type pages (professions)
  for (const [name, id] of Object.entries(QUESTS.posts)) {
    tasks.push(() => processQuest(name, id, 'post'));
  }

  console.log(`Total quests to parse: ${tasks.length}\n`);

  const results = await runWithSemaphore(tasks, SEMAPHORE);

  // Build output
  const output = {};
  for (const r of results) {
    if (!r) continue;
    output[r.name] = {
      id: r.id,
      type: r.type,
      npcId: r.npcId,
      npcName: r.npcName,
      coords: r.coords,
      steps: r.steps.slice(0, 30), // limit steps
    };
    console.log(`  ${r.name}: ${r.steps.length} steps, NPC=${r.npcName || '?'}`);
    await randomDelay();
  }

  // Write output
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nWritten to ${OUTPUT}`);
  console.log(`Total quests: ${Object.keys(output).length}`);
}

main().catch(console.error);
