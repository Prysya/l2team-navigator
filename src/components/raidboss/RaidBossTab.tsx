import { Fragment, useCallback, useEffect, useMemo } from 'react';
import RAIDBOSSES from '@data/RAIDBOSSES.json';
import CopyLink from '@shared/CopyLink';
import EmptyState from '@shared/EmptyState';
import FloatingLabel from '@shared/FloatingLabel';
import Modal from '@shared/Modal';
import WorldMap from '@shared/WorldMap';
import { goal } from '@utils/metrics';
import cx from 'classnames';

import { useRaidBossStore } from '@/stores/raidBossStore';
import type { RaidBoss } from '@/types';

import styles from './RaidBossTab.module.scss';

const BOSSES = RAIDBOSSES as RaidBoss[];
const BASE = import.meta.env.BASE_URL;

export function formatNum(s: string | null): string {
  if (!s) return '–';
  return Number(s).toLocaleString('ru');
}

export const isEpic = (b: RaidBoss) => b.respawn && b.respawn.includes('Фиксированное');

export default function RaidBossTab() {
  const searchQuery = useRaidBossStore((s) => s.searchQuery);
  const mapBoss = useRaidBossStore((s) => s.mapBoss);
  const previewBoss = useRaidBossStore((s) => s.previewBoss);
  const selectedBoss = useRaidBossStore((s) => s.selectedBoss);
  const setSearchQuery = useRaidBossStore((s) => s.setSearchQuery);
  const setMapBoss = useRaidBossStore((s) => s.setMapBoss);
  const setPreviewBoss = useRaidBossStore((s) => s.setPreviewBoss);
  const setSelectedBoss = useRaidBossStore((s) => s.setSelectedBoss);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bossName = params.get('boss');
    if (bossName) {
      const decoded = decodeURIComponent(bossName);
      setSearchQuery(decoded);
      const boss = BOSSES.find((b) => b.name.toLowerCase() === decoded.toLowerCase());
      if (boss) {
        setSelectedBoss(boss);
        goal('boss_expand');
        setTimeout(() => {
          const el = document.getElementById('boss-' + boss.name + boss.level);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [setSearchQuery, setSelectedBoss]);

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

  const handleCardClick = useCallback(
    (boss: RaidBoss) => {
      setSelectedBoss(boss);
      goal('boss_expand');
    },
    [setSelectedBoss],
  );

  const handleShowMap = useCallback(
    (boss: RaidBoss) => {
      setSelectedBoss(null);
      setMapBoss(boss);
    },
    [setSelectedBoss, setMapBoss],
  );

  const handleShowImage = useCallback(
    (boss: RaidBoss) => {
      setSelectedBoss(null);
      setPreviewBoss(boss);
    },
    [setSelectedBoss, setPreviewBoss],
  );

  function BossCardGrid({ bosses, title, icon }: { bosses: RaidBoss[]; title: string; icon: string }) {
    if (bosses.length === 0) return null;
    return (
      <Fragment>
        <div className={styles.sectionTitle}>
          {icon} {title} ({bosses.length})
        </div>
        <div className={styles.grid}>
          {bosses.map((boss) => {
            const id = boss.name + boss.level;
            return (
              <div
                key={id}
                id={'boss-' + id}
                className={cx(styles.card, { [styles.cardEpic]: isEpic(boss) })}
                onClick={() => handleCardClick(boss)}
              >
                <div className={styles.cardImageWrap}>
                  {boss.image ? (
                    <img className={styles.cardImage} src={`${BASE}${boss.image}`} alt={boss.name} loading="lazy" />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>👹</div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardName}>
                    {boss.name}
                    <CopyLink
                      getUrl={() => window.location.origin + BASE + 'raidboss?boss=' + encodeURIComponent(boss.name)}
                    />
                  </div>
                  <div className={styles.cardTags}>
                    <span className={cx(styles.cardTag, styles.tagLvl)}>Ур. {boss.level}</span>
                    <span
                      className={cx(styles.cardTag, {
                        [styles.tagRespFixed]: isEpic(boss),
                        [styles.tagResp]: !isEpic(boss),
                      })}
                    >
                      ⏱ {boss.respawn}
                    </span>
                    {boss.location && <span className={cx(styles.cardTag, styles.tagLoc)}>📍 {boss.location}</span>}
                  </div>
                </div>
              </div>
            );
          })}
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
          <BossCardGrid bosses={[...epics, ...raids]} title="Результаты поиска" icon="🔍" />
        ) : (
          <Fragment>
            <BossCardGrid bosses={epics} title="Эпик боссы" icon="🔥" />
            <BossCardGrid bosses={raids} title="Рейд-боссы" icon="👹" />
          </Fragment>
        )
      ) : (
        <EmptyState message="Боссы не найдены" />
      )}

      {selectedBoss && (
        <Modal isOpen={!!selectedBoss} onClose={() => setSelectedBoss(null)} title={selectedBoss.name} size="lg">
          <BossDetail
            boss={selectedBoss}
            onShowMap={selectedBoss.coords ? () => handleShowMap(selectedBoss) : undefined}
            onShowImage={selectedBoss.image ? () => handleShowImage(selectedBoss) : undefined}
          />
        </Modal>
      )}

      {mapBoss && mapBoss.coords && (
        <WorldMap name={mapBoss.name} x={mapBoss.coords.x} y={mapBoss.coords.y} onClose={() => setMapBoss(null)} />
      )}

      {previewBoss && (
        <Modal isOpen={!!previewBoss} onClose={() => setPreviewBoss(null)} title={previewBoss.name} size="sm">
          <div className={styles.imgPreviewBody}>
            <img className={styles.imgPreviewImage} src={`${BASE}${previewBoss.image}`} alt={previewBoss.name} />
          </div>
        </Modal>
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
            <img className={styles.bossImage} src={`${BASE}${boss.image}`} alt={boss.name} loading="lazy" />
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
                  <div key={label} className={styles.statItem}>
                    <span className={styles.statLabel}>{label}</span>
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
