import { beforeEach, describe, expect, it } from 'vitest';

import { useSkillsStore } from '../skillsStore';

beforeEach(() => {
  useSkillsStore.setState({ selectedRace: '', selectedClass: '', searchQuery: '', filterType: 'all' });
});

describe('skillsStore', () => {
  it('handles race change and resets class', () => {
    useSkillsStore.getState().setSelectedClass('Warrior');
    useSkillsStore.getState().handleRaceChange({ target: { value: 'Human' } } as React.ChangeEvent<HTMLSelectElement>);
    expect(useSkillsStore.getState().selectedRace).toBe('Human');
    expect(useSkillsStore.getState().selectedClass).toBe('');
  });

  it('sets filter type', () => {
    useSkillsStore.getState().setFilterType('active');
    expect(useSkillsStore.getState().filterType).toBe('active');
  });

  it('sets search', () => {
    useSkillsStore.getState().setSearchQuery('mortal');
    expect(useSkillsStore.getState().searchQuery).toBe('mortal');
  });
});
