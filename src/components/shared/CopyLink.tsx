import { useCallback, useState } from 'react';

import { useTelegramStore } from '@/stores/telegramStore';

import styles from './CopyLink.module.scss';

interface CopyLinkProps {
  getUrl: () => string;
}

export default function CopyLink({ getUrl }: CopyLinkProps) {
  const isTelegram = useTelegramStore((s) => s.isTelegram);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = getUrl();
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [getUrl]);

  if (isTelegram) return null;

  return (
    <span
      className={styles.copyBtn}
      onClick={(e) => {
        e.stopPropagation();
        handleCopy();
      }}
      title="Копировать ссылку"
    >
      {copied ? (
        <svg
          className={styles.linkIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          className={styles.linkIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </span>
  );
}
