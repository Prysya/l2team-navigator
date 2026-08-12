import { Fragment, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BOMZH_GUIDE } from '@data/guide/bomzhGuide';
import { QUESTS_BY_RACE } from '@data/quests/questsByRace';
import { SHARED_QUESTS } from '@data/quests/sharedQuests';
import WorldMap from '@shared/WorldMap';
import { enrichQuest, questUrl } from '@utils/quests';
import cx from 'classnames';

import { useGuideStore } from '@/stores/guideStore';

import styles from './GuideTab.module.scss';

export default function GuideTab() {
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [mapNpc, setMapNpc] = useState<{ name: string; x: number; y: number } | null>(null);
  const expanded = useGuideStore((s) => s.expanded);
  const toggleExpanded = useGuideStore((s) => s.toggleExpanded);
  const infoOpen = useGuideStore((s) => s.infoOpen);
  const toggleInfo = useGuideStore((s) => s.toggleInfo);

  const rewardMap = useMemo(() => {
    const m = new Map<string, string>();
    Object.values(QUESTS_BY_RACE).forEach((list) => list.forEach((q) => m.set(q.name, q.reward)));
    SHARED_QUESTS.forEach((q) => m.set(q.name, q.reward));
    return m;
  }, []);

  const rows = useMemo(
    () =>
      BOMZH_GUIDE.quests.map((guide) => ({
        guide,
        quest: enrichQuest({
          lvl: guide.lvl,
          name: guide.enName,
          desc: '',
          reward: rewardMap.get(guide.enName) ?? guide.reward ?? '',
        }),
      })),
    [rewardMap],
  );

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>{BOMZH_GUIDE.title}</h2>
        <div className={styles.meta}>
          <span className={styles.author}>Автор: {BOMZH_GUIDE.author}</span>
          <a className={styles.sourceLink} href={BOMZH_GUIDE.sourceUrl} target="_blank" rel="noopener noreferrer">
            Источник: L2E-Global Forum ↗
          </a>
        </div>
        <div className={styles.intro}>
          {BOMZH_GUIDE.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colExpand} />
              <th className={styles.colNum}>№</th>
              <th>Квест</th>
              <th className={styles.colLvl}>Ур.</th>
              <th>Награда (по гайду)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ guide, quest }) => {
              const rowOpen = expanded.has(guide.enName);
              const infoOpenHere = infoOpen.has(guide.enName);
              return (
                <Fragment key={guide.id}>
                  <tr className={styles.row} onClick={() => toggleExpanded(guide.enName)}>
                    <td className={styles.colExpand}>
                      <span className={styles.expandIcon}>{rowOpen ? '▼' : '▶'}</span>
                    </td>
                    <td className={styles.colNum}>
                      <span className={styles.numBadge}>{guide.id}</span>
                    </td>
                    <td>
                      <div className={styles.questName}>{guide.name}</div>
                      {guide.note && <div className={styles.questNote}>{guide.note}</div>}
                    </td>
                    <td className={styles.colLvl}>
                      <span className={styles.lvlBadge}>{guide.lvl}</span>
                    </td>
                    <td className={styles.rewardCell}>{guide.reward || '—'}</td>
                  </tr>
                  {rowOpen && (
                    <tr className={styles.detailRow}>
                      <td colSpan={5} className={styles.detailCell}>
                        <div className={styles.detailCard}>
                          <div className={styles.sectionTitle}>📜 Из гайда</div>
                          <div className={styles.guideSteps}>
                            {guide.steps.map((step, i) => (
                              <div key={i} className={styles.guideStep}>
                                {step}
                              </div>
                            ))}
                          </div>

                          <button
                            className={cx(styles.accordionBtn, { [styles.accordionOpen]: infoOpenHere })}
                            onClick={() => toggleInfo(guide.enName)}
                          >
                            <span className={styles.accordionIcon}>{infoOpenHere ? '▾' : '▸'}</span>
                            ℹ️ Информация о квесте
                          </button>

                          {infoOpenHere && (
                            <div className={styles.questInfo}>
                              <div className={styles.infoTop}>
                                {quest.npc && (
                                  <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>NPC:</span> {quest.npc}
                                  </div>
                                )}
                                {quest.questId > 0 && (
                                  <a
                                    href={questUrl(quest.name, quest.questId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.wikiLink}
                                  >
                                    mw2.wiki ↗
                                  </a>
                                )}
                              </div>
                              <div className={styles.infoGrid}>
                                {quest.location && (
                                  <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Локация:</span> {quest.location}
                                  </div>
                                )}
                                <div className={styles.infoItem}>
                                  <span className={styles.infoLabel}>Уровни:</span> {quest.startLvl}–{quest.endLvl}
                                </div>
                                {quest.reward && (
                                  <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Награда:</span> {quest.reward}
                                  </div>
                                )}
                              </div>

                              {quest.coords && quest.npcId > 0 && (
                                <button
                                  className={styles.mapBtn}
                                  onClick={() => {
                                    const c = quest.coords;
                                    if (c) setMapNpc({ name: quest.npc, x: c.x, y: c.y });
                                  }}
                                >
                                  📍 Показать на карте
                                </button>
                              )}

                              {quest.images && quest.images.length > 0 && (
                                <div className={styles.imagesSection}>
                                  <div className={styles.sectionTitle}>👤 Ключевые НПС</div>
                                  <div className={styles.images}>
                                    {quest.images.map((img, i) => (
                                      <div
                                        key={i}
                                        className={styles.imageLink}
                                        onClick={() => setPreviewImg(`${import.meta.env.BASE_URL}images/quests/${img}`)}
                                      >
                                        <img
                                          src={`${import.meta.env.BASE_URL}images/quests/${img}`}
                                          alt={`${quest.npc} ${i + 1}`}
                                          className={styles.image}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {quest.steps && quest.steps.length > 0 && (
                                <div className={styles.stepsSection}>
                                  <div className={styles.sectionTitle}>📋 Прохождение (mw2.wiki)</div>
                                  {quest.steps.map((step, i) => (
                                    <div key={i} className={styles.stepItem}>
                                      {step}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {mapNpc && <WorldMap name={mapNpc.name} x={mapNpc.x} y={mapNpc.y} onClose={() => setMapNpc(null)} />}

      {previewImg &&
        createPortal(
          <div className={styles.previewOverlay} onClick={() => setPreviewImg(null)}>
            <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
              <button className={styles.previewClose} onClick={() => setPreviewImg(null)}>
                ✕
              </button>
              <img src={previewImg} alt="NPC preview" className={styles.previewImage} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
