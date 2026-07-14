import { beforeEach, describe, expect, it } from 'vitest';

import { useLocationsStore } from '../locationsStore';

beforeEach(() => {
  useLocationsStore.setState({
    typeFilter: 'all',
    selectedRace: '',
    selectedClass: '',
    selectedCity: '',
    selectedLocation: '',
    searchQuery: '',
  });
});

describe('locationsStore', () => {
  it('handles type change and resets race+class', () => {
    useLocationsStore.getState().setSelectedRace('Elf');
    useLocationsStore.getState().handleTypeChange('recipe');
    expect(useLocationsStore.getState().typeFilter).toBe('recipe');
    expect(useLocationsStore.getState().selectedRace).toBe('');
    expect(useLocationsStore.getState().selectedClass).toBe('');
  });

  it('sets city', () => {
    useLocationsStore.getState().setSelectedCity('Giran');
    expect(useLocationsStore.getState().selectedCity).toBe('Giran');
  });

  it('sets search', () => {
    useLocationsStore.getState().setSearchQuery('sword');
    expect(useLocationsStore.getState().searchQuery).toBe('sword');
  });
});
