import { beforeEach, describe, expect, it, vi } from 'vitest';

import { goal, hit } from '../metrics';

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('hit', () => {
  it('calls window.ym with hit action and path', () => {
    const ym = vi.fn();
    vi.stubGlobal('ym', ym);
    hit('/recipes');
    expect(ym).toHaveBeenCalledWith(110798252, 'hit', '/recipes');
  });

  it('does nothing if window.ym is not defined', () => {
    expect(() => hit('/test')).not.toThrow();
  });
});

describe('goal', () => {
  it('calls window.ym with reachGoal action and goal name', () => {
    const ym = vi.fn();
    vi.stubGlobal('ym', ym);
    goal('recipe_select');
    expect(ym).toHaveBeenCalledWith(110798252, 'reachGoal', 'recipe_select');
  });

  it('does nothing if window.ym is not defined', () => {
    expect(() => goal('test')).not.toThrow();
  });
});
