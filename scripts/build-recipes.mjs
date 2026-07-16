import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function readJSON(relPath) {
  return JSON.parse(readFileSync(resolve(ROOT, relPath), 'utf-8'));
}

const recipesRaw = readJSON('tmp/recipe_json.json');
const items = readJSON('tmp/items.json');
const npcs = readJSON('tmp/npc_json_with_subtypes.json');

const itemMap = {};
items.forEach(item => { itemMap[item.item_wiki_id] = item; });

const RELEVANT_TYPES = ['Weapon', 'Armor', 'Accessory', 'Etc'];
const DISPLAY_TYPES = ['Weapon', 'Armor', 'Accessory', 'Soulshot', 'Elixir', 'Other'];
const GRADE_ORDER = ['NG', 'D', 'C', 'B', 'A'];
const GRADE_SET = new Set(GRADE_ORDER);
const ETC_ONLY_GRADE = new Set(['NG', 'D', 'C', 'B', 'A']);

function isRelevantNpc(npc) {
  return (npc.type === 'Monsters' || npc.type === 'Bosses') && !npc.is_quest_moster;
}

const relevantNpcs = npcs.filter(isRelevantNpc);

const dropByRecipe = {};
const spoilByRecipe = {};

relevantNpcs.forEach(npc => {
  if (npc.drops && npc.drops.groups) {
    npc.drops.groups.forEach(group => {
      group.items.forEach(drop => {
        if (!dropByRecipe[drop.item_wiki_id]) dropByRecipe[drop.item_wiki_id] = [];
        dropByRecipe[drop.item_wiki_id].push({
          npcId: npc.npc_wiki_id,
          name: npc.name,
          url: npc.url,
          level: npc.level,
          respawn: npc.respawn,
          type: npc.type,
          subtype: npc.subtype,
          locations: npc.locations || [],
          dropChance: drop.drop_chance,
          groupChance: group.group_chance,
        });
      });
    });
  }

  if (npc.spoils && Array.isArray(npc.spoils)) {
    npc.spoils.forEach(spoil => {
      if (!spoilByRecipe[spoil.item_wiki_id]) spoilByRecipe[spoil.item_wiki_id] = [];
      spoilByRecipe[spoil.item_wiki_id].push({
        npcId: npc.npc_wiki_id,
        name: npc.name,
        url: npc.url,
        level: npc.level,
        respawn: npc.respawn,
        type: npc.type,
        subtype: npc.subtype,
        locations: npc.locations || [],
        spoilChance: spoil.spoil_chance,
      });
    });
  }
});

const NPC_MAP = {};
relevantNpcs.forEach(npc => {
  NPC_MAP[npc.npc_wiki_id] = npc;
});

function buildMonsters(recipeId) {
  const drops = dropByRecipe[recipeId] || [];
  const spoils = spoilByRecipe[recipeId] || [];

  const npcMap = {};

  drops.forEach(d => {
    const key = d.npcId;
    if (!npcMap[key]) {
      npcMap[key] = {
        monster_name: d.name,
        monster_url: d.url,
        monster_lvl: d.level,
        monster_respawn: d.respawn,
        monster_x: null,
        monster_type: d.type === 'Bosses' ? 'Boss' : d.type,
        locations: (d.locations || []).map(l => ({
          location_name: l.location_name_rus || l.location_name || '',
          location_type: null,
          main_location_name: '',
        })),
        drop_chance: 0,
        spoil_chance: 0,
      };
    }
    npcMap[key].drop_chance = d.dropChance;
  });

  spoils.forEach(s => {
    const key = s.npcId;
    if (!npcMap[key]) {
      npcMap[key] = {
        monster_name: s.name,
        monster_url: s.url,
        monster_lvl: s.level,
        monster_respawn: s.respawn,
        monster_x: null,
        monster_type: s.type === 'Bosses' ? 'Boss' : s.type,
        locations: (s.locations || []).map(l => ({
          location_name: l.location_name_rus || l.location_name || '',
          location_type: null,
          main_location_name: '',
        })),
        drop_chance: 0,
        spoil_chance: 0,
      };
    }
    npcMap[key].spoil_chance = s.spoilChance;
  });

  return Object.values(npcMap).sort((a, b) => {
    if (a.monster_type !== b.monster_type) {
      if (a.monster_type === 'Boss') return -1;
      if (b.monster_type === 'Boss') return 1;
    }
    return a.monster_name.localeCompare(b.monster_name);
  });
}

const recipes = [];
const recipesNoDrop = [];

