import type { Monster, CommentData, ChanceInfo, MonsterRowCells } from '../types';

export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatChance(value: number | null | undefined): ChanceInfo {
  if (value === null || value === undefined) return { text: '\u2014', cls: 'chance-empty' };
  const num = Number(value);
  if (isNaN(num) || num === 0) return { text: '\u2014', cls: 'chance-empty' };
  return { text: num.toFixed(2) + '%', cls: '' };
}

export function getLocationType(
  loc: { location_type?: string[] | string | null } | null | undefined
): string | null {
  if (!loc || !loc.location_type) return null;
  const types = Array.isArray(loc.location_type)
    ? loc.location_type
    : [loc.location_type];
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
      method = '\u0414\u0440\u043e\u043f + \u0421\u043f\u043e\u0439\u043b';
      methodClass = 'spoil';
    } else if (hasDrop) {
      method = '\u0422\u043e\u043b\u044c\u043a\u043e \u0434\u0440\u043e\u043f';
      methodClass = 'drop-only';
    } else {
      method = '\u0422\u043e\u043b\u044c\u043a\u043e \u0441\u043f\u043e\u0439\u043b';
      methodClass = 'spoil';
    }

    let partySize = '\u0440\u0435\u0448\u0430\u0439 \u0441\u0430\u043c';
    let partySizeClass = '';

    if (bossFlag) {
      partySize = '\u26a0\ufe0f \u043f\u043e\u043b\u043d\u0430\u044f \u0433\u0440\u0443\u043f\u043f\u0430 (\u0431\u043e\u0441\u0441)';
      partySizeClass = 'boss-warning';
      methodClass = 'boss';
    } else {
      const types = Array.from(data.types);
      if (types.includes('G')) {
        partySize = '\u043d\u0443\u0436\u043d\u0430 \u043f\u043e\u043b\u043d\u0430\u044f \u0433\u0440\u0443\u043f\u043f\u0430';
      } else if (types.includes('SG')) {
        partySize = '\u0445\u0432\u0430\u0442\u0438\u0442 \u043c\u0438\u043d\u0438\u0433\u0440\u0443\u043f\u043f\u044b';
      } else if (types.includes('S')) {
        partySize = '\u0445\u0432\u0430\u0442\u0438\u0442 1 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430';
      }
    }

    comments.push({ mainLoc: mainName, method, methodClass, partySize, partySizeClass });
  });

  return comments;
}

export function renderMonsterRow(m: Monster): MonsterRowCells {
  const monsterLink = m.monster_url
    ? `<a href="${escapeHtml(m.monster_url)}" target="_blank" rel="noopener">${escapeHtml(m.monster_name)}</a>`
    : escapeHtml(m.monster_name);

  const badges: string[] = [];
  if (m.monster_lvl) badges.push(`<span class="stat-badge stat-lvl">Lvl ${m.monster_lvl}</span>`);
  if (m.monster_x) badges.push(`<span class="stat-badge stat-hp">HP ${escapeHtml(m.monster_x)}</span>`);
  const respawn = m.monster_respawn?.replace(/seconds?/gi, 'с').replace(/minutes?/gi, 'м');
  if (respawn) badges.push(`<span class="stat-badge stat-resp">\u23f1 \u0420\u0435\u0441\u043f: ${escapeHtml(respawn)}</span>`);
  if (isBossMon(m)) badges.push(`<span class="stat-badge stat-boss">\u{d83d}\u{dc80} BOSS</span>`);

  const locationsHtml =
    (m.locations || [])
      .map((loc) => {
        const mainName = loc.main_location_name || loc.location_name;
        const subName = loc.main_location_name ? loc.location_name : '';
        const types = Array.isArray(loc.location_type)
          ? loc.location_type.join(', ')
          : loc.location_type || '';
        const typeStr = types ? `<span class="type">[${escapeHtml(types)}]</span>` : '';
        return `<div class="location-tag"><span class="main-loc">${escapeHtml(mainName)}</span>${
          subName ? `<span class="sub-loc">\u2192 ${escapeHtml(subName)}</span>` : ''
        }${typeStr}</div>`;
      })
      .join('') || '<span style="color:#8291ab">\u2014</span>';

  const drop = formatChance(m.drop_chance);
  const spoil = formatChance(m.spoil_chance);

  const commentData = generateComment(m);
  let commentHtml = '';
  if (commentData.length > 0) {
    commentHtml = commentData
      .map(
        (c) =>
          `<div class="rec-item ${c.methodClass}"><div class="method">${escapeHtml(c.method)}</div><div class="party-size ${c.partySizeClass}">${escapeHtml(c.partySize)}</div></div>`
      )
      .join('');
  }

  return {
    monsterCell: `${monsterLink}<br><div style="margin-top:3px">${badges.join(' ')}</div>`,
    locationsCell: locationsHtml,
    dropCell: `<span class="chance chance-drop ${drop.cls}">${drop.text}</span>`,
    spoilCell: `<span class="chance chance-spoil ${spoil.cls}">${spoil.text}</span>`,
    commentCell: commentHtml,
  };
}

export function getPartyText(
  types: string[],
  hasBoss: boolean
): { text: string; cls: string } {
  if (hasBoss) {
    return { text: '\u26a0\ufe0f \u043f\u043e\u043b\u043d\u0430\u044f \u0433\u0440\u0443\u043f\u043f\u0430 (\u0431\u043e\u0441\u0441)', cls: 'boss-warning' };
  }
  if (types.includes('G')) {
    return { text: '\u043d\u0443\u0436\u043d\u0430 \u043f\u043e\u043b\u043d\u0430\u044f \u0433\u0440\u0443\u043f\u043f\u0430', cls: '' };
  }
  if (types.includes('SG')) {
    return { text: '\u0445\u0432\u0430\u0442\u0438\u0442 \u043c\u0438\u043d\u0438\u0433\u0440\u0443\u043f\u043f\u044b', cls: '' };
  }
  if (types.includes('S')) {
    return { text: '\u0445\u0432\u0430\u0442\u0438\u0442 1 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430', cls: '' };
  }
  return { text: '\u0440\u0435\u0448\u0430\u0439 \u0441\u0430\u043c', cls: '' };
}

export function sortMonsters<T extends { drop_chance: number; spoil_chance: number }>(
  monsters: T[]
): T[] {
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
