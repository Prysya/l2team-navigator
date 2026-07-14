import { beforeEach, describe, expect, it } from 'vitest';

import type { RaidBoss } from '@/types';

import { useRaidBossStore } from '../raidBossStore';

beforeEach(() => {
  useRaidBossStore.setState({
    searchQuery: '',
    expanded: new Set(),
    epicSortAsc: true,
    raidSortAsc: true,
    mapBoss: null,
    previewBoss: null,
  });
});

describe('raidBossStore', () => {
  it('toggles expanded Set', () => {
    useRaidBossStore.getState().toggleRow('Core50');
    expect(useRaidBossStore.getState().expanded.has('Core50')).toBe(true);

    useRaidBossStore.getState().toggleRow('Core50');
    expect(useRaidBossStore.getState().expanded.has('Core50')).toBe(false);
  });

  it('flips epic sort', () => {
    useRaidBossStore.getState().toggleEpicSort();
    expect(useRaidBossStore.getState().epicSortAsc).toBe(false);

    useRaidBossStore.getState().toggleEpicSort();
    expect(useRaidBossStore.getState().epicSortAsc).toBe(true);
  });

  it('flips raid sort', () => {
    useRaidBossStore.getState().toggleRaidSort();
    expect(useRaidBossStore.getState().raidSortAsc).toBe(false);
  });

  it('sets search query', () => {
    useRaidBossStore.getState().setSearchQuery('core');
    expect(useRaidBossStore.getState().searchQuery).toBe('core');
  });

  it('sets map boss', () => {
    const boss = { name: 'Core', level: 50, respawn: '', location: '', stats: null, drops: null } as RaidBoss;
    useRaidBossStore.getState().setMapBoss(boss);
    expect(useRaidBossStore.getState().mapBoss?.name).toBe('Core');
  });
});
