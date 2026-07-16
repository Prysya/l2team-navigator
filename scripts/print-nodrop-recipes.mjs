import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const data = JSON.parse(readFileSync(resolve(ROOT, 'data/RECIPES_NODROP.json'), 'utf-8'));

const TYPE_LABELS = {
  Weapon: 'Оружие',
  Armor: 'Броня',
  Accessory: 'Аксессуары',
  Soulshot: 'Soulshots',
  Material: 'Ресурсы',
  Elixir: 'Эликсиры',
  Other: 'Прочее',
};

const SUBTYPE_LABELS = {
  Sword: 'Меч',
  Blunt: 'Дробящее',
  Dagger: 'Кинжал',
  Bow: 'Лук',
  Polearm: 'Древковое',
  Fist: 'Кастет',
  'Misc.': 'Прочее',
  Heavy: 'Тяжелая броня',
  Light: 'Легкая броня',
  Robe: 'Роба',
  Helmet: 'Шлем',
  Gloves: 'Перчатки',
  Boots: 'Сапоги',
  None: 'Щит',
  HairAccessory: 'Аксессуар',
  Earring: 'Серьга',
  Ring: 'Кольцо',
  Necklace: 'Ожерелье',
};

const OTHER_LABELS = {
  material: 'Ресурс',
  dye: 'Краска',
  arrow: 'Стрелы',
  fishing: 'Рыбалка',
  other: 'Прочее',
};

const grouped = {};
for (const r of data) {
  const type = r.recipeType;
  if (!grouped[type]) grouped[type] = [];
  grouped[type].push(r);
}

const TYPE_ORDER = ['Weapon', 'Armor', 'Accessory', 'Soulshot', 'Material', 'Elixir', 'Other'];

let total = 0;

for (const t of TYPE_ORDER) {
  const items = grouped[t] || [];
  if (items.length === 0) continue;

  const typeLabel = TYPE_LABELS[t] || t;
  console.log(`\n【${typeLabel}】— ${items.length}\n`);

  for (const r of items) {
    const subtype = r.resultItemSubtype
      ? SUBTYPE_LABELS[r.resultItemSubtype] || r.resultItemSubtype
      : '';
    const category = r.otherCategory
      ? `[${OTHER_LABELS[r.otherCategory] || r.otherCategory}]`
      : '';
    const sub = subtype ? ` · ${subtype}` : category ? ` ${category}` : '';
    console.log(`  ─ ${r.resultName} (${r.resultGrade})${sub}`);
  }

  total += items.length;
}

console.log(`\n${'─'.repeat(55)}`);
console.log(`Всего: ${total} рецептов без дропа/спойла`);
