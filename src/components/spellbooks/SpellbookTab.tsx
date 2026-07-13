import { useMemo, useEffect } from 'react';
import type { Spellbook } from '../../types';
import SPELLBOOKS_DATA from '../../data/SPELLBOOKS.json';
import { RACES } from '../../data/races';
import { renderMonsterRow, sortMonsters } from '../../utils/helpers';
import CopyLink from '../../components/shared/CopyLink';
import CustomSelect from '../../components/shared/CustomSelect';
import FloatingLabel from '../../components/shared/FloatingLabel';
import styles from './SpellbookTab.module.scss';
import { useSpellbookStore } from '../../stores/spellbookStore';

const SPELLBOOKS = SPELLBOOKS_DATA as Spellbook[];

const RACE_LABELS: Record<string, string> = {
  Human: 'Human', Elf: 'Elf', 'Dark Elf': 'Dark Elf', Orc: 'Orc', Dwarf: 'Dwarf',
};

function getRaceLabel(race: string): string {
  return RACE_LABELS[race] ?? race;
}

export default function SpellbookTab() {
  const selectedRace = useSpellbookStore(s => s.selectedRace);
  const selectedClass = useSpellbookStore(s => s.selectedClass);
  const searchQuery = useSpellbookStore(s => s.searchQuery);
  const setSelectedRace = useSpellbookStore(s => s.setSelectedRace);
  const setSelectedClass = useSpellbookStore(s => s.setSelectedClass);
  const setSearchQuery = useSpellbookStore(s => s.setSearchQuery);
  useEffect(() => {
    const hash = window.location.hash;
    const qsIndex = hash.indexOf('?');
    const params = new URLSearchParams(qsIndex >= 0 ? hash.slice(qsIndex) : '');
    const race = params.get('sbRace') ?? '';
    const q = params.get('sbQ') ?? '';
    setSelectedRace(race);
    setSearchQuery(q);
  }, [setSelectedRace, setSearchQuery]);

  const classesForRace = useMemo(() => {
    if (!selectedRace) return [];
    const set = new Set<string>();
    for (const sb of SPELLBOOKS) {
      for (const c of sb.classes) {
        if (c.race === selectedRace) set.add(c.class_name);
      }
    }
    return Array.from(set).sort();
  }, [selectedRace]);

  const filtered = useMemo(() => {
    let list = SPELLBOOKS;
    if (selectedRace) {
      list = list.filter((sb) => sb.classes.some((c) => c.race === selectedRace));
    }
    if (selectedClass) {
      list = list.filter((sb) => sb.classes.some((c) => c.class_name === selectedClass));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (sb) =>
          sb.spellbook_name.toLowerCase().includes(q) ||
          (sb.smart_name && sb.smart_name.toLowerCase().includes(q)) ||
          sb.skill_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedRace, selectedClass, searchQuery]);

  const totalMonsters = useMemo(
    () => filtered.reduce((sum, sb) => sum + sb.monster.length, 0),
    [filtered]
  );

  const tableRows = useMemo(
    () =>
      filtered.flatMap((sb) => {
        const sorted = sortMonsters(sb.monster);
        const rowspan = sorted.length || 1;

        const classTags = sb.classes.map((c) => (
          <span className="class-tag" key={`${c.race}-${c.class_name}`}>
            {getRaceLabel(c.race)} — {c.class_name}
          </span>
        ));

        return sorted.map((m, idx) => {
          const cells = renderMonsterRow(m);
          return (
            <tr key={`${sb.skill_name}-${idx}`}>
              {idx === 0 && (
                <>
                  <td rowSpan={rowspan}>
                    <div className="spellbook-name">
                      <div className={styles.bookTitle}>
                        <a href={sb.spellbook_url} target="_blank" rel="noopener">
                          {sb.spellbook_name}
                        </a>
                        <CopyLink
                          getUrl={() =>
                            window.location.origin +
                            import.meta.env.BASE_URL +
                            '#spellbooks?sbRace=' +
                            encodeURIComponent(selectedRace) +
                            '&sbQ=' +
                            encodeURIComponent(sb.skill_name)
                          }
                        />
                      </div>
                      <div className="spellbook-classes">{classTags}</div>
                    </div>
                  </td>
                  <td rowSpan={rowspan}>{sb.lvl}</td>
                </>
              )}
              <td dangerouslySetInnerHTML={{ __html: cells.monsterCell }} />
              <td dangerouslySetInnerHTML={{ __html: cells.locationsCell }} />
              <td dangerouslySetInnerHTML={{ __html: cells.dropCell }} />
              <td dangerouslySetInnerHTML={{ __html: cells.spoilCell }} />
              <td dangerouslySetInnerHTML={{ __html: cells.commentCell }} />
            </tr>
          );
        });
      }),
    [filtered, selectedRace]
  );

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.field}>
          <CustomSelect
            label="Раса"
            value={selectedRace}
            onChange={(v) => { setSelectedRace(v); setSelectedClass(''); }}
            options={RACES.map((r) => ({ value: r, label: getRaceLabel(r) }))}
          />
        </div>

        <div className={styles.field}>
          <CustomSelect
            label="Профессия"
            value={selectedClass}
            onChange={(v) => setSelectedClass(v)}
            options={classesForRace.map((c) => ({ value: c, label: c }))}
            disabled={!selectedRace}
          />
        </div>

        <div className={styles.searchWrap}>
          <FloatingLabel className={styles.searchField} label="Поиск" value={searchQuery}>
            <input
              className={styles.input}
              type="text"
              name="spellbook-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FloatingLabel>
        </div>

        <div
          className={styles.count}
          dangerouslySetInnerHTML={{
            __html: `Найдено книг: <b>${filtered.length}</b>`,
          }}
        />
      </div>

      <div className={styles.summary}>
        Книг: <b>{filtered.length}</b> | Мобов: <b>{totalMonsters}</b>
      </div>

      {filtered.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Книга</th>
                <th>Lvl</th>
                <th>Монстр</th>
                <th>Локации</th>
                <th>Шанс дропа</th>
                <th>Шанс спойла</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>Книги не найдены</div>
      )}
    </div>
  );
}
