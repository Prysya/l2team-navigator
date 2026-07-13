import cx from 'classnames';
import { useRef, useLayoutEffect } from 'react';
import type { FC } from 'react';
import styles from './TabBar.module.scss';

interface TabBarProps {
  tabs: readonly { key: string; icon: string; label: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

const TabBar: FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = tabsRef.current;
    const slider = sliderRef.current;
    if (!container || !slider) return;
    const activeBtn = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (!activeBtn) return;
    slider.style.setProperty('--left', `${activeBtn.offsetLeft}px`);
    slider.style.setProperty('--width', `${activeBtn.offsetWidth}px`);
  }, [activeTab]);

  return (
    <div className={styles.tabs} ref={tabsRef}>
      <div className={styles.slider} ref={sliderRef} />
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={cx(styles.tabBtn, activeTab === tab.key && styles.active)}
          data-tab={tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;
