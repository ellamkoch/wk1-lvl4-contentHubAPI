/**
 * Comments (Nested Resource) Tests
 *
 * What this file verifies:
 * - Comments can be created under an existing post.
 * - Creating comments now requires authentication.
 * - A valid JWT must be sent in the Authorization header.
 * - Attempting to comment on a missing post returns 404.
 *
 * Why this matters:
 * - Confirms requireAuth middleware works on nested routes.
 * - Confirms ownership-aware architecture does not break comment creation.
 * - Verifies proper HTTP status codes for protected endpoints.
 *
 * These tests focus on nested comment behavior.
 * Ownership update/delete behavior is tested separately.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/createApp.js';
import { createRepos } from '../src/repositories/index.js';
import { prisma } from '../src/db/prisma.js';

const MISSING_UUID = '00000000-0000-0000-0000-000000000000';

async function registerAndGetToken(app) {
  const res = await request(app).post('/auth/register').send({
    email: `bob+${Date.now()}@example.com`,
    name: 'Bob',
    password: 'Password123!',
  });

  return res.body.data.token;
}

describe('Comments (nested)', () => {
  it('creates and lists comments for a post', async () => {
    const app = createApp({
      repos: await createRepos(prisma),
      config: {
        JWT_SECRET: 'test-secret',
      },
    });

    const token = await registerAndGetToken(app);

    const postRes = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'A', body: '1' })
      .expect(201);
    const postId = postRes.body.data.id; //grab the new post's id from our standardized { data: ... } response shape

    const createComment = await request(app) //creates a comment for the post
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Nice!' })
      .expect(201);

    expect(createComment.body.data.postId).toBe(postId); //enforces that comments store the parent postID and that the API returns it back

    const list = await request(app) //returns a list of comments for the post
      .get(`/posts/${postId}/comments`)
      .expect(200);
    expect(list.body.data).toHaveLength(1); //didn't test pagination metadata to keep the test simple
  });

  it('returns 404 when post does not exist', async () => {
    //returns a 404 msg when a post doesn't exist
    const app = createApp({
      repos: await createRepos(prisma),
      config: {
        JWT_SECRET: 'test-secret',
      },
    });

    const token = await registerAndGetToken(app);

    const res = await request(app)
      .post(`/posts/${MISSING_UUID}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'x' })
      .expect(404);
    expect(res.body.error.code).toBe('not_found'); //ensures missing parent post becomes a 404 HttpError and the error handler formats it with code: 'not_found'
  });

  it('Ownership check if a user tries to update a comment that is not theirs', async () => {
    const app = createApp({
      repos: await createRepos(prisma),
      config: {
        JWT_SECRET: 'test-secret' },
      });

      const tokenA = await registerAndGetToken(app, { email: 'usera@test.com'});
      const tokenB = await registerAndGetToken(app, { email: 'userb@test.com'});

      const created = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'A', body: '1' })
        .expect(201);

      const postId = created.body.data.id;

      const createdComment = await request(app) //creates a comment for the post
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ body: 'Nice!' })
        .expect(201);

      const commentId = createdComment.body.data.id;

      const updateRes = await request(app)
        .put(`/posts/${postId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .set('Content-Type', 'application/json')
        .send({ body: 'Edited' })
        .expect(403);

    expect(updateRes.body.error.code).toBe('forbidden');
  });
});
