import type { ChanceInfo, CommentData, Monster } from '@/types';

export function formatChance(value: number | null | undefined): ChanceInfo {
  if (value === null || value === undefined) return { text: '—', cls: 'chance-empty' };
  const num = Number(value);
  if (isNaN(num) || num === 0) return { text: '—', cls: 'chance-empty' };
  return { text: num.toFixed(2) + '%', cls: '' };
}

export function getLocationType(loc: { location_type?: string[] | string | null } | null | undefined): string | null {
  if (!loc || !loc.location_type) return null;
  const types = Array.isArray(loc.location_type) ? loc.location_type : [loc.location_type];
  if (types.includes('G')) return 'G';
  if (types.includes('SG')) return 'SG';
  if (types.includes('S')) return 'S';
  return null;
}

export function isBossMon(m: { monster_type?: string }): boolean {
  const t = (m.monster_type || '').toLowerCase().trim();
  return t === 'bosses' || t === 'boss' || t.includes('boss');
}

export function generateComment(monster: Monster): CommentData[] {
  const comments: CommentData[] = [];
  const hasDrop = Number(monster.drop_chance) > 0;
  const hasSpoil = Number(monster.spoil_chance) > 0;
  if (!hasDrop && !hasSpoil) return [];

  const locations = monster.locations || [];
  if (locations.length === 0) return [];

  const bossFlag = isBossMon(monster);
  const mainLocs: Record<string, { types: Set<string> }> = {};

  locations.forEach((loc) => {
    const mainName = loc.main_location_name || loc.location_name;
    const locType = getLocationType(loc);
    if (!mainLocs[mainName]) mainLocs[mainName] = { types: new Set() };
    if (locType) mainLocs[mainName].types.add(locType);
  });

  Object.keys(mainLocs).forEach((mainName) => {
    const data = mainLocs[mainName];
    let method = '';
    let methodClass = '';

    if (hasDrop && hasSpoil) {
      method = 'Дроп + Спойл';
      methodClass = 'spoil';
    } else if (hasDrop) {
      method = 'Только дроп';
      methodClass = 'drop-only';
    } else {
      method = 'Только спойл';
      methodClass = 'spoil';
    }

    let partySize = 'решай сам';
    let partySizeClass = '';

    if (bossFlag) {
      partySize =
        '⚠️ полная группа (босс)';
      partySizeClass = 'boss-warning';
      methodClass = 'boss';
    } else {
      const types = Array.from(data.types);
      if (types.includes('G')) {
        partySize =
          'нужна полная группа';
      } else if (types.includes('SG')) {
        partySize = 'хватит минигруппы';
      } else if (types.includes('S')) {
        partySize = 'хватит 1 человека';
      }
    }

    comments.push({ mainLoc: mainName, method, methodClass, partySize, partySizeClass });
  });

  return comments;
}

export function getPartyText(types: string[], hasBoss: boolean): { text: string; cls: string } {
  if (hasBoss) {
    return {
      text: '⚠️ полная группа (босс)',
      cls: 'boss-warning',
    };
  }
  if (types.includes('G')) {
    return {
      text: 'нужна полная группа',
      cls: '',
    };
  }
  if (types.includes('SG')) {
    return {
      text: 'хватит минигруппы',
      cls: '',
    };
  }
  if (types.includes('S')) {
    return { text: 'хватит 1 человека', cls: '' };
  }
  return { text: 'решай сам', cls: '' };
}

export function sortMonsters<T extends { drop_chance: number; spoil_chance: number }>(monsters: T[]): T[] {
  return [...monsters].sort((a, b) => {
    const aDrop = Number(a.drop_chance) || 0;
    const bDrop = Number(b.drop_chance) || 0;
    const aSpoil = Number(a.spoil_chance) || 0;
    const bSpoil = Number(b.spoil_chance) || 0;
    const aHasDrop = aDrop > 0 ? 1 : 0;
    const bHasDrop = bDrop > 0 ? 1 : 0;

    if (aHasDrop !== bHasDrop) return bHasDrop - aHasDrop;
    if (aHasDrop && bHasDrop) return bDrop - aDrop;
    return bSpoil - aSpoil;
  });
}
