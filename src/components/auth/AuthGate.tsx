import { useState } from 'react';
import { validateToken } from '@utils/telegramApi';

import styles from './AuthGate.module.scss';

const BOT_LINK = 'https://t.me/l2team_butler_bot';

interface Props {
  onAuth: () => void;
}

export default function AuthGate({ onAuth }: Props) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await validateToken(token.trim());
      if (res.ok) {
        onAuth();
      } else {
        setError('Неверный или истёкший токен');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
            <path
              d="M16 24l6 6 10-10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>L2team Navigator</h1>
        <p className={styles.subtitle}>Доступ к сайту — получите токен у бота</p>

        <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className={styles.botLink}>
          @l2team_butler_bot
        </a>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            {error && <span className={styles.errorText}>{error}</span>}
            <input
              className={styles.input}
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Введите токен"
              autoFocus
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading || !token.trim()}>
            {loading ? 'Проверка…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
