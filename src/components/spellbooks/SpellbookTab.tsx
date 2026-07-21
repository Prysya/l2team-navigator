import { useEffect, useMemo, useState } from 'react';
import { RACES } from '@data/races';
import SPELLBOOKS_DATA from '@data/SPELLBOOKS.json';
import CopyLink from '@shared/CopyLink';
import CustomSelect from '@shared/CustomSelect';
import EmptyState from '@shared/EmptyState';
import FloatingLabel from '@shared/FloatingLabel';
import ItemIcon from '@shared/ItemIcon';
import { monsterCells } from '@shared/MonsterCells';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { sortMonsters } from '@utils/helpers';

import { useSpellbookStore } from '@/stores/spellbookStore';
import type { Spellbook } from '@/types';

import styles from './SpellbookTab.module.scss';

const SPELLBOOKS = SPELLBOOKS_DATA as Spellbook[];

const RACE_LABELS: Record<string, string> = {
  Human: 'Human',
  Elf: 'Elf',
  'Dark Elf': 'Dark Elf',
  Orc: 'Orc',
  Dwarf: 'Dwarf',
};

function getRaceLabel(race: string): string {
  return RACE_LABELS[race] ?? race;
}

interface FlatRow {
  id: string;
  spellbookName: string;
  spellbookUrl: string;
  skillName: string;
  level: string;
  monsterHtml: React.ReactNode;
  locationHtml: React.ReactNode;
  dropHtml: React.ReactNode;
  spoilHtml: React.ReactNode;
  commentHtml: React.ReactNode;
  classTags: React.ReactNode;
}

const columnHelper = createColumnHelper<FlatRow>();

export default function SpellbookTab() {
  const selectedRace = useSpellbookStore((s) => s.selectedRace);
  const selectedClass = useSpellbookStore((s) => s.selectedClass);
  const searchQuery = useSpellbookStore((s) => s.searchQuery);
  const setSelectedRace = useSpellbookStore((s) => s.setSelectedRace);
  const setSelectedClass = useSpellbookStore((s) => s.setSelectedClass);
  const setSearchQuery = useSpellbookStore((s) => s.setSearchQuery);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
          sb.skill_name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedRace, selectedClass, searchQuery]);

  const flatData = useMemo(() => {
    return filtered.flatMap((sb) => {
      const sorted = sortMonsters(sb.monster);

      const classTags = sb.classes.map((c) => (
        <span className="class-tag" key={`${c.race}-${c.class_name}`}>
          {getRaceLabel(c.race)} — {c.class_name}
        </span>
      ));

      const bookContent = (
        <div className="spellbook-name">
          <div className={styles.bookTitle}>
            <ItemIcon id={sb.item_wiki_id} name={sb.spellbook_name} />
            <a href={sb.spellbook_url} target="_blank" rel="noopener noreferrer">
              {sb.spellbook_name}
            </a>
            <CopyLink
              getUrl={() =>
                window.location.origin +
                import.meta.env.BASE_URL +
                'spellbooks?sbRace=' +
                encodeURIComponent(selectedRace) +
                '&sbQ=' +
                encodeURIComponent(sb.skill_name)
              }
            />
          </div>
          <div className="spellbook-classes">{classTags}</div>
        </div>
      );

      return sorted.map((m, idx) => {
        const cells = monsterCells(m);
        return {
          id: `${sb.skill_name}-${idx}`,
          spellbookName: sb.spellbook_name,
          spellbookUrl: sb.spellbook_url,
          skillName: sb.skill_name,
          level: String(sb.lvl),
          monsterHtml: cells.monsterCell,
          locationHtml: cells.locationsCell,
          dropHtml: cells.dropCell,
          spoilHtml: cells.spoilCell,
          commentHtml: cells.commentCell,
          classTags: bookContent,
        };
      });
    });
  }, [filtered, selectedRace]);

  const totalMonsters = useMemo(() => filtered.reduce((sum, sb) => sum + sb.monster.length, 0), [filtered]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('classTags', {
        header: 'Книга',
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor('level', {
        header: 'Lvl',
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor('monsterHtml', {
        header: 'Монстр',
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor('locationHtml', {
        header: 'Локации',
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor('dropHtml', {
        header: 'Шанс дропа',
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor('spoilHtml', {
        header: 'Шанс спойла',
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor('commentHtml', {
        header: 'Комментарий',
        cell: ({ getValue }) => getValue(),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: flatData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.field}>
          <CustomSelect
            label="Раса"
            value={selectedRace}
            onChange={(v) => {
              setSelectedRace(v);
              setSelectedClass('');
            }}
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

        <div className={styles.count}>
          Найдено книг: <b>{filtered.length}</b> | Мобов: <b>{totalMonsters}</b>
        </div>
      </div>

      {!selectedRace && !selectedClass && !searchQuery.trim() ? (
        <EmptyState message="Выберите расу или профессию для просмотра" />
      ) : flatData.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className={styles.sortIndicator}>
                          {{
                            asc: ' ▲',
                            desc: ' ▼',
                          }[header.column.getIsSorted() as string] ?? ' ⇅'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="Книги не найдены" />
      )}
    </div>
  );
}
