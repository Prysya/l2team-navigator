export const GROUP_NAMES: Record<number, string> = {
  1: '\uD83D\uDCE6 Soulshots & Spiritshots',
  2: '\uD83D\uDEE1\uFE0F Armor Materials',
  3: '\u2699\uFE0F Other Recipes',
};

export const TAB_NAMES = [
  { key: 'recipes', label: '\uD83D\uDCDC \u0420\u0435\u0446\u0435\u043F\u0442\u044B', short: '\uD83D\uDCDC' },
  { key: 'spellbooks', label: '\uD83D\uDCDA \u041A\u043D\u0438\u0433\u0438 \u0437\u0430\u043A\u043B\u0438\u043D\u0430\u043D\u0438\u0439', short: '\uD83D\uDCDA' },
  { key: 'locations', label: '\uD83D\uDDFA\uFE0F \u041B\u043E\u043A\u0430\u0446\u0438\u0438', short: '\uD83D\uDDFA\uFE0F' },
  { key: 'skills', label: '\uD83C\uDFCA \u0421\u043A\u0438\u043B\u043B\u044B', short: '\uD83C\uDFCA' },
  { key: 'raidboss', label: '\uD83D\uDC79 \u0420\u0435\u0439\u0434-\u0431\u043E\u0441\u0441\u044B', short: '\uD83D\uDC79' },
] as const;
