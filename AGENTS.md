# L2team Navigator — Project Context

## Stack
- Vite 5 + React 18 + TypeScript (strict, no `any`) + SCSS Modules + normalize.css
- No CRA, no external UI library
- Static data in `src/data/*.json` (no runtime API calls)
- Deployed to GitHub Pages at `/l2team-navigator/`
- Sass: `sass-embedded` with `api: 'modern-compiler'` in vite.config.ts

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

- Valid tabs constant in `src/utils/constants.ts` (`TAB_NAMES`, `VALID_TABS`)
- TabBar component renders all tabs; active tab determined by `window.location.hash`
- Switching tabs clears `?sbRace=` and `?sbQ=` search params (unless switching to spellbooks)

## Features by Tab

### SkillsTab
- EN/RU language toggle (radio buttons) at top of controls bar
- Race + class select dropdowns; labels localize based on language
- EN_CLASS_NAMES map (51 classes), RU_CLASS_NAMES map (28 entries), CLASS_RACE_MAP
- Skill search and level filter
- `compressLevels` — groups consecutive levels with identical description into comma-separated ranges
- `cleanStatText` — strips leading zeros, hides HP stats
- Skill stats rendered as separate bordered pills
- Numbers in skill descriptions highlighted with `$color-accent-orange`
- "Где выбить книгу" button in skill cards — navigates to spellbooks tab with `?sbRace=&sbQ=` URL params
- Imports data from `src/data/SKILLS.json` (2145 skills)

### SpellbookTab
- Race + skill name filters; pre-fills from `?sbRace=` / `?sbQ=` URL params on mount
- Lazy race loading — only loads classes for selected race
- Table with class tags (localized via RU_CLASS_NAMES), level, drop chance, mob name, description
- Language toggle affects class tag labels

### RecipeTab
- Card layout with border-left accent
- Recipe select labels show only recipe name (no `#number —` prefix)
- Category-based filtering

### LocationsTab
- Gradient active buttons for sub-tabs
- Consistent SCSS variables with other tabs

### RaidBossTab
- 139 bosses (130 with stats/drops from mw2.wiki, 9 location+respawn only)
- Two sections: 🔥 Epic (fixed respawn: Core, Orfen, Queen Ant, Zaken) + 👹 Regular
- Click row to expand detail panel (stats grid + unified drop table)
- Drop table: `table-layout: fixed`, group headers ("Шанс дропа группы: X%"), neutral border
- Item names are clickable links to `mw2.wiki/lu4/search/result?Search[query]=...`
- No row hover highlighting (global override in both main and drop tables)
- Respawn badge: `⏱ Респ: 40с`
- Monster stat badges: larger padding/radius, font-weight 600
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

## Build & Deploy
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (JS: ~2.86MB / 382KB gzip, CSS: ~31KB / 5.9KB gzip)
- `npm run deploy` — `gh-pages -d dist` (pushes to `gh-pages` branch)

## Key Design Decisions
- Language toggle is a full-width row inside controls bar (`flex-basis: 100%`), not floating
- Spellbook linking via URL search params (`?sbRace=&sbQ=`) not lifted state — enables bookmarking
- Boss detail panels are `<tr><td colSpan={4}>` inside `<tbody>` (valid DOM, not separate divs)
- Drops rendered as single `table-layout:fixed` table with group header separator rows
- ALL json filenames in data/ are UPPERCASE (includes skills.json renamed to SKILLS.json)
- Race keys are English (`'Elf'`, `'Dark Elf'`, `'Human'`, `'Orc'`, `'Dwarf'`)

## Known Constraints
- fetch-raidbosses.mjs cannot extract from lu4db directly (SPA requires JS rendering)
- Item thumbnails not available — no item ID in drop data
- `RAIDBOSSES.json` is large (530KB) and git-ignored

## Future: World Map for Raid Bosses

### Approach (L2J Datapack)
If adding an interactive map to RaidBossTab, use data from **L2J DataPack** (open-source, XML spawn files with x/y/z coordinates).

### Sources
- [L2J DataPack on GitHub](https://github.com/L2J/L2J_DataPack) — `data/spawns/Npcs/` contains XML with `x`, `y`, `z` attributes for every NPC
- Map image from lu4db: `/media/site/maps/world-map.jpg` (3004×3004px, exists at `https://lu4db.ru/media/site/maps/world-map.jpg`)
- lu4db itself can't be scraped programmatically (SPA, no API, no prerendered data)

### Steps to implement
1. **Parse L2J DataPack** — write a script (`scripts/parse-l2j-spawns.mjs`) that downloads or reads L2J spawn XML files, filters by NPC IDs matching raid bosses (from our current data), and extracts `npcId`, `x`, `y`, `z`
2. **Merge coordinates** — add `coords: { x, y }` field to each boss in `RAIDBOSSES.json` (convert L2J world coordinates to pixel positions on the 3004×3004 world map)
3. **Map component** — new tab or sub-tab rendering the world map as background with boss markers positioned via CSS `left`/`top`; click marker to expand boss details
4. **Pixel coordinate conversion** — L2J world x/y → pixel x/y on the world map image (formula can be derived from L2J map data or reverse-engineered from lu4db)

### Notes
- lu4db positions bosses on the map using `<span>` with inline `left`/`top` (percentage or px) over `world-map.jpg`
- L2J coordinates use the in-game world coordinate system (~655k × 655k range); conversion to pixel values needs a linear transform
- The map image is publicly accessible and can be copied to `/public/maps/world-map.jpg` in our project
