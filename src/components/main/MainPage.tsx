import { useNavigate } from 'react-router-dom';
import { TAB_NAMES } from '../../utils/constants';
import styles from './MainPage.module.scss';

export default function MainPage() {
  const navigate = useNavigate();
  const visibleTabs = TAB_NAMES;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>L2team Navigator</h2>
      <p className={styles.subtitle}>Выберите раздел</p>
      <div className={styles.grid}>
        {visibleTabs.map(tab => (
          <button
            key={tab.key}
            className={styles.card}
            onClick={() => navigate('/' + tab.key)}
          >
            <span className={styles.cardIcon}>{tab.icon}</span>
            <span className={styles.cardLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
