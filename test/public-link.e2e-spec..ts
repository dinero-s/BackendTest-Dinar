import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

let app: INestApplication;
let accessToken: string;
let noteId: string;
let shareToken: string;
let shareTokenId: string;

describe('📌 Public Share Links (e2e)', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Авторизация
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'demo@gmail.com', password: 'Password123' });
    accessToken = login.body.accessToken;

    // Создание заметки
    const note = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Note', body: 'Content' });
    noteId = note.body.id;
  });

  it('1️⃣ Happy Path: создать и открыть по ссылке', async () => {
    const share = await request(app.getHttpServer())
      .post(`/notes/${noteId}/share`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ttl: 10 });

    expect(share.status).toBe(201);
    expect(share.body.token).toBeDefined();
    shareToken = share.body.token;
    shareTokenId = share.body.id;

    const publicAccess = await request(app.getHttpServer()).get(
      `/public/notes/${shareToken}`,
    );

    expect(publicAccess.status).toBe(200);
    expect(publicAccess.body.title).toBe('Test Note');
  });

  it('2️⃣ Повторный запрос по использованной ссылке — 410', async () => {
    const secondTry = await request(app.getHttpServer()).get(
      `/public/notes/${shareToken}`,
    );
    expect(secondTry.status).toBe(410);
  });

  it('3️⃣ Истёкший TTL — 410', async () => {
    const shortLink = await request(app.getHttpServer())
      .post(`/notes/${noteId}/share`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ttl: 0 }); // TTL = 0 минут

    const expiredToken = shortLink.body.token;

    // Подождем 1 секунду
    await new Promise((r) => setTimeout(r, 1000));

    const expiredTry = await request(app.getHttpServer()).get(
      `/public/notes/${expiredToken}`,
    );
    expect(expiredTry.status).toBe(410);
  });

  it('4️⃣ Ревокация ссылки — 404', async () => {
    const share = await request(app.getHttpServer())
      .post(`/notes/${noteId}/share`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ttl: 10 });

    const tokenId = share.body.id;
    const token = share.body.token;

    await request(app.getHttpServer())
      .delete(`/notes/${noteId}/share/${tokenId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const revokedTry = await request(app.getHttpServer()).get(
      `/public/notes/${token}`,
    );
    expect(revokedTry.status).toBe(404);
  });

  it('5️⃣ Попытка создать ссылку на чужую заметку — 403', async () => {
    // Создаём второго пользователя
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'hacker@example.com',
      password: 'hack1234',
    });

    const hackerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'hacker@example.com', password: 'hack1234' });

    const hackerToken = hackerLogin.body.accessToken;

    const forbidden = await request(app.getHttpServer())
      .post(`/notes/${noteId}/share`)
      .set('Authorization', `Bearer ${hackerToken}`)
      .send({ ttl: 10 });

    expect(forbidden.status).toBe(403);
  });

  afterAll(async () => {
    await app.close();
  });
});

