import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../src/data/RAIDBOSSES.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseBosses(html) {
  const bosses = [];
  const liRegex = /<li>(.+?)<\/li>/gs;
  let match;
  while ((match = liRegex.exec(html)) !== null) {
    const li = match[1];
    const nameMatch = li.match(/^(.+?)\s*<span/);
    const metaMatch = li.match(/<span[^>]*>\(([^)]+)\)<\/span>/);
    const locMatch = li.match(/\u2014\s*(.+)$/);

    const name = nameMatch ? nameMatch[1].trim() : '';
    const meta = metaMatch ? metaMatch[1].trim() : '';
    const location = locMatch ? locMatch[1].trim() : '';

    const lvlMatch = meta.match(/ур\.\s*(\d+)/);
    const level = lvlMatch ? Number(lvlMatch[1]) : 0;

    let respawn = '';
    if (meta.includes('Фиксированное')) {
      respawn = 'Фикс';
    } else {
      const respawnMatch = meta.match(/(\d+)\s*часов?\s*±\s*(\d+)\s*часа?/);
      if (respawnMatch) {
        respawn = `${respawnMatch[1]}ч ± ${respawnMatch[2]}ч`;
      }
    }

    if (name) {
      bosses.push({ name, level, respawn, location });
    }
  }
  return bosses;
}

async function main() {
  console.log('Fetching raid boss page...');
  const html = await fetch('https://lu4db.ru/raid-boss');
  const bosses = parseBosses(html);
  fs.writeFileSync(OUT, JSON.stringify(bosses, null, 2));
  console.log(`Done! Parsed ${bosses.length} raid bosses → ${OUT}`);
}

main().catch(console.error);
