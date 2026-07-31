import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const imagesDir = resolve(root, 'public/images/quests');

if (!existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true });

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

// Racial quests (same as questSteps)
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

function extractImages(html) {
  const urls = [];
  const regex = /<img[^>]*src="\/file\/([^"]+)"[^>]*>/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const fileUrl = `https://mw2.wiki/file/${m[1]}`;
    if (!urls.includes(fileUrl)) urls.push(fileUrl);
  }
  return urls;
}

async function downloadImage(url, filepath) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    writeFileSync(filepath, buffer);
    return true;
  } catch (err) {
    console.error(`    FAILED: ${url} - ${err.message}`);
    return false;
  }
}

async function main() {
  const imageMap = {};
  let totalDownloaded = 0;
  
  for (const name of quests) {
    const id = questIds[name];
    if (!id) { console.log(`[SKIP] No ID for ${name}`); continue; }
    
    const qSlug = slug(name);
    const url = `https://mw2.wiki/lu4/posts/post/${id}-${qSlug}`;
    console.log(`[${quests.indexOf(name)+1}/${quests.length}] ${name}`);
    
    try {
      const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const html = await resp.text();
      if (!html || html.length < 500) {
        throw new Error(`Empty or too short response (${html.length} bytes)`);
      }
      const imageUrls = extractImages(html);
      
      const questImages = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const ext = '.jpg';
        const filename = `${qSlug}-${i + 1}${ext}`;
        const filepath = resolve(imagesDir, filename);
        
        // Skip if already exists (check file size > 1KB)
        if (existsSync(filepath) && readFileSync(filepath).length > 1000) {
          questImages.push(filename);
          continue;
        }
        
        console.log(`    Downloading ${filename}...`);
        const ok = await downloadImage(imageUrls[i], filepath);
        if (ok) {
          questImages.push(filename);
          totalDownloaded++;
        }
        // Small delay between downloads
        await sleep(500);
      }
      
      imageMap[name] = questImages;
      console.log(`    ${questImages.length} images`);
      
    } catch (err) {
      console.log(`    [ERR] ${err.message}`);
      imageMap[name] = [];
    }
    
    await sleep(1000 + Math.random() * 1000);
  }
  
  // Write QUEST_IMAGES.json (merge with existing)
  const existingPath = resolve(root, 'src/data/quests/QUEST_IMAGES.json');
  let existing = {};
  if (existsSync(existingPath)) {
    existing = JSON.parse(readFileSync(existingPath, 'utf-8'));
  }
  const merged = { ...existing, ...imageMap };
  writeFileSync(existingPath, JSON.stringify(merged, null, 2));
  
  console.log(`\nDone! Downloaded ${totalDownloaded} new images.`);
  console.log(`Total quests with images: ${Object.values(imageMap).filter(v => v.length > 0).length}`);
}

main().catch(console.error);
