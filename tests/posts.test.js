/**This file tests the /post routes functionality. It should
 *  - Return 404 if the post doesn't exist
 *  - Return 200+ if the post does exist
 *
 * What we need for each test
 *  - For the 404 test
 *      - no data needed, so we create a fresh app and don't seed any data
 *      - Server should say status 404 and post not found for an error msg
 *  - For the 200 test
 *      - need to create a post first
 *      - need to use the /posts route app and:
 *          - create app
 *          - send a POST request w/ a title/body
 *          - capture the id that comes back
 *
 * As part of the test, we'll be pretending to be a client making a HTTP request to the app and need to:
 *  - Target the express app
 *  - Use the GET method
 *  - choose the route
 *  - decide what the response should look like
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/createApp';
import { createRepos } from '../src/repositories/index';

describe('Posts', () => {
  it('creates and lists posts', async () => {
    const app = createApp({ repos: await createRepos() });

    await request(app).post('/posts').send({ title: 'A', body: '1' }).expect(201);
    await request(app).post('/posts').send({ title: 'B', body: '2' }).expect(201);
    await request(app).post('/posts').send({ title: 'C', body: '3' }).expect(201);

    const res = await request(app).get('/posts').expect(200);

    expect(res.body.data);
  });

  it('get a post by id, or return a Post not found message', async () => {
    const app = createApp({ repos: await createRepos() });

    const created = await request(app).post('/posts').send({ title: 'A', body: '1' }).expect(201);

    const id = created.body.data.id;

    const getRes = await request(app).get(`/posts/${id}`).expect(200);
    expect(getRes.body.data.id).toBe(id);

    const miss = await request(app).get('/posts/9999').expect(404);
    expect(miss.body.error.message).toBe('Post not found');
  });

  //if I was to split out the get post by id and a not found msg tests
  it('gets a post by id (200)', async () => {
    const app = createApp({ repos: await createRepos() });

    // Arrange: create a post so we have a real id
    const created = await request(app).post('/posts').send({ title: 'A', body: '1' }).expect(201);

    const id = created.body.data.id;

    // Act + Assert: fetch it by id
    const getRes = await request(app).get(`/posts/${id}`).expect(200);
    expect(getRes.body.data.id).toBe(id);
  });

  it('returns 404 when a post id is missing', async () => {
    const app = createApp({ repos: await createRepos() });

    // Act + Assert: request an id that doesn't exist
    const miss = await request(app).get('/posts/9999').expect(404);
    expect(miss.body.error.message).toBe('Post not found');
  });

  //delete post by id success
  it('delete a post by id with success (200)', async () => {
    const app = createApp({ repos: await createRepos() });

    //create a post first so we have post by id to delete by
    const created = await request(app).post('/posts').send({ title: 'A', body: '1' }).expect(201);

    const id = created.body.data.id;

    //Delete it by id an return a 200 for success
    const delRes = await request(app).delete(`/posts/${id}`).expect(200);
    expect(delRes.body.data.id).toBe(id);
  });

  it('returns 404 when a post id that the user tries to delete is not found', async () => {
    const app = createApp({ repos: await createRepos() });


    // Act + Assert: try to delete an id that doesn't exist
    const delRes = await request(app).delete('/posts/9999').expect(404);
    expect(delRes.body.error.message).toBe('Post not found');
  });

  it('returns 400 when a post id is invalid', async () => {
    const app = createApp({ repos: await createRepos() });

    // Act + Assert: try to delete an id that is invalid
    const delRes = await request(app).delete('/posts/0').expect(400);
    expect(delRes.body.error.message).toBe('Invalid post id');
  });
});
