# L2team Navigator — Project Context

## Git Workflow

### Branch Naming
| Prefix | Usage |
|--------|-------|
| `feature/*` | New features, redesigns, enhancements |
| `fix/*` | Bug fixes |
| `ci/*` | CI/CD, workflows, tooling config |
| `refactor/*` | Code refactoring, no functional changes |
| `chore/*` | Dependencies, version bumps, housekeeping |

### Rules for AI Agent
- **Always ask permission** before committing, pushing, or creating PRs
- Always create a branch from `main` for new work
- PR target: `main`
- Version bumps go in the PR body, not as separate commits (auto-tag workflow handles tagging on merge)
- **Update CHANGELOG.md** with each version — describe changes in Russian under Added/Changed/Fixed/Removed

### Commit Messages
Use conventional commits: `type: description` (lowercase, no caps).
| Type | When |
|------|------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Housekeeping, deps, version |
| `ci:` | CI/CD, workflows |
| `refactor:` | Code restructuring |
| `docs:` | Documentation only |
| `style:` | Styling, formatting (no logic change) |

## Stack
- Vite 5 + React 18 + TypeScript (strict, no `any`) + SCSS Modules + normalize.css
- No CRA, no external UI library
- Static data in `src/data/*.json` (no runtime API calls)
- Deployed to GitHub Pages at `/l2team-navigator/`
- Sass: `sass-embedded` with `api: 'modern-compiler'` in vite.config.ts
- `classnames` for conditional className composition

## Theme
- Dark gaming-themed UI
- `$color-primary: #38bdf8` (sky blue), `$color-border: #24304a` (neutral navy)
- All SCSS variables defined in `src/styles/_variables.scss`
- Global styles in `src/styles/_global.scss`

## Routes (react-router-dom in App.tsx)

### Main Page
| Route | Component | File |
|-------|-----------|------|
| `/` | MainPage | `src/components/main/MainPage.tsx` |

Главная страница-разводка: сетка карточек с иконками разделов. TabBar скрыт.
Пасхалка: ввод `iddqd` открывает модалку «Саша Ролекс Пес».

### Tab Pages
| Route | Component | File |
|-------|-----------|------|
| `/recipes` | RecipeTab | `src/components/recipes/RecipeTab.tsx` |
| `/spellbooks` | SpellbookTab | `src/components/spellbooks/SpellbookTab.tsx` |
| `/locations` | LocationsTab | `src/components/locations/LocationsTab.tsx` |
| `/skills` | SkillsTab | `src/components/skills/SkillsTab.tsx` |
| `/raidboss` | RaidBossTab | `src/components/raidboss/RaidBossTab.tsx` |
| `/calculator` | CalculatorTab | `src/components/calculator/CalculatorTab.tsx` |
| `/quests` | QuestsTab | `src/components/quests/QuestsTab.tsx` |

- Valid tabs constant in `src/utils/constants.ts` (`TAB_NAMES`, `VALID_TABS`)
- TabBar component renders tab navigation; shown only when `activeTab` is set (hidden on `/`)
- Switching tabs clears `?sbRace=` and `?sbQ=` search params (unless switching to spellbooks)

## Shared Components

### FloatingLabel (`src/components/shared/FloatingLabel.tsx`)
- Material UI-style floating label for inputs and selects
- Label sits inside the field as placeholder, floats to top on focus/value
- Uses `:focus-within` + `.hasValue` class for CSS-only floating
- Accepts: `label`, `value`, `children`

### CustomSelect (`src/components/shared/CustomSelect.tsx`)
- Replaces all native `<select>` elements across all tabs
- Custom dropdown with floating label, click-outside-to-close
- Supports flat `options` array and grouped `groups` (for optgroup-style data)
- Option highlighting on hover, active state for selected value
- Scrollable menu with max-height + custom scrollbar
- All native `<select>` and their `<option>`/`<optgroup>` elements removed from codebase

## Features by Tab

### SkillsTab
- EN/RU language toggle (radio buttons) at top of controls bar
- Race + class `CustomSelect` dropdowns; labels localize based on language
- EN_CLASS_NAMES map (51 classes), RU_CLASS_NAMES map (28 entries), CLASS_RACE_MAP
- Skill search (`FloatingLabel`) and level filter
- `compressLevels` — groups consecutive levels with identical description into comma-separated ranges
- `cleanStatText` — strips leading zeros, hides HP stats
- Skill stats rendered as separate bordered pills
- Numbers in skill descriptions highlighted with `$color-accent-orange`
- "Где выбить книгу" button in skill cards — navigates to spellbooks tab with `?sbRace=&sbQ=` URL params
- Imports data from `src/data/SKILLS.json` (2145 skills)
- CopyLink per skill card: `#skills?race=&class=&skill=`

### SpellbookTab
- Race + Profession `CustomSelect` filters + skill name search (`FloatingLabel`)
- Pre-fills from `?sbRace=` / `?sbQ=` URL params on mount (reads from hash)
- Table with class tags (localized via RU_CLASS_NAMES), level, drop chance, mob name, description
- Language toggle affects class tag labels
- CopyLink next to book title: `#spellbooks?sbRace=&sbQ=`

