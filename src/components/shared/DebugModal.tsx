import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@shared/Toast';

import { useTelegramStore } from '@/stores/telegramStore';

import pkg from '../../../package.json';

import styles from './DebugModal.module.scss';

interface Props {
  onClose: () => void;
}

export default function DebugModal({ onClose }: Props) {
  const store = useTelegramStore.getState();
  const [toast, setToast] = useState('');

  const info = useMemo(() => {
    const hash = window.location.hash;
    const cleanHash = hash.replace(/^[#?]/, '');
    const hashParams = new URLSearchParams(cleanHash);
    const searchParams = new URLSearchParams(window.location.search);

    const data: Record<string, unknown> = {
      version: pkg.version,
      url: window.location.href,
      hash,
      search: window.location.search,
      userAgent: navigator.userAgent,
      searchParams: Object.fromEntries(searchParams.entries()),
      hashParams: Object.fromEntries(hashParams.entries()),
      telegramStore: {
        isTelegram: store.isTelegram,
        platform: store.platform,
        user: store.user,
        themeParams: store.themeParams,
        clanCheckResult: store.clanCheckResult,
        clanCheckLoading: store.clanCheckLoading,
        clanCheckError: store.clanCheckError,
      },
      env: {
        BASE_URL: import.meta.env.BASE_URL,
        VITE_TELEGRAM_API_URL: import.meta.env.VITE_TELEGRAM_API_URL,
        VITE_ADMIN_ID: import.meta.env.VITE_ADMIN_ID,
        VITE_TELEGRAM_API_TOKEN: import.meta.env.VITE_TELEGRAM_API_TOKEN ? '***' : undefined,
      },
    };

    return JSON.stringify(data, null, 2);
  }, [store]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(info);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = info;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setToast('Скопировано');
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>🐛 Debug Info</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <pre className={styles.content}>{info}</pre>
        <button className={styles.copyBtn} onClick={handleCopy}>
          📋 Копировать
        </button>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>,
    document.body,
  );
}
