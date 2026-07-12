import { useMemo, type FC } from 'react';
import type { Monster, ResourceMaterial } from '../../types';
import { sortMonsters, renderMonsterRow } from '../../utils/helpers';
import styles from './MonsterTable.module.scss';

interface MonsterTableProps {
  monsters: Monster[];
  showMaterial?: boolean;
  material?: ResourceMaterial;
}

const MonsterTable: FC<MonsterTableProps> = ({ monsters, showMaterial, material }) => {
  const rows = useMemo(() => {
    const sorted = sortMonsters(monsters);
    return sorted.map((m) => renderMonsterRow(m));
  }, [monsters]);

  if (monsters.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <table className="monster-table">
        <thead>
          <tr>
            <th>Monster</th>
            <th>Location</th>
            <th>Drop</th>
            <th>Spoil</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td dangerouslySetInnerHTML={{ __html: row.monsterCell }} />
              <td dangerouslySetInnerHTML={{ __html: row.locationsCell }} />
              <td dangerouslySetInnerHTML={{ __html: row.dropCell }} />
              <td dangerouslySetInnerHTML={{ __html: row.spoilCell }} />
              <td dangerouslySetInnerHTML={{ __html: row.commentCell }} />
            </tr>
          ))}
        </tbody>
      </table>
      {showMaterial && material && (
        <div className="material-section">
          <h3>Material: {material.name}</h3>
        </div>
      )}
    </div>
  );
};

export default MonsterTable;
