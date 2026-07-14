---
name: react-router
description: >
  React Router v6 patterns for path-based routing with query params.
  Covers BrowserRouter, tab navigation, CopyLink URL params, lazy loading.
  Trigger: When working with routing, useNavigate, useSearchParams, CopyLink,
  URL params, or tab navigation.
---

## Когда использовать

- Навигация между табами (роутами)
- Создание CopyLink с query-параметрами
- Чтение URL-параметров при монтировании (`?boss=`, `?race=`)
- Lazy-loading тяжёлых страниц (SkillsTab)

## Базовая структура

```tsx
import { BrowserRouter, Route, Routes, useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const BASE = import.meta.env.BASE_URL;
const BASE_CLEAN = BASE.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={BASE_CLEAN}>
      <AppLayout />
    </BrowserRouter>
  );
}
```

- `BrowserRouter` с `basename` для GitHub Pages (`/l2team-navigator/`)
- Все роуты — path-based, **без хэшей**
- Роуты: `/`, `/recipes`, `/spellbooks`, `/locations`, `/skills`, `/raidboss`, `/calculator`, `/quests`
- `path="*"` → редирект на `MainPage`

## Навигация между табами

```tsx
const navigate = useNavigate();
const location = useLocation();
const [searchParams] = useSearchParams();

const handleTabChange = (key: string) => {
  if (key.startsWith('spellbooks?')) {
    navigate('/' + key);
  } else {
    const params = new URLSearchParams(searchParams);
    if (key !== 'spellbooks') {
      params.delete('sbRace');
      params.delete('sbQ');
    }
    const qs = params.toString();
    navigate('/' + key + (qs ? `?${qs}` : ''));
  }
};
```

- При переключении таба очищаются `?sbRace=` и `?sbQ=` (если таргет не spellbooks)
- `key={location.pathname}` на контейнере форсирует re-mount при смене роута

## Определение активного таба

```tsx
const activeTab = useMemo(() => {
  const tab = location.pathname.split('/')[1] || '';
  if (!tab) return '';
  return VALID_TABS.has(tab) ? tab : 'recipes';
}, [location.pathname]);
```

- `VALID_TABS` — `Set` с именами разрешённых табов
- Неизвестный путь → фоллбек на `'recipes'`
- Путь `/` → `''` (TabBar скрыт)

## Чтение query-параметров при монтировании

```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const race = params.get('race');
  const cls = params.get('class');
  const skill = params.get('skill');
  if (race) setSelectedRace(race);
  if (cls) setSelectedClass(cls);
  if (skill) setSearchQuery(skill);
}, [setSelectedRace, setSelectedClass, setSearchQuery]);
```

- Используется `window.location.search` (не `useSearchParams`) для чтения при монтировании
- Параметры декодируются через `decodeURIComponent()`

## CopyLink — копирование URL с параметрами

```tsx
<CopyLink
  getUrl={() =>
    window.location.origin +
    BASE +
    'raidboss?boss=' +
    encodeURIComponent(boss.name)
  }
/>
```

- `getUrl()` — функция, а не строка (чтобы не пересоздавать при каждом рендере)
- URL строится через `window.location.origin + import.meta.env.BASE_URL + path + query`
- Параметры кодируются через `encodeURIComponent()`
- Используется в 3 табах: RaidBossTab (`?boss=`), SkillsTab (`?race=&class=&skill=`), SpellbookTab (`?sbRace=&sbQ=`)

## CopyLink компонент

```tsx
// src/components/shared/CopyLink.tsx
<CopyLink getUrl={() => 'path?key=val'} />
```

- Копирует в буфер обмена через `navigator.clipboard.writeText()`
- Fallback: `document.execCommand('copy')` через textarea
- После копирования показывает зелёную галочку 1.5 секунды
- Скрыт в Telegram Web App

## Lazy-loading

Тяжёлые страницы загружаются лениво:

```tsx
const LazySkillsTab = lazy(() => import('./components/skills/SkillsTab'));

<Suspense fallback={<div className="tab-page" />}>
  <LazySkillsTab onNavigateToTab={handleTabChange} />
</Suspense>
```

- SkillsTab (3.6MB JSON) — единственный lazy-loaded роут
- Fallback — пустой `div.tab-page` (сохраняет анимацию)

## Навигация из MainPage

```tsx
// MainPage.tsx
const navigate = useNavigate();
navigate('/recipes');  // переход на таб
navigate('/');         // возврат на главную
```

## Роуты в тестах

Компоненты с роутингом оборачиваются в `BrowserRouter`:

```tsx
import { BrowserRouter } from 'react-router-dom';

render(<BrowserRouter><Component /></BrowserRouter>);
```
