//This file uses integration testing, which checks how the different parts of the app work together as a single unit. We're testing the whole app here, not just one portion of it.
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { prisma } from '../src/db/prisma.js';

import { createApp } from '../src/createApp.js';
import { createRepos } from '../src/repositories/index.js';
// import { respond } from '../src/middleware/responds.js';

describe('GET /health', () => {
  it('returns ok', async () => {
    const app = createApp({ repos: await createRepos(prisma) });
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
});
