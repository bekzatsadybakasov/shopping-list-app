# Shopping List Backend API

## Установка

```bash
npm install
```

## Запуск

```bash
npm start
```

Сервер запустится на порту 3001.

## Структура проекта

```
server/
├── app.js                          # Главный файл приложения
├── app/
│   ├── config/
│   │   └── profiles.js            # Определение профилей
│   ├── middleware/
│   │   ├── validation.js          # Валидация dtoIn
│   │   └── authorization.js      # Проверка авторизации
│   └── server/
│       └── api/
│           ├── shopping-list/         # Эндпоинты для списков
│           ├── shopping-list-member/  # Эндпоинты для участников
│           └── shopping-list-item/    # Эндпоинты для товаров
```

## Эндпоинты

### Shopping Lists
- `POST /api/shopping-list/create` - создать список
- `GET /api/shopping-list/get?id=...&awid=...` - получить список
- `GET /api/shopping-list/list?awid=...&filter=...` - список всех списков
- `POST /api/shopping-list/update` - обновить список
- `POST /api/shopping-list/delete` - удалить список
- `POST /api/shopping-list/archive` - архивировать
- `POST /api/shopping-list/unarchive` - разархивировать

### Shopping List Members
- `POST /api/shopping-list-member/addMember` - добавить участника
- `POST /api/shopping-list-member/removeMember` - удалить участника
- `POST /api/shopping-list-member/leave` - покинуть список

### Shopping List Items
- `POST /api/shopping-list-item/create` - создать товар
- `POST /api/shopping-list-item/update` - обновить товар
- `POST /api/shopping-list-item/delete` - удалить товар
- `POST /api/shopping-list-item/toggleResolved` - переключить статус

## Тестирование

Для тестирования используйте заголовки:
- `x-uu-identity` - идентификатор пользователя
- `x-authorities` - профили (через запятую: "Operatives,Authorities")

Пример:
```bash
curl -X POST http://localhost:3001/api/shopping-list/create \
  -H "Content-Type: application/json" \
  -H "x-uu-identity: user123" \
  -H "x-authorities: Operatives" \
  -d '{"name": "My List", "awid": "awid123"}'
```

