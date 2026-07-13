export const GROUP_NAMES: Record<number, string> = {
  1: 'Soulshots & Spiritshots',
  2: 'Armor Materials',
  3: 'Other Recipes',
};

export const TAB_NAMES = [
  { key: 'recipes', icon: '\uD83D\uDCDC', label: '\u0420\u0435\u0446\u0435\u043F\u0442\u044B' },
  { key: 'spellbooks', icon: '\uD83D\uDCDA', label: '\u041A\u043D\u0438\u0433\u0438 \u0437\u0430\u043A\u043B\u0438\u043D\u0430\u043D\u0438\u0439' },
  { key: 'locations', icon: '\uD83D\uDDFA\uFE0F', label: '\u041B\u043E\u043A\u0430\u0446\u0438\u0438' },
  { key: 'skills', icon: '\uD83C\uDFCA', label: '\u0421\u043A\u0438\u043B\u043B\u044B' },
  { key: 'raidboss', icon: '\uD83D\uDC79', label: '\u0420\u0435\u0439\u0434-\u0431\u043E\u0441\u0441\u044B' },
  { key: 'calculator', icon: '\uD83D\uDCC8', label: '\u041F\u0440\u043E\u043A\u0430\u0447\u043A\u0430' },
  { key: 'quests', icon: '\uD83D\uDCCB', label: '\u041A\u0432\u0435\u0441\u0442\u044B' },
] as const;
