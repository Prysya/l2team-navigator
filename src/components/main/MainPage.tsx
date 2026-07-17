import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabIcon from '@shared/TabIcon';
import { TAB_ACCENT, TAB_NAMES } from '@utils/constants';

import styles from './MainPage.module.scss';

const KONAMI = 'iddqd';

export default function MainPage() {
  const navigate = useNavigate();
  const visibleTabs = TAB_NAMES;
  const [easter, setEaster] = useState(false);
  const buf = useRef('');
  const [searchValue, setSearchValue] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim().toLowerCase();
    if (!q) return;
    const found = visibleTabs.find((t) => {
      const label = t.label.toLowerCase();
      return label.includes(q) || t.key.includes(q);
    });
    if (found) {
      navigate('/' + found.key);
    }
  };

  const filteredTabs = searchValue.trim()
    ? visibleTabs.filter((t) => {
        const q = searchValue.toLowerCase();
        return t.label.toLowerCase().includes(q) || t.key.includes(q);
      })
    : visibleTabs;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>L2team Database</h1>
        <p className={styles.subtitle}>Энциклопедия Lineage 2 — рецепты, рейд-боссы, скиллы, квесты и многое другое</p>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Поиск по разделам…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button className={styles.searchBtn} type="submit">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </div>

      <div className={styles.grid}>
        {(searchValue.trim() ? filteredTabs : visibleTabs).map((tab, idx) => (
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
        <div className={styles.overlay} onClick={() => setEaster(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalContent}>
              <span className={styles.eggText}>Саша Ролекс Пес</span>
            </div>
            <button className={styles.closeBtn} onClick={() => setEaster(false)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
