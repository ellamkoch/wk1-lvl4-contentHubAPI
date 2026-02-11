/**
 * This file verifies nested comments behavior end-to-end:
    - comments belong to a post
    - you can’t comment on a post that doesn’t exist
    - comments can be listed per post
    - response shape follows your standardized API format
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/createApp.js';
import { createRepos } from '../src/repositories/index.js';

describe('Comments (nested)', () => {
  it('creates and lists comments for a post', async () => {
    const app = createApp({ repos: await createRepos() });

    const postRes = await request(app) //creating a post here so we can test the nesting of comments.
      .post('/posts')
      .send({ title: 'A', body: '1' })
      .expect(201);
    const postId = postRes.body.data.id; //grab the new post's id from our standardized { data: ... } response shape

    const createComment = await request(app) //creates a comment for the post
      .post(`/posts/${postId}/comments`)
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
    const app = createApp({ repos: await createRepos() });

    const res = await request(app).post('/posts/9999/comments').send({ body: 'x' }).expect(404);
    expect(res.body.error.code).toBe('not_found'); //ensures missing parent post becomes a 404 HttpError and the error handler formats it with code: 'not_found'
  });
});
