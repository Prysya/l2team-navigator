import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@shared/Toast';

import { useTelegramStore } from '@/stores/telegramStore';

import styles from './DebugModal.module.scss';

interface Props {
  onClose: () => void;
}

export default function DebugModal({ onClose }: Props) {
  const store = useTelegramStore.getState();
  const [toast, setToast] = useState('');

  const info = useMemo(() => {
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.split('?')[1] || hash);

    const lines: string[] = [];
    lines.push('=== System Info ===');
    lines.push(`URL: ${window.location.href}`);
    lines.push(`Hash: ${hash}`);
    lines.push(`User Agent: ${navigator.userAgent}`);
    lines.push('');
    lines.push('=== Telegram Store ===');
    lines.push(
      JSON.stringify(
        {
          isTelegram: store.isTelegram,
          platform: store.platform,
          user: store.user,
          themeParams: store.themeParams,
          clanCheckResult: store.clanCheckResult,
          clanCheckLoading: store.clanCheckLoading,
          clanCheckError: store.clanCheckError,
        },
        null,
        2,
      ),
    );
    lines.push('');
    lines.push('=== Hash Params ===');
    for (const [k, v] of hashParams.entries()) {
      lines.push(`${k}: ${v}`);
    }
    lines.push('');
    lines.push('=== App State ===');
    lines.push(`BASE_URL: ${import.meta.env.BASE_URL}`);
    lines.push(`VITE_TELEGRAM_API_URL: ${import.meta.env.VITE_TELEGRAM_API_URL}`);

    return lines.join('\n');
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
