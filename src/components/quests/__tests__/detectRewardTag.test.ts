import { describe, expect, it } from 'vitest';

import { detectRewardTag } from '../QuestsTab';

describe('detectRewardTag', () => {
  it('returns both for weapon and soulshot', () => {
    expect(detectRewardTag('Sword + Soulshot')).toBe('both');
  });

  it('returns weapon for weapon-only reward', () => {
    expect(detectRewardTag('Iron Sword')).toBe('weapon');
  });

  it('detects меч as weapon', () => {
    expect(detectRewardTag('Стальной меч')).toBe('weapon');
  });

  it('returns soulshot for soulshot-only reward', () => {
    expect(detectRewardTag('2000 soulshots')).toBe('soulshot');
  });

  it('detects соски as soulshot', () => {
    expect(detectRewardTag('500 соски')).toBe('soulshot');
  });

  it('returns adena for aden/aden reward', () => {
    expect(detectRewardTag('15000 aden')).toBe('adena');
  });

  it('returns exp for exp reward', () => {
    expect(detectRewardTag('25000 Exp')).toBe('exp');
  });

  it('returns other for generic reward', () => {
    expect(detectRewardTag('Ring of Knowledge')).toBe('other');
  });
});
