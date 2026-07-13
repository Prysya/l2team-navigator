# Changelog

All notable changes to this project will be documented in this file.

## [1.1.2] - 2026-07-13

### Added
- CSS custom properties for all colors, gradients, shadows, font sizes
- `DESIGN_SYSTEM.md` with design tokens documentation
- `_tokens.scss` with component-level variables
- Enhanced background with third gradient layer + micro grid texture
- burger menu on mobile (slide-in from left, 60% width)
- JS-delegated tooltips for location type badges
- Styled tooltips via `data-tooltip` attribute
- `.monster-name` class for larger monster name font

### Changed
- Header logo replaces text title
- TabBar → Chakra `Tabs` (reverted)
- Tab icons with text below on mobile
- All tables migrated to TanStack Table (RaidBoss, Spellbook, Recipe)
- Floating label with border matching input
- Social links moved into burger menu on mobile
- Item names in drop table use `$color-link` (blue)
- Recipe name is clickable link instead of Wiki button
- Material section uses `$color-primary` instead of orange

### Fixed
- Search input 100% width in RecipeTab
- Missing `name` attribute on inputs (HTML validation error)
- Select arrow centered vertically with rotation animation
- Input height matching select height (38px)
- Header links staying right on mobile
- Duplicate SCSS classes cleaned up
- HTML entity double-escaping in monster names
- Table overflow clipping tooltips
- Scroll lock when burger menu open

### Removed
- EN/RU language toggle (English only)
- `languageStore` (zustand)
- SVG logo file
- Theme switcher widget
- AGR badge from header
- Unused SCSS classes from all modules
- `_tokens.scss` (was unused)
- Row hover highlighting on tables

## [1.1.1] - 2026-07-13

### Added
- Auto-tag workflow on merge to main (`tag-on-merge.yml`)
- Auto patch version bump if unchanged in PR

### Fixed
- RaidBoss search input full width
- Move epic/RB count below search input

## [1.1.0] - 2026-07-13

### Added
- Header logo (`logo-l2team.png`) instead of text
- Tab icons with text below on mobile
- `FloatingLabel` with `className` prop
- `_tokens.scss` with component design tokens

### Changed
- TabBar responsive design (icons + text)

### Fixed
- Search input full width in RecipeTab
- Missing `name` attribute on inputs
- Select arrow centered + rotation animation
- Input height matching selects (38px)
- Header links position on mobile

## [1.0.0] - 2026-07-13

### Added
- Initial release
- RaidBossTab with 139 bosses, images, world map
- SkillsTab with 2145 skills, EN/RU toggle
- SpellbookTab with book/mob data
- RecipeTab with group filters and monster tables
- LocationsTab with city/location filters
- Custom SCSS modules, dark gaming theme
- TabBar with hash-based navigation
- CopyLink for sharing URLs
- CustomSelect + FloatingLabel components
- All data in local JSON files
