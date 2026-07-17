import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import cx from 'classnames';

import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = contentRef.current;
    if (!el) return;
    const touchY = e.touches[0].clientY;
    const rect = el.getBoundingClientRect();
    (el as unknown as Record<string, unknown>)._swipeY = touchY;
    (el as unknown as Record<string, unknown>)._swipePinned = rect.top > 60 || el.scrollTop > 5;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const el = contentRef.current;
    if (!el) return;
    const pinned = (el as unknown as Record<string, unknown>)._swipePinned as boolean;
    if (pinned) return;
    const startY = (el as unknown as Record<string, unknown>)._swipeY as number;
    if (startY === undefined) return;
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) {
      e.preventDefault();
      el.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const el = contentRef.current;
      if (!el) return;
      const startY = (el as unknown as Record<string, unknown>)._swipeY as number;
      const pinned = (el as unknown as Record<string, unknown>)._swipePinned as boolean;
      if (startY === undefined || pinned) {
        el.style.transform = '';
        return;
      }
      const delta = e.changedTouches[0].clientY - startY;
      el.style.transform = '';
      if (delta > 100) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={contentRef}
        className={cx(styles.modal, styles[size])}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.header}>
          {title && <span className={styles.title}>{title}</span>}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
