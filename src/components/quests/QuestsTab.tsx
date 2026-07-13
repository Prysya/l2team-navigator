import { useMemo, useState, useCallback, Fragment } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import CustomSelect from '../../components/shared/CustomSelect';
import WorldMap from '../../components/shared/WorldMap';
import styles from './QuestsTab.module.scss';

type RewardTag = 'weapon' | 'soulshot' | 'both' | 'adena' | 'exp' | 'other';

interface Quest {
  lvl: number;
  name: string;
  desc: string;
  reward: string;
  note?: string;
  questId?: number;
  npc?: string;
  npcId?: number;
  location?: string;
  startLvl?: number;
  endLvl?: number;
  steps?: string[];
  rewardTag?: RewardTag;
}

function detectRewardTag(reward: string): RewardTag {
  const r = reward.toLowerCase();
  const hasWeapon = /sword|staff|wand|blade|saber|hammer|club|dagger|knife|shield|spellbook|weapon|меч|молот|булава|dagger/i.test(r);
  const hasSoulshot = /soulshot|spiritshot|соск/i.test(r);
  if (hasWeapon && hasSoulshot) return 'both';
  if (hasWeapon) return 'weapon';
  if (hasSoulshot) return 'soulshot';
  if (/aden|a$/i.test(r) && !/exp/i.test(r)) return 'adena';
  if (/exp|xp/i.test(r)) return 'exp';
  return 'other';
}

