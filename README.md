# Shopping List Application

Монорепозиторий для приложения Shopping List, содержащий фронтенд и бэкенд.

## Структура проекта

```
shopping-list/
├── client/          # React фронтенд приложение
├── server/          # Express.js бэкенд API
├── .gitignore
└── README.md
```

## Frontend (Client)

React приложение для управления списками покупок.

### Установка и запуск

```bash
cd client
npm install
npm start
```

Приложение будет доступно на `http://localhost:3000`

### Сборка

```bash
cd client
npm run build
```

## Backend (Server)

Express.js API сервер для управления списками покупок.

### Установка и запуск

```bash
cd server
npm install
npm start
```

Сервер будет доступен на `http://localhost:3001`

### API Endpoints

#### Shopping Lists
- `POST /api/shopping-list/create`
- `GET /api/shopping-list/get`
- `GET /api/shopping-list/list`
- `POST /api/shopping-list/update`
- `POST /api/shopping-list/delete`
- `POST /api/shopping-list/archive`
- `POST /api/shopping-list/unarchive`

#### Shopping List Members
- `POST /api/shopping-list-member/addMember`
- `POST /api/shopping-list-member/removeMember`
- `POST /api/shopping-list-member/leave`

#### Shopping List Items
- `POST /api/shopping-list-item/create`
- `POST /api/shopping-list-item/update`
- `POST /api/shopping-list-item/delete`
- `POST /api/shopping-list-item/toggleResolved`

Подробная документация API доступна в `server/README.md`

## Технологии

- **Frontend**: React, React Router
- **Backend**: Node.js, Express.js
- **Validation**: Custom validation middleware
- **Authorization**: Profile-based authorization (Authorities, Operatives)
