# L2team Navigator — Project Context

## Git Workflow

### Branch Naming

| Prefix       | Usage                                     |
| ------------ | ----------------------------------------- |
| `feature/*`  | New features, redesigns, enhancements     |
| `fix/*`      | Bug fixes                                 |
| `ci/*`       | CI/CD, workflows, tooling config          |
| `refactor/*` | Code refactoring, no functional changes   |
| `chore/*`    | Dependencies, version bumps, housekeeping |

### Rules for AI Agent

- **Always ask permission** before committing, pushing, or creating PRs
- Always create a branch from `main` for new work
- PR target: `main`
- Version bumps go in the PR body, not as separate commits (auto-tag workflow handles tagging on merge)
- **Update CHANGELOG.md** with each version — describe changes in Russian under Added/Changed/Fixed/Removed
- **Update AGENTS.md after any PR** — если PR меняет поведение, фичи, скрипты, конфиги или стек, обнови соответствующие секции AGENTS.md (Features by Tab, Data Notes, Scripts, Key Design Decisions и т.д.), чтобы агент всегда имел актуальный контекст
- **All new features must be covered by tests** — unit (Vitest) for pure functions and stores, component tests for UI, E2E (Playwright) for critical user flows

### Commit Messages

Use conventional commits: `type: description` (lowercase, no caps).

| Type        | When                                  |
| ----------- | ------------------------------------- |
| `feat:`     | New feature                           |
| `fix:`      | Bug fix                               |
| `chore:`    | Housekeeping, deps, version           |
| `ci:`       | CI/CD, workflows                      |
| `refactor:` | Code restructuring                    |
| `docs:`     | Documentation only                    |
| `style:`    | Styling, formatting (no logic change) |

### Code Style

- **No Unicode escapes** — пишем обычный русский текст (`'дроп'`), не `'\u0434\u0440\u043E\u043F'`

## Stack

- Vite 8 + React 18 + TypeScript (strict, no `any`) + SCSS Modules + normalize.css
- No CRA, no external UI library
- Static data in `src/data/*.json` (no runtime API calls)
- Deployed to GitHub Pages at `/l2team-navigator/`
- Sass: `sass-embedded` (modern-compiler — дефолт, явный `api` конфиг убран)
- PWA: `vite-plugin-pwa` (Workbox) — service worker + manifest, прекэш оболочки и рантайм-кэш (см. секцию PWA)
- `classnames` for conditional className composition
- ESLint + Prettier for code quality (configs: `.eslintrc.json`, `.prettierrc`)
- Import aliases: `@/`, `@shared/`, `@components/`, `@utils/`, `@data/`, `@styles/`

## Парсер скиллов (`scripts/fetch-mw2-skills.mjs`)

Собирает обогащённые данные с mw2.wiki:

1. Парсит страницу `/lu4/classes` — получает ID и slug всех классов
2. Для каждого класса → `/lu4/class/{id}-{slug}/all` — парсит скиллы (accordion-секции с подкатегориями Physical/Buff/Debuff и т.д.)
3. Уникальные скиллы → `/lu4/skill/{id}-{slug}/1` — парсит описание, MP, кулдаун, трейт, атрибут, все уровни
4. Склеивает с существующим `SKILLS.json`: добавляет `description`, `mpConsume`, `reuseTime`, `castRange`, `trait`, `attribute`, `olympiadUsable`, `levels[].description`
5. Результат сохраняется в `SKILLS_ENRICHED.json`, затем перезаписывает `SKILLS.json`

**Запуск:** `node scripts/fetch-mw2-skills.mjs`
**Зависимости:** Node.js 18+ (native fetch), без внешних пакетов
**Лимиты:** asyncio.Semaphore(4), случайная задержка 1.5-3с (не реализовано — 1 запрос за раз)

### Поля скилла после обогащения

| Поле                   | Тип    | Источник                              |
| ---------------------- | ------ | ------------------------------------- |
| `description`          | string | mw2.wiki (полное описание навыка)     |
| `mpConsume`            | string | mw2.wiki (MP cost)                    |
| `reuseTime`            | string | mw2.wiki (перезарядка)                |
| `castRange`            | string | mw2.wiki (дальность)                  |
| `trait`                | string | mw2.wiki (Sword/Blunt/Dagger/Etc)     |
| `attribute`            | string | mw2.wiki (Fire/Water/Wind/Earth/None) |
| `olympiadUsable`       | string | mw2.wiki (Yes/No)                     |
| `levels[].description` | string | mw2.wiki (описание каждого уровня)    |

**Запуск:** `node scripts/fetch-mw2-skills.mjs`

## Code Quality

### ESLint

