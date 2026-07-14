import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, type RenderResult } from '@testing-library/react';

import type { Monster } from '@/types';

interface RenderOptions {
  route?: string;
}

export function renderWithProviders(ui: ReactElement, { route = '/' }: RenderOptions = {}): RenderResult {
  window.history.pushState({}, '', route);
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

export function createMockMonster(overrides?: Partial<Monster>): Monster {
  return {
    monster_name: overrides?.monster_name ?? 'Test Monster',
    monster_url: overrides?.monster_url ?? null,
    monster_lvl: overrides?.monster_lvl ?? 40,
    monster_respawn: overrides?.monster_respawn ?? null,
    monster_x: overrides?.monster_x ?? null,
    monster_type: overrides?.monster_type ?? '',
    locations: overrides?.locations ?? [],
    drop_chance: overrides?.drop_chance ?? 0,
    spoil_chance: overrides?.spoil_chance ?? 0,
  };
}
