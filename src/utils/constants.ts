export const GROUP_NAMES: Record<number, string> = {
  1: 'Soulshots & Spiritshots',
  2: 'Armor Materials',
  3: 'Other Recipes',
};

export const TAB_NAMES = [
  { key: 'recipes', label: 'Рецепты' },
  { key: 'spellbooks', label: 'Книги заклинаний' },
  { key: 'locations', label: 'Локации' },
  { key: 'skills', label: 'Скиллы' },
  { key: 'raidboss', label: 'Рейд-боссы' },
  { key: 'calculator', label: 'Прокачка' },
  { key: 'quests', label: 'Квесты' },
] as const;

export const TAB_ACCENT: Record<string, string> = {
  recipes: 'var(--color-accent-green)',
  spellbooks: 'var(--color-accent-purple)',
  locations: 'var(--color-accent-amber)',
  skills: 'var(--color-primary)',
  raidboss: 'var(--color-danger)',
  calculator: 'var(--color-accent-cyan)',
  quests: 'var(--color-accent-orange)',
};
