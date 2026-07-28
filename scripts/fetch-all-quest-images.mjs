import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const questIdsPath = resolve(root, 'src/data/quests/questIds.ts');
const questIdsContent = readFileSync(questIdsPath, 'utf-8');

const nameToId = {};
const regex = /'([^']+)':\s*(\d+)/g;
let match;
while ((match = regex.exec(questIdsContent)) !== null) {
  nameToId[match[1]] = parseInt(match[2], 10);
}

console.log(`Found ${Object.keys(nameToId).length} quests in questIds.ts`);

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchPage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

function extractImages(html) {
  const images = [];
  const regex = /<figure[^>]*>[\s\S]*?<img[^>]*src="([^"]+\.(?:jpg|png|webp))"[^>]*>[\s\S]*?<\/figure>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    images.push(m[1]);
  }
  return [...new Set(images)]; // deduplicate
}

async function downloadImage(url, filePath) {
  const res = await fetch(`https://mw2.wiki${url}`);
  if (!res.ok) return false;
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filePath, buffer);
  return true;
}

async function main() {
  const imgDir = resolve(root, 'public/images/quests');
  mkdirSync(imgDir, { recursive: true });

  const result = {};

  const entries = Object.entries(nameToId);

  for (let i = 0; i < entries.length; i++) {
    const [name, id] = entries[i];
    const slug = toSlug(name);
    const isPost = id >= 87;
    const url = isPost
      ? `https://mw2.wiki/lu4/posts/post/${id}`
      : `https://mw2.wiki/lu4/quest/${id}`;

    process.stdout.write(`[${i + 1}/${entries.length}] ${name}... `);
    const html = await fetchPage(url);

    if (!html) {
      console.log('SKIP (no response)');
      continue;
    }

    const images = extractImages(html);

    if (images.length === 0) {
      console.log('no images');
      continue;
    }

    const downloaded = [];
    for (let j = 0; j < images.length; j++) {
      const ext = images[j].split('.').pop();
      const fileName = `${slug}-${j + 1}.${ext}`;
      const filePath = resolve(imgDir, fileName);
      if (!existsSync(filePath) || false) {
        const ok = await downloadImage(images[j], filePath);
        if (!ok) {
          console.log(`  FAIL: ${images[j]}`);
          continue;
        }
      }
      downloaded.push(fileName);
    }

    result[name] = downloaded;
    console.log(`${downloaded.length} images`);
  }

  const outPath = resolve(root, 'src/data/quests/QUEST_IMAGES.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\nWritten ${outPath}`);
  console.log(`Total quests with images: ${Object.keys(result).length}`);
}

main().catch(console.error);
