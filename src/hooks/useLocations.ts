import { useState, useCallback, useMemo } from 'react';
import type { LocationEntry } from '../types';
import { CLASSES } from '../data/classes';
import { CITIES_ALL, CITIES_RECIPES, CITIES_SPELLBOOKS } from '../data/cities';
import locationsAllData from '../data/LOCATIONS_ALL.json';
import locationsRecipesData from '../data/LOCATIONS_RECIPES.json';
import locationsSpellbooksData from '../data/LOCATIONS_SPELLBOOKS.json';

const LOCATIONS_ALL = locationsAllData as LocationEntry[];
const LOCATIONS_RECIPES = locationsRecipesData as LocationEntry[];
const LOCATIONS_SPELLBOOKS = locationsSpellbooksData as LocationEntry[];

type LocationType = 'all' | 'recipe' | 'spellbook';

interface LocationGroup {
  city: string;
  locations: LocationEntry[];
}

export function useLocations() {
  const [locationType, setLocationType] = useState<LocationType>('all');
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentData = useMemo(() => {
    switch (locationType) {
      case 'recipe':
        return LOCATIONS_RECIPES;
      case 'spellbook':
        return LOCATIONS_SPELLBOOKS;
      default:
        return LOCATIONS_ALL;
    }
  }, [locationType]);

  const currentCities = useMemo(() => {
    switch (locationType) {
      case 'recipe':
        return CITIES_RECIPES;
      case 'spellbook':
        return CITIES_SPELLBOOKS;
      default:
        return CITIES_ALL;
    }
  }, [locationType]);

  const showRaceClassFilters = locationType !== 'recipe';

  const availableClasses = useMemo(() => {
    if (!selectedRace) return [];
    return CLASSES.filter((cls) =>
      currentData.some((loc) =>
        loc.items.some((item) =>
          item.classes.some(
            (c) => c.race === selectedRace && c.class_name === cls
          )
        )
      )
    );
  }, [selectedRace, currentData]);

  const filteredLocations = useMemo(() => {
    let result = currentData;

    if (locationType === 'spellbook' && selectedRace) {
      result = result.filter((loc) =>
        loc.items.some(
          (item) =>
            item.item_type === 'spellbook' &&
            item.classes.some((c) => c.race === selectedRace)
        )
      );
    }

    if (locationType === 'spellbook' && selectedClass) {
      result = result.filter((loc) =>
        loc.items.some(
          (item) =>
            item.item_type === 'spellbook' &&
            item.classes.some((c) => c.class_name === selectedClass)
        )
      );
    }

    if (selectedCity) {
      result = result.filter(
        (loc) => loc.main_location_name === selectedCity
      );
    }

    if (selectedLocation) {
      result = result.filter(
        (loc) => loc.location_name === selectedLocation
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (loc) =>
          loc.location_name.toLowerCase().includes(q) ||
          loc.main_location_name.toLowerCase().includes(q) ||
          loc.items.some((item) =>
            item.item_name.toLowerCase().includes(q)
          )
      );
    }

    return result;
  }, [
    currentData,
    locationType,
    selectedRace,
    selectedClass,
    selectedCity,
    selectedLocation,
    searchQuery,
  ]);

  const groupedLocations: LocationGroup[] = useMemo(() => {
    const map = new Map<string, LocationEntry[]>();
    for (const loc of filteredLocations) {
      const key = loc.main_location_name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(loc);
    }
    return Array.from(map.entries()).map(([city, locations]) => ({
      city,
      locations,
    }));
  }, [filteredLocations]);

  const totalCount = filteredLocations.length;

  const handleTypeChange = useCallback((type: LocationType) => {
    setLocationType(type);
    setSelectedRace('');
    setSelectedClass('');
    setSelectedCity('');
    setSelectedLocation('');
  }, []);

  const handleRaceChange = useCallback((race: string) => {
    setSelectedRace(race);
    setSelectedClass('');
  }, []);

  const handleClassChange = useCallback((cls: string) => {
    setSelectedClass(cls);
  }, []);

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
  }, []);

  const handleLocationChange = useCallback((location: string) => {
    setSelectedLocation(location);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    locationType,
    selectedRace,
    selectedClass,
    selectedCity,
    selectedLocation,
    searchQuery,
    currentCities,
    filteredLocations,
    groupedLocations,
    totalCount,
    showRaceClassFilters,
    handleTypeChange,
    handleRaceChange,
    handleClassChange,
    handleCityChange,
    handleLocationChange,
    handleSearch,
    availableClasses,
  };
}
