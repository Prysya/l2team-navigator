import type { FC } from 'react';

import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  message: string;
  icon?: string;
}

const EmptyState: FC<EmptyStateProps> = ({ message, icon }) => (
  <div className={styles.empty}>
    {icon && <span className={styles.icon}>{icon}</span>}
    <p className={styles.message}>{message}</p>
  </div>
);

export default EmptyState;
