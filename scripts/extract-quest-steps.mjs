import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function slug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Load quest IDs
const idsTxt = readFileSync(root + '/src/data/quests/questIds.ts', 'utf-8');
const questIds = {};
for (const line of idsTxt.split('\n')) {
  const m = line.match(/^\s*(['\"])(.+?)\1\s*:\s*(\d+)/);
  if (m) questIds[m[2]] = parseInt(m[3], 10);
}

// Extract text from HTML preserving <a> tag inner text
function cleanHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d));
}

// Extract guide section and steps from HTML
function extractSteps(html) {
  // Find the guide section
  const guideIdx = html.toLowerCase().search(/quest guide/i);
  if (guideIdx < 0) return [];
  
  let guideHtml = html.slice(guideIdx);
  
  // Cut at next major heading
  const cutoff = guideHtml.search(/<h[1-6][^>]*>/i);
  if (cutoff > 0) {
    guideHtml = guideHtml.slice(0, cutoff);
  }
  
  const text = cleanHtml(guideHtml);
  
  // Split text at step markers and find content between them
  const stepBlocks = text.split(/(?=\b\d+\. [A-Z])/);
  
  const steps = [];
  for (const block of stepBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(\d+)\.\s+([\s\S]+)/);
    if (m) {
      const stepText = m[2]
        .replace(/\s+/g, ' ')
        .replace(/ NG/g, '')
        .replace(/ D/g, '')
        .replace(/ C/g, '')
        .replace(/ x (\d)\s*(\d{3})/g, ' x $1$2')
        .trim();
      if (stepText.length > 15) {
        // Clean trailing " ," or " ."
        const clean = stepText.replace(/[,\s]+$/, '').replace(/\s+\.$/, '.');
        steps.push(`${m[1]}. ${clean}`);
      }
    }
  }
  
  // Deduplicate by step number
  const deduped = {};
  for (const step of steps) {
    const num = step.match(/^(\d+)\./);
    if (num) {
      const n = num[1];
      if (!deduped[n] || step.length > deduped[n].length) {
        deduped[n] = step;
      }
    }
  }
  
  return Object.keys(deduped).sort((a, b) => parseInt(a) - parseInt(b)).map(k => deduped[k]);
}

// Racial quests
const quests = [
  'Letters of Love', 'What Women Want', 'Mass of Darkness',
  "Long Live the Pa'agrio Lord!", "Miner's Favor",
  'Deliver Goods', 'Sacrifice to the Sea', 'Find Sir Windawood',
  'Deliver Supplies', 'Fruit of the Mother Tree', "Nerupa's Request",
  'The Guard is Busy', 'Hunt the Orcs', 'Invaders of the Holy Land',
  'Bonds of Slavery', 'The Hidden Veins', 'Collect Spores',
  'Sword of Solidarity', 'Spirit of Mirrors', 'Skirmish with the Orcs',
  'Forgotten Truth', 'Spirit of Craftsman', 'Merciless Punishment',
  'Jumble, Tumble, Diamond Fuss', 'Sea of Spores Fever',
  'Offspring of Nightmares', 'Millennium Love', 'Cure for Fever Disease',
  'Dwarven Kinship', 'Dangerous Seduction', 'Acts of Evil',
  'Totem of the Hestui', 'Dragon Fangs', 'Red-Eyed Invaders',
  'Blood Fiend', 'Seed of evil',
];

async function main() {
  const results = {};
  
  for (const name of quests) {
    const id = questIds[name];
    if (!id) {
      console.log(`[SKIP] No ID for ${name}`);
      continue;
    }
    
    const url = `https://mw2.wiki/lu4/posts/post/${id}-${slug(name)}`;
    console.log(`[FETCH] ${name} -> ${url}`);
    
    try {
      const resp = await fetch(url, {
        headers: { 'Accept-Language': 'en' }
      });
      const html = await resp.text();
      const steps = extractSteps(html);
      results[name] = steps;
      console.log(`  -> ${steps.length} steps`);
      for (const s of steps.slice(0, 2)) {
        console.log(`     ${s.slice(0, 120)}`);
      }
    } catch (err) {
      console.log(`  [ERR] ${err.message}`);
      results[name] = [];
    }
    
    await sleep(2000 + Math.random() * 1500);
  }
  
  // Generate output
  console.log('\n\n=== QUEST_STEPS OUTPUT ===\n');
  for (const [name, steps] of Object.entries(results)) {
    if (steps.length > 0) {
      console.log(`'${name}': [`);
      for (const step of steps) {
        const safe = step.replace(/'/g, "\\'");
        console.log(`  '${safe}',`);
      }
      console.log(`],\n`);
    }
  }
}

main().catch(console.error);
