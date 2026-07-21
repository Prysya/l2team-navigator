export interface Monster {
  monster_name: string;
  monster_url: string | null;
  monster_lvl: number;
  monster_respawn: string | null;
  monster_x: string | null;
  monster_type: string;
  locations: MonsterLocation[];
  drop_chance: number;
  spoil_chance: number;
}

export interface MonsterLocation {
  location_name: string;
  location_type: string[] | string | null;
  main_location_name: string;
}

export interface ResourceMaterial {
  name: string;
  url: string | null;
  monster: Monster[];
}

export interface Resource {
  number: number;
  recipe_name: string;
  smart_name?: string;
  recipe_url: string | null;
  group: number;
  monster: Monster[];
  material?: ResourceMaterial;
}

export interface SpellbookClass {
  race: string;
  class_name: string;
  class_url: string;
  lvl: number;
}

export interface SpellbookMonster {
  monster_name: string;
  monster_url: string;
  monster_lvl: number;
  monster_respawn: string | null;
  monster_x: string | null;
  monster_type: string;
  locations: MonsterLocation[];
  drop_chance: number;
  spoil_chance: number;
}

export interface Spellbook {
  item_wiki_id: number;
  spellbook_name: string;
  smart_name?: string;
  spellbook_url: string;
  skill_name: string;
  classes: SpellbookClass[];
  lvl: number;
  monster: SpellbookMonster[];
}

export interface LocationMonster {
  monster_name: string;
  monster_url: string;
  monster_lvl: number;
  drop_chance: number;
  spoil_chance: number;
  is_boss: boolean;
}

export interface LocationItem {
  item_name: string;
  item_url: string | null;
  item_type: 'recipe' | 'spellbook' | 'piece' | 'resource';
  classes: { race: string; class_name: string; class_url: string; lvl: number }[];
  monsters: LocationMonster[];
}

export interface LocationEntry {
  location_name: string;
  main_location_name: string;
  location_types: string[];
  avg_level: number;
  has_spoil: boolean;
  has_boss: boolean;
  items: LocationItem[];
}

export interface CommentData {
  mainLoc: string;
  method: string;
  methodClass: string;
  partySize: string;
  partySizeClass: string;
}

export interface BossStats {
  hp: string | null;
  mp: string | null;
  pAtk: string | null;
  mAtk: string | null;
  pDef: string | null;
  mDef: string | null;
  exp: string | null;
  sp: string | null;
  atkAttr?: string | null;
  defAttr?: string | null;
}

export interface DropItem {
  name: string;
  grade: string;
  amount: string;
  chance: number;
}

export interface DropGroup {
  groupChance: number;
  items: DropItem[];
}

export interface RaidBoss {
  name: string;
  level: number;
  respawn: string;
  location: string;
  stats: BossStats | null;
  drops: DropGroup[] | null;
  image?: string;
  coords?: { x: number; y: number };
  /** Official wiki NPC id (masterwork.wiki/lu4/npc/{npcId}-{slug}). */
  npcId?: number;
  /** Url slug for the wiki NPC page, taken from the wiki itself. */
  slug?: string;
}

export interface ChanceInfo {
  text: string;
  cls: string;
}

export interface SkillStat {
  label: string;
  text: string;
}

export interface SkillLevel {
  skillLevel: number;
  classLevel: number;
  changes: string[];
}

export interface ClassSkill {
  id: string;
  name: string;
  slug: string;
  type: string;
  subtype: string;
  firstClassLevel: number;
  imageUrl: string;
  stats: SkillStat[];
  levels: SkillLevel[];
  maxLevel: number;
}

export interface ClassSkillsData {
  id: string;
  slug: string;
  race: string;
  className: string;
  skills: ClassSkill[];
}

export type RecipeType = 'Weapon' | 'Armor' | 'Accessory' | 'Soulshot' | 'Material' | 'Elixir' | 'Other';
export type RecipeGrade = 'NG' | 'D' | 'C' | 'B' | 'A';

export interface RecipeComponent {
  itemId: number;
  name: string;
  amount: number;
  isComposite: boolean;
  children: RecipeComponent[];
}

export interface RecipeEntry {
  recipeId: number;
  recipeName: string;
  recipeUrl: string;
  resultName: string;
  resultUrl: string;
  resultDescription: string | null;
  resultWeight: number | null;
  resultPrice: number | null;
  resultParameter: string | null;
  resultCanDrop: boolean | null;
  resultCanTrade: boolean | null;
  resultCanEnchant: boolean | null;
  resultCanAttribute: boolean | null;
  recipeType: RecipeType;
  resultGrade: RecipeGrade;
  otherCategory: string | null;
  resultItemSubtype: string | null;
  craftLevel: number;
  manaCost: number;
  successRate: number;
  monsters: Monster[];
  requiredItems: RecipeComponent[];
  mainPieceMonsters: Monster[];
}
