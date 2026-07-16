import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import RAIDBOSSES from '@data/RAIDBOSSES.json';
import CopyLink from '@shared/CopyLink';
import EmptyState from '@shared/EmptyState';
import FloatingLabel from '@shared/FloatingLabel';
import WorldMap from '@shared/WorldMap';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { goal } from '@utils/metrics';
import cx from 'classnames';

import { useRaidBossStore } from '@/stores/raidBossStore';
import type { RaidBoss } from '@/types';

import styles from './RaidBossTab.module.scss';

const BOSSES = RAIDBOSSES as RaidBoss[];

export function formatNum(s: string | null): string {
  if (!s) return '–';
  return Number(s).toLocaleString('ru');
}

export const isEpic = (b: RaidBoss) => b.respawn && b.respawn.includes('Фиксированное');

const columnHelper = createColumnHelper<RaidBoss>();

export default function RaidBossTab() {
  const searchQuery = useRaidBossStore((s) => s.searchQuery);
  const expanded = useRaidBossStore((s) => s.expanded);
  const mapBoss = useRaidBossStore((s) => s.mapBoss);
  const previewBoss = useRaidBossStore((s) => s.previewBoss);
  const setSearchQuery = useRaidBossStore((s) => s.setSearchQuery);
  const toggleRow = useRaidBossStore((s) => s.toggleRow);
  const setMapBoss = useRaidBossStore((s) => s.setMapBoss);
  const setPreviewBoss = useRaidBossStore((s) => s.setPreviewBoss);

  const [epicSort, setEpicSort] = useState<SortingState>([{ id: 'level', desc: false }]);
  const [raidSort, setRaidSort] = useState<SortingState>([{ id: 'level', desc: false }]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bossName = params.get('boss');
    if (bossName) {
      const decoded = decodeURIComponent(bossName);
      setSearchQuery(decoded);
      const boss = BOSSES.find((b) => b.name.toLowerCase() === decoded.toLowerCase());
      if (boss) {
        const id = boss.name + boss.level;
        toggleRow(id);
        setTimeout(() => {
          const el = document.getElementById('boss-' + id);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [setSearchQuery, toggleRow]);

  const { epics, raids } = useMemo(() => {
    let list = BOSSES;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) => b.name.toLowerCase().includes(q) || (b.location && b.location.toLowerCase().includes(q)),
      );
    }
    return {
      epics: list.filter(isEpic),
      raids: list.filter((b) => !isEpic(b)),
    };
  }, [searchQuery]);

  const toggleExpand = useCallback(
    (id: string) => {
      toggleRow(id);
    },
    [toggleRow],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Босс',
        enableSorting: false,
        cell: ({ row, getValue }) => (
          <div className={styles.clickableCell} onClick={() => {
            toggleExpand(row.original.name + row.original.level);
            if (!expanded.has(row.original.name + row.original.level)) {
              goal('boss_expand');
            }
          }}>
            <span className={styles.bossName}>
              {expanded.has(row.original.name + row.original.level) ? '▼ ' : '▶ '}
              {getValue()}
            </span>
            <CopyLink
              getUrl={() =>
                window.location.origin +
                import.meta.env.BASE_URL +
                'raidboss?boss=' +
                encodeURIComponent(row.original.name)
              }
            />
          </div>
        ),
      }),
      columnHelper.accessor('level', {
        header: 'Ур.',
        cell: ({ getValue }) => <span className={styles.lvlBadge}>{getValue()}</span>,
      }),
      columnHelper.accessor('respawn', {
        header: 'Респ',
        enableSorting: false,
        cell: ({ row, getValue }) => (
          <span className={cx(styles.respawnBadge, isEpic(row.original) && styles.respawnFixed)}>{getValue()}</span>
        ),
      }),
      columnHelper.accessor('location', {
        header: 'Локация',
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      }),
    ],
    [expanded, toggleExpand],
  );

  function BossTable({ data, title, icon }: { data: RaidBoss[]; title: string; icon: string }) {
    const sortState = title.includes('Эпик') ? epicSort : raidSort;
    const setSortState = title.includes('Эпик') ? setEpicSort : setRaidSort;

    const table = useReactTable({
      data,
      columns,
      state: { sorting: sortState },
      onSortingChange: setSortState,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getRowCanExpand: () => true,
    });

    return (
      <Fragment>
        <div className={styles.sectionTitle}>
          {icon} {title} ({data.length})
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const widthClass =
                      header.id === 'name'
                        ? styles.colName
                        : header.id === 'level'
                          ? styles.colLvl
                          : header.id === 'respawn'
                            ? styles.colResp
                            : header.id === 'location'
                              ? styles.colLoc
                              : '';
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={widthClass}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className={styles.sortable}>
                            {{
                              asc: ' ▲',
                              desc: ' ▼',
                            }[header.column.getIsSorted() as string] ?? ' ⇅'}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <tr id={'boss-' + row.original.name + row.original.level}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                  {expanded.has(row.original.name + row.original.level) && (
                    <tr className={styles.detailRow}>
                      <td colSpan={columns.length} className={styles.detailCell}>
                        <BossDetail
                          boss={row.original}
                          onShowMap={row.original.coords ? () => setMapBoss(row.original) : undefined}
                          onShowImage={row.original.image ? () => setPreviewBoss(row.original) : undefined}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Fragment>
    );
  }

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <FloatingLabel label="Поиск по имени или локации" value={searchQuery}>
            <input
              className={styles.input}
              type="text"
              name="raidboss-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FloatingLabel>
        </div>
        <div className={styles.count}>
          Эпиков: <b>{epics.length}</b> &middot; РБ: <b>{raids.length}</b>
        </div>
      </div>

      {epics.length + raids.length > 0 ? (
        searchQuery.trim() ? (
          <BossTable data={[...epics, ...raids]} title="Результаты поиска" icon="🔍" />
        ) : (
          <Fragment>
            {epics.length > 0 && <BossTable data={epics} title="Эпик боссы" icon="🔥" />}
            {raids.length > 0 && <BossTable data={raids} title="Рейд-боссы" icon="👹" />}
          </Fragment>
        )
      ) : (
        <EmptyState message="Боссы не найдены" />
      )}

      {mapBoss && mapBoss.coords && (
        <WorldMap name={mapBoss.name} x={mapBoss.coords.x} y={mapBoss.coords.y} onClose={() => setMapBoss(null)} />
      )}

      {previewBoss && (
        <div className={styles.imgPreviewOverlay} onClick={() => setPreviewBoss(null)}>
          <div className={styles.imgPreviewModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.imgPreviewClose} onClick={() => setPreviewBoss(null)}>
              ✕
            </button>
            <img
              className={styles.imgPreviewImage}
              src={`${import.meta.env.BASE_URL}${previewBoss.image}`}
              alt={previewBoss.name}
            />
            <div className={styles.imgPreviewName}>{previewBoss.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function BossDetail({
  boss,
  onShowMap,
  onShowImage,
}: {
  boss: RaidBoss;
  onShowMap?: () => void;
  onShowImage?: () => void;
}) {
  const stats = boss.stats;
  const hasStats = stats?.hp || false;

  const dropGroups = boss.drops ?? [];

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        {boss.image && (
          <div className={styles.bossImageWrap} onClick={onShowImage}>
            <img
              className={styles.bossImage}
              src={`${import.meta.env.BASE_URL}${boss.image}`}
              alt={boss.name}
              loading="lazy"
            />
          </div>
        )}
        <div className={styles.detailStats}>
          {stats && (
            <>
              <div className={styles.subTitle}>📊 Характеристики</div>
              <div className={styles.statsGrid}>
                {[
                  ['HP', stats.hp],
                  ['MP', stats.mp],
                  ['P.Atk', stats.pAtk],
                  ['M.Atk', stats.mAtk],
                  ['P.Def', stats.pDef],
                  ['M.Def', stats.mDef],
                  ['Exp', stats.exp],
                  ['SP', stats.sp],
                ].map(([label, val]) => (
                  <div key={label as string} className={styles.statItem}>
                    <span className={styles.statLabel}>{label as string}</span>
                    <span className={styles.statValue}>{formatNum(val as string | null)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {boss.coords && onShowMap && (
            <button className={styles.mapBtn} onClick={onShowMap}>
              📍 Показать на карте
            </button>
          )}
        </div>
      </div>

      {dropGroups.length > 0 && (
        <>
          <div className={styles.subTitle}>🎁 Дроп</div>
          <div className={styles.dropTableWrap}>
            <table className={styles.dropTable}>
              <thead>
                <tr>
                  <th className={styles.dColItem}>Предмет</th>
                  <th className={styles.dColGrade}>Грейд</th>
                  <th className={styles.dColAmount}>Кол-во</th>
                  <th className={styles.dColChance}>Шанс</th>
                </tr>
              </thead>
              <tbody>
                {dropGroups.map((group, gi) => (
                  <Fragment key={gi}>
                    <tr className={styles.dropGroupHeader}>
                      <td colSpan={4}>
                        <span className={styles.groupLabel}>Шанс дропа группы:</span>
                        <span className={styles.groupChance}>{group.groupChance}%</span>
                      </td>
                    </tr>
                    {group.items.map((item, ii) => (
                      <tr key={`${gi}-${ii}`}>
                        <td className={styles.dColItem}>
                          <a
                            className={styles.itemLink}
                            href={`https://mw2.wiki/lu4/search/result?Search%5Bquery%5D=${encodeURIComponent(item.name)}&Search%5Bsearch_type%5D=0`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.name}
                          </a>
                        </td>
                        <td className={styles.dColGrade}>
                          {item.grade !== 'NG' ? <span className={styles.itemGrade}>{item.grade}</span> : '—'}
                        </td>
                        <td className={styles.dColAmount}>{item.amount}</td>
                        <td className={styles.dColChance}>
                          <span className={styles.dropChanceVal}>{item.chance}%</span>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!hasStats && dropGroups.length === 0 && <div className={styles.noData}>Нет данных</div>}
    </div>
  );
}
