import { useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@shared/Toast';
import { formatRespawnLabel, formatRespawnRange, parseRespawn } from '@utils/respawn';

import type { RaidBoss } from '@/types';

import styles from './RespawnCalculator.module.scss';

const BOT_LINK = 'https://t.me/l2team_navigator_bot';

interface Props {
  boss: RaidBoss;
  onClose: () => void;
}

function nowString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default function RespawnCalculator({ boss, onClose }: Props) {
  const [killTime, setKillTime] = useState(nowString);
  const [resultText, setResultText] = useState('');
  const [toast, setToast] = useState('');

  const respawnWindow = parseRespawn(boss.respawn);

  if (!respawnWindow) return null;

  const handleCalculate = () => {
    if (!killTime) return;
    const kill = new Date(killTime);
    if (isNaN(kill.getTime())) return;
    const minHours = respawnWindow.base - respawnWindow.variance;
    const maxHours = respawnWindow.base + respawnWindow.variance;
    const minDate = new Date(kill.getTime() + minHours * 3600000);
    const maxDate = new Date(kill.getTime() + maxHours * 3600000);
    const bossId = boss.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const botUrl = `${BOT_LINK}?startapp=boss_${bossId}`;
    const text = `Босс ${boss.name} (${botUrl}) — окно респа: ${formatRespawnRange(minDate, maxDate)} (МСК)`;
    setResultText(text);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = resultText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setToast('Текст скопирован');
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
        <div className={styles.title}>Калькулятор респа — {boss.name}</div>
        <div className={styles.field}>
          <label className={styles.label}>Время убийства</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={killTime}
            onChange={(e) => setKillTime(e.target.value)}
          />
        </div>
        <div className={styles.respawnLabel}>Респаун: {formatRespawnLabel(boss.respawn)}</div>
        <button className={styles.calcBtn} onClick={handleCalculate} disabled={!killTime}>
          Рассчитать
        </button>
        {resultText && (
          <div className={styles.result}>
            <div className={styles.resultText}>{resultText}</div>
            <button className={styles.copyBtn} onClick={handleCopy}>
              📋 Копировать
            </button>
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>,
    document.body,
  );
}
