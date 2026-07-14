import { useMemo, useState } from 'react';
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

import type { Monster } from '@/types';

import styles from './RecipeTab.module.scss';

interface MonsterRow {
  id: string;
  monsterHtml: React.ReactNode;
  locationHtml: React.ReactNode;
  dropHtml: React.ReactNode;
  spoilHtml: React.ReactNode;
  commentHtml: React.ReactNode;
}

const columnHelper = createColumnHelper<MonsterRow>();

function useMonsterColumns() {
  return useMemo(
    () => [
      columnHelper.accessor('monsterHtml', { header: 'Монстр', cell: ({ getValue }) => getValue() }),
      columnHelper.accessor('locationHtml', { header: 'Локации', cell: ({ getValue }) => getValue() }),
      columnHelper.accessor('dropHtml', { header: 'Шанс дропа', cell: ({ getValue }) => getValue() }),
      columnHelper.accessor('spoilHtml', { header: 'Шанс спойла', cell: ({ getValue }) => getValue() }),
      columnHelper.accessor('commentHtml', { header: 'Комментарий', cell: ({ getValue }) => getValue() }),
    ],
    [],
  );
}

export default function MonsterTable({ monsters, className }: { monsters: Monster[]; className?: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMonsterColumns();

  const data = useMemo(() => {
    const sorted = sortMonsters(monsters);
    return sorted.map((m, idx) => {
      const cells = monsterCells(m);
      return {
        id: String(idx),
        monsterHtml: cells.monsterCell,
        locationHtml: cells.locationsCell,
        dropHtml: cells.dropCell,
        spoilHtml: cells.spoilCell,
        commentHtml: cells.commentCell,
      };
    });
  }, [monsters]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (data.length === 0) return null;

  return (
    <div className={className}>
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
                    <span style={{ userSelect: 'none', color: 'var(--color-primary)', marginLeft: '2px' }}>
                      {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ' ⇅'}
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
  );
}
