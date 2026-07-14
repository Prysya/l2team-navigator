import { describe, expect, it } from 'vitest';

import { clamp, computeTotal } from '../CalculatorTab';

describe('clamp', () => {
  it('returns val when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('computeTotal', () => {
  it('returns 0 for level 1', () => {
    expect(computeTotal(1)).toBe(0);
  });

  it('returns sum for level > 1', () => {
    const total = computeTotal(5);
    expect(total).toBeGreaterThan(0);
  });

  it('is cumulative', () => {
    const total5 = computeTotal(5);
    const total4 = computeTotal(4);
    expect(total5).toBeGreaterThan(total4);
  });
});
