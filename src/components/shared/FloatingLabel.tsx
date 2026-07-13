import cx from 'classnames';
import type { ReactNode } from 'react';
import styles from './FloatingLabel.module.scss';

interface FloatingLabelProps {
  label: string;
  value: string;
  children: ReactNode;
  className?: string;
}

export default function FloatingLabel({ label, value, children, className }: FloatingLabelProps) {
  return (
    <div className={cx(styles.wrapper, value && styles.hasValue, className)}>
      {children}
      <span className={styles.label}>{label}</span>
    </div>
  );
}