const QUEST_STEPS: Record<string, string[]> = {
  'Letters of Love': ['1. Поговорите с Darin (центральная площадь Talking Island) — он попросит передать письмо Roxxy.', '2. Найдите Roxxy у храма и передайте письмо. Она даст платок для Darin.', '3. Верните платок Darin. Он попросит сходить к Magister Baulro за любовным зельем.', '4. Baulro в храме даст «зелье» (обычную воду). Отнесите Darin — квест завершён.'],
  'Deliver Goods': ['1. Поговорите с Arnold Guard на Talking Island (юго-восточные ворота).', '2. Доставьте товары и вернитесь к Arnold за наградой.'],
  'Sacrifice to the Sea': ['1. Поговорите с Rockswell Lighthouse Keeper на Talking Island (маяк).', '2. Выполните ритуал для Shilen (соберите куклу и подношения).', '3. Вернитесь к Rockswell за наградой.'],
  'Find Sir Windawood': ['1. Найдите Sir Windawood.'],
  'The Guard is Busy': ['1. Убейте орков и соберите трофеи (Orc Amulet, Orc\'s Necklace, Werewolf\'s Fang).', '2. Бонус за первое прохождение — 800 сосок + адена.'],
  'What Women Want': ['1. Поговорите с Arujien в Elven Village (запад деревни).', '2. Выберите награду: EXP+SP или Mystic\'s Earring + Haste Potion + 500a.', '3. Выполните задание.'],
  'Mass of Darkness': ['1. Поговорите с Undrias Abyssal Celebrant в Dark Elven Village.', '2. Соберите предметы для Mass of Darkness.', '3. Вернитесь к Undrias за наградой.'],
  'Long Live the Pa\'agrio Lord!': ['1. Поговорите с Nakusin Centurion в Orc Village (восточные ворота).', '2. Соберите дары от шести племён.', '3. Вернитесь к Nakusin — получите Club.'],
  'Miner\'s Favor': ['1. Поговорите с Bolter Miner в Dwarven Village (дорога у старта).', '2. Сходите в деревню по поручению.', '3. Вернитесь к Bolter за наградой.'],
  'Sword of Solidarity': ['1. Поговорите с Roien Grand Master на Talking Island (стартовая зона воинов).', '2. Соберите Broken Sword Blade Piece.', '3. Вернитесь к Blacksmith Altran.', '4. Соберите последние части.', '5. Получите Sword of Solidarity.'],
  'Spirit of Mirrors': ['1. Поговорите с Gallint Grand Magister на Talking Island (зона магов).', '2. Найдите убежавших духов.', '3. Вернитесь к Gallint — получите Wand of Adept.'],
  'Skirmish with the Orcs': ['1. Поговорите с Kendell Sentinel в Elven Village (юго-восточные ворота).', '2. Убейте орков — защитите лес.', '3. Вернитесь к Kendell.'],
  'Forgotten Truth': ['1. Поговорите с Thifiell Tetrarch в Dark Elven Village (храм).', '2. Найдите украденные откровения Kaysha.', '3. Вернитесь с переводом откровений.'],
  'Spirit of Craftsman': ['1. Поговорите с Karrod Blacksmith в Dark Elven Village (оружейная лавка).', '2. Соберите ингредиенты для Soul Catcher.', '3. Вернитесь к Harne, затем к Cecktinon.', '4. Получите Blood Saber / Spiritshot.'],
  'Merciless Punishment': ['1. Поговорите с Hatos Urutu Chief в Orc Village (Hall of the Kings).', '2. Остановите заговор Varangka — перехватите письма.', '3. Вернитесь к Hatos — получите Butcher\'s Sword.'],
  'Jumble, Tumble, Diamond Fuss': ['1. Поговорите с Gouph Collector в Dwarven Village (дом на севере).', '2. Найдите Star Diamond!', '3. Помогите Carrier Torocco, затем Brunon.', '4. Получите Silversmith Hammer + расходники.'],
  'Sea of Spores Fever': ['1. Поговорите с Alberius Sentinel Knight в Elven Village (храм).', '2. Соберите Dryad\'s Tears и создайте лекарство.', '3. Доставьте лекарство и вернитесь к Alberius.'],
  'Offspring of Nightmares': ['1. Поговорите с Vlasty Magister в Dark Elven Village (храм).', '2. Узнайте природу Dark Horrors.', '3. Вернитесь к Vlasty за наградой.'],
  'Millennium Love': ['1. Поговорите с Lilith на Talking Island (храм).', '2. Найдите потерянного возлюбленного.', '3. Найдите Dnevnik vozlyublennogo.', '4. Вернитесь к Lilith.'],
  'Cure for Fever Disease': ['1. Поговорите с Elias на Talking Island (центральная площадь).', '2. Соберите Spider\'s Poison Sac.', '3. Создайте лекарство от лихорадки.', '4. Вылечите больных — получите Bone Shield.'],
  'Dwarven Kinship': ['1. Поговорите с Carlon Warehouse Keeper в Dark Elven Village (склад).', '2. Передайте письмо (дважды).', '3. Вернитесь за наградой.'],
  'Deliver Supplies': ['1. Поговорите с Jenna Sentry в Dark Elven Village (восточные ворота).', '2. Доставьте три меча.', '3. Вернитесь к Jenna.'],
  'Bonds of Slavery': ['1. Поговорите с Kristin Sentry в Dark Elven Village (внутренние западные ворота).', '2. Соберите Imp Shackles (11+ шт).', '3. Бонус за первое прохождение — Soulshots + Spiritshots.'],
  'Hunt the Orcs': ['1. Поговорите с Rayen Sentinel в Elven Village (юго-западные ворота).', '2. Охотьтесь на орков Kaboo.', '3. Сдайте трофеи.'],
  'Invaders of the Holy Land': ['1. Поговорите с Varkees Atuba Chief в Orc Village.', '2. Убейте Rakeclaw Imp — соберите Soulstones.', '3. Бонус за первое прохождение — соски + банки.'],
  'The Hidden Veins': ['1. Поговорите с Filaur Gray Pillar в Dwarven Village (House of Elders).', '2. Добывайте Chrysolite и ищите Hidden Ore Map.', '3. Бонус за первое прохождение — Soulshots + Healing Potions.'],
  'Collect Spores': ['1. Поговорите с Herbiel Grocer в Elven Village (лавка).', '2. Собирайте Spore Sac (по 35a).'],
  'Totem of the Hestui': ['1. Поговорите с Tanapi Seer в Orc Village (Hall of the Kings).', '2. Очистите Grizzly (убейте 30 мобов).', '3. Сдайте Kasha Parasite / Crystal — получите расходники.'],
  'Dragon Fangs': ['1. Поговорите с Luis Guard в Gludin (юго-восточные ворота).', '2. Убейте Langk Lizardman — соберите Feather Ornament (100 шт).', '3. Вернитесь к Luis, затем к Magister Iris.', '4. Убейте Langk Lizardman Shaman/Leader — соберите Tooth of Dragon (50 шт).', '5. Верните Tooth of Dragon — рандомная D-шмотка + EXP.'],
  'Red-Eyed Invaders': ['1. Поговорите с Babenco Guard в Gludio (западные ворота).', '2. Убейте монстров — соберите трофеи.', '3. Получите EXP (280k-330k) + SP + адена + рандомные банки.'],
  'Seed of evil': ['1. Поговорите с Biotin High Priest на Talking Island (храм).', '2. Выполните задание.', '3. Получите EXP 50k + 50 банок + шанс на D-свитки заточки.'],
  'Blood Fiend': ['1. Поговорите с Creamees Accessory Merchant в Elven Village (лавка).', '2. Выполните задание.', '3. Получите EXP 100k + банки + свитки + соски.'],
  'Fruit of the Mother Tree': ['1. Поговорите с Andellia в Elven Village (центральная площадь).', '2. Соберите Fruit of the Mother Tree.', '3. Вернитесь к Andellia.'],
  'Nerupa\'s Request': ['1. Поговорите с Nerupa в Elven Village (стартовая зона).', '2. Доставьте товары, соберите Nightshade Leaf.', '3. Вернитесь к Nerupa.'],
  // 1st profession quests - basic structure (see mw2.wiki for full details)
  'Path of the Warrior': ['1. NPC: Auron (Gludin Warriors Guild).', '2. Teleport to Gludio.', '3. Teleport to Ruins of Agony, kill Skeleton Tracker (10x Rusted Bronze Sword).', '4. Return to Simplon (Armor Merchant).', '5. Teleport to Gludin Village.', '6. Teleport to Windmill Hill, kill Venomous Spider (20x legs).', '7. Return to Auron.'],
  'Path of the Human Knight': ['1. NPC: Sir Klaus Vasper (Gludin Warriors Guild).', '2. Head to western gate of Gludin.', '3. Head to Gludin Temple.', '4. Teleport to Windmill Hill.', '5. Teleport to Gludin Village.', '6. Head to Gludin Temple.', '7. Teleport to Gludio, head east then north.', '8. Return to Bathis Captain.', '9. Teleport to Gludin Village. For prof change → Ramos (Grand Master).'],
  'Path of the Rogue': ['1. NPC: Bezique (western gate of Gludin).', '2. Head to northern main square of Gludin.', '3. Teleport to Gludio, then Ruins of Agony.', '4. Return to Neti.', '5. Teleport to Gludin Village.', '6. Teleport to Abandoned Camp.', '7. Return to Bezique. For prof change → Ramos (Grand Master).'],
  'Path of the Human Wizard': ['1. NPC: Parina (Temple of Gludin).', '2. Teleport to Gludio, then Ruins of Despair.', '3. Head northwest to The Ruined Bend.', '4. Return to Flame Salamander.', '5. Teleport to Gludio, then Ant Nest.', '6. Head south to western Wasteland.', '7. Return to Wind Sylph.', '8. Teleport to Gludio, then Ruins of Agony.', '9. Head east to the lake house.', '10. Return to Water Undine.', '11. Teleport to Gludio, then Ruins of Agony.', '12. Head northwest.', '13. Return to Earth Snake Wise.', '14. Teleport to Gludin. For prof change → Levian (High Priestess).'],
  'Path of the Cleric': ['1. NPC: Zigaunt (Temple of Gludin).', '2. Teleport to Gludio.', '3. Head to Gludio Temple.', '4. Head to western gate of Gludio.', '5. Teleport to Ruins of Agony.', '6. Return to Praga Guard.', '7. Teleport to Gludin Village.', '8. Teleport to Talking Island, then Elven Ruins.', '9. Teleport to Talking Island Village.', '10. Return to Lionel.', '11. Teleport to Gludin. For prof change → Levian (High Priestess).'],
  'Path of the Elven Knight': ['1. NPC: Sorius (Gludio Warriors Guild).', '2. Teleport to Ruins of Agony.', '3. Return to Sorius.', '4. Teleport to Gludin Village.', '5. Teleport to Abandoned Camp.', '6. Return to Kluto (Blacksmith).', '7. Teleport to Gludio. For prof change → Rains (Grand Master).'],
  'Path of the Elven Scout': ['1. NPC: Reisa (Gludio Warriors Guild).', '2. Head to east gate of Gludio.', '3. Teleport to Gludin, then Abandoned Camp.', '4. Return to Moretti (Guard).', '5. Teleport to Elven Village, then Neutral Zone. Kill Ol Mahum Sentry.', '6. Return to Moretti.', '7. Head to Gludio Warriors Guild. For prof change → Rains (Grand Master).'],
  'Path of the Elven Wizard': ['1. NPC: Rosella (western building, Elven Village).', '2. Head to Elven Village Temple, talk to Greenis.', '3. Teleport to Neutral Zone.', '4. Return to Greenis.', '5. Teleport to Elven Fortress.', '6. Teleport to Elven Forest.', '7. Return to Thalia.', '8. Teleport to Elven Fortress, go inside.', '9. Return to Northwind.', '10. For prof change → Raymond (High Priest, Gludio).'],
  'Path of the Elven Oracle': ['1. NPC: Manuel (Temple of Gludio).', '2. Teleport to Gludin Village.', '3. Head north around the harbor to northern lighthouse. Kill monster, get Tamil\'s Necklace.', '4. Talk to Perrin.', '5. Return to Allana.', '6. For prof change → Raymond (High Priest, Gludio).'],
  'Path of the Palus Knight': ['1. NPC: Virgil (Dark Elf Guild, Gludio).', '2. Teleport to Elven Village, then Neutral Zone.', '3. Return to Virgil.', '4. Teleport to Gludin Village.', '5. Teleport to Windmill Hill.', '6. Return to Kalinta (Abyssal Celebrant).', '7. Teleport to Gludio. For prof change → Tobias (Grand Master).'],
  'Path of the Assassin': ['1. NPC: Triskel (Dark Elf Guild entrance, Gludio).', '2. Teleport to Dark Elf Village, then Spider Nest → Altar of Rites.', '3. Teleport to Gludin Village.', '4. Teleport to Elven Village, then Neutral Zone.', '5. Return to Leikan (Guard).', '6. Teleport to Dark Elf Village, then Swampland.', '7. Teleport to Dark Elf Village, then Spider Nest → Altar of Rites.', '8. For prof change → Triskel (Dark Elf Guild).'],
  'Path of the Dark Wizard': ['1. NPC: Varika (Altar of Rites, south Dark Elf lands).', '2. Find Arkenia near the Altar.', '3. Head north to School of Dark Arts, kill Skeleton Hunter.', '4. Return to Annika.', '5. Teleport to Dark Elf Village, then Swampland. Kill Marsh Zombie.', '6. Return to Charkeren.', '7. Teleport to Gludio, then Ruins of Agony.', '8. Teleport to Dark Elf Village, then Spider Nest.', '9. Find Varika near the Altar. For prof change → Tobias (Grand Master).'],
  'Path of the Shillien Oracle': ['1. NPC: Sidra (Dark Elf Guild, Gludio).', '2. Teleport to Gludin Village.', '3. Teleport to Dark Elf Village, then Spider Nest.', '4. Return to Talbot (Magister).', '5. Head to Gludin Temple.', '6. Teleport to Gludio, then Ruins of Despair.', '7. Return to Adonius (Priest).', '8. For prof change → Tobias (Grand Master).'],
  'Path of the Orc Raider': ['1. NPC: Karukia (Hall of Kings, 1st floor, Orc Village).', '2. Teleport to Immortal Plateau — North.', '3. Return to Karukia.', '4. Teleport to Gludin Village.', '5. Teleport to Dark Elf Village, then Spider Nest.', '6. Return to Kasman (Prefect).', '7. For prof change → Osborn (High Prefect, Orc Guild of Gludin).'],
  'Path of the Orc Monk': ['1. NPC: Gantaki Zu Urutu (Orc Village, near Weapon Shop).', '2. Teleport to Frozen Waterfalls. Kill Kasha Bear.', '3. Return to Rosheek.', '4. Kill Kasha Blade Spider.', '5. Return to Rosheek.', '6. Teleport to Cave of Trials.', '7. Return to Rosheek.', '8. Teleport to Orc Village → Gludin → Fellmere → Langk Lizardmen → Windmill Hill → Fellmere.', '9. For prof change → Osborn (High Prefect, Orc Guild of Gludin).'],
  'Path of the Orc Shaman': ['1. NPC: Tataru Zu Hestui (Hall of Kings entrance, Orc Village).', '2. Teleport to Frozen Waterfall.', '3. Teleport to Cave of Trial.', '4. Exit Orc Village south.', '5. Return to Tataru, select Gludin.', '6. Teleport to Gludin Village → Fellmere Harvesting Grounds.', '7. Return to Umos Seer.', '8. Leave city north → Windmill Hill.', '9. Return to Duda-Mara Totem Spirit.', '10. For prof change → Osborn (High Prefect, Orc Guild of Gludin).'],
  'Path of the Scavenger': ['1. NPC: Pippi (north of Dwarven Village).', '2. Dwarven Village Grocery Store → NPC chain until Mion\'s Letter.', '3. Teleport to Western Mining Zone.', '4. Kill Hunter Tarantula.', '5. Return to Toma (Master).', '6. Teleport to Gludin → Giran → Dragon Valley.', '7. Return to Raut (Warehouse Keeper).', '8. For prof change → Moke (Warehouse Chief, Gludin).'],
  'Path of the Artisan': ['1. NPC: Silvera (Dwarven Village Blacksmith Shop).', '2. Teleport to Abandoned Coal Mines.', '3. Return to Silvera.', '4. Teleport to Gludin → Gludio → Windmill Hill.', '5. Return to Pinter (Blacksmith).', '6. For prof change → Tapoy (Head Blacksmith, Gludin).'],
  'Trial of Geomancer': ['1. NPC: Dabrigit Stoneshoulder (left of stairs to Gludin Gatekeeper).', '2. Teleport to Dwarven Village.', '3. Teleport to Eastern Mining Zone.', '4. Return to Gerald (Priest of the Earth).', '5. Teleport to Gludin.', '6. Teleport to Dwarven Village.', '7. Return to Reeya (Blueprint Seller) in Gludin.', '8. Teleport to Talking Island → Dwarven Village → Abandoned Coal Mines.', '9. Return to Altran (Blacksmith).', '10. Teleport to Gludio → Ruins of Despair → Fellmere Harvesting Grounds.', '11. Return to Earth Snake Wise.', '12. For prof change → Sisealine (High Priestess, Gludin Warehouse).'],
};