- `simple-import-sort` — сортировка импортов (react → external → `@/` → relative → `.scss`)
- `unused-imports` — автоудаление неиспользуемых импортов
- `consistent-type-imports` — `import type` для типов
- `no-non-null-assertion` — запрет `!` (warn)
- `react/jsx-curly-brace-presence` — убирает лишние `{}` в JSX

Команды: `npm run lint`, `npm run lint:fix`

### Prettier

- 120 символов, single quotes, trailing commas
- `.prettierrc` + `.prettierignore`
- `eslint-config-prettier` для избежания конфликтов

Команды: `npm run format`, `npm run format:check`

### Zustand Stores

Все табы используют Zustand для состояния:

| Store               | File                           |
| ------------------- | ------------------------------ |
| `useRaidBossStore`  | `src/stores/raidBossStore.ts`  |
| `useLocationsStore` | `src/stores/locationsStore.ts` | `typeFilter`, `selectedRace`, `selectedClass`, `selectedCity`, `selectedLocation`, `searchQuery`, `partyFilter`, `userLevel` |
| `useSkillsStore`    | `src/stores/skillsStore.ts`    |
| `useSpellbookStore` | `src/stores/spellbookStore.ts` |
| `useRecipeStore`    | `src/stores/recipeStore.ts`    |
| `useQuestStore`     | `src/stores/questStore.ts`     |
| `useGuideStore`     | `src/stores/guideStore.ts`     | `expanded`, `infoOpen`                                                                                                       |
| `useTelegramStore`  | `src/stores/telegramStore.ts`  |

## Theme

- Dark gaming-themed UI
- `$color-primary: #38bdf8` (sky blue), `$color-border: #24304a` (neutral navy)
- All SCSS variables defined in `src/styles/_variables.scss`
- Global styles in `src/styles/_global.scss`

## Routes (react-router-dom in App.tsx)

### Main Page

| Route | Component | File                               |
| ----- | --------- | ---------------------------------- |
| `/`   | MainPage  | `src/components/main/MainPage.tsx` |

Главная страница-разводка: сетка карточек с иконками разделов. TabBar скрыт.
Пасхалка: ввод `iddqd` открывает модалку «Саша Ролекс Пес».

### Tab Pages

| Route         | Component     | File                                          |
| ------------- | ------------- | --------------------------------------------- |
| `/recipes`    | RecipeTab     | `src/components/recipes/RecipeTab.tsx`        |
| `/spellbooks` | SpellbookTab  | `src/components/spellbooks/SpellbookTab.tsx`  |
| `/locations`  | LocationsTab  | `src/components/locations/LocationsTab.tsx`   |
| `/skills`     | SkillsTab     | `src/components/skills/SkillsTab.tsx`         |
| `/raidboss`   | RaidBossTab   | `src/components/raidboss/RaidBossTab.tsx`     |
| `/calculator` | CalculatorTab | `src/components/calculator/CalculatorTab.tsx` |
| `/quests`     | QuestsTab     | `src/components/quests/QuestsTab.tsx`         |
| `/guide`      | GuideTab      | `src/components/guide/GuideTab.tsx`           |

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
- Accepts `dataTestId` prop — пробрасывается на кнопку триггера и опции (`data-testid`)
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

## SkillsTab

- EN/RU language toggle (radio buttons) at top of controls bar
- Race + class `CustomSelect` dropdowns; labels localize based on language
- Class selector сгруппирован по профессиям: **Без профессии / 1 профессия / 2 профессия** (через `groups` prop CustomSelect)
- EN_CLASS_NAMES map (61 класс: 51 profession + 10 base), CLASS_RACE_MAP
- Skill search (`FloatingLabel`) and level filter
- `compressLevels` — groups consecutive levels with identical description into comma-separated ranges; добавляет колонку "Ур. скилла"
- `cleanStatText` — strips leading zeros, hides HP stats
- Skill stats rendered as separate bordered pills (MP, КД, Дальн. + макс. дальность с тултипом, Trait, Attr)
- Numbers in skill descriptions highlighted with `$color-accent-orange`
- "Где выбить книгу" button in skill cards — navigates to spellbooks tab with `?sbRace=&sbQ=` URL params
- Если у скилла нет classLevel ни на одном уровне — карточка скрывается (скилл не принадлежит классу)
- Imports data from `src/data/SKILLS.json` (2671 skills)
- Иконки загружаются с mw2.wiki (`/i64/...png`) или lu4db (`/media/...`)
- **Lazy-loaded** via `React.lazy(() => import(...))` — SKILLS.json не в основном бандле

### SpellbookTab

