import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@shared/Modal';
import TabIcon from '@shared/TabIcon';
import { TAB_ACCENT, TAB_NAMES } from '@utils/constants';

import styles from './MainPage.module.scss';

const KONAMI = 'iddqd';

export default function MainPage() {
  const navigate = useNavigate();
  const visibleTabs = TAB_NAMES;
  const [easter, setEaster] = useState(false);
  const buf = useRef('');

  const handleKey = useCallback((e: KeyboardEvent) => {
    buf.current += e.key.toLowerCase();
    if (buf.current.length > KONAMI.length) {
      buf.current = buf.current.slice(-KONAMI.length);
    }
    if (buf.current === KONAMI) {
      setEaster(true);
      buf.current = '';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className={styles.page}>
      <p className={styles.subtitle}>Выберите раздел</p>
      <div className={styles.grid}>
        {visibleTabs.map((tab, idx) => (
          <button
            key={tab.key}
            className={styles.card}
            style={
              {
                '--card-accent': TAB_ACCENT[tab.key],
                '--card-index': idx,
              } as React.CSSProperties
            }
            onClick={() => navigate('/' + tab.key)}
          >
            <span className={styles.cardIcon}>
              <TabIcon tab={tab.key} size={40} />
            </span>
            <span className={styles.cardLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      {easter && (
        <Modal isOpen={easter} onClose={() => setEaster(false)}>
          <div className={styles.modalContent}>
            <span className={styles.eggText}>Саша Ролекс Пес</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
