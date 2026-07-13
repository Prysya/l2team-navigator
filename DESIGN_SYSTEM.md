# Design System

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `$color-bg` | `#05070d` | Page background |
| `$color-surface` | `#121a2b` | Card, panel, controls background |
| `$color-surface-alt` | `#0f1626` | Alternate surface (darker) |
| `$color-surface-hover` | `#1a2338` | Surface hover state |
| `$color-border` | `#24304a` | Borders, dividers |
| `$color-primary` | `#38bdf8` | Primary accent (sky blue) |
| `$color-primary-dark` | `#0ea5e9` | Primary dark, gradients |
| `$color-text` | `#dbe4f0` | Body text |
| `$color-text-muted` | `#8291ab` | Secondary text, placeholders |
| `$color-link` | `#6ab7ff` | Links |
| `$color-accent-purple` | `#a78bfa` | Purple accent |
| `$color-accent-green` | `#7ee787` | Green accent |
| `$color-accent-orange` | `#ffa657` | Orange accent (skill numbers) |
| `$color-danger` | `#ef4444` | Error/danger text |
| `$color-danger-bg` | `#7f1d1d` | Error background |
| `$color-danger-text` | `#fecaca` | Error text |
| `$color-agr` | `#ff3b3b` | AGR badge |

## Typography

### Font Family
- Primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Monospace: `'Consolas', 'Courier New', monospace`

### Type Scale

| Token | Size | Usage |
|---|---|---|
| `$font-size-xs` | 10px | Labels, badges |
| `$font-size-sm` | 11px | Secondary info |
| `$font-size-base` | 12px | Body text, tables |
| `$font-size-md` | 13px | Mobile body text |
| `$font-size-lg` | 14px | Controls, buttons |
| `$font-size-xl` | 18px | Section titles |
| `$font-size-h1` | 1.4rem | Page title |

## Spacing Scale

| Token | Value |
|---|---|
| `$spacing-xs` | 4px |
| `$spacing-sm` | 8px |
| `$spacing-md` | 10px |
| `$spacing-lg` | 12px |
| `$spacing-xl` | 15px |
| `$spacing-2xl` | 20px |

## Breakpoints

| Mixin | Max Width | Target |
|---|---|---|
| `@include tablet` | 1024px | Tablet / small desktop |
| `@include mobile` | 768px | Mobile portrait |
| `@include small` | 480px | Small phones |

Usage:
```scss
@include mobile {
  // mobile styles
}
```

## Component Tokens (`_tokens.scss`)

Import in any component:
```scss
@use '../../styles/tokens' as *;
```

### Animation
- `$duration-fade: 0.15s`
- `$duration-slide: 0.2s`
- `$duration-expand: 0.3s`
- `$easing-spring: cubic-bezier(0.4, 0, 0.2, 1)`

### Controls (Inputs & Selects)
- Min height: `38px`
- Border radius: `6px` (`$radius-lg`)
- Background: `#0b0f1a`
- Font size: `14px` (`$font-size-lg`)
- Padding: `14px 12px 6px` bottom (selects: `36px` right for arrow)

### Cards
- Background: `$color-surface`
- Border radius: `8px` (`$radius-xl`)
- Left accent border: `4px solid $color-primary`
- Padding: `20px` (mobile: `12px`)

### Badges
- Font: `11px` / `600`
- Padding: `3px 10px`
- Radius: `6px`
- Background: `rgba(56, 189, 248, 0.12)` / text: `$color-primary`

### Gradients
- Primary: `linear-gradient(135deg, #38bdf8, #0ea5e9)`
- Background spots: two radial gradients positioned at top-left / top-right

## SCSS Conventions

1. **Module imports** — always use `@use` (not `@import`)
2. **Variables first** — import `_tokens.scss` which re-exports all design tokens
3. **Color values** — always use named variables, never hardcode colors in components
4. **Responsive** — use mixins from `_mixins.scss` (`@include tablet/mobile/small`)
5. **SCSS Modules** — component styles use `.module.scss`; global styles in `_global.scss`
6. **Nesting** — max 3 levels deep

## Component Architecture

```
src/styles/
  _variables.scss    — raw design tokens (colors, sizes, fonts)
  _tokens.scss       — semantic tokens and component-level variables
  _mixins.scss       — responsive mixins
  _global.scss       — global reset, header, shared utilities

src/components/*/
  ComponentName.tsx         — component
  ComponentName.module.scss — scoped styles
```