- Race + Profession `CustomSelect` filters + skill name search (`FloatingLabel`)
- Pre-fills from `?sbRace=` / `?sbQ=` URL params on mount (reads from hash)
- Table with class tags (localized via RU_CLASS_NAMES), level, drop chance, mob name, description
- Language toggle affects class tag labels
- CopyLink next to book title: `#spellbooks?sbRace=&sbQ=`

### RecipeTab

- Type `CustomSelect` (All / Weapon / Armor / Accessory / Soulshot / Material / Elixir / Other) + Grade `CustomSelect` (NG/D/C/B/A)
- Recipe `CustomSelect` filtered by type + grade + search; grouping by subtype for Armor (Heavy/Light/Robe/Helmet/Gloves/Boots/Shields/HairAccessory), Weapon (Sword/Blunt/Dagger/Bow/Polearm/Fist/Misc), Accessory (Earring/Ring/Necklace)
- Grade selector hidden for Material/Other types; NG hidden for Soulshot type
- Card with 4 tabs: Рецепт (NPC дроп рецепта), Куски (NPC дроп основного материала), Крафт (уровень/MP/шанс + дерево компонентов), Информация о предмете (вес/цена/параметр/описание)
- Search (`FloatingLabel`) с дропдауном: открывается при фокусе, закрывается по blur/click-outside, крестик очистки
- Поиск не влияет на селекторы — результаты показываются под полем поиска в абсолютном дропдауне
- `formatChance` — адаптивная точность: 2 знака для ≥10%, 3 для 1-10%, 4 для <1%
- Dynamic import of data: RECIPES.json загружается через `import()` внутри `useEffect` (отдельные чанки)
- Store: `selectedType`, `selectedGrade`, `selectedRecipeId`, `searchQuery`

### LocationsTab

- 5 подтабов: Все | 📜 Рецепты | 📚 Книги | 📦 Куски | 🧱 Ресурсы
- «Все» объединяет данные из LOCATIONS_ALL + PIECES + RESOURCES
- Раса/Класс селекторы только на табе «Книги»
- Фильтр типа пати: Solo / Small Group / Group (`CustomSelect`)
- Фильтр уровня: `NumberInput` (общий shared-компонент) с диапазоном avg_level [-7, +4]
- Кнопка «Найти» со спиннером (0.5–1с), без поиска — пустой результат
- Обогащение рецептов: грейд (цветной бейдж) + тип + название результата крафта (из `RECIPE_ENRICHMENT.json`)
- Данные кусков: `LOCATIONS_PIECES.json` (собирается скриптом `build-locations-pieces.mjs` из RECIPES.json mainPieceMonsters)
- Данные ресурсов: `LOCATIONS_RESOURCES.json` (собирается скриптом `build-locations-resources.mjs` из Material/Other рецептов)
- Ленивая загрузка PIECES/RESOURCES: чанки 1.4MB/0.5MB, загружаются при переходе на таб
- Шансы дропа/спойла: белым цветом, уменьшенный шрифт, без дублирующего футера
- Тултип S/SG/G: справа от бейджа (portal), CSS-дубликат убран
- Счётчик «Найдено: N локаций»
- Селекторы Город/Локация: пункт «Все» + алфавитная сортировка
- Race, Class, City, Location селекторы через `CustomSelect`
- Поиск (`FloatingLabel`)

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

### GuideTab