const NPC_COORDS: Record<number, { x: number; y: number }> = {
  30048: { x: 1202.96, y: 2873.71 }, 30223: { x: 1922.81, y: 1779.49 }, 30130: { x: 1826.08, y: 1563.20 },
  30578: { x: 1412.43, y: 859.11 }, 30554: { x: 2316.47, y: 514.07 }, 30041: { x: 1214.92, y: 2884.54 },
  30312: { x: 1234.02, y: 2859.66 }, 30042: { x: 1213.00, y: 2886.14 }, 30349: { x: 1776.62, y: 1575.46 },
  30362: { x: 1942.57, y: 1787.28 }, 30370: { x: 1940.16, y: 1734.77 }, 30039: { x: 1215.39, y: 2866.82 },
  30221: { x: 1921.88, y: 1790.92 }, 30566: { x: 1415.58, y: 857.87 }, 30357: { x: 1723.19, y: 1603.97 },
  30535: { x: 2335.95, y: 494.05 }, 30150: { x: 1921.62, y: 1784.69 }, 30008: { x: 1276.70, y: 2961.34 },
  30017: { x: 1165.83, y: 2903.22 }, 30218: { x: 1948.90, y: 1793.35 }, 30358: { x: 1740.88, y: 1582.17 },
  30307: { x: 1739.77, y: 1601.29 }, 30568: { x: 1415.55, y: 862.54 }, 30523: { x: 2333.77, y: 465.34 },
  30284: { x: 1938.34, y: 1794.21 }, 30145: { x: 1743.60, y: 1583.53 }, 30368: { x: 1198.83, y: 2884.51 },
  30050: { x: 1205.10, y: 2873.93 }, 30350: { x: 1757.76, y: 1600.88 }, 30571: { x: 1420.89, y: 865.72 },
  30386: { x: 1239.38, y: 2386.04 }, 30336: { x: 1600.88, y: 2216.93 }, 30149: { x: 1921.24, y: 1784.81 },
  30141: { x: 1742.21, y: 1581.82 },
  30497: { x: 1032.06, y: 2757.88 },
  30498: { x: 1217.21, y: 2369.49 },
  30010: { x: 1217.51, y: 2344.92 },
  30417: { x: 1214.25, y: 2351.05 },
  30425: { x: 1208.73, y: 2360.33 },
  30408: { x: 1078.39, y: 2820.51 },
  30337: { x: 1612.54, y: 2201.37 },
  30379: { x: 1199.67, y: 2365.77 },
  30391: { x: 1225.59, y: 2353.38 },
  30022: { x: 1232.23, y: 2353.28 },
  30328: { x: 1602.64, y: 2194.56 },
  30293: { x: 1603.80, y: 2188.67 },
  30421: { x: 1430.14, y: 1952.40 },
  30330: { x: 1609.36, y: 2197.22 },
  30524: { x: 2333.21, y: 466.60 },
  38555: { x: 1221.34, y: 2349.19 },
  30414: { x: 1926.74, y: 1782.69 },
  30424: { x: 1158.47, y: 2373.32 },
  30422: { x: 1203.16, y: 2348.73 },
  30418: { x: 1417.49, y: 1836.82 },
  30375: { x: 1232.12, y: 2354.92 },
  30570: { x: 1420.38, y: 855.13 },
  30587: { x: 1427.89, y: 869.95 },
  30585: { x: 1423.91, y: 853.77 },
  30517: { x: 2336.40, y: 478.90 },
  30527: { x: 2331.25, y: 469.84 },
  20042: { x: 1339.18, y: 2099.44 },
  27031: { x: 1630.21, y: 1911.63 },
  30288: { x: 1603.28, y: 2197.01 },
  20019: { x: 1776.80, y: 1758.69 },
  20047: { x: 1758.14, y: 1935.22 },
  27032: { x: 1161.34, y: 2372.78 },
  20038: { x: 1303.97, y: 1918.54 },
  20043: { x: 1272.29, y: 1921.62 },
  20369: { x: 1793.19, y: 2019.51 },
  27036: { x: 1388.46, y: 1733.28 },
  20015: { x: 1592.28, y: 1681.66 },
  20022: { x: 1915.34, y: 2893.99 },
  20457: { x: 1562.71, y: 2298.31 },
  20320: { x: 1587.87, y: 915.62 },
  20014: { x: 1296.07, y: 2120.45 },
  20017: { x: 1296.93, y: 2416.21 },
  20403: { x: 2483.85, y: 364.49 },
  20508: { x: 2494.92, y: 347.50 },
  20389: { x: 2499.34, y: 516.23 },
  20511: { x: 2568.84, y: 346.95 },
  30327: { x: 1604.07, y: 2194.90 },
  30499: { x: 1211.33, y: 2381.20 },
  30500: { x: 1225.84, y: 2368.00 },
  30501: { x: 1225.49, y: 2368.71 },
  30502: { x: 1225.49, y: 2367.58 },
  30503: { x: 1604.73, y: 2208.15 },
  30504: { x: 1594.18, y: 2206.84 },
  30505: { x: 1607.55, y: 2207.58 },
  30506: { x: 1607.75, y: 2206.88 },
  30507: { x: 1607.75, y: 2208.08 },
  30508: { x: 1792.61, y: 2311.22 },
  30191: { x: 2152.51, y: 1801.02 },
  30690: { x: 2354.98, y: 1941.75 },
  30702: { x: 2344.40, y: 1938.52 },
  30629: { x: 1774.24, y: 2306.34 },
  30461: { x: 1772.81, y: 2305.00 },
  30109: { x: 2163.93, y: 2329.52 },
  30623: { x: 2129.77, y: 1822.44 },
  30473: { x: 2164.91, y: 2340.22 },
  30476: { x: 2125.92, y: 2344.04 },
  30634: { x: 1221.25, y: 2360.21 },
  30514: { x: 2134.55, y: 2317.68 },
  30644: { x: 1792.04, y: 2318.46 },
  30648: { x: 1199.76, y: 2099.45 },
  30510: { x: 1792.56, y: 2311.02 },
  30103: { x: 2150.42, y: 2330.26 },
  30104: { x: 2150.41, y: 2331.02 },
};

