import { describe, expect, it } from 'vitest';

import { formatChance, getLocationType, getPartyText, isBossMon, sortMonsters } from '../helpers';

describe('formatChance', () => {
  it('returns dash for null', () => {
    expect(formatChance(null)).toEqual({ text: '—', cls: 'chance-empty' });
  });

  it('returns dash for undefined', () => {
    expect(formatChance(undefined)).toEqual({ text: '—', cls: 'chance-empty' });
  });

  it('returns dash for zero', () => {
    expect(formatChance(0)).toEqual({ text: '—', cls: 'chance-empty' });
  });

  it('returns formatted percent for positive value', () => {
    expect(formatChance(50)).toEqual({ text: '50.00%', cls: '' });
  });

  it('returns formatted percent for decimal value', () => {
    expect(formatChance(12.345)).toEqual({ text: '12.35%', cls: '' });
  });

  it('shows 3 decimals for medium values', () => {
    expect(formatChance(8.76)).toEqual({ text: '8.760%', cls: '' });
  });

  it('shows 4 decimals for small values', () => {
    expect(formatChance(0.0185)).toEqual({ text: '0.0185%', cls: '' });
  });

  it('shows 4 decimals for very small values', () => {
    expect(formatChance(0.00336)).toEqual({ text: '0.0034%', cls: '' });
  });
});

describe('getLocationType', () => {
  it('returns null for null input', () => {
    expect(getLocationType(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(getLocationType(undefined)).toBeNull();
  });

  it('returns null when location_type is empty', () => {
    expect(getLocationType({ location_type: null })).toBeNull();
  });

  it('returns G for group type', () => {
    expect(getLocationType({ location_type: ['G'] })).toBe('G');
  });

  it('returns SG for small group type', () => {
    expect(getLocationType({ location_type: ['SG'] })).toBe('SG');
  });

  it('returns S for solo type', () => {
    expect(getLocationType({ location_type: ['S'] })).toBe('S');
  });

  it('handles string location_type', () => {
    expect(getLocationType({ location_type: 'G' })).toBe('G');
  });

  it('prefers G over SG', () => {
    expect(getLocationType({ location_type: ['SG', 'G'] })).toBe('G');
  });
});

describe('isBossMon', () => {
  it('returns false for empty monster_type', () => {
    expect(isBossMon({})).toBe(false);
  });

  it('returns true for "bosses"', () => {
    expect(isBossMon({ monster_type: 'bosses' })).toBe(true);
  });

  it('returns true for "boss"', () => {
    expect(isBossMon({ monster_type: 'boss' })).toBe(true);
  });

  it('matches substring "boss"', () => {
    expect(isBossMon({ monster_type: 'raidboss' })).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isBossMon({ monster_type: 'BOSS' })).toBe(true);
  });

  it('returns false for unrelated type', () => {
    expect(isBossMon({ monster_type: 'normal' })).toBe(false);
  });
});

describe('getPartyText', () => {
  it('shows boss warning for boss mobs', () => {
    const result = getPartyText([], true);
    expect(result.text).toContain('босс');
    expect(result.cls).toBe('boss-warning');
  });

  it('shows full group for G type', () => {
    const result = getPartyText(['G'], false);
    expect(result.text).toContain('полная группа');
    expect(result.cls).toBe('');
  });

  it('shows minigroup for SG type', () => {
    const result = getPartyText(['SG'], false);
    expect(result.text).toContain('минигруппы');
  });

  it('shows solo for S type', () => {
    const result = getPartyText(['S'], false);
    expect(result.text).toContain('1 человека');
  });

  it('shows default for empty types', () => {
    const result = getPartyText([], false);
    expect(result.text).toBe('решай сам');
  });
});

describe('sortMonsters', () => {
  it('returns empty array for empty input', () => {
    expect(sortMonsters([])).toEqual([]);
  });

  it('does not mutate original array', () => {
    const input = [{ drop_chance: 50, spoil_chance: 0 }];
    const sorted = sortMonsters(input);
    expect(input).toEqual([{ drop_chance: 50, spoil_chance: 0 }]);
    expect(sorted).not.toBe(input);
  });

  it('places monsters with drop before those without', () => {
    const monsters = [
      { drop_chance: 0, spoil_chance: 0 },
      { drop_chance: 50, spoil_chance: 0 },
    ];
    const sorted = sortMonsters(monsters);
    expect(sorted[0].drop_chance).toBe(50);
  });

  it('sorts by drop chance descending', () => {
    const monsters = [
      { drop_chance: 10, spoil_chance: 0 },
      { drop_chance: 50, spoil_chance: 0 },
    ];
    const sorted = sortMonsters(monsters);
    expect(sorted[0].drop_chance).toBe(50);
  });
});
