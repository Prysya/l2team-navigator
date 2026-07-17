import { useCallback } from 'react';

import styles from './NumberInput.module.scss';

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

interface NumberInputProps {
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
}

export default function NumberInput({ value, onChange, min, max, step = 1, decimals = 0 }: NumberInputProps) {
  const inc = useCallback(() => {
    const cur = parseFloat(value) || 0;
    const next = clamp(+(cur + step).toFixed(decimals), min, max);
    onChange(String(next));
  }, [value, onChange, min, max, step, decimals]);

  const dec = useCallback(() => {
    const cur = parseFloat(value) || 0;
    const prev = clamp(+(cur - step).toFixed(decimals), min, max);
    onChange(String(prev));
  }, [value, onChange, min, max, step, decimals]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(',', '.');
      if (raw === '') {
        onChange('');
        return;
      }
      const re = decimals > 0 ? /^\d*\.?\d{0,5}$/ : /^\d*$/;
      if (!re.test(raw)) return;
      const num = parseFloat(raw);
      if (isNaN(num)) {
        onChange(raw);
        return;
      }
      if (num < min || num > max) return;
      onChange(raw);
    },
    [onChange, min, max, decimals],
  );

  return (
    <div className={styles.numInput}>
      <input className={styles.input} type="text" inputMode="decimal" value={value} onChange={handleChange} />
      <button type="button" className={styles.numBtn} onClick={dec} tabIndex={-1}>
        −
      </button>
      <button type="button" className={styles.numBtn} onClick={inc} tabIndex={-1}>
        +
      </button>
    </div>
  );
}