### RecipeTab
- Group `CustomSelect` (select category) → Recipe `CustomSelect` (filtered by group + search)
- Search (`FloatingLabel`) full width via `.searchWrap { flex: 1 }`
- Card layout with border-left accent
- Recipe select labels show only recipe name (no `#number —` prefix)
- Store: `selectedGroup: number | null`, selecting a group clears `selectedNumber`

### LocationsTab
- Gradient active buttons for sub-tabs
- Race, Class, City, Location `CustomSelect` dropdowns
- Search (`FloatingLabel`)

### RaidBossTab
- 139 bosses (130 with stats/drops from mw2.wiki, 9 location+respawn only)
- Two sections: Epic (fixed respawn: Core, Orfen, Queen Ant, Zaken) + Regular
- Boss search (`FloatingLabel`), filters by name and location
- Click row to expand detail panel (boss image + stats grid + unified drop table)
- Boss image click opens full-screen preview overlay with centered image, border, close button top-right
- Drop table: `table-layout: fixed`, group headers ("Шанс дропа группы: X%"), data rows have left `::before` dot + `border-left` accent
- Item names are clickable links to `mw2.wiki/lu4/search/result?Search[query]=...`
- Columns: Предмет (left), Грейд/Кол-во/Шанс/Шанс внутри группы (center)
- No row hover highlighting (global override in both main and drop tables)
- Respawn badge: `⏱ Респ: 40с`
- Monster stat badges: larger padding/radius, font-weight 600
- Boss image shown alongside stats in detail panel (137 bosses have images)
- "Показать на карте" button opens draggable/zoomable world map with boss marker (initial zoom 110%)
- CopyLink per boss: `#raidboss?boss=`, opens boss expanded + search pre-filled
- Map image: `/public/maps/world-map.jpg` (3004×3004)
- Data source: `src/data/RAIDBOSSES.json` (530KB, untracked in git)

## Data Files (all in `src/data/`)
- `SKILLS.json` — 2145 skills
- `SPELLBOOKS.json` — spellbook drop data
- `RAIDBOSSES.json` — 139 bosses (untracked, ~530KB)
- `LOCATIONS_ALL.json`, `LOCATIONS_RECIPES.json`, `LOCATIONS_SPELLBOOKS.json` — location data
- `RESOURCES.json` — resource data
- `cities.ts`, `classes.ts`, `groupNames.ts`, `races.ts` — TS constants

## Quest Data (`scripts/parse-quests.mjs`)

Парсер извлекает данные квестов с mw2.wiki:
- HTTP/2, `Accept-Language: en`, случайная задержка 1.5-3с
- 4 параллельных запроса (Semaphore)
- Извлекает: полные шаги, NPC ID, имя NPC, координаты на карте
- Результат: `src/data/QUEST_DATA.json`
- Используется в `QuestsTab.tsx` как fallback для `QUEST_STEPS`, `QUEST_DETAILS`, `NPC_COORDS`
- Цепочка палач храма: посты 54–62 (добавлены в `QUESTS.posts`)
- `enrichQuest()` проверяет: хардкод-мапы → поле квеста → `QUEST_DATA.json`

**Запуск:** `node scripts/parse-quests.mjs`
**Добавить квест:** дополнить словари `QUESTS.quest` или `QUESTS.posts` в скрипте

### Known mw2.wiki Issues (для всех парсеров)

| # | Проблема | Решение |
|---|---|---|
| 1 | Cloudflare защита | `httpx.AsyncClient(http2=True)` |
| 2 | Пагинация | `seen_ids: Set[int]` + `stale_count` |
| 3 | Склеенный grade в названии | `clean_item_name(name, grade)` |
| 4 | Неправильный ID секции | Использовать `#contained` и `#capsule` явно |
| 5 | CSS селекторы классов | Использовать атрибутные селекторы: `[class*="text-center"]` |
| 6 | Русские ключи в таблицах | Нормализация через `normalize_enchant_key()` |
| 7 | Флаг is_rare | Проверка `<Rare Item Effect>` в описании |
| 8 | Первая страница уже в base_soup | Оптимизация `first_page_soup` |
| 9 | Yii2 роутинг | Формат `"Search[item_type]": "5"` |
| 10 | Длинные описания | Сохранять HTML как есть, парсить связи отдельно |
| 11 | URL префиксы | Универсальный regex `r'/item/(\d+)-'` |
| 12 | Числа с пробелами | Функции `safe_int()` / `safe_float()` |
| 13 | Вложенный HTML в таблицах | `find_all(..., recursive=True)` |
| 14 | Кнопки локаций | Парсить: выпадающее меню И прямую ссылку |
| 15 | Флаги в `item-name__additional` | Парсить флаги ДО вызова `decompose()` |
| 16 | Язык | `cookies={"language": "en"}` + `Accept-Language` |
| 17 | 404 на пагинации | Считать 404 как "конец пагинации" |
| 18 | "Массовые" предметы (Adena) | Пропускать через `SKIP_PAGINATION_ITEM_IDS` |
| 19 | Soul crystals триггер | Использовать английский триггер `'soul crystal'` |
| 20 | Set parts триггер | Использовать английский триггер `'set'` |
| 21 | Дробный `data-initial-amount` | `safe_amount()` с fallback |
| 22 | ID поста ≠ ID квеста | Resolve через HTTP для извлечения `quest_wiki_id` |
| 23 | Разный порядок колонок | Динамический поиск ячейки по наличию ссылки |
| 24 | Аккордеоны в наградах | Развернуть в текст с `[Heading]` |
| 25 | `find_parent` возвращает None | Переключиться на `soup.select('div.stat_line')` |
| 26 | `_load_existing_items` = None | Добавить явный `return [], set()` |
| 27 | Дублирование HTTP в Enricher | Оптимизация `first_page_html` |
| 28 | Race condition с headers | Передавать User-Agent явно в КАЖДОМ запросе |
| 29 | Цвета в таблицах | Извлекать `style` или вложенный `<span>` |