const QUEST_DETAILS: Record<string, { npc: string; npcId: number; location: string; startLvl: number; endLvl: number }> = {
  'Letters of Love': { npc: 'Darin', npcId: 30048, location: 'Talking Island, Центральная площадь', startLvl: 2, endLvl: 5 },
  'What Women Want': { npc: 'Arujien', npcId: 30223, location: 'Elven Village, Запад деревни', startLvl: 2, endLvl: 5 },
  'Mass of Darkness': { npc: 'Undrias Abyssal Celebrant', npcId: 30130, location: 'Elven Village, Стартовая зона', startLvl: 2, endLvl: 5 },
  'Long Live the Pa\'agrio Lord!': { npc: 'Nakusin Centurion', npcId: 30578, location: 'Orc Village, Восточные ворота', startLvl: 2, endLvl: 5 },
  'Miner\'s Favor': { npc: 'Bolter Miner', npcId: 30554, location: 'Dwarven Village, Дорога у старта', startLvl: 2, endLvl: 5 },
  'Deliver Goods': { npc: 'Arnold Guard', npcId: 30041, location: 'Talking Island, Юго-восточные ворота', startLvl: 2, endLvl: 7 },
  'Sacrifice to the Sea': { npc: 'Rockswell Lighthouse Keeper', npcId: 30312, location: 'Talking Island, Маяк', startLvl: 2, endLvl: 7 },
  'Find Sir Windawood': { npc: 'Abellos Guard', npcId: 30042, location: 'Talking Island, Юго-восточные ворота', startLvl: 3, endLvl: 6 },
  'Deliver Supplies': { npc: 'Jenna Sentry', npcId: 30349, location: 'Dark Elven Village, Восточные ворота', startLvl: 3, endLvl: 6 },
  'Fruit of the Mother Tree': { npc: 'Andellia', npcId: 30362, location: 'Elven Village, Центральная площадь', startLvl: 3, endLvl: 7 },
  'Nerupa\'s Request': { npc: 'Nerupa', npcId: 30370, location: 'Elven Village, Стартовая зона', startLvl: 3, endLvl: 7 },
  'The Guard is Busy': { npc: 'Gilbert Captain', npcId: 30039, location: 'Talking Island, Северо-восточные ворота', startLvl: 6, endLvl: 16 },
  'Hunt the Orcs': { npc: 'Rayen Sentinel', npcId: 30221, location: 'Elven Village, Юго-западные ворота', startLvl: 6, endLvl: 16 },
  'Invaders of the Holy Land': { npc: 'Varkees Atuba Chief', npcId: 30566, location: 'Orc Village, Hall of the Kings', startLvl: 6, endLvl: 14 },
  'Bonds of Slavery': { npc: 'Kristin Sentry', npcId: 30357, location: 'Dark Elven Village, Внутренние западные ворота', startLvl: 6, endLvl: 11 },
  'The Hidden Veins': { npc: 'Filaur Gray Pillar', npcId: 30535, location: 'Dwarven Village, House of Elders', startLvl: 6, endLvl: 15 },
  'Collect Spores': { npc: 'Herbiel Grocer', npcId: 30150, location: 'Elven Village, Лавка', startLvl: 8, endLvl: 13 },
  'Sword of Solidarity': { npc: 'Roien Grand Master', npcId: 30008, location: 'Talking Island, Стартовая зона воинов', startLvl: 9, endLvl: 16 },
  'Spirit of Mirrors': { npc: 'Gallint Grand Magister', npcId: 30017, location: 'Talking Island, Стартовая зона магов', startLvl: 10, endLvl: 15 },
  'Skirmish with the Orcs': { npc: 'Kendell Sentinel', npcId: 30218, location: 'Elven Village, Юго-восточные ворота', startLvl: 10, endLvl: 15 },
  'Forgotten Truth': { npc: 'Thifiell Tetrarch', npcId: 30358, location: 'Dark Elven Village, Храм', startLvl: 10, endLvl: 15 },
  'Spirit of Craftsman': { npc: 'Karrod Blacksmith', npcId: 30307, location: 'Dark Elven Village, Оружейная лавка', startLvl: 10, endLvl: 17 },
  'Merciless Punishment': { npc: 'Hatos Urutu Chief', npcId: 30568, location: 'Orc Village, Hall of the Kings', startLvl: 10, endLvl: 16 },
  'Jumble, Tumble, Diamond Fuss': { npc: 'Gouph Collector', npcId: 30523, location: 'Dwarven Village, Дом на севере', startLvl: 10, endLvl: 14 },
  'Sea of Spores Fever': { npc: 'Alberius Sentinel Knight', npcId: 30284, location: 'Elven Village, Храм', startLvl: 12, endLvl: 18 },
  'Offspring of Nightmares': { npc: 'Vlasty Magister', npcId: 30145, location: 'Dark Elven Village, Храм', startLvl: 15, endLvl: 20 },
  'Millennium Love': { npc: 'Lilith', npcId: 30368, location: 'Talking Island, Храм', startLvl: 15, endLvl: 19 },
  'Cure for Fever Disease': { npc: 'Elias', npcId: 30050, location: 'Talking Island, Центральная площадь', startLvl: 15, endLvl: 21 },
  'Dwarven Kinship': { npc: 'Carlon Warehouse Keeper', npcId: 30350, location: 'Dark Elven Village, Склад', startLvl: 15, endLvl: 40 },
  'Totem of the Hestui': { npc: 'Tanapi Seer', npcId: 30571, location: 'Orc Village, Hall of the Kings', startLvl: 15, endLvl: 21 },
  'Dragon Fangs': { npc: 'Luis Guard', npcId: 30386, location: 'Gludin, Юго-восточные ворота', startLvl: 19, endLvl: 29 },
  'Red-Eyed Invaders': { npc: 'Babenco Guard', npcId: 30336, location: 'Gludio, Западные ворота', startLvl: 20, endLvl: 28 },
  'Blood Fiend': { npc: 'Creamees Accessory Merchant', npcId: 30149, location: 'Elven Village, Лавка', startLvl: 21, endLvl: 26 },
  'Seed of evil': { npc: 'Biotin High Priest', npcId: 30141, location: 'Talking Island, Храм', startLvl: 21, endLvl: 26 },
  // 1st profession quests
  'Path of the Warrior': { npc: 'Auron', npcId: 30010, location: 'Gludin, Warriors Guild', startLvl: 18, endLvl: 85 },
  'Path of the Human Knight': { npc: 'Sir Klaus Vasper', npcId: 30417, location: 'Gludin, Warriors Guild', startLvl: 18, endLvl: 85 },
  'Path of the Rogue': { npc: 'Bezique', npcId: 30379, location: 'Gludin, Western Gate', startLvl: 18, endLvl: 85 },
  'Path of the Human Wizard': { npc: 'Parina', npcId: 30391, location: 'Gludin, Temple', startLvl: 18, endLvl: 85 },
  'Path of the Cleric': { npc: 'Zigaunt', npcId: 30022, location: 'Gludin, Temple', startLvl: 18, endLvl: 85 },
  'Path of the Elven Knight': { npc: 'Sorius', npcId: 30327, location: 'Gludio, Warriors Guild', startLvl: 18, endLvl: 85 },
  'Path of the Elven Scout': { npc: 'Reisa', npcId: 30328, location: 'Gludio, Warriors Guild', startLvl: 18, endLvl: 85 },
  'Path of the Elven Wizard': { npc: 'Rosella', npcId: 30414, location: 'Elven Village', startLvl: 18, endLvl: 85 },
  'Path of the Elven Oracle': { npc: 'Manuel', npcId: 30293, location: 'Gludio, Temple', startLvl: 18, endLvl: 85 },
  'Path of the Palus Knight': { npc: 'Virgil', npcId: 31742, location: 'Gludio, Dark Elf Guild', startLvl: 18, endLvl: 85 },
  'Path of the Assassin': { npc: 'Triskel', npcId: 30416, location: 'Gludio, Dark Elf Guild', startLvl: 18, endLvl: 85 },
  'Path of the Dark Wizard': { npc: 'Varika', npcId: 30421, location: 'Dark Elf Lands, Altar of Rites', startLvl: 18, endLvl: 85 },
  'Path of the Shillien Oracle': { npc: 'Sidra', npcId: 30330, location: 'Gludio, Dark Elf Guild', startLvl: 18, endLvl: 85 },
  'Path of the Orc Raider': { npc: 'Karukia', npcId: 30570, location: 'Orc Village, Hall of Kings', startLvl: 18, endLvl: 85 },
  'Path of the Orc Monk': { npc: 'Gantaki Zu Urutu', npcId: 30587, location: 'Orc Village', startLvl: 18, endLvl: 85 },
  'Path of the Orc Shaman': { npc: 'Tataru Zu Hestui', npcId: 30585, location: 'Orc Village, Hall of Kings', startLvl: 18, endLvl: 85 },
  'Path of the Scavenger': { npc: 'Pippi', npcId: 30524, location: 'Dwarven Village', startLvl: 18, endLvl: 85 },
  'Path of the Artisan': { npc: 'Silvera', npcId: 30527, location: 'Dwarven Village, Blacksmith', startLvl: 18, endLvl: 85 },
  'Trial of Geomancer': { npc: 'Dabrigit Stoneshoulder', npcId: 38555, location: 'Gludin, Gatekeeper', startLvl: 18, endLvl: 85 },
  // 3 in 1 second profession quests
  '3 in 1 Gladiator': { npc: 'Hollint', npcId: 30191, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Warlord': { npc: 'Hollint', npcId: 30191, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Paladin': { npc: 'Hollint', npcId: 30191, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Dark Avenger': { npc: 'Hollint', npcId: 30191, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Treasure Hunter': { npc: 'Luther', npcId: 30690, location: 'Hunter Village, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Hawkeye': { npc: 'Bernard', npcId: 30702, location: 'Hunter Village, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Sorcerer': { npc: 'Rukal', npcId: 30629, location: 'Gludio, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Necromancer': { npc: 'Mirien', npcId: 30461, location: 'Gludio, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Warlock': { npc: 'Hollint', npcId: 30191, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Bishop': { npc: 'Hollint', npcId: 30191, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Prophet': { npc: 'Hollint', npcId: 30191, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Temple Knight': { npc: 'Hannavalt', npcId: 30109, location: 'Oren, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Swordsinger': { npc: 'Kaien', npcId: 30623, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Plains Walker': { npc: 'Luther', npcId: 30690, location: 'Hunter Village, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Silver Ranger': { npc: 'Bernard', npcId: 30702, location: 'Hunter Village, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Spellsinger': { npc: 'Rukal', npcId: 30629, location: 'Gludio, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Elemental Summoner': { npc: 'Mirien', npcId: 30461, location: 'Gludio, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Elven Elder': { npc: 'Bandellos', npcId: 30473, location: 'Oren, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Shillien Knight': { npc: 'Hannavalt', npcId: 30109, location: 'Oren, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Bladedancer': { npc: 'Kaien', npcId: 30623, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Abyss Walker': { npc: 'Luther', npcId: 30690, location: 'Hunter Village, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Phantom Ranger': { npc: 'Bernard', npcId: 30702, location: 'Hunter Village, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Spellhowler': { npc: 'Kaira', npcId: 30476, location: 'Oren, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Phantom Summoner': { npc: 'Galatea', npcId: 30634, location: 'Gludin, Inn', startLvl: 35, endLvl: 45 },
  '3 in 1 Shillien Elder': { npc: 'Kaira', npcId: 30476, location: 'Oren, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Destroyer': { npc: 'Vokian', npcId: 30514, location: 'Oren, Warriors Guild', startLvl: 35, endLvl: 45 },
  '3 in 1 Tyrant': { npc: 'Kash', npcId: 30644, location: 'Gludio, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Overlord': { npc: 'Santiago', npcId: 30648, location: 'Gludio, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Warcryer': { npc: 'Somak', npcId: 30510, location: 'Gludio, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Bounty Hunter': { npc: 'Valkon', npcId: 30103, location: 'Oren, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Warsmith': { npc: 'Valkon', npcId: 30103, location: 'Oren, Temple', startLvl: 35, endLvl: 45 },
  '3 in 1 Terramancer': { npc: 'Parman', npcId: 30104, location: 'Oren, Temple', startLvl: 35, endLvl: 45 },
};

const QUEST_IDS: Record<string, number> = {
  'Letters of Love': 1, 'What Women Want': 2, 'Mass of Darkness': 166,
  'Long Live the Pa\'agrio Lord!': 4, 'Miner\'s Favor': 5,
  'Deliver Goods': 153, 'Sacrifice to the Sea': 154,
  'Find Sir Windawood': 155, 'Deliver Supplies': 168,
  'Fruit of the Mother Tree': 161, 'Nerupa\'s Request': 160,
  'The Guard is Busy': 257, 'Hunt the Orcs': 260,
  'Invaders of the Holy Land': 273, 'Bonds of Slavery': 265,
  'The Hidden Veins': 293, 'Collect Spores': 313,
  'Sword of Solidarity': 101, 'Spirit of Mirrors': 104,
  'Skirmish with the Orcs': 105, 'Forgotten Truth': 106,
  'Spirit of Craftsman': 103, 'Merciless Punishment': 107,
  'Jumble, Tumble, Diamond Fuss': 108,
  'Sea of Spores Fever': 102,
  'Offspring of Nightmares': 169, 'Millennium Love': 156,
  'Cure for Fever Disease': 151, 'Dwarven Kinship': 167,
  'Totem of the Hestui': 276,
  'Dragon Fangs': 38, 'Red-Eyed Invaders': 169,
  'Blood Fiend': 170, 'Seed of evil': 171,
  // 1st profession quests
  'Path of the Warrior': 618, 'Path of the Human Knight': 445, 'Path of the Rogue': 619,
  'Path of the Human Wizard': 404, 'Path of the Cleric': 405,
  'Path of the Elven Knight': 406, 'Path of the Elven Scout': 407, 'Path of the Elven Wizard': 408, 'Path of the Elven Oracle': 409,
  'Path of the Palus Knight': 410, 'Path of the Assassin': 411, 'Path of the Dark Wizard': 412, 'Path of the Shillien Oracle': 413,
  'Path of the Orc Raider': 414, 'Path of the Orc Monk': 415, 'Path of the Orc Shaman': 416,
  'Path of the Scavenger': 417, 'Path of the Artisan': 418,   'Trial of Geomancer': 747,
  // 3 in 1 second profession quests
  '3 in 1 Gladiator': 290, '3 in 1 Warlord': 291,
  '3 in 1 Paladin': 292, '3 in 1 Dark Avenger': 293,
  '3 in 1 Treasure Hunter': 294, '3 in 1 Hawkeye': 295,
  '3 in 1 Sorcerer': 296, '3 in 1 Necromancer': 297, '3 in 1 Warlock': 298,
  '3 in 1 Bishop': 299, '3 in 1 Prophet': 300,
  '3 in 1 Temple Knight': 301, '3 in 1 Swordsinger': 302,
  '3 in 1 Plains Walker': 303, '3 in 1 Silver Ranger': 304,
  '3 in 1 Spellsinger': 305,   '3 in 1 Elemental Summoner': 306,
  '3 in 1 Elven Elder': 307,
  '3 in 1 Shillien Knight': 308, '3 in 1 Bladedancer': 309,
  '3 in 1 Abyss Walker': 310, '3 in 1 Phantom Ranger': 311,
  '3 in 1 Spellhowler': 312, '3 in 1 Phantom Summoner': 313,
  '3 in 1 Shillien Elder': 314,
  '3 in 1 Destroyer': 315, '3 in 1 Tyrant': 316,
  '3 in 1 Overlord': 317, '3 in 1 Warcryer': 318,
  '3 in 1 Bounty Hunter': 319, '3 in 1 Warsmith': 320,
  '3 in 1 Terramancer': 321,
};

function enrichQuest(q: Quest): Quest & { npc: string; npcId: number; location: string; startLvl: number; endLvl: number; questId: number; steps: string[]; coords: { x: number; y: number } | null; rewardTag: RewardTag } {
  const details = QUEST_DETAILS[q.name];
  const npcId = details?.npcId ?? q.npcId ?? 0;
  return {
    ...q,
    npc: details?.npc ?? q.npc ?? '',
    location: details?.location ?? q.location ?? '',
    npcId,
    startLvl: details?.startLvl ?? q.lvl,
    endLvl: details?.endLvl ?? q.lvl,
    questId: QUEST_IDS[q.name] ?? q.questId ?? 0,
    steps: (QUEST_STEPS[q.name] ?? q.steps) ?? [],
    coords: NPC_COORDS[npcId] ?? null,
    rewardTag: detectRewardTag(q.reward),
  };
}

const RACES = ['Human Mage', 'Human Fighter', 'Elf', 'Dark Elf', 'Orc Fighter', 'Orc Shaman', 'Dwarf', 'Dwarf Mage'] as const;
type Race = typeof RACES[number];

const SHARED_QUESTS: Quest[] = [
  { lvl: 15, name: 'Offspring of Nightmares', desc: 'Хороший EXP', reward: '20000 Exp, 2000 SP, 15000 aden' },
  { lvl: 15, name: 'Millennium Love', desc: 'Опыт', reward: 'Spiritshot: No Grade 250, 10000 Exp, 1000 Sp' },
  { lvl: 15, name: 'Dwarven Kinship', desc: 'EXP и адена', reward: '10000 Exp, 1500 Sp, 7500 aden' },
  { lvl: 15, name: 'Cure for Fever Disease', desc: 'Один из лучших EXP-квестов', reward: '20000 Exp, 2000 Sp, Bone Shield (продаем в магаз)' },
  { lvl: 18, name: 'Первая профа', desc: '', reward: '' },
  { lvl: 19, name: 'Dragon Fangs', desc: 'Лучший квест до профы', reward: '350000 exp, 35000 Sp, Puma skin gaiters' },
  { lvl: 20, name: 'Red-Eyed Invaders', desc: 'опыт и расходка.', reward: '300000 exp, 30000 Sp, 10000 aden, 17 Ghp' },
  { lvl: 21, name: 'Blood Fiend', desc: 'опыт и расходка.', reward: 'вся расходка согласно квеста 100000 Exp, 10000 Sp' },
  { lvl: 21, name: 'Seed of evil', desc: 'опыт и расходка.', reward: '50000 exp, 5000 Sp, точка рандом' },
];

const QUESTS_BY_RACE: Record<string, Quest[]> = {
  'Human Mage': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Necklace of Knowledge' },
    { lvl: 2, name: 'What Women Want', desc: 'EXP и расходники', reward: '3000 XP, 300 SP' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: '2000 XP, 200 SP, 2x Ring of Knowledge' },
    { lvl: 3, name: 'Sacrifice to the Sea', desc: 'Хороший EXP', reward: '2500 XP, 250 SP, Mystic\'s Earring, 450 aden' },
    { lvl: 4, name: 'Find Sir Windawood', desc: 'Продолжение цепочки', reward: '' },
    { lvl: 6, name: 'The Guard is Busy', desc: 'Соски и расходники за первое прохождение', reward: 'сам квест можно сдавать после убийства 1 моба' },
    { lvl: 10, name: 'Spirit of Mirrors', desc: 'Бесплатное оружие для мага', reward: 'Spiritshot: No Grade 1750, Lesser Healing Potion 100, Wand of Adept' },
  ],
  'Human Fighter': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Necklace of Knowledge' },
    { lvl: 2, name: 'What Women Want', desc: 'EXP и расходники', reward: '3000 XP, 300 SP' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: '2000 XP, 200 SP, 2x Ring of Knowledge' },
    { lvl: 3, name: 'Sacrifice to the Sea', desc: 'Хороший EXP', reward: '2500 XP, 250 SP, Mystic\'s Earring, 450 aden' },
    { lvl: 4, name: 'Find Sir Windawood', desc: 'Продолжение цепочки', reward: '' },
    { lvl: 6, name: 'The Guard is Busy', desc: 'Соски и расходники за первое прохождение', reward: '1360a (сдал 36 итемов), 800 сосок' },
    { lvl: 9, name: 'Sword of Solidarity', desc: 'Бесплатное оружие для воина', reward: 'Меч, 100 хп банок, 3500 сосок' },
  ],
  'Elf': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Necklace of Knowledge' },
    { lvl: 2, name: 'What Women Want', desc: 'Стартовый EXP', reward: '3000 XP, 300 SP' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: '2000 XP, 200 SP, 2x Ring of Knowledge' },
    { lvl: 3, name: 'Sacrifice to the Sea', desc: 'Хороший EXP', reward: '2500 XP, 250 SP, Mystic\'s Earring, 450 aden' },
    { lvl: 3, name: 'Fruit of the Mother Tree', desc: 'Хороший опыт', reward: '500a, 5 Lesser Healing Potion, 1500 exp, 150 sp' },
    { lvl: 3, name: 'Nerupa\'s Request', desc: 'EXP и расходники', reward: '5 Lesser Healing Potion, 1 Haste potion, 1500 exp, 150 sp' },
    { lvl: 6, name: 'Hunt the Orcs', desc: 'Большой бонус первого прохождения (набить 11 итемов)', reward: '1498 a, 2000 SoulshotNG, 1000 SpiritshotNG' },
    { lvl: 8, name: 'Collect Spores', desc: 'Доп адена, делать параллельно с Hunt the Orcs', reward: '3500 a' },
    { lvl: 10, name: 'Skirmish with the Orcs', desc: 'EXP во время кача', reward: 'Red Sunset Staff, 100 Lesser Healing Potion, 1250 SpiritshotNG' },
    { lvl: 12, name: 'Sea of Spores Fever', desc: 'Очень хороший EXP', reward: 'Staff of Sentinel, 100 Lesser Healing Potion, 1250 SpiritshotNG' },
  ],
  'Dark Elf': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Necklace of Knowledge' },
    { lvl: 2, name: 'Mass of Darkness', desc: 'Стартовый опыт', reward: '500 EXP, 100 SP, 250a' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: '2000 XP, 200 SP, 2x Ring of Knowledge' },
    { lvl: 3, name: 'Sacrifice to the Sea', desc: 'Хороший EXP', reward: '2500 XP, 250 SP, Mystic\'s Earring, 450 aden' },
    { lvl: 3, name: 'Deliver Supplies', desc: 'Быстрый EXP', reward: '1500 EXP, 150 SP, 500a' },
    { lvl: 6, name: 'Bonds of Slavery', desc: 'бонус за первое прохождение (Набить 11 итемов)', reward: '632a (сдал 11 итемов), 2000 сосок на воина и 1000 сосок на мага' },
    { lvl: 10, name: 'Forgotten Truth', desc: 'Бесплатное оружие', reward: 'НГ дагер (11 п.атак) — 4875a в магаз, 2500 физ сосок, 100 легких хилок' },
    { lvl: 10, name: 'Spirit of Craftsman', desc: 'Второе бесплатное оружие', reward: 'НГ меч (14 п.атак) — 6450a в магаз, 100 легких хилок, 2500 физ сосок' },
  ],
  'Orc Fighter': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Necklace of Knowledge' },
    { lvl: 2, name: 'Long Live the Pa\'agrio Lord!', desc: 'Стартовый EXP', reward: 'Club (на 2 п.атаки и 1 м.атаку лучше, чем начальный меч)' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: '2000 XP, 200 SP, 2x Ring of Knowledge' },
    { lvl: 3, name: 'Sacrifice to the Sea', desc: 'Хороший EXP', reward: '2500 XP, 250 SP, Mystic\'s Earring, 450 aden' },
    { lvl: 6, name: 'Invaders of the Holy Land', desc: 'Соски и банки за первое прохождение', reward: '2000 soulshots, 1000 spiritshots, 1883a, 100 lesser heal pot' },
    { lvl: 10, name: 'Merciless Punishment', desc: 'Хороший EXP', reward: '5000 soulshots, 2500 spiritshots, 100 lesser heal pot, Butcher\'s sword (13 p.atk, 10 m.atk)' },
    { lvl: 15, name: 'Totem of the Hestui', desc: 'Убить 30 мобов', reward: '1680a, 100 Soulshots, 50 Spiritshots, 2 SoE, 10 персональных средних хилок' },
  ],
  'Orc Shaman': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Necklace of Knowledge' },
    { lvl: 2, name: 'Long Live the Pa\'agrio Lord!', desc: 'Стартовый EXP', reward: 'Club (на 2 п.атаки и 1 м.атаку лучше, чем начальный меч)' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: '2000 XP, 200 SP, 2x Ring of Knowledge' },
    { lvl: 3, name: 'Sacrifice to the Sea', desc: 'Хороший EXP', reward: '2500 XP, 250 SP, Mystic\'s Earring, 450 aden' },
    { lvl: 6, name: 'Invaders of the Holy Land', desc: 'Соски и банки за первое прохождение', reward: '2000 soulshots, 1000 spiritshots, 1883a, 100 lesser heal pot' },
    { lvl: 10, name: 'Merciless Punishment', desc: 'Хороший EXP', reward: '5000 soulshots, 2500 spiritshots, 100 lesser heal pot, Butcher\'s sword (13 p.atk, 10 m.atk)' },
    { lvl: 15, name: 'Totem of the Hestui', desc: 'Убить 30 мобов', reward: '1680a, 100 Soulshots, 50 Spiritshots, 2 SoE, 10 персональных средних хилок', note: 'Актуально только если делаешь на работе полуафк.' },
  ],
  'Dwarf': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Necklace of Knowledge' },
    { lvl: 2, name: 'Miner\'s Favor', desc: 'Стартовый опыт', reward: '1500 exp, 700a' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: '2000 XP, 200 SP, 2x Ring of Knowledge' },
    { lvl: 3, name: 'Sacrifice to the Sea', desc: 'Хороший EXP', reward: '2500 XP, 250 SP, Mystic\'s Earring, 450 aden' },
    { lvl: 6, name: 'The Hidden Veins', desc: 'Соски и расходники (набить 11 итемов)', reward: '2055a, 100 lesser healing potion, 2000 NG Soulshot' },
    { lvl: 10, name: 'Jumble, Tumble, Diamond Fuss', desc: 'Адена и материалы', reward: 'Silversmith Hammer NG, Soulshot NG x5000, Lesser Healing Potion NG x100' },
  ],
  'Dwarf Mage': [
    { lvl: 2, name: 'Letters of Love', desc: 'Быстрый стартовый опыт', reward: 'Necklace of Knowledge' },
    { lvl: 2, name: 'Miner\'s Favor', desc: 'Стартовый опыт', reward: '1500 exp, 700a' },
    { lvl: 3, name: 'Deliver Goods', desc: 'Легкий опыт', reward: '2000 XP, 200 SP, 2x Ring of Knowledge' },
    { lvl: 3, name: 'Sacrifice to the Sea', desc: 'Хороший EXP', reward: '2500 XP, 250 SP, Mystic\'s Earring, 450 aden' },
    { lvl: 6, name: 'The Hidden Veins', desc: 'Соски и расходники (набить 11 итемов)', reward: '2055a, 100 lesser healing potion, 2000 NG Soulshot' },
    { lvl: 10, name: 'Jumble, Tumble, Diamond Fuss', desc: 'Адена и материалы', reward: 'Silversmith Hammer NG, Soulshot NG x5000, Lesser Healing Potion NG x100' },
  ],
};

const TEMPLE_EXECUTOR_QUESTS: Quest[] = [
  { lvl: 35, name: 'Temple Missionary', desc: 'Цепочка Temple Executor, часть 1', reward: '253k Exp, 25k SP, 20k aden, банки, эликсиры', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 341, npcId: 30141, steps: ['1. Поговорите с High Priest Biotin в храме на Talking Island.', '2. Выполните миссию (уровни 35-45).', '3. Вернитесь за наградой: EXP, SP, адена, банки, эликсиры.'] },
  { lvl: 35, name: 'Temple Executor', desc: 'Цепочка Temple Executor, часть 2', reward: '253k Exp, 25k SP, 23.7k aden, банки', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 342, npcId: 30141, steps: ['1. Продолжите цепочку у Biotin.', '2. Выполните задание.', '3. Получите награду.'] },
  { lvl: 35, name: 'Temple Champion — 1', desc: 'Цепочка Temple Executor, часть 3', reward: '316k Exp, 31k SP, 31.5k aden, соски D, CP Potion', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 343, npcId: 30141, steps: ['1. Продолжите цепочку у Biotin.', '2. Выполните задание.', '3. Получите соски D + CP Potion + EXP.'] },
  { lvl: 36, name: 'Temple Champion — 2', desc: 'Цепочка Temple Executor, часть 4', reward: '352k Exp, 35k SP, 36k aden, эликсиры', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 344, npcId: 30141, steps: ['1. Продолжите цепочку у Biotin.', '2. Выполните задание.', '3. Получите эликсиры HP/MP + EXP.'] },
  { lvl: 37, name: 'Shadow Fox — 1', desc: 'Цепочка Temple Executor, часть 5', reward: '313k Exp, 31k SP, 26k aden, банки', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 345, npcId: 30141, steps: ['1. Продолжите цепочку у Biotin.', '2. Выполните задание.', '3. Получите награду.'] },
  { lvl: 37, name: 'Shadow Fox — 2', desc: 'Цепочка Temple Executor, часть 6', reward: '313k Exp, 31k SP, 26k aden, банки', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 346, npcId: 30141, steps: ['1. Продолжите цепочку у Biotin.', '2. Выполните задание.', '3. Получите награду.'] },
  { lvl: 37, name: 'Shadow Fox — 3', desc: 'Цепочка Temple Executor, часть 7', reward: '313k Exp, 31k SP, 26k aden, соски D, CP Potion', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 347, npcId: 30141, steps: ['1. Продолжите цепочку у Biotin.', '2. Выполните задание.', '3. Получите соски D + CP Potion.'] },
  { lvl: 38, name: 'Fallen Angel — Request of Dawn', desc: 'Цепочка Temple Executor, на выбор', reward: '592k Exp, 59k SP, 58.5k aden, соски D, CP, ресы', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 348, npcId: 30141, steps: ['1. Выберите путь Dawn у Biotin.', '2. Выполните задание (больше EXP, но сложнее).', '3. Получите Proof of Loyalty + соски D + CP.'] },
  { lvl: 38, name: 'Fallen Angel — Request of Dusk', desc: 'Цепочка Temple Executor, на выбор', reward: '435k Exp, 43k SP, 41k aden, CP, ресы', npc: 'High Priest Biotin', location: 'Talking Island, Храм', questId: 349, npcId: 30141, steps: ['1. Выберите путь Dusk у Biotin.', '2. Выполните задание (меньше EXP, но быстрее).', '3. Получите Proof of Loyalty + CP.'] },
];

type QuestCategory = 'racial' | 'profession' | 'temple';

const CATEGORIES: { key: QuestCategory; label: string }[] = [
  { key: 'racial', label: 'Расовые квесты' },
  { key: 'profession', label: 'Профессии' },
  { key: 'temple', label: 'Цепочка палач храма' },
];

type ProfType = 'first' | 'second';

interface ProfClass {
  name: string;
  quest1: string;
  quest3in1?: string;
  quest3rd?: string;
}

interface ProfessionRace {
  race: string;
  classes: ProfClass[];
}

const PROFESSION_RACES: ProfessionRace[] = [
  { race: 'Human', classes: [
    { name: 'Warrior', quest1: 'Path of the Warrior' },
    { name: 'Gladiator', quest1: 'Path of the Warrior', quest3in1: '3 in 1 Gladiator' },
    { name: 'Warlord', quest1: 'Path of the Warrior', quest3in1: '3 in 1 Warlord' },
    { name: 'Human Knight', quest1: 'Path of the Human Knight' },
    { name: 'Paladin', quest1: 'Path of the Human Knight', quest3in1: '3 in 1 Paladin' },
    { name: 'Dark Avenger', quest1: 'Path of the Human Knight', quest3in1: '3 in 1 Dark Avenger' },
    { name: 'Rogue', quest1: 'Path of the Rogue' },
    { name: 'Treasure Hunter', quest1: 'Path of the Rogue', quest3in1: '3 in 1 Treasure Hunter' },
    { name: 'Hawkeye', quest1: 'Path of the Rogue', quest3in1: '3 in 1 Hawkeye' },
    { name: 'Human Wizard', quest1: 'Path of the Human Wizard' },
    { name: 'Sorcerer', quest1: 'Path of the Human Wizard', quest3in1: '3 in 1 Sorcerer' },
    { name: 'Necromancer', quest1: 'Path of the Human Wizard', quest3in1: '3 in 1 Necromancer' },
    { name: 'Warlock', quest1: 'Path of the Human Wizard', quest3in1: '3 in 1 Warlock' },
    { name: 'Cleric', quest1: 'Path of the Cleric' },
    { name: 'Bishop', quest1: 'Path of the Cleric', quest3in1: '3 in 1 Bishop' },
    { name: 'Prophet', quest1: 'Path of the Cleric', quest3in1: '3 in 1 Prophet' },
  ]},
  { race: 'Elf', classes: [
    { name: 'Elven Knight', quest1: 'Path of the Elven Knight' },
    { name: 'Temple Knight', quest1: 'Path of the Elven Knight', quest3in1: '3 in 1 Temple Knight' },
    { name: 'Swordsinger', quest1: 'Path of the Elven Knight', quest3in1: '3 in 1 Swordsinger' },
    { name: 'Elven Scout', quest1: 'Path of the Elven Scout' },
    { name: 'Plains Walker', quest1: 'Path of the Elven Scout', quest3in1: '3 in 1 Plains Walker' },
    { name: 'Silver Ranger', quest1: 'Path of the Elven Scout', quest3in1: '3 in 1 Silver Ranger' },
    { name: 'Elven Wizard', quest1: 'Path of the Elven Wizard' },
    { name: 'Spellsinger', quest1: 'Path of the Elven Wizard', quest3in1: '3 in 1 Spellsinger' },
    { name: 'Elemental Summoner', quest1: 'Path of the Elven Wizard', quest3in1: '3 in 1 Elemental Summoner' },
    { name: 'Elven Oracle', quest1: 'Path of the Elven Oracle' },
    { name: 'Elven Elder', quest1: 'Path of the Elven Oracle', quest3in1: '3 in 1 Elven Elder' },
  ]},
  { race: 'Dark Elf', classes: [
    { name: 'Palus Knight', quest1: 'Path of the Palus Knight' },
    { name: 'Shillien Knight', quest1: 'Path of the Palus Knight', quest3in1: '3 in 1 Shillien Knight' },
    { name: 'Bladedancer', quest1: 'Path of the Palus Knight', quest3in1: '3 in 1 Bladedancer' },
    { name: 'Assassin', quest1: 'Path of the Assassin' },
    { name: 'Abyss Walker', quest1: 'Path of the Assassin', quest3in1: '3 in 1 Abyss Walker' },
    { name: 'Phantom Ranger', quest1: 'Path of the Assassin', quest3in1: '3 in 1 Phantom Ranger' },
    { name: 'Dark Wizard', quest1: 'Path of the Dark Wizard' },
    { name: 'Spellhowler', quest1: 'Path of the Dark Wizard', quest3in1: '3 in 1 Spellhowler' },
    { name: 'Phantom Summoner', quest1: 'Path of the Dark Wizard', quest3in1: '3 in 1 Phantom Summoner' },
    { name: 'Shillien Oracle', quest1: 'Path of the Shillien Oracle' },
    { name: 'Shillien Elder', quest1: 'Path of the Shillien Oracle', quest3in1: '3 in 1 Shillien Elder' },
  ]},
  { race: 'Orc', classes: [
    { name: 'Orc Raider', quest1: 'Path of the Orc Raider' },
    { name: 'Destroyer', quest1: 'Path of the Orc Raider', quest3in1: '3 in 1 Destroyer' },
    { name: 'Orc Monk', quest1: 'Path of the Orc Monk' },
    { name: 'Tyrant', quest1: 'Path of the Orc Monk', quest3in1: '3 in 1 Tyrant' },
    { name: 'Orc Shaman', quest1: 'Path of the Orc Shaman' },
    { name: 'Overlord', quest1: 'Path of the Orc Shaman', quest3in1: '3 in 1 Overlord' },
    { name: 'Warcryer', quest1: 'Path of the Orc Shaman', quest3in1: '3 in 1 Warcryer' },
  ]},
  { race: 'Dwarf', classes: [
    { name: 'Artisan', quest1: 'Path of the Artisan' },
    { name: 'Warsmith', quest1: 'Path of the Artisan', quest3in1: '3 in 1 Warsmith' },
    { name: 'Scavenger', quest1: 'Path of the Scavenger' },
    { name: 'Bounty Hunter', quest1: 'Path of the Scavenger', quest3in1: '3 in 1 Bounty Hunter' },
    { name: 'Geomancer', quest1: 'Trial of Geomancer' },
    { name: 'Terramancer', quest1: 'Trial of Geomancer', quest3in1: '3 in 1 Terramancer' },
  ]},
];

const columnHelper = createColumnHelper<Quest>();

export default function QuestsTab() {
  const [category, setCategory] = useState<QuestCategory>('racial');
  const [selectedRace, setSelectedRace] = useState<Race>('Human Mage');
  const [profRace, setProfRace] = useState<string>('Human');
  const [profType, setProfType] = useState<ProfType>('first');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mapNpc, setMapNpc] = useState<{ name: string; x: number; y: number } | null>(null);

  const toggleRow = useCallback((name: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let quests: Quest[];
    if (category === 'racial') {
      const raceQuests = QUESTS_BY_RACE[selectedRace] ?? [];
      quests = [...raceQuests, ...SHARED_QUESTS];
    } else if (category === 'profession') {
      if (!selectedClass) { quests = []; } else {
        const raceData = PROFESSION_RACES.find(r => r.race === profRace);
        const cls = raceData?.classes.find(c => c.name === selectedClass);
        if (cls) {
          const name = profType === 'second' ? (cls.quest3in1 ?? cls.quest1) : cls.quest1;
          quests = [{ lvl: profType === 'second' ? 35 : 18, name, desc: `${cls.name} — ${profType === 'second' ? '2-я профа (3 в 1)' : '1-я профа'}`, reward: '' }];
        } else {
          quests = [];
        }
      }
    } else if (category === 'temple') {
      quests = [...TEMPLE_EXECUTOR_QUESTS];
    } else {
      quests = [];
    }
    return quests.map(enrichQuest).sort((a, b) => a.lvl - b.lvl || a.name.localeCompare(b.name));
  }, [category, selectedRace, profRace, profType, selectedClass]);

  const hasNotes = useMemo(() => filtered.some(q => q.note), [filtered]);

  const noteColumn = useMemo(() => hasNotes ? columnHelper.accessor('note' as const, {
    header: 'Примечание',
    enableSorting: false,
    cell: ({ getValue }) => getValue() ? <span className={styles.noteCell}>{getValue()}</span> : null,
  }) : null, [hasNotes]);

  const columns = useMemo(() => {
      const cols: any[] = [
        columnHelper.display({
          id: 'expand',
          header: '',
          cell: ({ row }) => {
            const name = (row.original as Quest).name;
            return <span style={{ cursor: 'pointer', userSelect: 'none' }}>{expanded.has(name) ? '▼' : '▶'}</span>;
          },
        }),
        columnHelper.accessor('lvl', {
          header: 'Ур.',
          cell: ({ getValue }) => <span className={styles.lvlBadge}>{getValue()}</span>,
        }),
        columnHelper.accessor('name', {
          header: 'Квест',
          enableSorting: false,
          cell: ({ getValue }) => <span style={{ fontWeight: 600 }}>{getValue()}</span>,
        }),
          ...(category === 'racial' ? [columnHelper.accessor('rewardTag', {
          header: '',
          enableSorting: false,
          cell: ({ getValue }) => {
            if (getValue() === 'weapon' || getValue() === 'both') return <span className={styles.tagWeapon}>⚔️</span>;
            if (getValue() === 'soulshot') return <span className={styles.tagSoulshot}>🔥</span>;
            return null;
          },
        })] : []),
        columnHelper.accessor('desc', {
          header: 'Зачем',
          enableSorting: false,
        }),
        columnHelper.accessor('reward', {
          header: 'Награда',
          enableSorting: false,
          cell: ({ getValue }) => getValue() || '—',
        }),
      ];
      if (noteColumn) cols.push(noteColumn);
      return cols;
    }, [noteColumn, expanded, category]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.field}>
          <CustomSelect
            label="Категория"
            value={category}
            onChange={(v) => setCategory(v as QuestCategory)}
            options={CATEGORIES.map(c => ({ value: c.key, label: c.label }))}
          />
        </div>
        {category === 'racial' && (
          <div className={styles.field}>
            <CustomSelect
              label="Раса"
              value={selectedRace}
              onChange={(v) => setSelectedRace(v as Race)}
              options={RACES.map(r => ({ value: r, label: r }))}
            />
          </div>
        )}
        {category === 'profession' && (
          <>
            <div className={styles.field}>
              <CustomSelect
                label="Раса"
                value={profRace}
                onChange={(v) => { setProfRace(v); setSelectedClass(''); }}
                options={PROFESSION_RACES.map(r => ({ value: r.race, label: r.race }))}
              />
            </div>
            <div className={styles.field}>
              <CustomSelect
                label="Профессия"
                value={profType}
                onChange={(v) => { setProfType(v as ProfType); setSelectedClass(''); }}
                options={[
                  { value: 'first', label: '1-я профессия' },
                  { value: 'second', label: '2-я профессия' },
                ]}
              />
            </div>
            <div className={styles.field}>
              <CustomSelect
                label="Класс"
                value={selectedClass}
                onChange={(v) => setSelectedClass(v)}
                options={PROFESSION_RACES.find(r => r.race === profRace)?.classes
                  .filter(c => profType === 'second' ? c.quest3in1 : !c.quest3in1)
                  .map(c => ({ value: c.name, label: c.name })) ?? []}
              />
            </div>
          </>
        )}
      </div>

        {category === 'racial' && (
          <div className={styles.legend}>
            <span className={styles.legendTitle}>Обязательные к выполнению:</span>
            <span className={styles.legendItem}><span className={styles.tagWeapon}>⚔️</span> — оружие</span>
            <span className={styles.legendItem}><span className={styles.tagSoulshot}>🔥</span> — соски</span>
          </div>
        )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const q = row.original as Quest;
              const eq = q as ReturnType<typeof enrichQuest>;
              const colSpan = row.getVisibleCells().length;
              return (
                <Fragment key={row.id}>
                  <tr
                    onClick={() => toggleRow(q.name)}
                    className={category === 'racial' && (eq.rewardTag === 'weapon' || eq.rewardTag === 'both' || eq.rewardTag === 'soulshot') ? styles.rowWeapon : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {expanded.has(q.name) && (
                    <tr className={styles.detailRow}>
                      <td colSpan={colSpan} className={styles.detailCell}>
                        <div className={styles.detailCard}>
                          <div className={styles.detailHeader}>
                            <span className={styles.detailQuestName}>{eq.name}</span>
                            {eq.questId && eq.questId > 0 && (
                              <a
                                href={`https://mw2.wiki/lu4/quest/${eq.questId}`}
                                target="_blank"
                                rel="noopener"
                                className={styles.wikiLink}
                              >
                                mw2.wiki ↗
                              </a>
                            )}
                          </div>
                          <div className={styles.detailGrid}>
                            {eq.npc && <div className={styles.detailItem}><span className={styles.detailLabel}>NPC:</span> {eq.npc}</div>}
                            {eq.location && <div className={styles.detailItem}><span className={styles.detailLabel}>Локация:</span> {eq.location}</div>}
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Уровни:</span> {eq.startLvl}–{eq.endLvl}</div>
                            {eq.desc && <div className={styles.detailItem}><span className={styles.detailLabel}>Описание:</span> {eq.desc}</div>}
                            {eq.reward && <div className={styles.detailItem}><span className={styles.detailLabel}>Награда:</span> {eq.reward}</div>}
                          </div>
                          {eq.coords && eq.npcId > 0 && NPC_COORDS[eq.npcId] && (
                            <button className={styles.mapBtn} onClick={() => {
                              const c = NPC_COORDS[eq.npcId];
                              setMapNpc({ name: eq.name, x: c.x, y: c.y });
                            }}>
                              📍 Показать на карте
                            </button>
                          )}
                          {(eq.steps && eq.steps.length > 0) || (eq.questId && eq.questId > 0) ? (
                            <div className={styles.stepsSection}>
                              <div className={styles.stepsTitle}>📋 Прохождение</div>
                              {eq.steps && eq.steps.length > 0 ? (
                                eq.steps.map((step, i) => (
                                  <div key={i} className={styles.stepItem}>{step}</div>
                                ))
                              ) : (
                                <div className={styles.stepItem}>
                                  Полное описание прохождения на{' '}
                                  <a href={`https://mw2.wiki/lu4/quest/${eq.questId}`} target="_blank" rel="noopener" className={styles.wikiLinkInline}>
                                    mw2.wiki ↗
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {mapNpc && (
        <WorldMap name={mapNpc.name} x={mapNpc.x} y={mapNpc.y} onClose={() => setMapNpc(null)} />
      )}
    </div>
  );
}
