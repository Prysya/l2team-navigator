import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const bosses = JSON.parse(readFileSync(resolve(root, 'src/data/RAIDBOSSES.json'), 'utf-8'));

function toBossId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const map = bosses.map((b) => ({ id: toBossId(b.name), name: b.name }));

const outPath = resolve(root, 'src/data/BOSS_ID_MAP.json');
writeFileSync(outPath, JSON.stringify(map));

console.log(`Written ${map.length} entries to ${outPath}`);
