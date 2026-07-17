import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const recipes = JSON.parse(readFileSync(resolve(root, 'src/data/RECIPES.json'), 'utf-8'));
const locationsAll = JSON.parse(readFileSync(resolve(root, 'src/data/LOCATIONS_ALL.json'), 'utf-8'));
const locationRefs = JSON.parse(readFileSync(resolve(root, 'tmp/locations.json'), 'utf-8'));

function normalizeName(name) {
  return name
    .replace(/[\u2018\u2019\u0060\u00B4\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}

const ruToEng = new Map();
const cityIdToName = new Map();

for (const ref of locationRefs) {
  if (ref.location_name_rus && ref.location_name_eng) {
    ruToEng.set(ref.location_name_rus, ref.location_name_eng);
  }
  if (ref.main_location_wiki_id === null && ref.location_name_eng) {
    cityIdToName.set(ref.location_wiki_id, ref.location_name_eng);
  }
}

const locationsAllMap = new Map();
for (const loc of locationsAll) {
  locationsAllMap.set(normalizeName(loc.location_name), loc);
}

function translateName(ruName) {
  const direct = ruToEng.get(ruName);
  if (direct) return direct;

  if (ruName === 'Кайнак') return 'Cave of Trials';
  if (ruName === 'Школа Полномочий') return 'Skyshadow Meadow';

  for (const [ru, eng] of ruToEng) {
    if (normalizeName(ru) === normalizeName(ruName)) return eng;
  }

  return ruName;
}

function getCityForRuName(ruName) {
  for (const ref of locationRefs) {
    if (ref.location_name_rus === ruName) {
      if (ref.main_location_wiki_id !== null) {
        const city = cityIdToName.get(ref.main_location_wiki_id);
        if (city) return city;
      } else {
        return ref.location_name_eng;
      }
    }
  }

  if (ruName === 'Кайнак') return 'Orc Village';
  if (ruName === 'Школа Полномочий') return 'Oren';

  return null;
}

function getLocationTypes(ruName) {
  for (const ref of locationRefs) {
    if (ref.location_name_rus === ruName) {
      if (Array.isArray(ref.location_type)) return ref.location_type;
      if (typeof ref.location_type === 'string') return [ref.location_type];
      return [];
    }
  }
  return [];
}

const pieceMap = {};

for (const recipe of recipes) {
  if (!recipe.mainPieceMonsters || recipe.mainPieceMonsters.length === 0) continue;
  if (recipe.recipeType === 'Material' || recipe.recipeType === 'Other') continue;

  const pieceName = recipe.requiredItems[0]?.name;
  if (!pieceName) continue;

  const pieceItemId = recipe.requiredItems[0]?.itemId;

  for (const monster of recipe.mainPieceMonsters) {
    for (const loc of monster.locations || []) {
      const ruName = loc.location_name;
      if (!ruName) continue;

      const enName = normalizeName(translateName(ruName));

      if (!pieceMap[enName]) {
        let city = getCityForRuName(ruName);
        if (!city) {
          const locData = locationsAllMap.get(enName);
          city = locData?.main_location_name || 'Unknown';
        }

        const types = getLocationTypes(ruName);
        const locData = locationsAllMap.get(enName);

        pieceMap[enName] = {
          location_name: enName,
          main_location_name: city,
          location_types: types.length > 0 ? types : (locData?.location_types || []),
          avg_level: 0,
          has_spoil: false,
          has_boss: false,
          items: {},
          monsterLevels: [],
        };
      }

      const entry = pieceMap[enName];
      const itemKey = pieceName;

      if (!entry.items[itemKey]) {
        const slug = pieceName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        entry.items[itemKey] = {
          item_name: pieceName,
          item_url: pieceItemId ? `https://masterwork.wiki/lu4/item/${pieceItemId}-${slug}` : null,
          item_type: 'piece',
          classes: [],
          monsters: {},
        };
      }

      const itemEntry = entry.items[itemKey];
      const monKey = `${monster.monster_name}|${monster.monster_lvl}`;

      if (!itemEntry.monsters[monKey]) {
        itemEntry.monsters[monKey] = {
          monster_name: monster.monster_name,
          monster_url: monster.monster_url || '',
          monster_lvl: monster.monster_lvl || 0,
          drop_chance: monster.drop_chance || 0,
          spoil_chance: monster.spoil_chance || 0,
          is_boss: monster.monster_type === 'Bosses',
        };
        if (monster.spoil_chance > 0) entry.has_spoil = true;
        if (monster.monster_type === 'Bosses') entry.has_boss = true;
        if (monster.monster_lvl && !entry.monsterLevels.includes(monster.monster_lvl)) {
          entry.monsterLevels.push(monster.monster_lvl);
        }
      }
    }
  }
}

const result = [];

for (const key of Object.keys(pieceMap).sort()) {
  const entry = pieceMap[key];

  if (entry.monsterLevels.length > 0) {
    entry.avg_level = +(entry.monsterLevels.reduce((a, b) => a + b, 0) / entry.monsterLevels.length).toFixed(1);
  }
  delete entry.monsterLevels;

  entry.items = Object.values(entry.items).map((item) => ({
    ...item,
    monsters: Object.values(item.monsters),
  }));

  if (entry.items.length > 0) {
    result.push(entry);
  }
}

const outPath = resolve(root, 'src/data/LOCATIONS_PIECES.json');
writeFileSync(outPath, JSON.stringify(result));

let totalItems = 0;
let unknownCount = 0;
const byCity = {};
for (const loc of result) {
  totalItems += loc.items.length;
  if (loc.main_location_name === 'Unknown') unknownCount++;
  byCity[loc.main_location_name] = (byCity[loc.main_location_name] || 0) + 1;
}
console.log(`Written ${result.length} locations with ${totalItems} items to ${outPath}`);
console.log(`Unknown cities: ${unknownCount}/${result.length}`);
for (const [city, count] of Object.entries(byCity).sort()) {
  console.log(`  ${city}: ${count}`);
}
