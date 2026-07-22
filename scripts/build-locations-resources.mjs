import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/** Read + parse a JSON file, failing with a clear message when it is missing. */
function readJson(relPath, hint) {
  const abs = resolve(root, relPath);
  if (!existsSync(abs)) {
    const suffix = hint ? ` ${hint}` : '';
    throw new Error(`Required input not found: ${relPath}.${suffix}`);
  }
  return JSON.parse(readFileSync(abs, 'utf-8'));
}

const TMP_HINT = 'It is generated into tmp/ (gitignored) by the NPC scraping step — run that first.';

const recipes = readJson('src/data/RECIPES.json');
const npcs = readJson('tmp/npc_json_with_subtypes.json', TMP_HINT);
const locationsAll = readJson('src/data/LOCATIONS_ALL.json');
const locationRefs = readJson('tmp/locations.json', TMP_HINT);

// --- Location mapping utilities (same as build-locations-pieces.mjs) ---

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

const locationsAllMap = new Map();
for (const loc of locationsAll) {
  locationsAllMap.set(normalizeName(loc.location_name), loc);
}

// --- Identify resource items ---
// Pieces: requiredItems[0] of Weapon/Armor/Accessory recipes
// Resources: requiredItems[0] of Material/Other/Soulshot + ALL non-first required items

const pieceNames = new Set();
for (const r of recipes) {
  if (r.recipeType === 'Weapon' || r.recipeType === 'Armor' || r.recipeType === 'Accessory') {
    const first = r.requiredItems?.[0];
    if (first) pieceNames.add(first.name);
  }
}

const EXCLUDE_WORDS = ['Recipe', 'Book', 'Scroll'];
// Whole-word match so a compound name (e.g. "Notebook", "Bookend") isn't
// falsely excluded by a substring hit. Recipe pieces are still filtered out
// independently below via pieceNames.
const EXCLUDE_WORD_RE = new RegExp(`\\b(${EXCLUDE_WORDS.join('|')})\\b`);
const EXCLUDE_NAMES = new Set(['Soul Ore', 'Spirit Ore', 'Adena']);

function isResourceItem(name) {
  if (EXCLUDE_WORD_RE.test(name)) return false;
  if (EXCLUDE_NAMES.has(name)) return false;
  if (pieceNames.has(name)) return false;
  return true;
}

const resources = new Map(); // itemId -> { name, itemId, recipeTypes }
const pieceByRecipe = new Map(); // recipeName -> first required item name

for (const r of recipes) {
  const first = r.requiredItems?.[0];
  if (first) {
    pieceByRecipe.set(r.recipeName, first);
  }

  for (const ri of r.requiredItems || []) {
    if (!isResourceItem(ri.name)) continue;

    if (!resources.has(ri.itemId)) {
      resources.set(ri.itemId, { name: ri.name, itemId: ri.itemId, recipeTypes: new Set() });
    }
    resources.get(ri.itemId).recipeTypes.add(r.recipeType);
  }
}

// --- Build NPC lookup: item_wiki_id -> [{ npc, dropChance, spoilChance }] ---

const npcDropMap = new Map(); // item_wiki_id -> entries[]
const npcSpoilMap = new Map();

for (const npc of npcs) {
  for (const group of npc.drops?.groups || []) {
    for (const item of group.items || []) {
      if (!npcDropMap.has(item.item_wiki_id)) {
        npcDropMap.set(item.item_wiki_id, []);
      }
      npcDropMap.get(item.item_wiki_id).push({
        npc,
        dropChance: item.drop_chance,
        groupChance: group.group_chance,
      });
    }
  }
  for (const spoil of npc.spoils || []) {
    if (!npcSpoilMap.has(spoil.item_wiki_id)) {
      npcSpoilMap.set(spoil.item_wiki_id, []);
    }
    npcSpoilMap.get(spoil.item_wiki_id).push({
      npc,
      spoilChance: spoil.spoil_chance,
    });
  }
}

// --- Build locations data ---

const pieceMap = {};