- Таб «Гайд Бомжа» (`/guide`) — квесты из гайда «Гайд Бомжа 3. Lu4 Edition. Твинкогномы как драйвер экономики» (автор @iMessiah, форум L2E-Global)
- Данные: `src/data/guide/bomzhGuide.ts` — интро + 19 квестов (рус. имя, `enName` для связи с нашими данными, lvl, шаги дословно, награда, note)
- Таблица: № · Квест · Ур. · Награда (по гайду); раскрытие строки → шаги гайда + аккордион «Информация о квесте»
- Аккордион тянет данные через `enrichQuest(enName)`: NPC, локация, уровни, награда, шаги mw2.wiki, картинки, кнопка карты, ссылка post-ID
- Ссылки на квесты — новый формат `/lu4/posts/post/{id}-{slug}` через `questUrl`
- Квесты гайда добавлены в расовые квесты **Dwarf / Dwarf Mage** (10 новых: Find Sir Windawood, The Guard is Busy, Shards of Golem, Covert Business, Dreaming of the Skies, Tarantula's Spider Silk, Traces of Evil, Collector's Dream, Rancher's Plea, Catch the Wind)
- В данных добавлены 8 новых квестов: `questDetails.ts`, `questIds.ts`, `questSteps.ts`, `npcCoords.ts`, `QUEST_IMAGES.json` (картинки в `public/images/quests/`)
- Хелперы `enrichQuest`/`questUrl`/`slug`/`detectRewardTag` вынесены в `src/utils/quests.ts` (общие для QuestsTab и GuideTab)
- Таб ленивый: `React.lazy(() => import('./components/guide/GuideTab'))`, отдельный чанк ~16KB

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
- Цепочка Кусто: посты 87–95, данные в `src/data/quests/kustoQuests.ts`
- `enrichQuest()` проверяет: хардкод-мапы → поле квеста → `QUEST_DATA.json`
- `isPostQuest(name, id)` — удалён. Все ссылки через `questUrl(name, id)` → `/lu4/posts/post/{id}-{slug(name)}`

### Quest Data Files (`src/data/quests/`)

| Файл                      | Описание                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `questsByRace.ts`         | Расовые квесты по расам                                                            |
| `sharedQuests.ts`         | Общие квесты                                                                       |
| `templeExecutorQuests.ts` | Цепочка палача храма (9 квестов)                                                   |
| `kustoQuests.ts`          | Цепочка Кусто (9 квестов с шагами, изображения через QUEST_IMAGES.json)            |
| `professionRaces.ts`      | Маппинг профессий к их квестам Path of... + 3 in 1...                              |
| `questDetails.ts`         | NPC, локации, уровни для квестов                                                   |
| `questIds.ts`             | Маппинг имён квестов → post ID на mw2.wiki (6xx для расовых)                       |
| `questSteps.ts`           | Текстовые шаги прохождения (36 расовых квестов, 188 шагов)                         |
| `npcCoords.ts`            | Координаты NPC на карте мира                                                       |
| `QUEST_IMAGES.json`       | Маппинг квестов к изображениям (45 квестов: 36 расовых + 9 Кусто, 177 изображений) |

### URL на mw2.wiki

Все квесты на mw2.wiki теперь доступны через `/lu4/posts/post/{id}-{slug}`.
В июле 2026 mw2.wiki мигрировал все расовые квесты со старых ID (1, 2, 101-108, 151-170, 257-276, 293, 313)
на новые post ID (637-726). Старые ID теперь ведут на другие квесты — обновление `questIds.ts` обязательно.

Генерация ссылки в `QuestsTab.tsx`:

```tsx
function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function questUrl(name: string, id: number): string {
  return `https://mw2.wiki/lu4/posts/post/${id}-${slug(name)}`;
}
```

### Обновление наград расовых квестов (`scripts/fetch-quest-rewards.mjs`)

Собирает актуальные награды расовых квестов с mw2.wiki:

1. Fetches all 26 racial quests via `/lu4/quest/{id}` (follows redirect to post-format pages)
2. Извлекает награды из таблицы (post-формат) или `#result-stats` (old-формат)
3. Парсит количество (x N), названия предметов, секции (Воин/Маг)
4. Выводит старую и новую награду для каждого квеста

**Запуск:** `node scripts/fetch-quest-rewards.mjs`
**Зависимости:** Node.js 18+ (native https, без внешних пакетов)
**Лимиты:** 2 параллельных запроса, задержка 1-2с

**Запуск:** `node scripts/parse-quests.mjs`

### Quest Images

Изображения скачиваются скриптом `scripts/fetch-quest-images.mjs`.
Парсит актуальные изображения с mw2.wiki и обновляет `QUEST_IMAGES.json`.

Изображения Kusto-квестов скачиваются скриптом `scripts/quests/fetch-kusto.mjs`
(использует `shared.mjs` для утилит). Оба скрипта теперь обрабатывают HTTP 500
(начиная с июля 2026 mw2.wiki возвращает 500, но с валидным контентом) —
проверяют длину тела ответа вместо `resp.ok`.

`fetch-quest-images.mjs` мёрджит данные с существующим `QUEST_IMAGES.json`
вместо перезаписи — можно запускать для отдельных квестов без потери данных.

**Запуск:** `node scripts/fetch-quest-images.mjs` — все расовые квесты  
**Запуск:** `node scripts/quests/fetch-kusto.mjs` — цепочка Кусто (посты 87-95)  
**Зависимости:** Node.js 18+ (native fetch)
**Лимиты:** последовательная загрузка (1 запрос за раз), задержка 0.5-2с

Изображения хранятся в `public/images/quests/` и обновляются при изменении визуала квеста на mw2.wiki.

**Важно:** mw2.wiki теперь использует `/lu4/posts/post/{id}-{slug}` для всех страниц квестов. Генерация ссылок в `QuestsTab.tsx` использует `questUrl(name, id)` → `https://mw2.wiki/lu4/posts/post/{id}-{slug(name)}`. `isPostQuest` удалён.

## Scripts (`scripts/`)

