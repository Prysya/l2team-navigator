# ⚔️ L2team Navigator

> Dashboard для сервера Lineage 2 LU4 — рейд-боссы, скиллы, спекбуки, рецепты и локации.

[![Deploy](https://github.com/Prysya/l2team-navigator/actions/workflows/deploy.yml/badge.svg)](https://github.com/Prysya/l2team-navigator/actions/workflows/deploy.yml)

**Live:** [https://prysya.github.io/l2team-navigator/](https://prysya.github.io/l2team-navigator/)

---

## Features

- **👹 Рейд-боссы** — 139 боссов со статами, дроп-таблицами и респавном (Epic / Regular)
- **📖 Скиллы** — 2145 скиллов с фильтром по расе/классу, уровню, поиск по названию
- **📚 Спекбуки** — таблица дропа спекбуков с фильтром по расе и скиллу
- **📜 Рецепты** — категории и фильтр по рецептам
- **📍 Локации** — локации с подкатегориями
- **🌐 EN/RU** — переключение языка для названий рас и классов

## Stack

- **Vite 5** + **React 18** + **TypeScript** (strict, `noUnusedLocals`, `noUncheckedIndexedAccess`)
- **SCSS Modules** + **sass-embedded**
- **normalize.css**
- **Static data** — все данные в JSON (без runtime API)
- **GitHub Pages** — автоматический деплой через GitHub Actions

## Development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run preview   # preview production build
```

### Update data

```bash
npm run update-data    # fetch skills + parse bosses
npm run update-skills  # только скиллы
npm run update-bosses  # только рейд-боссы
```

## Deploy

```bash
npm run deploy    # gh-pages -d dist
```

Пуш в `main` также запускает автоматический деплой через GitHub Actions.

## Project Structure

```
src/
├── components/
│   ├── raidboss/     # RaidBossTab — рейд-боссы
│   ├── skills/       # SkillsTab — скиллы
│   ├── spellbooks/   # SpellbookTab — спекбуки
│   ├── recipes/      # RecipeTab — рецепты
│   ├── locations/    # LocationsTab — локации
│   └── tabs/         # TabBar — навигация
├── data/             # JSON и TS данные
├── hooks/            # React hooks
├── styles/           # SCSS переменные, миксины, глобалки
├── types/            # TypeScript типы
└── utils/            # helpers, constants
```

## Data Sources

- [mw2.wiki](https://mw2.wiki) — данные по рейд-боссам
- [lu4db.ru](https://lu4db.ru) — данные по скиллам (через API)
- [L2J DataPack](https://github.com/L2J/L2J_DataPack) — спавн-координаты (планируется для карты)

## License

MIT
