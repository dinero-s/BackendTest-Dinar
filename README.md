Тестовое задание для Legko Company

## Запуск проекта

1. Клонируйте репозиторий и установите зависимости:

```bash
git clone https://github.com/dinero-s/BackendTest-Dinar
npm install
Запустите проект через Docker:
docker compose up --build
Создайте сид-данные:
npm run seed

2. Основные команды

npm run start:dev — запуск приложения в режиме разработки
npm run seed — сидинг тестовых данных
docker compose down -v — остановка и удаление контейнеров и томов

После выполнения npm run seed создаётся тестовый пользователь:
Email: demo@gmail.com
Пароль: Password123


3. Аутентификация

Access Token (валиден 15 минут) — передаётся в заголовке Authorization
Refresh Token (валиден 7 дней) — передаётся в заголовке
Используется ротация refresh-токенов, хранение в БД
Поддерживаются logout и revoke токенов


4. Публичные ссылки на заметки

POST /notes/:id/share — создать одноразовую публичную ссылку
GET /public/notes/:token — получить доступ к заметке без авторизации
GET /notes/:id/share — получить список ссылок владельца
DELETE /notes/:id/share/:tokenId — отозвать ссылку


5. Тесты

npm run test:e2e
Покрываются сценарии:

- Happy Path: Создание и открытие по публичной ссылке

- Повторный запрос по использованной ссылке → 410 Gone

- Доступ по истёкшей ссылке → 410 Gone

- Ревокация ссылки → 404 Not Found

- Обновление токенов по refreshToken


6. Переменные окружения (.env)

# JWT
JWT_SECRET=3f8a7b2e5c1d9f0a6b4c7e2d5f8a1b3c6d9e0f2a4b5c7d8e1f3a6b9c2d5e8f1
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
JWT_ISSUER=your-app-name
JWT_AUDIENCE=your-app-name
JWT_SALT_ROUNDS=10

JWT_SHARE_SECRET=3d3dss4tt5td9f0a6b4c7e2d5f8a15tg533rfwewfw3434q33d3
JWT_SHARE_TTL=5m

# DB
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=example
DB_NAME=db_main


7. Swagger-документация

Swagger доступен по адресу:
http://localhost:3000/docs


8. Автор:

Dinar Sabangulov — Backend Developer