**Параметры:**
- `STAGES_CONFIG` — конфигурация для batch-обработки
- `asyncio.Semaphore(4)` — лимит параллельных запросов
- `random.uniform(1.5, 3.0)` — человеческая задержка
- `httpx.AsyncClient(http2=True, follow_redirects=True, cookies={"language": "en"})` — HTTP/2 + английский язык

## Scripts (`scripts/`)
- `fetch-skills.mjs` — fetches skill data from lu4db API
- `fetch-raidbosses.mjs` — intended for raid boss data (blocked: lu4db is SPA, requires JS rendering)
- `parse-wiki-bosses.mjs` — parses mw2.wiki article + lu4db HTML to build RAIDBOSSES.json
- `fetch-mw2-bosses.mjs` — parses mw2.wiki raid boss article, downloads boss images to `/public/images/bosses/`, fetches map coords from spawn page, adds `image`/`coords` fields to `RAIDBOSSES.json`

## Build & Deploy
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run deploy` — `gh-pages -d dist` (pushes to `gh-pages` branch)

## Data Notes
- `RAIDBOSSES.json` now has `image` and `coords` fields (added by `fetch-mw2-bosses.mjs`)
- Boss images are in `/public/images/bosses/` — accessible at `/l2team-navigator/images/bosses/` after deploy
- `coords` are pixel positions on the 3004×3004 world map (`x` = left, `y` = top)
- 2 bosses (Korim, Zaken) are missing images/coords — they exist in lu4db data but not in the mw2.wiki article

## Key Design Decisions
- Language toggle is a full-width row inside controls bar (`flex-basis: 100%`), not floating
- Spellbook linking via URL search params (`?sbRace=&sbQ=`) not lifted state — enables bookmarking
- Boss detail panels are `<tr><td colSpan={4}>` inside `<tbody>` (valid DOM, not separate divs)
- Drops rendered as single `table-layout:fixed` table with group header separator rows
- ALL json filenames in data/ are UPPERCASE
- Race keys are English (`'Elf'`, `'Dark Elf'`, `'Human'`, `'Orc'`, `'Dwarf'`)
- All native `<select>` replaced with `CustomSelect` (custom dropdown component)
- Conditional classNames use `classnames` (`cx()`) everywhere
- URL params for copy-links live in the hash fragment (`#tab?key=val`), read via `window.location.hash`
- Path-based routing via `react-router-dom` (`BrowserRouter` with `basename`)
- Navigation uses `useNavigate`, `useLocation`, `useSearchParams`
- `fullHash` state + `key={fullHash}` on tab wrappers forces re-mount on any hash change
- QuestsTab has 3 categories: racial quests, professions (1st/2nd class), Temple Executor chain
- Profession quest steps are parsed from mw2.wiki articles via node.js

## Known Constraints
- fetch-raidbosses.mjs cannot extract from lu4db directly (SPA requires JS rendering)
- Item thumbnails not available — no item ID in drop data
- `RAIDBOSSES.json` is large (530KB) and git-ignored

## Future: World Map for Raid Bosses

### Approach (L2J Datapack)
If adding an interactive map to RaidBossTab, use data from **L2J DataPack** (open-source, XML spawn files with x/y/z coordinates).

### Sources
- [L2J DataPack on GitHub](https://github.com/L2J/L2J_DataPack) — `data/spawns/Npcs/` contains XML with `x`, `y`, `z` attributes for every NPC
- Map image from mw2.wiki: `/assets/679b2c82/images/map.jpg` (3004×3004px)
- Map image from lu4db: `/media/site/maps/world-map.jpg` (3004×3004px)
- lu4db itself can't be scraped programmatically (SPA, no API, no prerendered data)

### Current Map Feature
- ✅ Draggable (mouse drag + touch support)
- ✅ Zoom (wheel + +/- buttons in footer), initial zoom 110%
- ✅ Boss marker positioned at pixel coords
- ✅ Marker label with boss name
- ✅ Close button
- ✅ Full-screen modal overlay
- Map image: `/public/maps/world-map.jpg` (3004×3004)
- Served at `import.meta.env.BASE_URL + maps/world-map.jpg`

### Planned
- Show all boss markers on one map view
- L2J DataPack integration for coordinate conversion
- Boss filter/search on the map
