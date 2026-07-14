import { beforeEach, describe, expect, it } from 'vitest';

import { useSpellbookStore } from '../spellbookStore';

beforeEach(() => {
  useSpellbookStore.setState({ selectedRace: '', selectedClass: '', searchQuery: '' });
});

describe('spellbookStore', () => {
  it('handles race change and resets class', () => {
    useSpellbookStore.getState().setSelectedClass('Wizard');
    useSpellbookStore.getState().handleRaceChange({ target: { value: 'Elf' } } as React.ChangeEvent<HTMLSelectElement>);
    expect(useSpellbookStore.getState().selectedRace).toBe('Elf');
    expect(useSpellbookStore.getState().selectedClass).toBe('');
  });

  it('sets search', () => {
    useSpellbookStore.getState().setSearchQuery('fire');
    expect(useSpellbookStore.getState().searchQuery).toBe('fire');
  });
});
