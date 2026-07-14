---
name: vitest
description: >
  Vitest testing patterns for React + Zustand projects. Covers unit tests, component tests,
  store tests, and project-specific conventions. Trigger: When writing vitest tests, test files,
  *.test.ts, *.test.tsx, __tests__ directories, or describing testing patterns.
---

## Когда использовать

- Создание новых тестов для компонентов, сторов, утилит
- Рефакторинг существующих тестов
- Написание тестов для новых фич
- Code review тестов

## Архитектура тестов

- Тесты лежат в `__tests__/` рядом с тестируемым модулем
- Именование: `*.test.ts` для утилит, `*.test.tsx` для компонентов
- Настройка: `src/test/setup.ts` импортирует `@testing-library/jest-dom/vitest`
- Конфиг Vitest — inline в `vite.config.ts` (jsdom, globals: true, css non-scoped)
- Команды: `npm run test` (vitest run), `npm run test:watch` (vitest)

## Основные правила

- **Все тесты явно импортируют** `describe, expect, it` из `vitest`. Даже при `globals: true`.
- Импорты сортируются по правилам ESLint (simple-import-sort): `vitest` → `@testing-library` → `@/` → relative
- **Нет snapshot-тестов** — ни одного `__snapshots__` в проекте
- **Нет `vi.mock()`** — модульное мокирование не используется
- Для моков используется только `vi.fn()`

## Структура тестов

```ts
import { beforeEach, describe, expect, it } from 'vitest';
// react-testing-library для компонентов
import { fireEvent, render, screen } from '@testing-library/react';

// beforeEach только если нужно сбросить состояние
beforeEach(() => {
  useSomeStore.setState({ field: '', other: null });
});

describe('ComponentName / functionName', () => {
  it('делает что-то конкретное', () => {
    // ...
  });
});
```

## Паттерны по типам

### Pure functions / utils

```ts
import { describe, expect, it } from 'vitest';

describe('functionName', () => {
  it('возвращает X для null', () => {
    expect(functionName(null)).toBeNull();
  });

  it('обрабатывает граничный случай', () => {
    expect(functionName(input)).toEqual(expected);
  });
});
```

- `.toBe()` для примитивов (строки, числа, булевы)
- `.toEqual()` для объектов и массивов (deep equality)
- `.toBeNull()`, `.toBeTruthy()`, `.toBeFalsy()` для проверки существования
- `.toContain()` для проверки подстрок
- Каждый `it` — ровно один assert (или группа логически связанных assert'ов на один кейс)

### Zustand store tests

```ts
import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(() => {
  useStore.setState({ field1: '', field2: null });
});

describe('storeName', () => {
  it('изменяет поле через экшн', () => {
    useStore.getState().setField('value');
    expect(useStore.getState().field).toBe('value');
  });
});
```

- `beforeEach` сбрасывает стор в дефолтное состояние через `useStore.setState(...)`
- Экшены вызываются через `useStore.getState().actionName(...)`
- Чтение состояния: `useStore.getState().fieldName`

### Component tests

```ts
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

describe('ComponentName', () => {
  it('рендерит заголовок', () => {
    render(<BrowserRouter><Component /></BrowserRouter>);
    expect(screen.getByText('Заголовок')).toBeTruthy();
  });

  it('обрабатывает событие', () => {
    render(<BrowserRouter><Component /></BrowserRouter>);
    fireEvent.click(screen.getByText('Кнопка'));
    expect(screen.queryByText('Скрытый текст')).toBeNull();
  });
});
```

- Компоненты с роутингом оборачиваются в `<BrowserRouter>`
- `screen.getByText()` — для элементов, которые ДОЛЖНЫ быть
- `screen.queryByText()` — для элементов, которых НЕ должно быть (после `.toBeNull()`)
- `fireEvent.click()`, `fireEvent.keyDown()` — основные события
- `screen.getAllByText()` если элемент встречается несколько раз, проверка через `.length`

## Что НЕ используется

- ❌ Нет snapshot tests (`toMatchSnapshot`)
- ❌ Нет `vi.mock()` — нет модульного мокирования
- ❌ Нет `renderHook` — сторы тестируются напрямую
- ❌ Нет `userEvent` — только `fireEvent`

## Ассершены (jest-dom from setup)

- `toBeVisible()`, `toBeInTheDocument()`, `toHaveTextContent()`
- `toHaveClass()`, `toBeDisabled()`

## Команды

```bash
npm run test        # vitest run
npm run test:watch  # vitest (watch mode)
npm run test:e2e    # playwright test
```
