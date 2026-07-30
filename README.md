# L2team Navigator

> Dashboard для сервера Lineage 2 LU4 — рейд-боссы, скиллы, спекбуки, рецепты, локации и квесты.

[![Deploy](https://github.com/Prysya/l2team-navigator/actions/workflows/deploy.yml/badge.svg)](https://github.com/Prysya/l2team-navigator/actions/workflows/deploy.yml)

**Live:** [https://prysya.github.io/l2team-navigator/](https://prysya.github.io/l2team-navigator/)

---

## Features

- **Рейд-боссы** — 139 боссов со статами, дроп-таблицами, респавном, изображениями и картой мира
- **Скиллы** — 2671 скилл с описаниями, MP, КД, трейтом, атрибутом; фильтр по расе/классу
- **Спекбуки** — дроп спекбуков с фильтром по расе, профессии, поиск по названию
- **Рецепты** — крафт, дроп, компоненты; категоризация по типу и грейду
- **Локации** — 5 подтабов (Все / Рецепты / Книги / Куски / Ресурсы) с фильтрами
- **Квесты** — расовые квесты с прохождением, NPC, наградами, скриншотами
- **Калькулятор** — расчёт параметров
- **Telegram Mini App** — авторизация через Telegram, deep link на боссов, проверка клана
- **EN/RU** — переключение языка интерфейса

## Stack

- **Vite 5** + **React 18** + **TypeScript** (strict, no `any`)
- **react-router-dom** v6 — path-based routing
- **Zustand** — сторы для каждого таба
- **SCSS Modules** + **sass-embedded** (API modern-compiler)
- **ESLint** (simple-import-sort, unused-imports) + **Prettier**
- **classnames** — условные className
- **normalize.css**
- **Static data** — все данные в JSON (без runtime API)
- **GitHub Pages** — деплой через GitHub Actions + auto-tag

## Development

```bash
npm install
npm run dev         # Vite dev server
npm run build       # tsc -b && vite build
npm run preview     # preview production build
npm run lint        # ESLint check
npm run format      # Prettier
```

### Update data

```bash
npm run update-mw2              # парсинг боссов с mw2.wiki
npm run update-boss-ids         # NPC ID боссов для Telegram deep-link
npm run update-item-icons       # иконки предметов (все фазы)
npm run update-recipe-icons     # только иконки рецептов
npm run update-item-icons-by-id # только иконки по ID
```

## Project Structure

```
src/
├── components/
│   ├── main/         # MainPage — сетка разделов
│   ├── raidboss/     # RaidBossTab — боссы, дроп, карта
│   ├── skills/       # SkillsTab — скиллы, lazy-loaded
│   ├── spellbooks/   # SpellbookTab — спекбуки
│   ├── recipes/      # RecipeTab — рецепты, lazy-loaded
│   ├── locations/    # LocationsTab — локации
│   ├── quests/       # QuestsTab — квесты
│   ├── calculator/   # CalculatorTab — калькулятор
│   ├── shared/       # FloatingLabel, CustomSelect, Toast, EmptyState
│   └── tabs/         # TabBar — навигация
├── data/             # JSON и TS данные квестов
├── stores/           # Zustand сторы
├── styles/           # SCSS переменные, миксины, глобалки
├── types/            # TypeScript декларации
└── utils/            # helpers, constants, metrics, telegramApi
```

## Data Sources

- [mw2.wiki](https://mw2.wiki) — основной источник всех данных (боссы, скиллы, спекбуки, рецепты, квесты, локации)
- [lu4db.ru](https://lu4db.ru) — не скрапится (SPA, без API)

## Scripts

Полный список в `AGENTS.md` в секции Scripts.

## License

MIT
