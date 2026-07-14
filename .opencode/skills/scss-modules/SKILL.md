---
name: scss-modules
description: >
  SCSS Modules patterns for gaming-themed dark UI with CSS custom properties.
  Covers naming conventions, variables, mixins, composition, responsive design.
  Trigger: When writing styles, *.module.scss, SCSS variables, design system,
  or theming for components.
---

## Когда использовать

- Создание новых `.module.scss` файлов для компонентов
- Использование переменных темы, цветов, шрифтов
- Респонсив-дизайн (мобильные/планшетные брейкпоинты)
- Анимации, градиенты, тени в стиле проекта

## Архитектура стилей

- Каждый компонент имеет свой `ComponentName.module.scss`
- Глобальные стили в `src/styles/_global.scss`
- Переменные в `src/styles/_variables.scss`
- Миксины в `src/styles/_mixins.scss`
- Импорт: `@use "../../styles/variables" as *;` и `@use "../../styles/mixins" as *;`
- В TS/TSX: `import styles from './ComponentName.module.scss'`
- Конфиг Vitest: `css.modules.classNameStrategy: 'non-scoped'`
- `classnames` (`cx()`) для условных классов

## Тема (CSS Custom Properties)

Все цвета — CSS-переменные в `:root` (`_global.scss`), SCSS-переменные только как алиасы:

```scss
// _variables.scss — SCSS alias → CSS var
$color-primary: var(--color-primary);
$color-border: var(--color-border);
$color-surface: var(--color-surface);
$color-text: var(--color-text);
$color-text-muted: var(--color-text-muted);
$color-link: var(--color-link);
$color-danger: var(--color-danger);
$color-accent-purple: var(--color-accent-purple);
$color-accent-green: var(--color-accent-green);
$color-accent-orange: var(--color-accent-orange);
$color-accent-amber: var(--color-accent-amber);
$color-accent-cyan: var(--color-accent-cyan);
```

Градиенты — тоже CSS-переменные:

```scss
$gradient-primary: var(--gradient-primary);
$gradient-bg-1: var(--gradient-bg-1);
```

Тени:

```scss
$shadow-primary: var(--shadow-primary);
$shadow-primary-sm: var(--shadow-primary-sm);
$shadow-box: var(--shadow-box);
```

Шрифты:

```scss
$font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
$font-mono: "Consolas", "Courier New", monospace;
$font-size-base: var(--font-size-base);   // 13px
$font-size-sm: var(--font-size-sm);       // 12px
$font-size-lg: var(--font-size-lg);       // 15px
```

## Отступы и радиусы (статические)

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 10px;
$spacing-lg: 12px;
$spacing-xl: 15px;
$spacing-2xl: 20px;

$radius-sm: 3px;
$radius-md: 4px;
$radius-lg: 6px;
$radius-xl: 8px;
```

## Брейкпоинты и миксины

```scss
$bp-tablet: 1024px;
$bp-mobile: 768px;
$bp-small: 480px;

// _mixins.scss
@mixin tablet { @media (max-width: $bp-tablet) { @content; } }
@mixin mobile { @media (max-width: $bp-mobile) { @content; } }
@mixin small  { @media (max-width: $bp-small)  { @content; } }
```

Всегда используй миксины, не пиши `@media` вручную.

## Нейминг классов (camelCase)

```scss
// ✅ Правильно: camelCase
.wrapper {}
.searchWrap {}
.optionActive {}
.groupLabel {}
.copyBtn {}

// Использование в TSX
<div className={styles.wrapper}>
  <span className={styles.optionActive}>text</span>
</div>
```

Вложенность через `&`:

```scss
.trigger {
  // ...
  .wrapper:focus-within & {
    border-color: $color-primary;
  }
}

.linkIcon {
  .copyBtn:hover & {
    opacity: 1;
  }
}
```

## Состояния через CSS-классы (не :hover одного элемента)

Для состояний (open, active, disabled) добавляй CSS-класс на родителя и используй `&`:

```scss
.wrapper {
  &.isOpen .menu { display: block; }
  &.hasValue .label { top: 0; }
}

.label {
  &.floating { /* стили для всплывшего лейбла */ }
}
```

В TSX:

```tsx
<div className={cx(styles.wrapper, { [styles.isOpen]: open })}>
```

## Типичные паттерны

### Controls bar

```scss
.controls {
  background: $color-surface;
  padding: $spacing-2xl;
  border-radius: $radius-xl;
  margin-bottom: $spacing-2xl;
  display: flex;
  gap: $spacing-xl;
  align-items: center;
  flex-wrap: wrap;

  @include tablet {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-md;
  }
}
```

### Карточка / панель

```scss
.card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $spacing-2xl;
  border-left: 3px solid $color-primary;
}
```

### Таблица с фиксированной раскладкой

```scss
.table {
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
}
```

### Скроллбар

```scss
.menu {
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb {
    background: $color-border;
    border-radius: 3px;
  }
}
```

## Что НЕ используется

- ❌ Tailwind CSS — нет в проекте
- ❌ styled-components / CSS-in-JS
- ❌ CSS Modules composition / composes
- ❌ `@import` — только `@use`
- ❌ `var()` в SCSS-файлах напрямую (используй SCSS-переменные-алиасы)

## Импорт в компоненте

```tsx
import styles from './ComponentName.module.scss';
import cx from 'classnames';
```
