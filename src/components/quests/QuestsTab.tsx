import { Fragment, useMemo } from 'react';
import QUEST_DATA from '@data/QUEST_DATA.json';
import { NPC_COORDS } from '@data/quests/npcCoords';
import { PROFESSION_RACES } from '@data/quests/professionRaces';
import { QUEST_DETAILS } from '@data/quests/questDetails';
import { QUEST_IDS } from '@data/quests/questIds';
import { QUESTS_BY_RACE } from '@data/quests/questsByRace';
import { QUEST_STEPS } from '@data/quests/questSteps';
import { SHARED_QUESTS } from '@data/quests/sharedQuests';
import { TEMPLE_EXECUTOR_QUESTS } from '@data/quests/templeExecutorQuests';
import type { Quest, RewardTag } from '@data/quests/types';
import CustomSelect from '@shared/CustomSelect';
import WorldMap from '@shared/WorldMap';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import cx from 'classnames';

import { useQuestStore } from '@/stores/questStore';

import styles from './QuestsTab.module.scss';

type QuestDataEntry = {
  id: number;
  type: string;
  npcId: number | null;
  npcName: string;
  coords: { x: number; y: number } | null;
  steps: string[];
};

export function detectRewardTag(reward: string): RewardTag {
  const r = reward.toLowerCase();
  const hasWeapon =
    /sword|staff|wand|blade|saber|hammer|club|dagger|knife|shield|spellbook|weapon|меч|молот|булава|dagger/i.test(r);
  const hasSoulshot = /soulshot|spiritshot|соск/i.test(r);
  if (hasWeapon && hasSoulshot) return 'both';
  if (hasWeapon) return 'weapon';
  if (hasSoulshot) return 'soulshot';
  if (/aden|a$/i.test(r) && !/exp/i.test(r)) return 'adena';
  if (/exp|xp/i.test(r)) return 'exp';
  return 'other';
}

export function enrichQuest(q: Quest): Quest & {
  npc: string;
  npcId: number;
  location: string;
  startLvl: number;
  endLvl: number;
  questId: number;
  steps: string[];
  coords: { x: number; y: number } | null;
  rewardTag: RewardTag;
} {
  const details = QUEST_DETAILS[q.name];
  const parsed = (QUEST_DATA as Record<string, QuestDataEntry>)[q.name];
  const npcId = details?.npcId ?? q.npcId ?? parsed?.npcId ?? 0;
  const parsedCoords = parsed?.coords ?? null;
  return {
    ...q,
    npc: details?.npc ?? q.npc ?? parsed?.npcName ?? '',
    location: details?.location ?? q.location ?? '',
    npcId,
    startLvl: details?.startLvl ?? q.lvl,
    endLvl: details?.endLvl ?? q.lvl,
    questId: QUEST_IDS[q.name] ?? q.questId ?? parsed?.id ?? 0,
    steps: QUEST_STEPS[q.name] ?? parsed?.steps ?? q.steps ?? [],
    coords: NPC_COORDS[npcId] ?? parsedCoords,
    rewardTag: detectRewardTag(q.reward),
  };
}

const RACES = [
  'Human Mage',
  'Human Fighter',
  'Elf',
  'Dark Elf',
  'Orc Fighter',
  'Orc Shaman',
  'Dwarf',
  'Dwarf Mage',
] as const;
type Race = (typeof RACES)[number];

type QuestCategory = 'racial' | 'profession' | 'temple';

const CATEGORIES: { key: QuestCategory; label: string }[] = [
  { key: 'racial', label: 'Расовые квесты' },
  { key: 'profession', label: 'Профессии' },
  { key: 'temple', label: 'Цепочка палач храма' },
];

type ProfType = 'first' | 'second';

const columnHelper = createColumnHelper<Quest>();

