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

## Tabs (hash-based navigation in App.tsx)
| Hash | Component | File |
|------|-----------|------|
| `#recipes` | RecipeTab | `src/components/recipes/RecipeTab.tsx` |
| `#spellbooks` | SpellbookTab | `src/components/spellbooks/SpellbookTab.tsx` |
| `#locations` | LocationsTab | `src/components/locations/LocationsTab.tsx` |
| `#skills` | SkillsTab | `src/components/skills/SkillsTab.tsx` |
| `#raidboss` | RaidBossTab | `src/components/raidboss/RaidBossTab.tsx` |
| `#calculator` | CalculatorTab | `src/components/calculator/CalculatorTab.tsx` |

- Valid tabs constant in `src/utils/constants.ts` (`TAB_NAMES`, `VALID_TABS`)
- TabBar component renders all tabs; active tab determined by `window.location.hash`
- Switching tabs clears `?sbRace=` and `?sbQ=` search params (unless switching to spellbooks)
- `getTabFromHash()` strips query params via `.split('?')[0]` — handles `#tab?key=val` URLs
- `fullHash` state in App.tsx forces component re-mount on any hash change (via `key={fullHash}`)

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
