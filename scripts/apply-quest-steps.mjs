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

function cleanHtml(html) {
  return html
    // Remove item grade badges (NG, D, C, B, A, S, Foundation)
    .replace(/<span[^>]*class="[^"]*item-grade[^"]*"[^>]*>[^<]*<\/span>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d));
}

function extractStepsFromHtml(html) {
  const guideIdx = html.toLowerCase().search(/quest guide|прохождение квеста/i);
  if (guideIdx < 0) return [];
  
  let guideHtml = html.slice(guideIdx);
  const cutoff = guideHtml.search(/<h[1-6][^>]*>/i);
  if (cutoff > 0) guideHtml = guideHtml.slice(0, cutoff);
  
  const text = cleanHtml(guideHtml);
  
  // Split at step numbers (handle both English and Cyrillic)
  const blocks = text.split(/(?=\b\d+\.\s*[A-ZА-Я])/);
  const steps = [];
  
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(\d+)\.\s+([\s\S]+)/);
    if (m) {
      let stepText = m[2]
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*([,.\])])/g, '$1')
        .replace(/\s+\.$/, '.')
        .trim();
      
      // Filter out non-step content
      if (stepText.length > 15 && !stepText.startsWith('![')) {
        // Clean trailing punctuation artifacts
        stepText = stepText.replace(/\s+[,\s]+$/, '').replace(/\.\s*\.$/, '.');
        steps.push(`${m[1]}. ${stepText}`);
      }
    }
  }
  
  return steps;
}

function cleanupSteps(steps, name) {
  return steps.map(step => {
    let s = step;
    
    // Remove "ungeon Map" and similar artifacts
    s = s.replace(/ungeon Map[^.]*\.?/gi, '');
    s = s.replace(/Highlighted areas?[^.]*\./gi, '');
    s = s.replace(/The highlighted area[^.]*\./gi, '');
    
    // Fix Dungeon Map heading
    s = s.replace(/\s*[Dd]ungeon\s+[Mm]ap\s*/g, ' ');
    
    // Fix sub-step references ("2.1", "2.2")
    s = s.replace(/\s+\d+\.\d+\s+/g, ' ');
    
    // Remove trailing NPC name repetition (after period, there's a name)
    // Pattern: "text. NPC Name" at end - this is a footnote. Remove it.
    s = s.replace(/\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*$/, '.');
    
    // Fix "x 1 500" → "x 1500" (spaces in numbers)
    s = s.replace(/x (\d)\s(\d{3})/g, 'x $1$2');
    s = s.replace(/x (\d)\s(\d)\s(\d{3})/g, 'x $1$2$3');
    
    // Remove grade markers
    s = s.replace(/\s+NG(?=[\s.,;:!?]|$)/g, '');
    s = s.replace(/\s+NG\./g, '.');
    s = s.replace(/\s+D(?=[\s.,;:!?]|$)/g, '');
    s = s.replace(/\s+C(?=[\s.,;:!?]|$)/g, '');
    
    // Clean up multiple spaces
    s = s.replace(/\s{2,}/g, ' ');
    s = s.replace(/\s+\./g, '.');
    s = s.replace(/\.\.+/g, '.');
    
    // Clean trailing comma/space
    s = s.replace(/[,\s]+$/, '');
    
    return s.trim();
  });
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
    if (!id) { console.log(`[SKIP] No ID for ${name}`); continue; }
    
    const url = `https://mw2.wiki/lu4/posts/post/${id}-${slug(name)}`;
    console.log(`[${quests.indexOf(name)+1}/${quests.length}] ${name}`);
    
    try {
      // Try Russian first
      let resp = await fetch(url, { headers: { 'Accept-Language': 'ru' } });
      let html = await resp.text();
      let steps = extractStepsFromHtml(html);
      
      // Fallback to English if Russian has no steps
      if (steps.length < 2) {
        console.log(`  Russian: ${steps.length} steps, trying English...`);
        resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        html = await resp.text();
        steps = extractStepsFromHtml(html);
      }
      
      steps = cleanupSteps(steps, name);
      results[name] = steps;
      console.log(`  -> ${steps.length} steps`);
    } catch (err) {
      console.log(`  [ERR] ${err.message}`);
      results[name] = [];
    }
    
    await sleep(1500 + Math.random() * 1000);
  }
  
  // Read existing questSteps.ts to preserve profession quest steps
  const existing = readFileSync(root + '/src/data/quests/questSteps.ts', 'utf-8');
  
  // Find the profession quests section (everything after '// 1st profession quests')
  const profSection = existing.match(/(\/\/ 1st profession quests[\s\S]*)/);
  
  // Build new file
  let output = 'export const QUEST_STEPS: Record<string, string[]> = {\n';
  
  for (const [name, steps] of Object.entries(results)) {
    if (steps.length > 0) {
      // Use double quotes for keys with apostrophes
      if (name.includes("'")) {
        output += `  "${name}": [\n`;
      } else {
        output += `  '${name}': [\n`;
      }
      for (const step of steps) {
        const safe = step.replace(/'/g, "\\'");
        output += `    '${safe}',\n`;
      }
      output += `  ],\n\n`;
    }
  }
  
  // Append profession quests from existing file
  if (profSection) {
    output += profSection[1];
  } else {
    output += existing.match(/([\s\S]*)/)[0];
  }
  
  writeFileSync(root + '/src/data/quests/questSteps.ts', output);
  console.log('\nDone! Updated questSteps.ts');
  
  // Stats
  let totalSteps = 0;
  for (const [, steps] of Object.entries(results)) totalSteps += steps.length;
  console.log(`Total: ${Object.keys(results).length} quests, ${totalSteps} steps`);
}

main().catch(console.error);
