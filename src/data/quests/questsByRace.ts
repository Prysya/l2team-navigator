import type { Quest } from './types';

export const QUESTS_BY_RACE: Record<string, Quest[]> = {
  'Human Mage': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Adena x450' },
    {
      lvl: 2,
      name: 'What Women Want',
      desc: 'EXP и расходники',
      reward: "Выбрать: Exp 3000 + SP 300\n или Adena 500 + Mystic's Earring + Haste Potion",
    },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: 'Exp 2000, SP 200, Ring of Knowledge x2' },
    {
      lvl: 3,
      name: 'Sacrifice to the Sea',
      desc: 'Хороший EXP',
      reward: "Exp 2500, SP 250, Ring of Knowledge, Mystic's Earring",
    },
    {
      lvl: 4,
      name: 'Find Sir Windawood',
      desc: 'Продолжение цепочки',
      reward: 'Exp 1000, SP 100, Haste Potion, Alacrity Potion',
    },
    {
      lvl: 6,
      name: 'The Guard is Busy',
      desc: 'Соски и расходники за первое прохождение',
      reward:
        'Adena x10 за 1 итем (Orc Amulet/Nickel/Werewolf Fang), макс. 10 итемов\n\nБонус первого прохождения: Soulshot NG x2000, Spiritshot NG x1000, Heal Pot x50',
    },
    {
      lvl: 10,
      name: 'Spirit of Mirrors',
      desc: 'Бесплатное оружие для мага',
      reward: 'Воин: Soulshot NG x5000, Heal Pot x150\n\nМаг: Spiritshot NG x2500, Heal Pot x150, Wand of Adept',
    },
  ],
  'Human Fighter': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Adena x450' },
    {
      lvl: 2,
      name: 'What Women Want',
      desc: 'EXP и расходники',
      reward: "Выбрать: Exp 3000 + SP 300\n или Adena 500 + Mystic's Earring + Haste Potion",
    },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: 'Exp 2000, SP 200, Ring of Knowledge x2' },
    {
      lvl: 3,
      name: 'Sacrifice to the Sea',
      desc: 'Хороший EXP',
      reward: "Exp 2500, SP 250, Ring of Knowledge, Mystic's Earring",
    },
    {
      lvl: 4,
      name: 'Find Sir Windawood',
      desc: 'Продолжение цепочки',
      reward: 'Exp 1000, SP 100, Haste Potion, Alacrity Potion',
    },
    {
      lvl: 6,
      name: 'The Guard is Busy',
      desc: 'Соски и расходники за первое прохождение',
      reward:
        'Adena x10 за 1 итем (Orc Amulet/Nickel/Werewolf Fang), макс. 10 итемов\n\nБонус первого прохождения: Soulshot NG x2000, Spiritshot NG x1000, Heal Pot x50',
    },
    {
      lvl: 9,
      name: 'Sword of Solidarity',
      desc: 'Бесплатное оружие для воина',
      reward: 'Воин: Soulshot NG x5000, Heal Pot x150, Sword of Solidarity\n\nМаг: Spiritshot NG x2500, Heal Pot x150',
    },
  ],
  Elf: [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Adena x450' },
    {
      lvl: 2,
      name: 'What Women Want',
      desc: 'Стартовый EXP',
      reward: "Выбрать: Exp 3000 + SP 300\n или Adena 500 + Mystic's Earring + Haste Potion",
    },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: 'Exp 2000, SP 200, Ring of Knowledge x2' },
    {
      lvl: 3,
      name: 'Sacrifice to the Sea',
      desc: 'Хороший EXP',
      reward: "Exp 2500, SP 250, Ring of Knowledge, Mystic's Earring",
    },
    {
      lvl: 3,
      name: 'Fruit of the Mother Tree',
      desc: 'Хороший опыт',
      reward: 'Exp 1500, SP 150, Adena 500, Lesser Healing Potion x5',
    },
    {
      lvl: 3,
      name: "Nerupa's Request",
      desc: 'EXP и расходники',
      reward: 'Exp 1500, SP 150, Lesser Healing Potion x5, Haste Potion',
    },
    {
      lvl: 6,
      name: 'Hunt the Orcs',
      desc: 'Большой бонус первого прохождения',
      reward:
        'Adena x12 за 1 итем (Orc Amulet/Necklace), макс. 10 итемов\n\nБонус первого прохождения: Soulshot NG x3000, Spiritshot NG x1500, Heal Pot x50',
    },
    {
      lvl: 8,
      name: 'Collect Spores',
      desc: 'Доп адена, делать параллельно с Hunt the Orcs',
      reward: 'Adena x35, Spore Sac',
    },
    {
      lvl: 10,
      name: 'Skirmish with the Orcs',
      desc: 'EXP во время кача',
      reward:
        'Воин: Soulshot NG x3500, Heal Pot x150, Red Sunset Sword\n\nМаг: Spiritshot NG x1750, Heal Pot x150, Red Sunset Staff',
    },
    {
      lvl: 12,
      name: 'Sea of Spores Fever',
      desc: 'Очень хороший EXP',
      reward:
        'Воин: Soulshot NG x3500, Heal Pot x150, Sword of Sentinel\n\nМаг: Spiritshot NG x1750, Heal Pot x150, Staff of Sentinel',
    },
  ],
  'Dark Elf': [
    {
      lvl: 21,
      name: 'Dangerous Seduction',
      desc: 'Темная тема',
      reward:
        '100000 Exp, 10000 SP, Soulshot NG x1000, Spiritshot NG x350, Lesser Healing Potion x75, Haste Potion x5, Scroll of Escape x5, Scroll of Resurrection x5, Elixir of HP (D-Grade) x2, Elixir of MP (D-Grade) x2',
      note: 'Только для Dark Elf',
    },
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Adena x450' },
    { lvl: 2, name: 'Mass of Darkness', desc: 'Стартовый опыт', reward: 'Exp 500, SP 100, Adena 250' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: 'Exp 2000, SP 200, Ring of Knowledge x2' },
    {
      lvl: 3,
      name: 'Sacrifice to the Sea',
      desc: 'Хороший EXP',
      reward: "Exp 2500, SP 250, Ring of Knowledge, Mystic's Earring",
    },
    { lvl: 3, name: 'Deliver Supplies', desc: 'Быстрый EXP', reward: 'Exp 1500, SP 150, Adena 500' },
    {
      lvl: 6,
      name: 'Bonds of Slavery',
      desc: 'бонус за первое прохождение (Набить 11 итемов)',
      reward:
        'Adena x12 за 1 итем (Imp Shackles), макс. 10 итемов\n\nБонус первого прохождения: Soulshot NG x3000, Spiritshot NG x1500, Heal Pot x50',
    },
    {
      lvl: 10,
      name: 'Forgotten Truth',
      desc: 'Бесплатное оружие',
      reward:
        "Воин: Soulshot NG x3500, Heal Pot x150, Eldritch Dagger\n\nМаг: Spiritshot NG x1750, Heal Pot x150, Apprentice's Spellbook",
    },
    {
      lvl: 10,
      name: 'Spirit of Craftsman',
      desc: 'Второе бесплатное оружие',
      reward: 'Воин: Soulshot NG x3500, Heal Pot x150, Blood Saber\n\nМаг: Spiritshot NG x1750, Heal Pot x150',
    },
  ],
  'Orc Fighter': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Adena x450' },
    {
      lvl: 2,
      name: "Long Live the Pa'agrio Lord!",
      desc: 'Стартовый EXP',
      reward: 'Exp 4254, SP 335, Club',
    },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: 'Exp 2000, SP 200, Ring of Knowledge x2' },
    {
      lvl: 3,
      name: 'Sacrifice to the Sea',
      desc: 'Хороший EXP',
      reward: "Exp 2500, SP 250, Ring of Knowledge, Mystic's Earring",
    },
    {
      lvl: 6,
      name: 'Invaders of the Holy Land',
      desc: 'Соски и банки за первое прохождение',
      reward: 'Soulshot NG x3000, Spiritshot NG x1500, Lesser Healing Potion x150',
    },
    {
      lvl: 10,
      name: 'Merciless Punishment',
      desc: 'Хороший EXP',
      reward: "Butcher's Sword, Heal Pot x150, Soulshot NG x7000, Spiritshot NG x3500",
    },
    {
      lvl: 15,
      name: 'Totem of the Hestui',
      desc: 'Убить 30 мобов',
      reward: 'Flexible Reward (adena/exp в зависимости от уровня)',
    },
  ],
  'Orc Shaman': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Adena x450' },
    {
      lvl: 2,
      name: "Long Live the Pa'agrio Lord!",
      desc: 'Стартовый EXP',
      reward: 'Exp 4254, SP 335, Club',
    },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: 'Exp 2000, SP 200, Ring of Knowledge x2' },
    {
      lvl: 3,
      name: 'Sacrifice to the Sea',
      desc: 'Хороший EXP',
      reward: "Exp 2500, SP 250, Ring of Knowledge, Mystic's Earring",
    },
    {
      lvl: 6,
      name: 'Invaders of the Holy Land',
      desc: 'Соски и банки за первое прохождение',
      reward: 'Soulshot NG x3000, Spiritshot NG x1500, Lesser Healing Potion x150',
    },
    {
      lvl: 10,
      name: 'Merciless Punishment',
      desc: 'Хороший EXP',
      reward: "Butcher's Sword, Heal Pot x150, Soulshot NG x7000, Spiritshot NG x3500",
    },
    {
      lvl: 15,
      name: 'Totem of the Hestui',
      desc: 'Убить 30 мобов',
      reward: 'Flexible Reward (adena/exp в зависимости от уровня)',
      note: 'Актуально только если делаешь на работе полуафк.',
    },
  ],
  Dwarf: [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Adena x450' },
    { lvl: 2, name: "Miner's Favor", desc: 'Стартовый опыт', reward: 'Exp 1500, SP 150, Adena 700' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: 'Exp 2000, SP 200, Ring of Knowledge x2' },
    {
      lvl: 3,
      name: 'Sacrifice to the Sea',
      desc: 'Хороший EXP',
      reward: "Exp 2500, SP 250, Ring of Knowledge, Mystic's Earring",
    },
    {
      lvl: 6,
      name: 'The Hidden Veins',
      desc: 'Соски и расходники (набить 11 итемов)',
      reward:
        'Adena x5 за 1 итем (Chrysolite Ore/Hidden Ore Map), макс. 10 итемов\n\nБонус первого прохождения: Soulshot NG x3000, Spiritshot NG x1500, Heal Pot x150',
    },
    {
      lvl: 10,
      name: 'Jumble, Tumble, Diamond Fuss',
      desc: 'Адена и материалы',
      reward:
        'Воин: Soulshot NG x7000, Heal Pot x150, Silversmith Hammer\n\nМаг: Spiritshot NG x3500, Heal Pot x150, Wand of Adept',
    },
  ],
  'Dwarf Mage': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Adena x450' },
    { lvl: 2, name: "Miner's Favor", desc: 'Стартовый опыт', reward: 'Exp 1500, SP 150, Adena 700' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: 'Exp 2000, SP 200, Ring of Knowledge x2' },
    {
      lvl: 3,
      name: 'Sacrifice to the Sea',
      desc: 'Хороший EXP',
      reward: "Exp 2500, SP 250, Ring of Knowledge, Mystic's Earring",
    },
    {
      lvl: 6,
      name: 'The Hidden Veins',
      desc: 'Соски и расходники (набить 11 итемов)',
      reward:
        'Adena x5 за 1 итем (Chrysolite Ore/Hidden Ore Map), макс. 10 итемов\n\nБонус первого прохождения: Soulshot NG x3000, Spiritshot NG x1500, Heal Pot x150',
    },
    {
      lvl: 10,
      name: 'Jumble, Tumble, Diamond Fuss',
      desc: 'Адена и материалы',
      reward:
        'Воин: Soulshot NG x7000, Heal Pot x150, Silversmith Hammer\n\nМаг: Spiritshot NG x3500, Heal Pot x150, Wand of Adept',
    },
  ],
};
