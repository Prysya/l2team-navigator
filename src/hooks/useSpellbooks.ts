import { useState, useCallback, useMemo } from 'react';
import type { Spellbook } from '../types';
import { CLASSES } from '../data/classes';
import spellbooksData from '../data/SPELLBOOKS.json';

const SPELLBOOKS = spellbooksData as Spellbook[];

export function useSpellbooks() {
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const availableClasses = useMemo(() => {
    if (!selectedRace) return [];
    return CLASSES.filter((cls) =>
      SPELLBOOKS.some((sb) =>
        sb.classes.some((c) => c.race === selectedRace && c.class_name === cls)
      )
    );
  }, [selectedRace]);

  const filteredSpellbooks = useMemo(() => {
    let result = SPELLBOOKS;

    if (selectedRace) {
      result = result.filter((sb) =>
        sb.classes.some((c) => c.race === selectedRace)
      );
    }

    if (selectedClass) {
      result = result.filter((sb) =>
        sb.classes.some((c) => c.class_name === selectedClass)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (sb) =>
          sb.spellbook_name.toLowerCase().includes(q) ||
          sb.skill_name.toLowerCase().includes(q) ||
          (sb.smart_name && sb.smart_name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [selectedRace, selectedClass, searchQuery]);

  const totalCount = filteredSpellbooks.length;

  const handleRaceChange = useCallback((race: string) => {
    setSelectedRace(race);
    setSelectedClass('');
  }, []);

  const handleClassChange = useCallback((cls: string) => {
    setSelectedClass(cls);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    selectedRace,
    selectedClass,
    searchQuery,
    availableClasses,
    filteredSpellbooks,
    totalCount,
    handleRaceChange,
    handleClassChange,
    handleSearch,
  };
}
