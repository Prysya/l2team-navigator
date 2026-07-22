import ITEM_ICONS_BY_ID from '@data/ITEM_ICONS_BY_ID.json';
import ITEM_WIKI from '@data/ITEM_WIKI.json';

/** name (lowercased) -> wiki id / slug / icon filename, scraped from boss drop tables. */
export interface ItemWikiInfo {
  id: number;
  slug: string;
  icon: string;
}

const CATALOG = ITEM_WIKI as Record<string, ItemWikiInfo>;
/** wiki item id -> icon filename (spellbooks + resources). */
const BY_ID = ITEM_ICONS_BY_ID as Record<string, string>;

export const WIKI_ITEM_BASE = 'https://masterwork.wiki/lu4';
/** Icons are hotlinked from the official wiki (static asset, not Cloudflare-gated). */
export const WIKI_ICON_BASE = 'https://masterwork.wiki/i64';

/** Full hotlinked URL for a bare wiki icon filename (e.g. "etc_recipe_white_i00.png"). */
export function wikiIconUrl(icon: string | null | undefined): string | null {
  return icon ? `${WIKI_ICON_BASE}/${icon}` : null;
}

export function getItemInfo(name: string): ItemWikiInfo | undefined {
  return CATALOG[name.trim().toLowerCase()];
}

/** Hotlinked icon URL for an item, or null when the icon is unknown. */
export function itemIconUrl(name: string): string | null {
  const info = getItemInfo(name);
  return info ? `${WIKI_ICON_BASE}/${info.icon}` : null;
}

/** Hotlinked icon URL for an item by its wiki id, or null when unknown. */
export function itemIconUrlById(id: number | null | undefined): string | null {
  if (id == null) return null;
  return wikiIconUrl(BY_ID[id]);
}

/**
 * Direct wiki item page when we know the id, otherwise the wiki item search.
 * (search_type=0 = items)
 */
export function itemWikiUrl(name: string): string {
  const info = getItemInfo(name);
  if (info) return `${WIKI_ITEM_BASE}/item/${info.id}-${info.slug}`;
  return `${WIKI_ITEM_BASE}/search/result?Search%5Bquery%5D=${encodeURIComponent(name)}&Search%5Bsearch_type%5D=0`;
}
