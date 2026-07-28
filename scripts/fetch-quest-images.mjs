import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const QUESTS = [
  { id: 87, name: 'Relic Exploration' },
  { id: 88, name: "Nikola's Cooperation" },
  { id: 89, name: 'Art of Persuasion' },
  { id: 90, name: "Nikola's Heart" },
  { id: 91, name: 'Seal Removal' },
  { id: 92, name: 'Contract Execution' },
  { id: 93, name: 'Lost Dream' },
  { id: 94, name: 'Vain Conclusion' },
  { id: 95, name: 'Contract Completion' },
];

function toId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchPage(postId) {
  const url = `https://mw2.wiki/lu4/posts/post/${postId}`;
  const res = await fetch(url);
  return res.text();
}

function extractImages(html) {
  const images = [];
  const regex = /<figure[^>]*>[\s\S]*?<img[^>]*src="([^"]+\.jpg)"[^>]*>[\s\S]*?<\/figure>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    images.push(match[1]);
  }
  return images;
}

async function downloadImage(url, filePath) {
  const res = await fetch(`https://mw2.wiki${url}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filePath, buffer);
}

async function main() {
  const outDir = resolve(root, 'public/images/quests');
  mkdirSync(outDir, { recursive: true });

  for (const quest of QUESTS) {
    console.log(`Fetching post ${quest.id} — ${quest.name}...`);
    const html = await fetchPage(quest.id);
    const images = extractImages(html);
    console.log(`  Found ${images.length} images`);

    const slug = toId(quest.name);

    for (let i = 0; i < images.length; i++) {
      const ext = images[i].split('.').pop();
      const fileName = `${slug}-${i + 1}.${ext}`;
      const filePath = resolve(outDir, fileName);
      console.log(`  Downloading ${images[i]} → ${fileName}`);
      await downloadImage(images[i], filePath);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
