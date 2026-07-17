import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const recipes = JSON.parse(readFileSync(resolve(root, 'src/data/RECIPES.json'), 'utf-8'));

const map = {};
for (const r of recipes) {
  map[r.recipeName] = {
    g: r.resultGrade,
    t: r.recipeType,
    r: r.resultName,
    u: r.resultUrl,
  };
}

const outPath = resolve(root, 'src/data/RECIPE_ENRICHMENT.json');
writeFileSync(outPath, JSON.stringify(map));

const stats = JSON.stringify(map);
console.log(`Written ${Object.keys(map).length} entries (${(Buffer.byteLength(stats) / 1024).toFixed(1)} KB) to ${outPath}`);
