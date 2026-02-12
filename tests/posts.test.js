/**
 * Posts Tests
 *
 * What this file verifies:
 * - Public routes (GET /posts, GET /posts/:id) still work without authentication.
 * - Creating a post now requires authentication.
 * - Pagination metadata is returned correctly.
 * - Protected routes require a valid JWT in the Authorization header.
 *
 * Why this matters:
 * - Confirms requireAuth middleware is correctly applied to post creation.
 * - Ensures existing pagination behavior was not broken by authentication changes.
 * - Verifies the separation between public read routes and protected write routes.
 *
 * These tests focus on post creation and listing behavior.
 * Ownership enforcement (update/delete) is validated separately.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/createApp.js';
import { createRepos } from '../src/repositories/index.js';

async function registerAndGetToken(app) {
  const res = await request(app).post('/auth/register').send({
    email: 'bob@example.com',
    name: 'Bob',
    password: 'Password123!',
  });

  return res.body.data.token;
}

describe('Posts', () => {
  it('create post requires auth', async () => {
    const app = createApp({
      repos: await createRepos(),
      config: {
        JWT_SECRET: 'test-secret',
      },
    });
    const res = await request(app).post('/posts').send({ title: 't', body: 'b' });
    expect(res.status).toBe(401);
  });

  it('creates and lists posts with pagination meta', async () => {
    const app = createApp({
      repos: await createRepos(),
      config: {
        JWT_SECRET: 'test-secret',
      },
    });

    const token = await registerAndGetToken(app);

    await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'A', body: '1' })
      .expect(201);
    await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'B', body: '2' })
      .expect(201);
    await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'C', body: '3' })
      .expect(201);
    const res = await request(app).get('/posts?limit=2&page=1').expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.pagination.total).toBe(3);
    expect(res.body.meta.pagination.limit).toBe(2);
    expect(res.body.meta.pagination.page).toBe(1);
  });

  it('get a post by id, or return a Post not found message', async () => {
    const app = createApp({
      repos: await createRepos(),
      config: {
        JWT_SECRET: 'test-secret',
      },
    });

    const token = await registerAndGetToken(app);

    const created = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'A', body: '1' })
      .expect(201);

    const id = created.body.data.id;

    const getRes = await request(app).get(`/posts/${id}`).expect(200);
    expect(getRes.body.data.id).toBe(id);

    const miss = await request(app).get('/posts/9999').expect(404);
    expect(miss.body.error.code).toBe('not_found');
  });

  //if I was to split out the get post by id and a not found msg tests
  it('gets a post by id (200)', async () => {
    const app = createApp({
      repos: await createRepos(),
      config: { JWT_SECRET: 'test-secret' },
    });

    const token = await registerAndGetToken(app);

    const created = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'A', body: '1' })
      .expect(201);

    const id = created.body.data.id;

    // Act + Assert: fetch it by id
    const getRes = await request(app).get(`/posts/${id}`).expect(200);
    expect(getRes.body.data.id).toBe(id);
  });

  it('returns 404 when a post id is missing', async () => {
    const app = createApp({ repos: await createRepos() });

    // Act + Assert: request an id that doesn't exist
    const miss = await request(app).get('/posts/9999').expect(404);
    expect(miss.body.error.code).toBe('not_found');
  });

  //delete post by id success
  it('delete a post by id with success (204)', async () => {
    const app = createApp({
      repos: await createRepos(),
      config: { JWT_SECRET: 'test-secret' },
    });

    const token = await registerAndGetToken(app);

    const created = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'A', body: '1' })
      .expect(201);

    const id = created.body.data.id;

    await request(app).delete(`/posts/${id}`).set('Authorization', `Bearer ${token}`).expect(204);
  });

  it('returns 404 when a post id that the user tries to delete is not found', async () => {
    const app = createApp({
      repos: await createRepos(),
      config: { JWT_SECRET: 'test-secret' },
    });

    const token = await registerAndGetToken(app);

    const delRes = await request(app)
      .delete('/posts/9999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(delRes.body.error.code).toBe('not_found');
  });

  it('returns 404 when a post id is invalid (treated as not found)', async () => {
    const app = createApp({
      repos: await createRepos(),
      config: { JWT_SECRET: 'test-secret' },
    });

    const token = await registerAndGetToken(app);

    const delRes = await request(app)
      .delete('/posts/0')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(delRes.body.error.code).toBe('not_found');
  });
});
