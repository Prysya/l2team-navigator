import { useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@shared/Toast';
import { isActualTelegram } from '@utils/telegram';

import styles from './DebugModal.module.scss';

interface Props {
  onClose: () => void;
}

function telegramState(): Record<string, unknown> {
  const w = window as unknown as Record<string, unknown>;
  const telegram = w.Telegram as Record<string, unknown> | undefined;
  const webapp = telegram?.WebApp as Record<string, unknown> | undefined;
  const initData = typeof webapp?.initData === 'string' ? webapp.initData : '';
  const hash = window.location.hash;

  return {
    isActualTelegram: isActualTelegram(),
    hasTelegramGlobal: Boolean(telegram),
    hasWebApp: Boolean(webapp),
    initDataLength: initData.length,
    hasTgWebAppDataInHash: hash.includes('tgWebAppData'),
    hasNavigatorToken: Boolean(sessionStorage.getItem('navigator_token')),
  };
}

export default function GateDebugModal({ onClose }: Props) {
  const [toast, setToast] = useState('');

  const data: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    ...telegramState(),
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
  };

  const info = JSON.stringify(data, null, 2);

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
          <span className={styles.title}>🐛 Gate Debug</span>
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
