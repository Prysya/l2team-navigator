import { useState, useMemo, useCallback } from 'react';
import FloatingLabel from '../../components/shared/FloatingLabel';
import styles from './CalculatorTab.module.scss';

function clamp(val: number, min: number, max: number): number {
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

function NumberInput({ value, onChange, min, max, step = 1, decimals = 0 }: NumberInputProps) {
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') { onChange(''); return; }
    const re = decimals > 0 ? /^\d*\.?\d{0,5}$/ : /^\d*$/;
    if (!re.test(raw)) return;
    const num = parseFloat(raw);
    if (isNaN(num)) { onChange(raw); return; }
    if (num < min || num > max) return;
    onChange(raw);
  }, [onChange, min, max, decimals]);

  return (
    <div className={styles.numInput}>
      <input
        className={styles.input}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
      />
      <button type="button" className={styles.numBtn} onClick={dec} tabIndex={-1}>−</button>
      <button type="button" className={styles.numBtn} onClick={inc} tabIndex={-1}>+</button>
    </div>
  );
}

const XP_DATA = [
  { level: 1, expToLevel: 0 },
  { level: 2, expToLevel: 68 },
  { level: 3, expToLevel: 295 },
  { level: 4, expToLevel: 805 },
  { level: 5, expToLevel: 1716 },
  { level: 6, expToLevel: 3154 },
  { level: 7, expToLevel: 5249 },
  { level: 8, expToLevel: 8136 },
  { level: 9, expToLevel: 11955 },
  { level: 10, expToLevel: 16851 },
  { level: 11, expToLevel: 22973 },
  { level: 12, expToLevel: 32450 },
  { level: 13, expToLevel: 45090 },
  { level: 14, expToLevel: 61640 },
  { level: 15, expToLevel: 82880 },
  { level: 16, expToLevel: 109600 },
  { level: 17, expToLevel: 142600 },
  { level: 18, expToLevel: 182600 },
  { level: 19, expToLevel: 229900 },
  { level: 20, expToLevel: 284700 },
  { level: 21, expToLevel: 347041 },
  { level: 22, expToLevel: 415800 },
  { level: 23, expToLevel: 493600 },
  { level: 24, expToLevel: 580300 },
  { level: 25, expToLevel: 675600 },
  { level: 26, expToLevel: 779100 },
  { level: 27, expToLevel: 889700 },
  { level: 28, expToLevel: 1006235 },
  { level: 29, expToLevel: 1127063 },
  { level: 30, expToLevel: 1273446 },
  { level: 31, expToLevel: 1435331 },
  { level: 32, expToLevel: 1614147 },
  { level: 33, expToLevel: 1811443 },
  { level: 34, expToLevel: 2028890 },
  { level: 35, expToLevel: 2268299 },
  { level: 36, expToLevel: 2531604 },
  { level: 37, expToLevel: 2820902 },
  { level: 38, expToLevel: 3138439 },
  { level: 39, expToLevel: 3486615 },
  { level: 40, expToLevel: 3868019 },
  { level: 41, expToLevel: 4285395 },
  { level: 42, expToLevel: 4741697 },
  { level: 43, expToLevel: 5240056 },
  { level: 44, expToLevel: 5783820 },
  { level: 45, expToLevel: 6376545 },
  { level: 46, expToLevel: 7022008 },
  { level: 47, expToLevel: 7724229 },
  { level: 48, expToLevel: 8487452 },
  { level: 49, expToLevel: 9316186 },
  { level: 50, expToLevel: 10215196 },
  { level: 51, expToLevel: 12260000 },
  { level: 52, expToLevel: 14720000 },
  { level: 53, expToLevel: 17640000 },
  { level: 54, expToLevel: 21140000 },
  { level: 55, expToLevel: 25310000 },
  { level: 56, expToLevel: 30280000 },
  { level: 57, expToLevel: 36210000 },
  { level: 58, expToLevel: 43260000 },
  { level: 59, expToLevel: 51650000 },
  { level: 60, expToLevel: 61630000 },
  { level: 61, expToLevel: 73479750 },
  { level: 62, expToLevel: 87540000 },
  { level: 63, expToLevel: 103400000 },
  { level: 64, expToLevel: 121200000 },
  { level: 65, expToLevel: 140800000 },
  { level: 66, expToLevel: 162200000 },
  { level: 67, expToLevel: 185400000 },
  { level: 68, expToLevel: 210000000 },
  { level: 69, expToLevel: 236000000 },
  { level: 70, expToLevel: 262853430 },
  { level: 71, expToLevel: 290500000 },
  { level: 72, expToLevel: 328600000 },
  { level: 73, expToLevel: 380700000 },
  { level: 74, expToLevel: 451600000 },
  { level: 75, expToLevel: 548600000 },
];

