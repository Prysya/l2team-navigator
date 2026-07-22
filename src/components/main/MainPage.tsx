import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import SectionIcon from '@shared/SectionIcon';
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
              <SectionIcon tab={tab.key} className={styles.cardIconImg} />
            </span>
            <span className={styles.cardLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      {easter &&
        createPortal(
          // Portal to body: .tab-page's persistent transform would otherwise trap this fixed overlay.
          <div className={styles.overlay} onClick={() => setEaster(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalContent}>
                <span className={styles.eggText}>Саша Ролекс Пес</span>
              </div>
              <button className={styles.closeBtn} onClick={() => setEaster(false)}>
                ✕
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
