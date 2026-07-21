import { readFileSync, writeFileSync } from 'fs';

/**
 * Builds src/data/RECIPE_ICONS.json — a map recipeId -> { recipe, result }
 * where each value is a wiki icon filename, e.g.
 *   "1793": { recipe: "etc_recipe_white_i00.png", result: "weapon_sword_of_watershadow_i00.png" }
 *
 * Powers the recipes page:
 *   - dropdown option shows the crafted item's icon (result) after the recipe name
 *   - the selected recipe's header shows the recipe scroll icon (recipe)
 *
 * One fetch per recipe: the recipe item page contains both the header (recipe) icon
 * and, in its "recipe_result" block, the crafted item's icon. Read from mw2.wiki
 * (accessible mirror of masterwork.wiki); icons are hotlinked from masterwork.wiki/i64.
 */

const WIKI_MIRROR = 'https://mw2.wiki';
const RECIPES_FILE = 'src/data/RECIPES.json';
const OUT_FILE = 'src/data/RECIPE_ICONS.json';
const DELAY_MS = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function parseIcons(html) {
  // Header icon of the recipe item itself (uses <div class="item-icon">).
  const recipe = (html.match(/<div class="item-icon">\s*<img src="\/i64\/([^"]+)"/) || [])[1] || null;
  // Crafted item icon: within the recipe_result block, the icon after the "Result" label.
  const rr = html.slice(html.indexOf('recipe_result'));
  const result = (rr.match(/>Result<\/div>[\s\S]*?<img src="\/i64\/([^"]+)"/) || [])[1] || null;
  return { recipe, result };
}

async function main() {
  const recipes = JSON.parse(readFileSync(RECIPES_FILE, 'utf-8'));
  console.log(`Fetching icons for ${recipes.length} recipes...`);

  const out = {};
  let done = 0;
  let withRecipe = 0;
  let withResult = 0;
  for (const r of recipes) {
    try {
      const html = await fetchText(`${WIKI_MIRROR}/lu4/item/${r.recipeId}`);
      const icons = parseIcons(html);
      const entry = {};
      if (icons.recipe) {
        entry.recipe = icons.recipe;
        withRecipe++;
      }
      if (icons.result) {
        entry.result = icons.result;
        withResult++;
      }
      if (entry.recipe || entry.result) out[r.recipeId] = entry;
    } catch (e) {
      console.error(`  ${r.recipeName} (${r.recipeId}): ${e.message}`);
    }
    if (++done % 40 === 0) console.log(`  ${done}/${recipes.length}`);
    await sleep(DELAY_MS);
  }

  console.log(`\nRecipes with recipe icon: ${withRecipe}/${recipes.length}`);
  console.log(`Recipes with result icon: ${withResult}/${recipes.length}`);

  const sorted = Object.fromEntries(Object.keys(out).sort((a, b) => +a - +b).map((k) => [k, out[k]]));
  writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`Saved ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