export default function QuestsTab() {
  const category = useQuestStore((s) => s.category);
  const setCategory = useQuestStore((s) => s.setCategory);
  const selectedRace = useQuestStore((s) => s.selectedRace);
  const setSelectedRace = useQuestStore((s) => s.setSelectedRace);
  const profRace = useQuestStore((s) => s.profRace);
  const setProfRace = useQuestStore((s) => s.setProfRace);
  const profType = useQuestStore((s) => s.profType);
  const setProfType = useQuestStore((s) => s.setProfType);
  const selectedClass = useQuestStore((s) => s.selectedClass);
  const setSelectedClass = useQuestStore((s) => s.setSelectedClass);
  const expanded = useQuestStore((s) => s.expanded);
  const toggleRow = useQuestStore((s) => s.toggleRow);
  const mapNpc = useQuestStore((s) => s.mapNpc);
  const setMapNpc = useQuestStore((s) => s.setMapNpc);

  const categoryData = useMemo(() => {
    if (category === 'racial') {
      const raceQuests = QUESTS_BY_RACE[selectedRace] ?? [];
      return [...raceQuests, ...SHARED_QUESTS];
    }
    if (category === 'temple') return TEMPLE_EXECUTOR_QUESTS;
    return [];
  }, [category, selectedRace]);

  const filtered = useMemo(() => {
    let quests = categoryData;
    if (category === 'profession') {
      const raceData = PROFESSION_RACES.find((r) => r.race === profRace);
      if (!raceData) return [];
      const classInfo = raceData.classes.find((c) => c.name === selectedClass);
      if (!classInfo) return [];
      quests = [];
      if (classInfo.quest1) {
        quests.push({ lvl: 18, name: classInfo.quest1, desc: 'Первая профессия', reward: '' });
      }
      if (classInfo.quest2) {
        quests.push({ lvl: 18, name: classInfo.quest2, desc: 'Вторая профессия', reward: '' });
      }
      if (classInfo.quest3in1) {
        quests.push({ lvl: 35, name: classInfo.quest3in1, desc: '3 in 1 профессия', reward: '' });
      }
    }
    return quests.map(enrichQuest).sort((a, b) => a.lvl - b.lvl || a.name.localeCompare(b.name));
  }, [category, categoryData, profRace, selectedClass]);

  const hasNotes = useMemo(() => filtered.some((q) => q.note), [filtered]);

  const noteColumn = useMemo(
    () =>
      hasNotes
        ? columnHelper.accessor('note' as const, {
            header: 'Примечание',
            enableSorting: false,
            cell: ({ getValue }) => (getValue() ? <span className={styles.noteCell}>{getValue()}</span> : null),
          })
        : null,
    [hasNotes],
  );

  const columns = useMemo(() => {
    const cols = [
      columnHelper.display({
        id: 'expand',
        header: '',
        cell: ({ row }) => {
          const name = (row.original as Quest).name;
          return <span style={{ cursor: 'pointer', userSelect: 'none' }}>{expanded.has(name) ? '▼' : '▶'}</span>;
        },
      }),
      columnHelper.accessor('lvl', {
        header: 'Ур.',
        cell: ({ getValue }) => <span className={styles.lvlBadge}>{getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: 'Квест',
        enableSorting: false,
        cell: ({ getValue, row }) => {
          const tag = (row.original as Quest).rewardTag;
          return (
            <span className={styles.questName}>
              {category === 'racial' && (tag === 'soulshot' || tag === 'both') && (
                <span className={styles.tagSoulshot}>🔥 </span>
              )}
              {getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor('desc', {
        header: 'Зачем',
        enableSorting: false,
      }),
      columnHelper.accessor('reward', {
        header: 'Награда',
        enableSorting: false,
        cell: ({ getValue }) => getValue() || '—',
      }),
    ];
    if (noteColumn) cols.push(noteColumn);
    return cols;
  }, [noteColumn, expanded, category]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.field}>
          <CustomSelect
            label="Категория"
            value={category}
            onChange={(v) => setCategory(v as QuestCategory)}
            options={CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
          />
        </div>
        {category === 'racial' && (
          <div className={styles.field}>
            <CustomSelect
              label="Раса"
              value={selectedRace}
              onChange={(v) => setSelectedRace(v as Race)}
              options={RACES.map((r) => ({ value: r, label: r }))}
            />
          </div>
        )}
        {category === 'profession' && (
          <>
            <div className={styles.field}>
              <CustomSelect
                label="Раса"
                value={profRace}
                onChange={(v) => {
                  setProfRace(v);
                  setSelectedClass('');
                }}
                options={PROFESSION_RACES.map((r) => ({ value: r.race, label: r.race }))}
              />
            </div>
            <div className={styles.field}>
              <CustomSelect
                label="Профессия"
                value={profType}
                onChange={(v) => {
                  setProfType(v as ProfType);
                  setSelectedClass('');
                }}
                options={[
                  { value: 'first', label: '1-я профессия' },
                  { value: 'second', label: '2-я профессия' },
                ]}
              />
            </div>
            <div className={styles.field}>
              <CustomSelect
                label="Класс"
                value={selectedClass}
                onChange={(v) => setSelectedClass(v)}
                options={
                  PROFESSION_RACES.find((r) => r.race === profRace)
                    ?.classes.filter((c) => (profType === 'second' ? c.quest3in1 : !c.quest3in1))
                    .map((c) => ({ value: c.name, label: c.name })) ?? []
                }
              />
            </div>
          </>
        )}
      </div>

      {category === 'racial' && (
        <div className={styles.legend}>
          <span className={styles.legendTitle}>Обязательные к выполнению:</span>
          <span className={styles.legendItem}>
            <span className={styles.tagSoulshot}>🔥</span>
          </span>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const q = row.original as Quest;
              const eq = q as ReturnType<typeof enrichQuest>;
              const colSpan = row.getVisibleCells().length;
              return (
                <Fragment key={row.id}>
                  <tr
                    onClick={() => toggleRow(q.name)}
                    className={cx(
                      category === 'racial' &&
                        (eq.rewardTag === 'soulshot' || eq.rewardTag === 'both') &&
                        styles.rowSoulshot,
                    )}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                  {expanded.has(q.name) && (
                    <tr className={styles.detailRow}>
                      <td colSpan={colSpan} className={styles.detailCell}>
                        <div className={styles.detailCard}>
                          <div className={styles.detailHeader}>
                            <span className={styles.detailQuestName}>{eq.name}</span>
                            {eq.questId && eq.questId > 0 && (
                              <a
                                href={`https://mw2.wiki/lu4/quest/${eq.questId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.wikiLink}
                              >
                                mw2.wiki ↗
                              </a>
                            )}
                          </div>
                          <div className={styles.detailGrid}>
                            {eq.npc && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>NPC:</span> {eq.npc}
                              </div>
                            )}
                            {eq.location && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Локация:</span> {eq.location}
                              </div>
                            )}
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>Уровни:</span> {eq.startLvl}–{eq.endLvl}
                            </div>
                            {eq.desc && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Описание:</span> {eq.desc}
                              </div>
                            )}
                            {eq.reward && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Награда:</span> {eq.reward}
                              </div>
                            )}
                          </div>
                          {eq.coords && eq.npcId > 0 && NPC_COORDS[eq.npcId] && (
                            <button
                              className={styles.mapBtn}
                              onClick={() => {
                                const c = NPC_COORDS[eq.npcId];
                                setMapNpc({ name: eq.name, x: c.x, y: c.y });
                              }}
                            >
                              📍 Показать на карте
                            </button>
                          )}
                          {(eq.steps && eq.steps.length > 0) || (eq.questId && eq.questId > 0) ? (
                            <div className={styles.stepsSection}>
                              <div className={styles.stepsTitle}>📋 Прохождение</div>
                              {eq.steps && eq.steps.length > 0 ? (
                                eq.steps.map((step, i) => (
                                  <div key={i} className={styles.stepItem}>
                                    {step}
                                  </div>
                                ))
                              ) : (
                                <div className={styles.stepItem}>
                                  Полное описание прохождения на{' '}
                                  <a
                                    href={`https://mw2.wiki/lu4/quest/${eq.questId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.wikiLinkInline}
                                  >
                                    mw2.wiki ↗
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : null}
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
    </div>
  );
}
