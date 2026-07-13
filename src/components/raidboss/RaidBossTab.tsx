import cx from 'classnames';
import { useMemo, Fragment, useCallback, useRef, useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import RAIDBOSSES from '../../data/RAIDBOSSES.json';
import styles from './RaidBossTab.module.scss';
import { useRaidBossStore, type RaidBoss } from '../../stores/raidBossStore';
import CopyLink from '../../components/shared/CopyLink';
import FloatingLabel from '../../components/shared/FloatingLabel';

const BOSSES = RAIDBOSSES as RaidBoss[];

function formatNum(s: string | null): string {
  if (!s) return '–';
  return Number(s).toLocaleString('ru');
}

const isEpic = (b: RaidBoss) => b.respawn && b.respawn.includes('Фиксированное');

const columnHelper = createColumnHelper<RaidBoss>();

export default function RaidBossTab() {
  const searchQuery = useRaidBossStore(s => s.searchQuery);
  const expanded = useRaidBossStore(s => s.expanded);
  const mapBoss = useRaidBossStore(s => s.mapBoss);
  const previewBoss = useRaidBossStore(s => s.previewBoss);
  const setSearchQuery = useRaidBossStore(s => s.setSearchQuery);
  const toggleRow = useRaidBossStore(s => s.toggleRow);
  const setMapBoss = useRaidBossStore(s => s.setMapBoss);
  const setPreviewBoss = useRaidBossStore(s => s.setPreviewBoss);

  const [epicSort, setEpicSort] = useState<SortingState>([{ id: 'level', desc: false }]);
  const [raidSort, setRaidSort] = useState<SortingState>([{ id: 'level', desc: false }]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bossName = params.get('boss');
    if (bossName) {
      const decoded = decodeURIComponent(bossName);
      setSearchQuery(decoded);
      const boss = BOSSES.find(b => b.name.toLowerCase() === decoded.toLowerCase());
      if (boss) {
        const id = boss.name + boss.level;
        toggleRow(id);
        setTimeout(() => {
          const el = document.getElementById('boss-' + id);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, []);

  const { epics, raids } = useMemo(() => {
    let list = BOSSES;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.location && b.location.toLowerCase().includes(q))
      );
    }
    return {
      epics: list.filter(isEpic),
      raids: list.filter(b => !isEpic(b)),
    };
  }, [searchQuery]);

  const toggleExpand = useCallback((id: string) => {
    toggleRow(id);
  }, [toggleRow]);

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Босс',
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <div className={styles.clickableCell} onClick={() => toggleExpand(row.original.name + row.original.level)}>
          <span className={styles.bossName}>
            {expanded.has(row.original.name + row.original.level) ? '▼ ' : '▶ '}{getValue()}
          </span>
          <CopyLink getUrl={() => window.location.origin + import.meta.env.BASE_URL + 'raidboss?boss=' + encodeURIComponent(row.original.name)} />
        </div>
      ),
    }),
    columnHelper.accessor('level', {
      header: 'Ур.',
      cell: ({ getValue }) => (
        <span className={styles.lvlBadge}>{getValue()}</span>
      ),
    }),
    columnHelper.accessor('respawn', {
      header: 'Респ',
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <span className={cx(styles.respawnBadge, isEpic(row.original) && styles.respawnFixed)}>
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('location', {
      header: 'Локация',
      enableSorting: false,
      cell: ({ getValue }) => getValue(),
    }),
  ], [expanded, toggleExpand]);

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
        <div className={styles.sectionTitle}>{icon} {title} ({data.length})</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const widthClass =
                      header.id === 'name' ? styles.colName :
                      header.id === 'level' ? styles.colLvl :
                      header.id === 'respawn' ? styles.colResp :
                      header.id === 'location' ? styles.colLoc : '';
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
              {table.getRowModel().rows.map(row => (
                <Fragment key={row.id}>
                  <tr id={'boss-' + row.original.name + row.original.level}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
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
              onChange={e => setSearchQuery(e.target.value)}
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
        <div className={styles.emptyState}>Боссы не найдены</div>
      )}

      {mapBoss && (
        <BossMap boss={mapBoss} onClose={() => setMapBoss(null)} />
      )}

      {previewBoss && (
        <div className={styles.imgPreviewOverlay} onClick={() => setPreviewBoss(null)}>
          <div className={styles.imgPreviewModal} onClick={e => e.stopPropagation()}>
            <button className={styles.imgPreviewClose} onClick={() => setPreviewBoss(null)}>✕</button>
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

function BossDetail({ boss, onShowMap, onShowImage }: { boss: RaidBoss; onShowMap?: () => void; onShowImage?: () => void }) {
  const hasStats = boss.stats?.hp || false;

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
          {hasStats && (
            <>
              <div className={styles.subTitle}>📊 Характеристики</div>
              <div className={styles.statsGrid}>
                {[
                  ['HP', boss.stats!.hp],
                  ['MP', boss.stats!.mp],
                  ['P.Atk', boss.stats!.pAtk],
                  ['M.Atk', boss.stats!.mAtk],
                  ['P.Def', boss.stats!.pDef],
                  ['M.Def', boss.stats!.mDef],
                  ['Exp', boss.stats!.exp],
                  ['SP', boss.stats!.sp],
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

      {!hasStats && dropGroups.length === 0 && (
        <div className={styles.noData}>Нет данных</div>
      )}
    </div>
  );
}

function BossMap({ boss, onClose }: { boss: RaidBoss; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragPos = useRef({ x: 0, y: 0 });

  const coords = boss.coords!;

  useEffect(() => {
    const vw = window.innerWidth * 0.9;
    const vh = window.innerHeight * 0.9;
    const s = 1.1;
    const cx = vw / 2 - coords.x * s;
    const cy = vh / 2 - coords.y * s;
    setPos({ x: cx, y: cy });
  }, [coords.x, coords.y]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(3, Math.max(0.15, prev * delta)));
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragPos.current = { ...pos };
  }, [pos]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPos({
      x: dragPos.current.x + (e.clientX - dragStart.current.x),
      y: dragPos.current.y + (e.clientY - dragStart.current.y),
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className={styles.mapOverlay} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <div className={styles.mapModal}>
        <div className={styles.mapHeader}>
          <span>🗺️ {boss.name}</span>
          <button className={styles.mapClose} onClick={onClose}>✕</button>
        </div>
        <div
          className={styles.mapContainer}
          ref={containerRef}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
        >
          <div
            className={styles.mapInner}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              backgroundImage: `url(${import.meta.env.BASE_URL}maps/world-map.jpg)`,
            }}
          >
            <div
              className={styles.mapMarker}
              style={{
                left: coords.x,
                top: coords.y,
              }}
            >
              <span className={styles.mapMarkerLabel}>{boss.name}</span>
            </div>
          </div>
        </div>
        <div className={styles.mapFooter}>
          <button className={styles.mapZoomBtn} onClick={() => setScale(s => Math.min(3, s * 1.3))}>+</button>
          <span className={styles.mapZoomLevel}>{Math.round(scale * 100)}%</span>
          <button className={styles.mapZoomBtn} onClick={() => setScale(s => Math.max(0.15, s / 1.3))}>−</button>
        </div>
      </div>
    </div>
  );
}
