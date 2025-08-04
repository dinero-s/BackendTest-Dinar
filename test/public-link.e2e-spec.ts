import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

let app: INestApplication;
let accessToken: string;
let noteId: string;
let token: string;

describe('Tests', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'demo@gmail.com', password: 'Password123' });

    console.log('Login:', login.status, login.body);
    const loginBody = login.body as { accessToken: string };
    expect(loginBody.accessToken).toBeDefined();
    accessToken = loginBody.accessToken;

    const note = await request(app.getHttpServer())
      .post('/notes/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Note', body: 'Content' });

    console.log('Note create:', note.status, note.body);
    const noteBody = note.body as { id: string };
    expect(noteBody.id).toBeDefined();
    noteId = noteBody.id;
  });

  it('1. Happy Path: создать и открыть по ссылке', async () => {
    const share = await request(app.getHttpServer())
      .post(`/notes/${noteId}/share`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ttl: 10 });

    expect(share.status).toBe(201);

    const shareBody = share.body as { token: string; id: string };
    expect(shareBody.token).toBeDefined();
    token = shareBody.token;

    const publicAccess = await request(app.getHttpServer()).get(
      `/notes/public/notes/${token}`,
    );

    const publicBody = publicAccess.body as { title: string };
    expect(publicAccess.status).toBe(200);
    expect(publicBody.title).toBe('Test Note');
  });

  it('2. Повторный запрос по использованной ссылке — 410', async () => {
    const secondTry = await request(app.getHttpServer()).get(
      `/notes/public/notes/${token}`,
    );
    console.log('Second try:', secondTry.status);
    expect(secondTry.status).toBe(410);
  });

  it('3. Истёкший TTL — 410', async () => {
    const shortLink = await request(app.getHttpServer())
      .post(`/notes/${noteId}/share`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ttl: 0 }); // ttl = 0 минут

    console.log('Short link:', shortLink.status, shortLink.body);
    const shortBody = shortLink.body as { token: string };
    expect(shortBody.token).toBeDefined();
    const expiredToken = shortBody.token;

    await new Promise((r) => setTimeout(r, 1000));

    const expiredTry = await request(app.getHttpServer()).get(
      `/notes/public/notes/${expiredToken}`,
    );
    console.log('Expired try:', expiredTry.status);
    expect(expiredTry.status).toBe(410);
  });

  it('4. Ревокация ссылки — 404', async () => {
    const share = await request(app.getHttpServer())
      .post(`/notes/${noteId}/share`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ttl: 10 });

    const shareBody = share.body as { id: string; token: string };
    const tokenId = shareBody.id;
    const token = shareBody.token;

    const revoke = await request(app.getHttpServer())
      .delete(`/notes/${noteId}/share/${tokenId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    console.log('Revoke:', revoke.status);
    expect(revoke.status).toBe(200);

    const revokedTry = await request(app.getHttpServer()).get(
      `/notes/public/notes/${token}`,
    );
    console.log('Revoked try:', revokedTry.status);
    expect(revokedTry.status).toBe(404);
  });

  it('5. Обновление токенов по refreshToken', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'demo@gmail.com', password: 'Password123' });

    console.log('Refresh login:', login.status, login.body);
    const loginBody = login.body as { refreshToken: string };
    expect(loginBody.refreshToken).toBeDefined();

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginBody.refreshToken });

    console.log('Refresh tokens:', refresh.status, refresh.body);
    const refreshBody = refresh.body as {
      accessToken: string;
      refreshToken: string;
    };

    expect(refresh.status).toBe(201);
    expect(refreshBody.accessToken).toBeDefined();
    expect(refreshBody.refreshToken).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
