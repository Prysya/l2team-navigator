import type { FC } from 'react';
import { formatChance, generateComment, isBossMon } from '@utils/helpers';

import type { Monster, MonsterLocation } from '@/types';

export const MonsterNameCell: FC<{ monster: Monster }> = ({ monster: m }) => {
  const name = m.monster_name;
  return (
    <div>
      {m.monster_url ? (
        <a className="monster-name" href={m.monster_url} target="_blank" rel="noopener noreferrer">
          {name}
        </a>
      ) : (
        <span className="monster-name">{name}</span>
      )}
      <div className="monster-badges">
        {m.monster_lvl && <span className="stat-badge stat-lvl">Lvl {m.monster_lvl}</span>}{' '}
        {m.monster_x && <span className="stat-badge stat-hp">HP {m.monster_x}</span>}{' '}
        {m.monster_respawn && (
          <span className="stat-badge stat-resp">
            ⏱ Респ: {m.monster_respawn.replace(/seconds?/gi, 'с').replace(/minutes?/gi, 'м')}
          </span>
        )}{' '}
        {isBossMon(m) && <span className="stat-badge stat-boss">💀 BOSS</span>}
      </div>
    </div>
  );
};

const LOC_TYPE_MAP: Record<string, string> = {
  S: 'Одиночный (solo)',
  SG: 'Минигруппа (small group)',
  G: 'Полная группа (group)',
};

export const MonsterLocationsCell: FC<{ locations: MonsterLocation[] }> = ({ locations }) => {
  if (!locations || locations.length === 0) {
    return <span className="text-muted">—</span>;
  }
  return (
    <>
      {locations.map((loc, i) => {
        const mainName = loc.main_location_name || loc.location_name;
        const subName = loc.main_location_name ? loc.location_name : '';
        const typesArr = Array.isArray(loc.location_type)
          ? loc.location_type
          : loc.location_type
            ? [loc.location_type]
            : [];
        return (
          <div key={i} className="location-tag">
            <span className="main-loc">{mainName}</span>
            {subName && <span className="sub-loc">→ {subName}</span>}
            {typesArr.length > 0 && (
              <span className="type">
                [
                {typesArr.map((t: string, j: number) => (
                  <span key={j} data-tooltip={LOC_TYPE_MAP[t] ?? t} title={LOC_TYPE_MAP[t] ?? t}>
                    {j > 0 && ', '}
                    {t}
                  </span>
                ))}
                ]
              </span>
            )}
          </div>
        );
      })}
    </>
  );
};

export const MonsterDropCell: FC<{ dropChance: number }> = ({ dropChance }) => {
  const drop = formatChance(dropChance);
  return <span className={`chance chance-drop ${drop.cls}`}>{drop.text}</span>;
};

export const MonsterSpoilCell: FC<{ spoilChance: number }> = ({ spoilChance }) => {
  const spoil = formatChance(spoilChance);
  return <span className={`chance chance-spoil ${spoil.cls}`}>{spoil.text}</span>;
};

export const MonsterCommentCell: FC<{ monster: Monster }> = ({ monster }) => {
  const commentData = generateComment(monster);
  if (commentData.length === 0) return null;
  return (
    <>
      {commentData.map((c, i) => (
        <div key={i} className={`rec-item ${c.methodClass}`}>
          <div className="method">{c.method}</div>
          <div className={`party-size ${c.partySizeClass}`}>{c.partySize}</div>
        </div>
      ))}
    </>
  );
};

export function monsterCells(m: Monster) {
  return {
    monsterCell: <MonsterNameCell monster={m} />,
    locationsCell: <MonsterLocationsCell locations={m.locations} />,
    dropCell: <MonsterDropCell dropChance={m.drop_chance} />,
    spoilCell: <MonsterSpoilCell spoilChance={m.spoil_chance} />,
    commentCell: <MonsterCommentCell monster={m} />,
  };
}
