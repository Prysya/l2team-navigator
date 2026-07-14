import { beforeEach, describe, expect, it } from 'vitest';

import { useQuestStore } from '../questStore';

beforeEach(() => {
  useQuestStore.setState({
    category: 'racial',
    selectedRace: 'Human Mage',
    profRace: 'Human',
    profType: 'first',
    selectedClass: '',
    expanded: new Set(),
    mapNpc: null,
  });
});

describe('questStore', () => {
  it('sets category and resets selectedClass', () => {
    const store = useQuestStore.getState();
    store.setSelectedClass('Warrior');
    store.setCategory('profession');
    expect(useQuestStore.getState().category).toBe('profession');
    expect(useQuestStore.getState().selectedClass).toBe('');
  });

  it('sets profRace and resets selectedClass', () => {
    useQuestStore.getState().setSelectedClass('Warrior');
    useQuestStore.getState().setProfRace('Elf');
    expect(useQuestStore.getState().profRace).toBe('Elf');
    expect(useQuestStore.getState().selectedClass).toBe('');
  });

  it('sets profType and resets selectedClass', () => {
    useQuestStore.getState().setSelectedClass('Wizard');
    useQuestStore.getState().setProfType('second');
    expect(useQuestStore.getState().profType).toBe('second');
    expect(useQuestStore.getState().selectedClass).toBe('');
  });

  it('toggles row in expanded Set', () => {
    useQuestStore.getState().toggleRow('Letters of Love');
    expect(useQuestStore.getState().expanded.has('Letters of Love')).toBe(true);

    useQuestStore.getState().toggleRow('Letters of Love');
    expect(useQuestStore.getState().expanded.has('Letters of Love')).toBe(false);
  });

  it('sets mapNpc', () => {
    const npc = { name: 'Test', x: 100, y: 200 };
    useQuestStore.getState().setMapNpc(npc);
    expect(useQuestStore.getState().mapNpc).toEqual(npc);

    useQuestStore.getState().setMapNpc(null);
    expect(useQuestStore.getState().mapNpc).toBeNull();
  });
});