for (const [, resource] of resources) {
  const itemId = resource.itemId;
  const drops = npcDropMap.get(itemId) || [];
  const spoils = npcSpoilMap.get(itemId) || [];

  const npcEntries = new Map(); // npcId -> { dropChance, spoilChance, npc }

  for (const d of drops) {
    const npcId = d.npc.npc_wiki_id;
    if (!npcEntries.has(npcId)) {
      npcEntries.set(npcId, {
        dropChance: 0,
        spoilChance: 0,
        npc: d.npc,
      });
    }
    const entry = npcEntries.get(npcId);
    entry.dropChance += (d.groupChance * d.dropChance) / 100;
  }

  for (const s of spoils) {
    const npcId = s.npc.npc_wiki_id;
    if (!npcEntries.has(npcId)) {
      npcEntries.set(npcId, {
        dropChance: 0,
        spoilChance: 0,
        npc: s.npc,
      });
    }
    npcEntries.get(npcId).spoilChance += s.spoilChance;
  }

  for (const [, entry] of npcEntries) {
    const npc = entry.npc;
    for (const loc of npc.locations || []) {
      const ruName = loc.location_name_rus || loc.location_name || '';
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
          location_types: types.length > 0 ? types : locData?.location_types || [],
          avg_level: 0,
          has_spoil: false,
          has_boss: false,
          items: {},
          monsterLevels: [],
        };
      }

      const locEntry = pieceMap[enName];
      const itemKey = resource.name;

      if (!locEntry.items[itemKey]) {
        const slug = resource.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        locEntry.items[itemKey] = {
          item_name: resource.name,
          item_url: `https://masterwork.wiki/lu4/item/${itemId}-${slug}`,
          item_type: 'resource',
          classes: [],
          monsters: {},
        };
      }

      const itemEntry = locEntry.items[itemKey];
      const monKey = `${npc.name}|${npc.level}`;

      if (!itemEntry.monsters[monKey]) {
        itemEntry.monsters[monKey] = {
          monster_name: npc.name,
          monster_url: npc.url || '',
          monster_lvl: npc.level || 0,
          drop_chance: Math.round(entry.dropChance * 10000) / 10000,
          spoil_chance: Math.round(entry.spoilChance * 10000) / 10000,
          is_boss: npc.type === 'Bosses',
        };
        if (entry.spoilChance > 0) locEntry.has_spoil = true;
        if (npc.type === 'Bosses') locEntry.has_boss = true;
        if (npc.level && !locEntry.monsterLevels.includes(npc.level)) {
          locEntry.monsterLevels.push(npc.level);
        }
      }
    }
  }
}

// --- Build output ---

const result = [];
for (const key of Object.keys(pieceMap).sort()) {
  const entry = pieceMap[key];

  if (entry.monsterLevels.length > 0) {
    entry.avg_level = +(entry.monsterLevels.reduce((a, b) => a + b, 0) / entry.monsterLevels.length).toFixed(1);
  }
  delete entry.monsterLevels;

  entry.items = Object.values(entry.items)
    .map((item) => ({
      ...item,
      monsters: Object.values(item.monsters),
    }))
    .sort((a, b) => a.item_name.localeCompare(b.item_name));

  if (entry.items.length > 0) {
    result.push(entry);
  }
}

const outPath = resolve(root, 'src/data/LOCATIONS_RESOURCES.json');
writeFileSync(outPath, JSON.stringify(result));

let totalItems = 0;
let totalResources = new Set();
let unknownCount = 0;
const byCity = {};
for (const loc of result) {
  totalItems += loc.items.length;
  for (const item of loc.items) totalResources.add(item.item_name);
  if (loc.main_location_name === 'Unknown') unknownCount++;
  byCity[loc.main_location_name] = (byCity[loc.main_location_name] || 0) + 1;
}
console.log(`Written ${result.length} locations with ${totalItems} items (${totalResources.size} unique resources) to ${outPath}`);
console.log(`Unknown cities: ${unknownCount}/${result.length}`);
