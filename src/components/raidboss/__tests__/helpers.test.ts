import { describe, expect, it } from 'vitest';

import type { RaidBoss } from '@/types';

import { bossWikiUrl, formatNum, isEpic } from '../RaidBossTab';

describe('formatNum', () => {
  it('returns dash for null', () => {
    expect(formatNum(null)).toBe('–');
  });

  it('formats number with RU locale', () => {
    expect(formatNum('12345')).toBe('12 345');
  });
});

describe('isEpic', () => {
  it('returns true for boss with Фиксированное respawn', () => {
    expect(
      isEpic({ name: '', level: 0, respawn: 'Фиксированное 40с', location: '', stats: null, drops: null } as RaidBoss),
    ).toBe(true);
  });

  it('returns false for regular boss', () => {
    expect(isEpic({ name: '', level: 0, respawn: '40с', location: '', stats: null, drops: null } as RaidBoss)).toBe(
      false,
    );
  });
});

describe('bossWikiUrl', () => {
  const base = { level: 0, respawn: '', location: '', stats: null, drops: null };

  it('deep-links to the NPC page when npcId and slug are known', () => {
    expect(bossWikiUrl({ ...base, name: 'Core', npcId: 29006, slug: 'core' } as RaidBoss)).toBe(
      'https://masterwork.wiki/lu4/npc/29006-core',
    );
  });

  it('falls back to NPC search when npcId is missing', () => {
    expect(bossWikiUrl({ ...base, name: 'Korim' } as RaidBoss)).toBe(
      'https://masterwork.wiki/lu4/search/result?Search%5Bquery%5D=Korim&Search%5Bsearch_type%5D=1',
    );
  });

  it('url-encodes spaces in boss names in the fallback', () => {
    expect(bossWikiUrl({ ...base, name: 'Last Titan Utenus' } as RaidBoss)).toContain(
      'Search%5Bquery%5D=Last%20Titan%20Utenus',
    );
  });
});