const fm = (n: number) => n.toLocaleString('ru');

function computeTotal(level: number): number {
  return XP_DATA.filter(d => d.level <= level).reduce((s, d) => s + d.expToLevel, 0);
}

const NAV_ITEMS = [
  { id: 'calc-calculator', label: 'Калькулятор опыта' },
  { id: 'calc-table', label: 'Таблица опыта' },
  { id: 'calc-group', label: 'Групповой опыт' },
  { id: 'calc-penalty', label: 'Штрафы' },
  { id: 'calc-tips', label: 'Советы по фарму' },
  { id: 'calc-premium', label: 'Премиум Аккаунт' },
  { id: 'calc-autoloot', label: 'Автолут' },
];

export default function CalculatorTab() {
  const [level, setLevel] = useState('');
  const [percent, setPercent] = useState('');

  const result = useMemo(() => {
    const lvl = parseInt(level, 10);
    const pct = parseFloat(percent);
    if (isNaN(lvl) || lvl < 1 || lvl > 75) return null;
    if (isNaN(pct) || pct < 0 || pct >= 100) return null;
    if (lvl === 75) return { isMax: true };

    const currentXP = XP_DATA.find(d => d.level === lvl)!;
    const currentTotal = computeTotal(lvl - 1);
    const expNow = currentTotal + (currentXP.expToLevel * pct / 100);
    const expNeeded = computeTotal(lvl) - expNow;

    return { isMax: false, nextLevel: lvl + 1, xp: fm(Math.round(expNeeded)) };
  }, [level, percent]);

  return (
    <div className={styles.wrapper}>
      <nav className={styles.floatingNav}>
        {NAV_ITEMS.map(item => (
          <a key={item.id} href={`#${item.id}`} className={styles.navLink}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className={styles.content}>
        <section id="calc-calculator" className={styles.card}>
          <h2 className={styles.title}>Калькулятор опыта</h2>
          <div className={styles.inputs}>
            <div className={styles.field}>
              <FloatingLabel label="Ваш уровень (1–75)" value={level}>
                <NumberInput value={level} onChange={setLevel} min={1} max={75} step={1} decimals={0} />
              </FloatingLabel>
            </div>
            <div className={styles.field}>
              <FloatingLabel label="Текущие проценты" value={percent}>
                <NumberInput value={percent} onChange={setPercent} min={0} max={99.99999} step={0.00001} decimals={5} />
              </FloatingLabel>
            </div>
          </div>
          {result && (
            <p className={styles.result}>
              {result.isMax ? (
                'Максимальный уровень'
              ) : (
                <>
                  До <b>{result.nextLevel}</b> уровня: <b>{result.xp}</b> опыта
                </>
              )}
            </p>
          )}
        </section>

        <section id="calc-table" className={styles.card}>
          <h2 className={styles.title}>Таблица опыта</h2>
          <div className={styles.tableWrap}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Уровень</th><th>Всего опыта</th><th>Опыт до уровня</th></tr>
                </thead>
                <tbody>
                  {XP_DATA.map(d => {
                    const total = computeTotal(d.level);
                    return (
                      <tr key={d.level}>
                        <td>{d.level}</td>
                        <td>{fm(total)}</td>
                        <td>{fm(d.expToLevel)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="calc-group" className={styles.card}>
          <h2 className={styles.title}>Групповой опыт</h2>
          <p className={styles.text}>На Lu4 бонус группового опыта переработан. При убийстве монстров в группе персонажи получают бонус к EXP, SP и Vitality.</p>
          <div className={styles.tableWrap}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th>Игроков в группе</th><th>Lu4</th></tr></thead>
                <tbody>
                  {[{ p: 2, lu4: '110%' }, { p: 3, lu4: '125%' }, { p: 4, lu4: '140%' }, { p: 5, lu4: '150%' }, { p: 6, lu4: '180%' }, { p: 7, lu4: '210%' }, { p: 8, lu4: '240%' }, { p: 9, lu4: '270%' }].map(row => (
                    <tr key={row.p}><td>{row.p}</td><td className={styles.lu4Cell}>{row.lu4}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <details className={styles.details}>
            <summary className={styles.detailsSummary}>Опыт группы по сравнению с соло (база 1000 EXP)</summary>
            <p className={styles.text} style={{ marginTop: 12 }}>Опыт делится между всеми участниками группы.</p>
            <div className={styles.tableWrap}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead><tr><th>Игроков в группе</th><th>Старые бонусы</th><th>Новые бонусы</th><th>Разница</th></tr></thead>
                  <tbody>
                    {[
                      { p: 2, old: '1100 EXP', new: '1100 EXP', diff: '0' },
                      { p: 3, old: '1200 EXP', new: '1250 EXP', diff: '+50' },
                      { p: 4, old: '1300 EXP', new: '1400 EXP', diff: '+100' },
                      { p: 5, old: '1400 EXP', new: '1500 EXP', diff: '+100' },
                      { p: 6, old: '1500 EXP', new: '1800 EXP', diff: '+300' },
                      { p: 7, old: '2000 EXP', new: '2100 EXP', diff: '+100' },
                      { p: 8, old: '2100 EXP', new: '2400 EXP', diff: '+300' },
                      { p: 9, old: '2200 EXP', new: '2700 EXP', diff: '+500' },
                    ].map(row => (
                      <tr key={row.p}><td>{row.p}</td><td>{row.old}</td><td className={styles.lu4Cell}>{row.new}</td><td className={styles.diffCell}>{row.diff}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          <div className={styles.note}>
            <strong>В группе из 5–9 игроков вы получаете одинаковое количество опыта.</strong> Учитывая, что большая группа убивает монстров быстрее, крупная пати — самый эффективный способ прокачки.
          </div>
        </section>

        <section id="calc-penalty" className={styles.card}>
          <h2 className={styles.title}>Штрафы: опыт, дроп и спойл</h2>

          <div className={styles.penaltyScale}>
            <div className={styles.penaltyLabels}>
              <span>Моб выше →</span>
              <span className={styles.penaltyNoPenalty}>без штрафа: −5…+4 ур.</span>
              <span>← моб ниже</span>
            </div>

            <div className={styles.penaltyRowWrap}>
            <div className={styles.penaltyRow}>
              {(() => {
                const raw = [
                  { d: '+15', p: '95%' }, { d: '+14', p: '95%' }, { d: '+13', p: '95%' }, { d: '+12', p: '95%' }, { d: '+11', p: '95%' },
                  { d: '+10', p: '90%' }, { d: '+9', p: '80%' }, { d: '+8', p: '65%' }, { d: '+7', p: '50%' }, { d: '+6', p: '30%' },
                  { d: '+5', p: '15%' }, { d: '+4', p: '0' }, { d: '+3', p: '0' },
                  { d: '+2', p: '0' }, { d: '+1', p: '0' }, { d: '0', p: '0' }, { d: '-1', p: '0' }, { d: '-2', p: '0' },
                  { d: '-3', p: '0' }, { d: '-4', p: '0' }, { d: '-5', p: '0' },
                  { d: '-6', p: '15%' }, { d: '-7', p: '30%' }, { d: '-8', p: '50%' }, { d: '-9', p: '65%' }, { d: '-10', p: '80%' },
                  { d: '-11', p: '90%' }, { d: '-12', p: '95%' }, { d: '-13', p: '95%' }, { d: '-14', p: '95%' }, { d: '-15', p: '95%' },
                ];
                const colors = [
                  '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5',
                  '#fecaca', '#fee2e2',
                  '#f5f5f5', '#ffffff', '#f5f5f5',
                  '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8',
                  '#0ea5e9', '#0284c7', '#0369a1',
                ];
                const lightColors = new Set(['#fecaca', '#fee2e2', '#f5f5f5', '#ffffff', '#e0f2fe', '#bae6fd']);
                const grouped: { p: string; color: string; start: string; end: string }[] = [];
                let ci = 0;
                for (let i = 0; i < raw.length; i++) {
                  const item = raw[i];
                  const last = grouped[grouped.length - 1];
                  if (last && last.p === item.p) {
                    last.end = item.d;
                  } else {
                    grouped.push({ p: item.p, color: colors[ci] ?? '#666', start: item.d, end: item.d });
                    ci++;
                  }
                }
                return grouped.map(group => {
                  const textColor = lightColors.has(group.color) ? '#111' : '#fff';
                  const range = group.start === group.end ? group.start : `${group.start}…${group.end}`;
                  return (
                    <div key={group.start} className={styles.penaltyCell} style={{ background: group.color, color: textColor }}>
                      <span className={styles.penaltyPct}>{group.p}</span>
                      <span className={styles.penaltyDiff}>{range}</span>
                    </div>
                  );
                });
              })()}
            </div>
            </div>

            <div className={styles.penaltyFooter}>
              шкала штрафа — EXP, Drop и Spoil одинаковые %
            </div>
          </div>
        </section>

        <section id="calc-tips" className={styles.card}>
          <h2 className={styles.title}>Советы по фарму</h2>
          <div className={styles.subCard}>
            <h3 className={styles.subTitle}>Монстры</h3>
            <p className={styles.text}>Для эффективной прокачки лучше выбирать локации с монстрами не ниже 5 уровней от персонажа и не выше 4 уровней.</p>
            <p className={styles.text}>Если нет свободного спота с «белыми» мобами, можно фармить «синих» с небольшим штрафом. Идти на «красных» бессмысленно из-за высоких штрафов на опыт и дроп/спойл.</p>
          </div>
          <div className={styles.subCard}>
            <h3 className={styles.subTitle}>Рейд-боссы</h3>
            <p className={styles.text}>На Lu4 нет смысла фармить «красных» и «синих» РБ: кроме высокой сложности, дроп будет снижен вплоть до отсутствия.</p>
            <p className={styles.text}>Текущее окно уровня босса относительно персонажа: от «на 5 уровней ниже» до «на 4 уровня выше».</p>
          </div>
        </section>

        <section id="calc-premium" className={styles.card}>
          <h2 className={styles.title}>Премиум Аккаунт</h2>
          <p className={styles.text}>Премиум Аккаунт — специальный статус игрового аккаунта. Обладатели ПА получают дополнительные бонусы к опыту и дропу, доступ к магической поддержке и другие преимущества.</p>
          <div className={styles.subCard}>
            <h3 className={styles.subTitle}>Стоимость Премиума</h3>
            <div className={styles.tableWrap}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead><tr><th>Длительность</th><th>Стоимость</th></tr></thead>
                  <tbody>
                    {[
                      ['Премиум на 1 день', 'Master Coin × 20'],
                      ['Премиум на 3 дня', 'Master Coin × 50'],
                      ['Премиум на 7 дней', 'Master Coin × 100'],
                      ['Премиум на 14 дней', 'Master Coin × 150'],
                      ['Премиум на 30 дней', 'Master Coin × 250'],
                      ['Премиум на 100 дней', 'Master Coin × 500'],
                    ].map(([d, c]) => (
                      <tr key={d}><td>{d}</td><td>{c}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className={styles.subCard}>
            <h3 className={styles.subTitle}>Бонусы Премиума</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Параметр</th><th>Бонус</th></tr></thead>
                <tbody>
                  {[
                    ['EXP', '+50%'], ['SP', '+50%'], ['Drop', '+50%'], ['Spoil', '+50%'],
                    ['Лимит Веса', '+50%'], ['Расширение Инвентаря', '+50 слотов'],
                    ['Расширение Склада', '+50 слотов'], ['Расширение Торговли', '+5 слотов'],
                    ['Расширение Книги Рецептов', '+5 слотов'], ['Глобальный чат', 'Доступ'],
                    ['Сервисы', 'Магическая поддержка + скидки'],
                    ['Лимит окон', '+1 окно'],
                  ].map(([p, b]) => (
                    <tr key={p}><td>{p}</td><td className={styles.lu4Cell}>{b}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="calc-autoloot" className={styles.card}>
          <h2 className={styles.title}>Автоматический сбор лута (Автолут)</h2>
          <p className={styles.text}>Автоматически собирает добычу при убийстве монстров. Действует аналогично ручному сбору — предметы распределяются внутри группы, согласно настройкам распределения добычи.</p>
          <div className={styles.subCard}>
            <h3 className={styles.subTitle}>Виды автолута</h3>
            <div className={styles.tableWrap}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead><tr><th>Тип</th><th>Радиус</th><th>Скорость в мирной зоне</th></tr></thead>
                  <tbody>
                    <tr><td>Ближний</td><td>до 400</td><td>+15 к скорости</td></tr>
                    <tr><td>Дальний</td><td>до 1500</td><td>+25 к скорости</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className={styles.subCard}>
            <h3 className={styles.subTitle}>Цены</h3>
            <div className={styles.tableWrap}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead><tr><th>Срок</th><th>Ближний</th><th>Дальний</th></tr></thead>
                  <tbody>
                    {[
                      ['1 день', '6 MC', '10 MC'],
                      ['3 дня', '15 MC', '25 MC'],
                      ['7 дней', '30 MC', '50 MC'],
                      ['14 дней', '45 MC', '75 MC'],
                      ['30 дней', '75 MC', '125 MC'],
                      ['100 дней', '150 MC', '250 MC'],
                    ].map(([d, n, f]) => (
                      <tr key={d}><td>{d}</td><td>{n}</td><td>{f}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
