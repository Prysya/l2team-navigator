import { useState, useMemo, Fragment } from 'react';
import RAIDBOSSES from '../../data/RAIDBOSSES.json';
import styles from './RaidBossTab.module.scss';

interface BossStats {
  hp: string | null;
  mp: string | null;
  pAtk: string | null;
  mAtk: string | null;
  pDef: string | null;
  mDef: string | null;
  exp: string | null;
  sp: string | null;
  atkAttr?: string | null;
  defAttr?: string | null;
}

interface DropItem {
  name: string;
  grade: string;
  amount: string;
  chance: number;
}

interface DropGroup {
  groupChance: number;
  items: DropItem[];
}

interface RaidBoss {
  name: string;
  level: number;
  respawn: string;
  location: string;
  stats: BossStats | null;
  drops: DropGroup[] | null;
}

const BOSSES = RAIDBOSSES as RaidBoss[];

function formatNum(s: string | null): string {
  if (!s) return '–';
  return Number(s).toLocaleString('ru');
}

const isEpic = (b: RaidBoss) => b.respawn && b.respawn.includes('Фиксированное');

export default function RaidBossTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [epicSortAsc, setEpicSortAsc] = useState(true);
  const [raidSortAsc, setRaidSortAsc] = useState(true);

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
      epics: [...list.filter(isEpic)].sort((a, b) =>
        epicSortAsc
          ? a.level - b.level || a.name.localeCompare(b.name)
          : b.level - a.level || a.name.localeCompare(b.name)
      ),
      raids: [...list.filter(b => !isEpic(b))].sort((a, b) =>
        raidSortAsc
          ? a.level - b.level || a.name.localeCompare(b.name)
          : b.level - a.level || a.name.localeCompare(b.name)
      ),
    };
  }, [searchQuery, epicSortAsc, raidSortAsc]);

  const toggleRow = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTable = (items: RaidBoss[], title: string, icon: string, sortAsc: boolean, onToggleSort: () => void) => (
    <Fragment>
      <div className={styles.sectionTitle}>{icon} {title} ({items.length})</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colName}>Босс</th>
              <th className={styles.colLvl}>
                <span className={styles.sortable} onClick={onToggleSort}>
                  Ур. {sortAsc ? '▲' : '▼'}
                </span>
              </th>
              <th className={styles.colResp}>Респ</th>
              <th className={styles.colLoc}>Локация</th>
            </tr>
          </thead>
          <tbody>
            {items.map((boss) => {
              const id = boss.name + boss.level;
              const isOpen = expanded.has(id);
              return (
                <Fragment key={id}>
                  <tr>
                    <td
                      className={styles.clickableCell}
                      onClick={() => toggleRow(id)}
                    >
                      <span className={styles.bossName}>
                        {isOpen ? '▼ ' : '▶ '}{boss.name}
                      </span>
                    </td>
                    <td className={styles.colLvl}><span className={styles.lvlBadge}>{boss.level}</span></td>
                    <td className={styles.colResp}>
                      <span className={`${styles.respawnBadge} ${isEpic(boss) ? styles.respawnFixed : ''}`}>
                        {boss.respawn}
                      </span>
                    </td>
                    <td className={styles.colLoc}>{boss.location}</td>
                  </tr>
                  {isOpen && (
                    <tr className={styles.detailRow}>
                      <td colSpan={4} className={styles.detailCell}>
                        <BossDetail boss={boss} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Fragment>
  );

  return (
    <div>
      <div className={styles.controls}>
        <label className={styles.label}>👹 Поиск:</label>
        <input
          className={styles.input}
          type="text"
          placeholder="🔍 Поиск по имени или локации..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className={styles.count}>
          Эпиков: <b>{epics.length}</b> &middot; РБ: <b>{raids.length}</b>
        </div>
      </div>

      {epics.length + raids.length > 0 ? (
        searchQuery.trim() ? (
          renderTable([...epics, ...raids], 'Результаты поиска', '🔍', epicSortAsc, () => setEpicSortAsc(prev => !prev))
        ) : (
          <Fragment>
            {epics.length > 0 && renderTable(epics, 'Эпик боссы', '🔥', epicSortAsc, () => setEpicSortAsc(prev => !prev))}
            {raids.length > 0 && renderTable(raids, 'Рейд-боссы', '👹', raidSortAsc, () => setRaidSortAsc(prev => !prev))}
          </Fragment>
        )
      ) : (
        <div className={styles.emptyState}>Боссы не найдены</div>
      )}
    </div>
  );
}

function BossDetail({ boss }: { boss: RaidBoss }) {
  const hasStats = boss.stats?.hp || false;

  const flatDrops = useMemo(() => {
    if (!boss.drops) return [];
    return boss.drops.flatMap(g =>
      g.items.map(item => ({
        ...item,
        groupChance: g.groupChance,
        effectiveChance: g.groupChance * item.chance / 100,
      }))
    );
  }, [boss.drops]);

  return (
    <div className={styles.detailPanel}>
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

      {flatDrops.length > 0 && (
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
                  <th className={styles.dColGroup}>Группа</th>
                </tr>
              </thead>
              <tbody>
                {flatDrops.map((item, i) => {
                  const isNewGroup = i === 0 || flatDrops[i - 1].groupChance !== item.groupChance;
                  return (
                    <Fragment key={i}>
                      {isNewGroup && (
                        <tr className={styles.dropGroupHeader}>
                          <td colSpan={5}>
                            <span className={styles.groupLabel}>Шанс дропа группы:</span>
                            <span className={styles.groupChance}>{item.groupChance}%</span>
                          </td>
                        </tr>
                      )}
                      <tr>
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
                          {item.grade !== 'NG' ? (
                            <span className={styles.itemGrade}>{item.grade}</span>
                          ) : '—'}
                        </td>
                        <td className={styles.dColAmount}>{item.amount}</td>
                        <td className={styles.dColChance}>
                          <span className={styles.dropChanceVal}>{item.chance}%</span>
                        </td>
                        <td className={styles.dColGroup}>
                          <span className={styles.groupBadge}>{item.groupChance}%</span>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!hasStats && flatDrops.length === 0 && (
        <div className={styles.noData}>Нет данных</div>
      )}
    </div>
  );
}
