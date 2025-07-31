Тестовое задание для Legko Company

## Запуск проекта

1. Клонируйте репозиторий и установите зависимости:

```bash
git clone https://github.com/dinero-s/BackendTest-Dinar
npm install
Запустите проект через Docker:
docker compose up --build
Примените миграции и создайте сид-данные:
npm run migration:run
npm run seed

2. Основные команды

npm run start:dev — запуск приложения в режиме разработки
npm run migration:run — применить миграции
npm run migration:generate — создать миграцию
npm run seed — сидинг тестовых данных
docker compose down -v — остановка и удаление контейнеров и томов

После выполнения npm run seed создаётся тестовый пользователь:
Email: demo@gmail.com
Пароль: Password123


3. Аутентификация

Access Token (валиден 15 минут) — передаётся в заголовке Authorization
Refresh Token (валиден 7 дней) — передаётся в httpOnly cookie или заголовке
Используется ротация refresh-токенов, хранение в БД/Redis, защита от reuse
Поддерживаются logout и revoke токенов


4. Публичные ссылки на заметки

POST /notes/:id/share — создать одноразовую публичную ссылку
GET /public/notes/:token — получить доступ к заметке без авторизации
GET /notes/:id/share — получить список ссылок владельца
DELETE /notes/:id/share/:tokenId — отозвать ссылку


5. Тесты

npm run test:e2e
Покрываются сценарии:

[//]: # (Регистрация и вход)

[//]: # (Обновление токенов)

[//]: # (Создание/ревокация публичных ссылок)

[//]: # (Доступ по одноразовой ссылке)


6. Переменные окружения (.env)

DATABASE_URL=postgres://postgres:example@postgres:5432/db_main
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=supersecret


7. Swagger-документация

Swagger доступен по адресу:
http://localhost:3000/api


8. Автор:

Dinar Sabangulov — Backend Developer