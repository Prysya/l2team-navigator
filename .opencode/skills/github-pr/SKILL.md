---
name: github-pr
description: >
  Создание Pull Requests для l2team-navigator: единый формат PR на русском
  (Summary, Changes, Checklist, CHANGELOG, версионирование) и работа с gh CLI.
  Trigger: создание PR, написание описания PR, gh pr create, обновление CHANGELOG,
  бампинг версии.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '2.0'
---

## Когда использовать

- Создание нового Pull Request
- Написание описания PR
- Обновление CHANGELOG.md
- Бампинг версии
- Работа с `gh` CLI (просмотр статуса, мерж, ревьюеры, лейблы)

---

## Структура PR

### PR Title

Формат: `type(scope): краткое описание на русском`

```
type(scope): описание
```

#### Типы

| Тип        | Когда                                        |
| ---------- | -------------------------------------------- |
| `feat`     | Новая функциональность, новый компонент      |
| `fix`      | Исправление бага                             |
| `refactor` | Рефакторинг, без изменения поведения         |
| `chore`    | Обслуживание, конфиги, версионирование       |
| `ci`       | CI/CD, workflows                             |
| `docs`     | Документация                                 |
| `style`    | Стили, форматирование (без изменения логики) |

#### Scope

| Scope        | Область                                         |
| ------------ | ----------------------------------------------- |
| `locations`  | Таб локаций                                     |
| `raidboss`   | Рейд-боссы                                      |
| `recipes`    | Таб рецептов                                    |
| `spellbook`  | Книги заклинаний                                |
| `skills`     | Таб навыков                                     |
| `calculator` | Калькулятор                                     |
| `quests`     | Квесты                                          |
| `app`        | Приложение в целом (роутинг, лейаут, lazy-load) |
| `deploy`     | Сборка, деплой, GitHub Pages                    |
| `data`       | Данные, парсеры, скрипты сборки                 |

### PR Body (шаблон)

```markdown
## Summary

- 1-3 предложения на русском: ЧТО сделали и ЗАЧЕМ

## Changes

### Область изменений 1

- Конкретное изменение
- Ещё одно

### Область изменений 2

- Изменение

## Checklist

- [ ] Тесты добавлены / обновлены
- [ ] CHANGELOG обновлён
- [ ] Версия бампнута (если нужно)

## Version

1.7.6 → 1.7.7
```

#### Правила для Version

- Пишется в теле PR, **не отдельным коммитом**
- Авто-tag workflow создаёт тэг при мерже в main
- Если версия не бампается — секцию можно опустить

#### Правила для Checks

Опционально, в конце PR body:

```
Checks: format ✅, lint ✅, build ✅, vitest N/N ✅
```

#### Ссылки на issue

- Для связи с issue: `Closes #123` в конце body

---

## CHANGELOG.md

Обновлять с каждым релизом. Версия — заголовок `## vX.Y.Z`.

Секции (на русском):

```
## vX.Y.Z

### Added
- Новые функции, компоненты, табы

### Changed
- Изменения существующего функционала

### Fixed
- Исправления багов

### Removed
- Удалённый функционал
```

Секции, которые не заполнены, **не включать** в CHANGELOG.

---

## Пример

```markdown
## Summary

- Добавлены подтабы с рецептами оружия, брони и бижутерии в таб Локаций
- Грейд-селектор фильтрует предметы по грейду

## Changes

### Рецепты оружия/брони/бижи

- 3 новых подтаба: Рец. Оружия, Рец. Брони, Рец. Бижи
- Грейд-селектор (NG/D/C/B/A) для рецептных табов и Кусков

### Данные

- LOCATIONS_RECIPES_FULL.json — новый файл данных (965KB, lazy-load)
- build-locations-pieces.mjs — добавлены recipe_type/recipe_grade
- build-locations-recipes-full.mjs — новый скрипт сборки

### Store

- TypeFilter расширен на recipe_weapon/recipe_armor/recipe_accessory
- Добавлен recipeGrade в состояния

## Checklist

- [ ] Тесты добавлены / обновлены
- [ ] CHANGELOG обновлён
- [ ] Версия бампнута

## Version

1.7.6 → 1.7.7
```

---

## Команда создания PR

С экранированием (heredoc, чтобы избежать проблем с бэктиками и спецсимволами):

```bash
gh pr create \
  --title "type(scope): описание" \
  --body "$(cat <<'EOF'
## Summary
- Что и зачем

## Changes
### Область
- Пункты

## Checklist
- [ ] Тесты добавлены / обновлены
- [ ] CHANGELOG обновлён

## Version
1.7.6 → 1.7.7
EOF
)"
```

### Draft PR

```bash
gh pr create --draft \
  --title "wip: refactor auth" \
  --body "Work in progress"
```

### PR с ревьюерами и лейблами

```bash
gh pr create \
  --title "type(scope): описание" \
  --body "..." \
  --reviewer "user1,user2" \
  --label "enhancement,api"
```

### Открыть PR в браузере

```bash
gh pr create --web
```

---

## Команды gh CLI

```bash
# Просмотр статуса PR
gh pr status

# Просмотр diff
gh pr diff

# Проверить CI статус
gh pr checks

# Merge со squash
gh pr merge --squash

# Добавить ревьюера
gh pr edit --add-reviewer username
```

---

## Quick Reference

| Task         | Command                                  |
| ------------ | ---------------------------------------- |
| Create PR    | `gh pr create -t "type: desc" -b "body"` |
| Draft PR     | `gh pr create --draft`                   |
| Web editor   | `gh pr create --web`                     |
| Add reviewer | `--reviewer user1,user2`                 |
| Add label    | `--label bug,high-priority`              |
| Link issue   | `Closes #123` in body                    |
| View status  | `gh pr status`                           |
| Merge squash | `gh pr merge --squash`                   |

---

## Анти-паттерны

| Плохо                     | Хорошо                                      |
| ------------------------- | ------------------------------------------- |
| `fix bug`                 | `fix(raidboss): respawn timer not updating` |
| PR без описания           | Полный шаблон с Summary + Changes           |
| Версия отдельным коммитом | Версия в теле PR                            |
| CHANGELOG не обновлён     | CHANGELOG с русскими секциями               |
| 50+ файлов в одном PR     | Разбить на логические PR                    |
| Английский в CHANGELOG    | Русский язык                                |

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI Manual](https://cli.github.com/manual/gh_pr_create)