### Skills pipeline

| Скрипт                       | Назначение                                                                                                           | npm скрипт |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| `fetch-mw2-skills.mjs`       | Основной парсер скиллов с mw2.wiki: описания, MP, кулдаун, трейт, атрибут, олимпиада, уровни → `SKILLS.json`         | —          |
| `fetch-mw2-class-levels.mjs` | Собирает `classLevel` (уровень персонажа для каждого уровня скилла) со страниц прокачки классов (51 класс)           | —          |
| `fetch-mw2-base-skills.mjs`  | Собирает скиллы базовых классов (Fighter, Mage и т.д.) и добавляет к классам-наследникам через дерево `BASE_LINEAGE` | —          |
| `fetch-base-classes.mjs`     | Добавляет базовые классы (Без профессии) в `SKILLS.json`: парсит mw2.wiki, копирует скиллы всем наследникам          | —          |
| `fix-base-skills.mjs`        | Удаляет базовые скиллы, не принадлежащие классу профессии (проверка через `classSkillMap` на mw2.wiki)               | —          |
| `fix-overlap-levels.mjs`     | Удаляет пересекающиеся уровни между 1-й и 2-й профессиями                                                            | —          |
| `fix-base-class-levels.mjs`  | Проставляет `classLevel` для базовых классов со страниц уровней (<20)                                                | —          |

### Boss pipeline

