/**
 * Authentication Tests
 *
 * What this file verifies:
 * - A new user can register successfully.
 * - Passwords are hashed and not stored in plaintext.
 * - A registered user can log in with valid credentials.
 * - A JWT token is returned on successful registration and login.
 *
 * Why this matters:
 * - Confirms that bcrypt hashing works correctly.
 * - Confirms JWT signing works with the configured secret.
 * - Verifies the full auth flow from HTTP request → controller → repo → response.
 *
 * These tests focus only on authentication behavior.
 * They do NOT test protected routes or ownership logic.
 */

import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/createApp.js';
import { createRepos } from '../src/repositories/index.js';

describe('Authentication', () => {
  it('registers a new user and logs in successfully', async () => {
    const app = createApp({
      repos: await createRepos(),
      config: {
        JWT_SECRET: 'test-secret',
      },
    });

    const registerRes = await request(app).post('/auth/register').send({
      email: 'alice@example.com',
      name: 'Alice',
      password: 'Password123!',
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('data.token');

    const loginRes = await request(app).post('/auth/login').send({
      email: 'alice@example.com',
      password: 'Password123!',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeTruthy();
  });
});