recipesRaw.forEach(recipe => {
  if (!RELEVANT_TYPES.includes(recipe.recipe_type)) return;

  if (!recipe.craft_result || recipe.craft_result.length === 0) return;
  const resultItem = itemMap[recipe.craft_result[0].item_wiki_id];
  if (!resultItem) return;

  if (resultItem.is_deprecated) return;

  if (recipe.recipe_type === 'Etc') {
    if (!ETC_ONLY_GRADE.has(resultItem.grade)) return;
  } else {
    if (!GRADE_SET.has(resultItem.grade)) return;
  }

  const recipeBookItem = itemMap[recipe.recipe_wiki_id];
  const recipeName = recipeBookItem ? recipeBookItem.name : resultItem.name || `Recipe #${recipe.recipe_wiki_id}`;

  let displayType = recipe.recipe_type;
  if (displayType === 'Etc') {
    const nameLower = resultItem.name ? resultItem.name.toLowerCase() : '';
    if (/soulshot|spiritshot|shot/.test(nameLower) && !/arrow/.test(nameLower)) {
      displayType = 'Soulshot';
    } else if (resultItem.item_subtype === 'Elixir') {
      displayType = 'Elixir';
    } else if (resultItem.item_subtype === 'Material' && !/fish|oil/.test(nameLower)) {
      displayType = 'Material';
    } else {
      displayType = 'Other';
    }
  }

  const monsters = buildMonsters(recipe.recipe_wiki_id);

  function buildComponentTree(comp) {
    const item = itemMap[comp.item_wiki_id];
    return {
      itemId: comp.item_wiki_id,
      name: item ? item.name : `Item #${comp.item_wiki_id}`,
      amount: comp.amount,
      isComposite: comp.components && comp.components.length > 0,
      children: comp.components && comp.components.length > 0
        ? comp.components.map(buildComponentTree)
        : [],
    };
  }

  const rawRequired = (recipe.required_items || []).filter(ri => ri.item_wiki_id !== recipe.recipe_wiki_id);

  const requiredItems = rawRequired.map(buildComponentTree);

  const mainPieceMonsters = rawRequired.length > 0
    ? buildMonsters(rawRequired[0].item_wiki_id)
    : [];

  if (displayType === 'Soulshot' && resultItem.grade === 'NG') return;

  let otherCategory = null;
  if (displayType === 'Other') {
    const nameLower = resultItem.name ? resultItem.name.toLowerCase() : '';
    const sub = resultItem.item_subtype;
    if (sub === 'Arrow') {
      otherCategory = 'arrow';
    } else if (sub === 'Dyes') {
      otherCategory = 'dye';
    } else if (sub === 'Material') {
      if (/fish|oil/.test(nameLower) && !/cokes|varnish|steel|mithril|crystal|gemstone|suede|cord|hardener|alloy|mold|holder|anvil/.test(nameLower)) {
        otherCategory = 'fishing';
      } else {
        otherCategory = 'material';
      }
    } else {
      otherCategory = 'other';
    }
  }

  const entry = {
    recipeId: recipe.recipe_wiki_id,
    recipeName,
    recipeUrl: recipe.url,
    resultName: resultItem.name || 'Unknown',
    resultUrl: `https://masterwork.wiki/lu4/item/${recipe.craft_result[0].item_wiki_id}`,
    resultDescription: resultItem.description || null,
    resultWeight: resultItem.weight || null,
    resultPrice: resultItem.sell_price || null,
    resultParameter: resultItem.item_parameter || null,
    resultCanDrop: resultItem.can_drop ?? null,
    resultCanTrade: resultItem.can_trade ?? null,
    resultCanEnchant: resultItem.can_enchant ?? null,
    resultCanAttribute: resultItem.can_attribute ?? null,
    recipeType: displayType,
    resultGrade: resultItem.grade,
    otherCategory,
    resultItemSubtype: resultItem.item_type === 'Armor' && resultItem.item_subtype === 'None' && resultItem.item_parameter
      ? (resultItem.item_parameter === 'Shield' ? 'None' : resultItem.item_parameter.replace(/\s+/g, ''))
      : (resultItem.item_subtype || null),
    craftLevel: recipe.craft_skill_lvl,
    manaCost: recipe.mana_cost,
    successRate: Math.round(recipe.success_rate * 100),
    monsters,
    requiredItems,
    mainPieceMonsters,
  };

  if (monsters.length > 0) {
    recipes.push(entry);
  } else {
    recipesNoDrop.push(entry);
  }
});

const TYPE_SORT_ORDER = ['Weapon', 'Armor', 'Accessory', 'Soulshot', 'Material', 'Elixir', 'Other'];

recipes.sort((a, b) => {
  const ta = TYPE_SORT_ORDER.indexOf(a.recipeType);
  const tb = TYPE_SORT_ORDER.indexOf(b.recipeType);
  if (ta !== tb) return ta - tb;
  const ga = GRADE_ORDER.indexOf(a.resultGrade);
  const gb = GRADE_ORDER.indexOf(b.resultGrade);
  if (ga !== gb) return ga - gb;
  return a.resultName.localeCompare(b.resultName);
});

recipesNoDrop.sort((a, b) => {
  const ta = TYPE_SORT_ORDER.indexOf(a.recipeType);
  const tb = TYPE_SORT_ORDER.indexOf(b.recipeType);
  if (ta !== tb) return ta - tb;
  const ga = GRADE_ORDER.indexOf(a.resultGrade);
  const gb = GRADE_ORDER.indexOf(b.resultGrade);
  if (ga !== gb) return ga - gb;
  return a.resultName.localeCompare(b.resultName);
});

writeFileSync(resolve(ROOT, 'src/data/RECIPES.json'), JSON.stringify(recipes, null, 2));
writeFileSync(resolve(ROOT, 'src/data/RECIPES_NODROP.json'), JSON.stringify(recipesNoDrop, null, 2));

console.log(`RECIPES.json: ${recipes.length} entries (with drop/spoil)`);
console.log(`RECIPES_NODROP.json: ${recipesNoDrop.length} entries (without drop/spoil)`);

const typeCounts = {};
recipes.concat(recipesNoDrop).forEach(r => {
  if (!typeCounts[r.recipeType]) typeCounts[r.recipeType] = { total: 0, withDrop: 0, without: 0 };
  typeCounts[r.recipeType].total++;
  if (r.monsters.length > 0) typeCounts[r.recipeType].withDrop++;
  else typeCounts[r.recipeType].without++;
});
console.log('\nBreakdown:');
Object.entries(typeCounts).forEach(([type, counts]) => {
  console.log(`  ${type}: ${counts.total} (${counts.withDrop} with drop, ${counts.without} without)`);
});
