export interface ProfClass {
  name: string;
  quest1: string;
  quest2?: string;
  quest3in1?: string;
}

export interface ProfessionRace {
  race: string;
  classes: ProfClass[];
}

export const PROFESSION_RACES: ProfessionRace[] = [
  {
    race: 'Human',
    classes: [
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
    ],
  },
  {
    race: 'Elf',
    classes: [
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
    ],
  },
  {
    race: 'Dark Elf',
    classes: [
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
    ],
  },
  {
    race: 'Orc',
    classes: [
      { name: 'Orc Raider', quest1: 'Path of the Orc Raider' },
      { name: 'Destroyer', quest1: 'Path of the Orc Raider', quest3in1: '3 in 1 Destroyer' },
      { name: 'Orc Monk', quest1: 'Path of the Orc Monk' },
      { name: 'Tyrant', quest1: 'Path of the Orc Monk', quest3in1: '3 in 1 Tyrant' },
      { name: 'Orc Shaman', quest1: 'Path of the Orc Shaman' },
      { name: 'Overlord', quest1: 'Path of the Orc Shaman', quest3in1: '3 in 1 Overlord' },
      { name: 'Warcryer', quest1: 'Path of the Orc Shaman', quest3in1: '3 in 1 Warcryer' },
    ],
  },
  {
    race: 'Dwarf',
    classes: [
      { name: 'Artisan', quest1: 'Path of the Artisan' },
      { name: 'Warsmith', quest1: 'Path of the Artisan', quest3in1: '3 in 1 Warsmith' },
      { name: 'Scavenger', quest1: 'Path of the Scavenger' },
      { name: 'Bounty Hunter', quest1: 'Path of the Scavenger', quest3in1: '3 in 1 Bounty Hunter' },
      { name: 'Geomancer', quest1: 'Trial of Geomancer' },
      { name: 'Terramancer', quest1: 'Trial of Geomancer', quest3in1: '3 in 1 Terramancer' },
    ],
  },
] as const;
