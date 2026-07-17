import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import cx from 'classnames';

import styles from './BottomSheet.module.scss';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: 'auto' | 'half' | 'full';
}

export default function BottomSheet({ isOpen, onClose, title, children, height = 'auto' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true;
    startY.current = e.touches[0].clientY;
    currentY.current = 0;
    const el = sheetRef.current;
    if (el) el.style.transition = 'none';
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta < 0) return;
    currentY.current = delta;
    const el = sheetRef.current;
    if (el) el.style.transform = `translateY(${delta}px)`;
  }, []);

  const handleTouchEnd = useCallback(() => {
    dragging.current = false;
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    if (currentY.current > 100) {
      onClose();
    } else {
      el.style.transform = '';
    }
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div className={cx(styles.overlay, isOpen && styles.open)} onClick={handleOverlayClick}>
      <div
        ref={sheetRef}
        className={cx(styles.sheet, styles[height])}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.handle}>
          <div className={styles.handleBar} />
        </div>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