| Скрипт                   | Назначение                                                                                                                           | npm скрипт        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `fetch-mw2-bosses.mjs`   | Парсит статью рейд-боссов на mw2.wiki, качает изображения в `/public/images/bosses/`, добавляет `image`/`coords` в `RAIDBOSSES.json` | `update-mw2`      |
| `enrich-boss-npcids.mjs` | Читает статью рейд-боссов (post #385), извлекает NPC ID + slug для каждого босса в `RAIDBOSSES.json`                                 | `update-boss-ids` |
| `build-boss-id-map.mjs`  | Генерирует `BOSS_ID_MAP.json` для Telegram deep-linking (slug → id)                                                                  | —                 |

### Recipe pipeline

| Скрипт                             | Назначение                                                                                                                                      | npm скрипт |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `build-recipes.mjs`                | Собирает `RECIPES.json` из `tmp/recipe_json.json`, `tmp/items.json`, `tmp/npc_json_with_subtypes.json`. Фильтрует S-grade, категоризирует броню | —          |
| `build-locations-pieces.mjs`       | Собирает `LOCATIONS_PIECES.json` из RECIPES.json + LOCATIONS_ALL.json, группирует по локациям/монстрам                                          | —          |
| `build-locations-recipes-full.mjs` | Собирает `LOCATIONS_RECIPES_FULL.json` — обогащённые рецептные локации с монстрами и avg_level                                                  | —          |
| `build-locations-resources.mjs`    | Собирает `LOCATIONS_RESOURCES.json` из Material/Other рецептов + `tmp/locations.json`                                                           | —          |
| `build-recipe-enrichment.mjs`      | Собирает `RECIPE_ENRICHMENT.json` — lookup-мапу `recipeName → {grade, type, resultName, resultUrl}` для таба Локаций                            | —          |
| `print-nodrop-recipes.mjs`         | Диагностика: выводит список рецептов без данных дропа/спойла (read-only)                                                                        | —          |

### Icons pipeline

| Скрипт                 | Назначение                                                                                                                                                                                                    | npm скрипт                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `build-item-icons.mjs` | Универсальный сборщик иконок. 3 фазы: `item-wiki` (ITEM_WIKI.json из дропа боссов), `item-icons-by-id` (ITEM_ICONS_BY_ID.json из spellbook/locations), `recipe-icons` (RECIPE_ICONS.json из страниц рецептов) | `update-item-icons`, `update-item-icons-by-id`, `update-recipe-icons` |

### Quest pipeline

| Скрипт                      | Назначение                                                                                                        | npm скрипт |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------- |
| `parse-quests.mjs`          | Парсит квесты с mw2.wiki: полные шаги, NPC ID, имена, координаты → `QUEST_DATA.json`. Semaphore=4                 | —          |
| `fetch-quest-rewards.mjs`   | Собирает актуальные награды расовых квестов с mw2.wiki, сравнивает старые/новые, выводит TS-обновления            | —          |
| `fetch-quest-images.mjs`    | Скачивает изображения квестов с mw2.wiki в `/public/images/quests/`, обновляет `QUEST_IMAGES.json`                | —          |
| `dedup-quest-images.mjs`    | Дедуплицирует изображения по MD5, подменяет ссылки в `QUEST_IMAGES.json`                                          | —          |
| `apply-quest-steps.mjs`     | Парсит шаги прохождения с mw2.wiki (русский/английский), обновляет `questSteps.ts` с сохранением profession-блока | —          |
| `extract-quest-steps.mjs`   | Упрощённая однопоточная версия `apply-quest-steps.mjs` (вывод в stdout)                                           | —          |
| `quests/fetch-kusto.mjs`    | Скачивает изображения для цепочки Кусто (посты 87-95)                                                             | —          |
| `quests/fetch-other.mjs`    | Скачивает изображения для остальных квестов (не Path of..., не Кусто)                                             | —          |
| `quests/fetch-path.mjs`     | Скачивает изображения для Path of... квестов (1 профессия)                                                        | —          |
| `quests/fetch-three.mjs`    | Вывод ID для 3 in 1 квестов (2 профессия) без изображений                                                         | —          |
| `quests/shared.mjs`         | Утилиты для скриптов в `quests/` (обработка HTTP 500)                                                             | —          |
| `fetch-telegram-script.mjs` | Скачивает Telegram WebApp SDK (`telegram-web-app.js`) с telegram.org в `public/`                                  | —          |

## PWA

- `vite-plugin-pwa` (Workbox, `generateSW`) — service worker + manifest, подключён в `vite.config.ts`
- `registerType: 'autoUpdate'` — при новом деплое SW обновляется и применяется сразу
- Manifest: `start_url`/`scope` = `/l2team-navigator/`, `display: standalone`, `theme_color`/`background_color` = `#05070d`
- Иконки: `public/images/pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png` — генерируются из `public/images/logo-l2team.png` через `npx pwa-assets-generator public/images/logo-l2team.png --preset minimal-2023`
- Прекэш (до 2 МБ на файл): HTML, JS/CSS-чанки, шрифты, логотип, иконки, `telegram-web-app.js` (~7 МБ суммарно) — сайт работает оффлайн после установки SW; тяжёлые данные (SkillsTab ~5 МБ, RECIPES ~4.3 МБ) в прекэш не попадают и кэшируются рантаймом при первом заходе
- Рантайм-кэш:
  - Ленивые чанки `/assets/*.js|json` → `NetworkFirst` (timeout 10с, 30 дней)
  - Локальные картинки боссов/квестов `/images/(bosses|quests)/` → `CacheFirst` (60 дней)
  - Карты `/maps/` → `CacheFirst` (60 дней)
  - Внешние иконки mw2.wiki/lu4db → `StaleWhileRevalidate`
- **НЕ кэшируются**: Яндекс.Метрика (`mc.yandex.ru`), Telegram API backend (Render), POST-запросы
- В dev SW отключён (дефолт `vite-plugin-pwa`) — не влияет на e2e
- При изменении PWA-конфига проверить: `npm run build` → `dist/sw.js` + `dist/manifest.webmanifest`, ручная проверка в DevTools (Application → Service Workers / Manifest / Cache Storage)

## Analytics

- Яндекс.Метрика (ID: 110798252) добавлена в `index.html`
- Отслеживание просмотров страниц: `useEffect` в `AppLayout()` шлёт `hit(location)`
- Отслеживание целей: `goal('goal_name')` — выбор рецепта, раскрытие босса
- Все вызовы через `src/utils/metrics.ts`: `hit(path)` / `goal(name)`
- В футере — уведомление о сборе анонимной статистики (152-ФЗ)
- Пользователи Telegram Mini App: детекция через URL-параметр `tgWebAppData`, данные сохраняются в `useTelegramStore`
- Telegram deep link: `https://t.me/l2team_navigator_bot?startapp=boss_{safeId}` → `tgWebAppStartParam` → навигация к боссу
- Safe ID босса: `name.toLowerCase().replace(/[^a-z0-9]+/g, '-')` — маппинг в `src/data/BOSS_ID_MAP.json`
- Проверка членства в клане: POST `/api/check-user` с id + username при старте Mini App
- CopyLink не показывается пользователям Telegram

### Viewport: fullscreen при запуске (`src/utils/telegram.ts`)

- `setupTelegramViewport()` вызывается в `useEffect` на mount в `AppLayout()` (после первого рендера) — возвращает cleanup
- Порядок: `expand` → `disableVerticalSwipes` → `ready` → `requestFullscreen`
- `ready()` вызывается после раскрытия, чтобы лоадер Telegram скрывался уже на полном экране
- `requestFullscreen()` повторяется одноразово при первом тапе (`pointerdown`/`touchstart`), если `webApp.isFullscreen !== true` (страховка от `fullscreenFailed`)
- Каждый вызов в try/catch — на клиентах без поддержки метода пропускается, в обычном браузере no-op
- Физит баг: свайп вверх внутри таблиц сворачивал приложение (BottomSheet перехватывал жест)
- Тип `window.Telegram.WebApp` (включая `initData`) описан в `src/types/telegram.d.ts` (только используемые поля)

### Environment Variables

| Var                     | Назначение                                         |
| ----------------------- | -------------------------------------------------- |
| `VITE_TELEGRAM_API_URL` | URL бэкенда (Render)                               |
| `VITE_ADMIN_ID`         | Telegram ID администратора (открывает Debug Modal) |

- `setTelegramUser(user, platform)` — отправляет ID, платформу и премиум-статус в метрику

### Telegram API (`telegramApi.ts`)

- Telegram WebApp SDK (`telegram-web-app.js`) хранится локально в `public/` и подключается из `index.html` через `%BASE_URL%` (не грузится с CDN telegram.org)
- Использует **axios instance** с `baseURL` из `VITE_TELEGRAM_API_URL` и таймаутом 15s
- **Авторизация** через `getAuthHeaders()`:
  - Telegram Mini App: заголовок `X-Telegram-Init-Data` (initData из Telegram SDK)
  - Браузер: заголовок `X-Auth-Token` (токен из sessionStorage)
- Три функции: `checkClanMembership(id, username)`, `sendBossText(text)`, `validateToken(token)`
- Все ошибки форматируются через `fmtAxiosError()`
- `telegramStore.isAdmin` — вычисляется один раз при `initFromHash` по совпадению `user.id` с `VITE_ADMIN_ID`

### Auth Gate (`src/components/auth/AuthGate.tsx`)

- Показывается **только** в обычном браузере (не Telegram Mini App) и только в production
- **DEV режим** (`import.meta.env.DEV === true`): гейт всегда пропущен (кроме Playwright тестов — выставлен `VITE_PLAYWRIGHT_TEST=1`)
- **Telegram Mini App**: гейт всегда пропущен (проверка `isActualTelegram()`)
- **Браузер**: проверка sessionStorage → если есть `navigator_token` → `POST /api/auth/validate` → если ок, пускаем; если нет — показываем гейт
- Токен получается через бота [@l2team_butler_bot](https://t.me/l2team_butler_bot)
- Токен хранится в `sessionStorage` (живёт пока открыта вкладка)
- При закрытии вкладки токен теряется → новый визит требует новый токен

### Playwright тесты и Auth

- `e2e/helpers.ts` — `setupAuth(page)`: устанавливает `sessionStorage` + мок `/api/auth/validate`
- `e2e/auth.spec.ts` — 3 теста: гейт виден, ошибка при невалидном токене, вход с валидным
- Для включения гейта в Playwright: `VITE_PLAYWRIGHT_TEST=1` в `webServer.env`
- Остальные spec-файлы вызывают `setupAuth()` в `beforeEach` для обхода гейта

### DebugModal (`DebugModal.tsx`)

- Открывается: по `iddqs` (только админ/DEV) или при `sendBossError` (только админ)
- Если модалка открыта по ошибке — показывает **только ошибку**, полный JSON скрыт под toggle
- Подписан на стор через `useTelegramStore()` (реактивно), а не `getState()` (снэпшот)

### GateDebugModal (`GateDebugModal.tsx`)

- Открывается: ввод `wbchai` на любой странице (без админ-чека)
- Показывает обезличенную диагностику токен-гейта: `isActualTelegram`, наличие `window.Telegram`/`WebApp`, длину `initData`, наличие `tgWebAppData` в hash, `hasNavigatorToken`, userAgent, screenSize, language
- **Без персональных данных**: нет user id/username, нет env-переменных, нет содержимого hash
- Использует те же стили `DebugModal.module.scss`, кнопка «Копировать»

## Lazy Loading

- SkillsTab — ленивый через `React.lazy(() => import(...))` (SKILLS.json 7.7 MB)
- RecipeTab — ленивый через `React.lazy()`, данные RECIPES.json загружаются динамическим `import()` внутри компонента (отдельные чанки)
- При использовании динамического import данных — обязателен loading state через `dataLoaded`

## SEO

- `llms.txt` в `public/llms.txt` — описание сайта для LLM и поисковиков
  **Добавить квест:** дополнить словари `QUESTS.quest` или `QUESTS.posts` в скрипте

### Known mw2.wiki Issues (для всех парсеров)

| #   | Проблема                        | Решение                                                     |
| --- | ------------------------------- | ----------------------------------------------------------- |
| 1   | Cloudflare защита               | `httpx.AsyncClient(http2=True)`                             |
| 2   | Пагинация                       | `seen_ids: Set[int]` + `stale_count`                        |
| 3   | Склеенный grade в названии      | `clean_item_name(name, grade)`                              |
| 4   | Неправильный ID секции          | Использовать `#contained` и `#capsule` явно                 |
| 5   | CSS селекторы классов           | Использовать атрибутные селекторы: `[class*="text-center"]` |
| 6   | Русские ключи в таблицах        | Нормализация через `normalize_enchant_key()`                |
| 7   | Флаг is_rare                    | Проверка `<Rare Item Effect>` в описании                    |
| 8   | Первая страница уже в base_soup | Оптимизация `first_page_soup`                               |
| 9   | Yii2 роутинг                    | Формат `"Search[item_type]": "5"`                           |
| 10  | Длинные описания                | Сохранять HTML как есть, парсить связи отдельно             |
| 11  | URL префиксы                    | Универсальный regex `r'/item/(\d+)-'`                       |
| 12  | Числа с пробелами               | Функции `safe_int()` / `safe_float()`                       |
| 13  | Вложенный HTML в таблицах       | `find_all(..., recursive=True)`                             |
| 14  | Кнопки локаций                  | Парсить: выпадающее меню И прямую ссылку                    |
| 15  | Флаги в `item-name__additional` | Парсить флаги ДО вызова `decompose()`                       |
| 16  | Язык                            | `cookies={"language": "en"}` + `Accept-Language`            |
| 17  | 404 на пагинации                | Считать 404 как "конец пагинации"                           |
| 18  | "Массовые" предметы (Adena)     | Пропускать через `SKIP_PAGINATION_ITEM_IDS`                 |
| 19  | Soul crystals триггер           | Использовать английский триггер `'soul crystal'`            |
| 20  | Set parts триггер               | Использовать английский триггер `'set'`                     |
| 21  | Дробный `data-initial-amount`   | `safe_amount()` с fallback                                  |
| 22  | ID поста ≠ ID квеста            | Resolve через HTTP для извлечения `quest_wiki_id`           |
| 23  | Разный порядок колонок          | Динамический поиск ячейки по наличию ссылки                 |
| 24  | Аккордеоны в наградах           | Развернуть в текст с `[Heading]`                            |
| 25  | `find_parent` возвращает None   | Переключиться на `soup.select('div.stat_line')`             |
| 26  | `_load_existing_items` = None   | Добавить явный `return [], set()`                           |
| 27  | Дублирование HTTP в Enricher    | Оптимизация `first_page_html`                               |
| 28  | Race condition с headers        | Передавать User-Agent явно в КАЖДОМ запросе                 |
| 29  | Цвета в таблицах                | Извлекать `style` или вложенный `<span>`                    |

**Параметры:**

- `STAGES_CONFIG` — конфигурация для batch-обработки
- `asyncio.Semaphore(4)` — лимит параллельных запросов
- `random.uniform(1.5, 3.0)` — человеческая задержка
- `httpx.AsyncClient(http2=True, follow_redirects=True, cookies={"language": "en"})` — HTTP/2 + английский язык

## Build & Deploy

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run deploy` — `gh-pages -d dist` (pushes to `gh-pages` branch)
- CI: PR-check на lint + format + build при каждом PR в main
- Деплой на GitHub Pages автоматически при push в main
- Auto-tag при merge в main (формирует vX.Y.Z тэг)

## Data Notes

- Суммарный объём статических данных `src/data/*.json` ~19 МБ (SKILLS.json 7.7 МБ, RECIPES.json 7.0 МБ, локации ~4.4 МБ, RAIDBOSSES.json 0.53 МБ, SPELLBOOKS.json 0.17 МБ)
- Распарсенные данные занимают в RAM ~1.2× от размера JSON (~23 МБ для всех сразу; ~8 МБ на один тяжёлый таб) — V8 интернирует повторяющиеся строки-ключи, раздутия нет
- **IndexedDB не используется** (рассмотрено и отклонено): данные статичны и компактны в RAM, оффлайн уже закрыт Service Worker'ом, а перенос в IDB потребовал бы переписывания синхронного чтения/фильтрации на асинхронное с ручной версионизацией
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

- lu4db.ru cannot be scraped programmatically (SPA, no API, no prerendered data)
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

## Skills

| Skill          | Description                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------- |
| `vitest`       | Vitest testing patterns — unit tests, component tests, store tests, project conventions      |
| `scss-modules` | SCSS Modules: переменные темы, нейминг, миксины, отзывчивый дизайн                           |
| `react-router` | React Router v6: навигация, query params, CopyLink, lazy-loading                             |
| `pr-message`   | Единый формат PR-описаний на русском языке (Summary, Changes, Checklist, CHANGELOG, Version) |
