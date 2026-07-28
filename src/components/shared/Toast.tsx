import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';

import styles from './Toast.module.scss';

interface ToastProps {
  message: string;
  onDone: () => void;
  duration?: number;
}

export default function Toast({ message, onDone, duration = 2500 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    let innerTimer: ReturnType<typeof setTimeout>;
    const outerTimer = setTimeout(() => {
      setVisible(false);
      innerTimer = setTimeout(onDone, 300);
    }, duration);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(outerTimer);
      clearTimeout(innerTimer);
    };
  }, [onDone, duration]);

  return createPortal(<div className={cx(styles.toast, visible && styles.visible)}>{message}</div>, document.body);
}
