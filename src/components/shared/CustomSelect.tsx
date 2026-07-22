import { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';

import styles from './CustomSelect.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  /** Optional icon shown after the label (e.g. crafted item icon). */
  iconUrl?: string;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  label: string;
  disabled?: boolean;
  dataTestId?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  groups,
  label,
  disabled,
  dataTestId,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const flatOptions = groups ? groups.flatMap((g) => g.options) : (options ?? []);

  const selectedLabel = flatOptions.find((o) => o.value === value)?.label || '';

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setIsOpen(false);
    },
    [onChange],
  );

  const renderOption = (opt: SelectOption) => (
    <>
      <span className={styles.optionLabel}>{opt.label}</span>
      {opt.iconUrl && (
        <img
          className={styles.optionIcon}
          src={opt.iconUrl}
          alt=""
          loading="lazy"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
    </>
  );

  return (
    <div
      ref={wrapperRef}
      className={cx(styles.wrapper, disabled && styles.disabled, value && styles.hasValue, isOpen && styles.isOpen)}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        data-testid={dataTestId}
      >
        <span className={styles.value}>{value ? selectedLabel : ''}</span>
        <svg
          className={styles.arrow}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <span className={cx(styles.label, (isOpen || value) && styles.floating)}>{label}</span>
      {isOpen && (
        <div className={styles.menu}>
          {groups
            ? groups.map((group, gi) => (
                <div key={gi}>
                  <div className={styles.groupLabel}>{group.label}</div>
                  {group.options.map((opt) => (
                    <div
                      key={opt.value}
                      className={cx(styles.option, opt.value === value && styles.optionActive)}
                      onClick={() => handleSelect(opt.value)}
                      data-testid={`select-option-${opt.value}`}
                    >
                      {renderOption(opt)}
                    </div>
                  ))}
                </div>
              ))
            : (options ?? []).map((opt) => (
                <div
                  key={opt.value}
                  className={cx(styles.option, opt.value === value && styles.optionActive)}
                  onClick={() => handleSelect(opt.value)}
                  data-testid={`select-option-${opt.value}`}
                >
                  {renderOption(opt)}
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
