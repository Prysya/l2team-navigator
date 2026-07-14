import { describe, expect, it } from 'vitest';

import { cleanStatText, compressLevels, getStatIcon } from '../SkillsTab';

describe('cleanStatText', () => {
  it('strips leading zeros from numbers', () => {
    expect(cleanStatText('0123')).toBe('123');
  });

  it('keeps trailing zeros', () => {
    expect(cleanStatText('100')).toBe('100');
  });

  it('strips zero after decimal point', () => {
    expect(cleanStatText('0.05')).toBe('0.5');
  });

  it('handles text without numbers', () => {
    expect(cleanStatText('Hello World')).toBe('Hello World');
  });
});

describe('getStatIcon', () => {
  it('returns water drop for MP', () => {
    expect(getStatIcon('MP')).toBe('💧');
  });

  it('returns stopwatch for КД', () => {
    expect(getStatIcon('КД')).toBe('⏱');
  });

  it('returns hourglass for Длит.', () => {
    expect(getStatIcon('Длит.')).toBe('⏳');
  });

  it('returns empty for unknown', () => {
    expect(getStatIcon('HP')).toBe('');
  });
});

describe('compressLevels', () => {
  const level1 = { skillLevel: 1, classLevel: 1, changes: ['+1 HP'] };
  const level2 = { skillLevel: 2, classLevel: 1, changes: ['+1 HP'] };
  const diffLevel = { skillLevel: 2, classLevel: 2, changes: ['+2 HP'] };

  it('groups consecutive levels with same changes', () => {
    const levels = [level1, level2, { ...level2, skillLevel: 3, classLevel: 1 }];
    const result = compressLevels(levels as { skillLevel: number; classLevel: number; changes: string[] }[]);
    expect(result).toHaveLength(1);
    expect(result[0].levels).toBe('1, 1, 1');
  });

  it('separates levels with different changes', () => {
    const levels = [level1, diffLevel];
    const result = compressLevels(levels as { skillLevel: number; classLevel: number; changes: string[] }[]);
    expect(result).toHaveLength(2);
  });

  it('handles empty levels', () => {
    expect(compressLevels([])).toHaveLength(0);
  });
});
