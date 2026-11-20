import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configureApp } from '../src/app.setup.js';
import { CinemasModule } from '../src/cinemas/cinemas.module.js';
import { HealthModule } from '../src/health/health.module.js';
import { MoviesModule } from '../src/movies/movies.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/**
 * Runs the real controllers, validation, filters and services over HTTP,
 * with a tiny in-memory stand-in for the database (no Postgres needed).
 */
const ironMan = randomUUID();
const avengers = randomUUID();
const endgame = randomUUID();
const cinemaId = randomUUID();

// Existing prerequisite links: Endgame -> The Avengers -> Iron Man
const edges = [
  { movieId: endgame, prerequisiteId: avengers },
  { movieId: avengers, prerequisiteId: ironMan },
];

const fakeDb = {
  movie: {
    findUnique: ({ where }: { where: { id: string } }) =>
      Promise.resolve(
        [ironMan, avengers, endgame].includes(where.id)
          ? { id: where.id }
          : null,
      ),
    count: ({ where }: { where: { id: { in: string[] } } }) =>
      Promise.resolve(where.id.in.length),
  },
  moviePrerequisite: {
    findMany: ({ where }: { where: { movieId: { not: string } } }) =>
      Promise.resolve(edges.filter((e) => e.movieId !== where.movieId.not)),
  },
  cinema: {
    findUnique: () =>
      Promise.resolve({
        id: cinemaId,
        name: 'Stark IMAX',
        bundleSizes: [1, 3, 4],
      }),
  },
  $queryRaw: () => Promise.resolve([{ '?column?': 1 }]),
  $transaction: (fn: (tx: unknown) => unknown) => fn(fakeDb),
};

describe('Doomsday Ready API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, HealthModule, MoviesModule, CinemasModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakeDb)
      .compile();

    app = configureApp(moduleRef.createNestApplication({ logger: false }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health and /health -> 200 ok', async () => {
    const resApi = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
    expect(resApi.body).toMatchObject({ status: 'ok', database: 'up' });

    const resRoot = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    expect(resRoot.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('PATCH making Endgame a prerequisite of Iron Man -> 409 CIRCULAR_DEPENDENCY', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/movies/${ironMan}`)
      .send({ prerequisiteIds: [endgame] })
      .expect(409);

    expect(res.body).toMatchObject({
      statusCode: 409,
      code: 'CIRCULAR_DEPENDENCY',
    });
  });

  it('PATCH making a movie its own prerequisite -> 409 CIRCULAR_DEPENDENCY', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/movies/${ironMan}`)
      .send({ prerequisiteIds: [ironMan] })
      .expect(409);

    expect(res.body.code).toBe('CIRCULAR_DEPENDENCY');
  });

  it('POST /movies with invalid runtime and unknown field -> 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/movies')
      .send({ title: 'Bad', releaseYear: 2020, runtime: 301, rating: 5 })
      .expect(400);

    expect(res.body.code).toBe('BAD_REQUEST');
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        'runtime must not be greater than 300',
        'property rating should not exist',
      ]),
    );
  });

  it('POST /cinemas with too many / out-of-range bundle sizes -> 400', async () => {
    await request(app.getHttpServer())
      .post('/api/cinemas')
      .send({ name: 'Big', bundleSizes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/cinemas')
      .send({ name: 'Huge', bundleSizes: [501] })
      .expect(400);
  });

  it('GET /cinemas/:id/booking?groupSize=6 with bundles [1,3,4] -> 2 bundles of 3', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/cinemas/${cinemaId}/booking?groupSize=6`)
      .expect(200);

    expect(res.body).toMatchObject({
      possible: true,
      totalBundles: 2,
      bundles: [{ size: 3, count: 2 }],
    });
  });

  it('GET booking with groupSize out of range -> 400', async () => {
    await request(app.getHttpServer())
      .get(`/api/cinemas/${cinemaId}/booking?groupSize=10001`)
      .expect(400);
  });

  it('GET /movies/not-a-uuid/rewatch-order -> 400', async () => {
    await request(app.getHttpServer())
      .get('/api/movies/not-a-uuid/rewatch-order')
      .expect(400);
  });
});
