import type { FC } from 'react';
import styles from './TabBar.module.scss';

interface TabBarProps {
  tabs: readonly { key: string; label: string; short: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

const TabBar: FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tabBtn} ${activeTab === tab.key ? styles.active : ''}`}
          data-tab={tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="full-text">{tab.label}</span>
          <span className="short-text">{tab.short}</span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;
