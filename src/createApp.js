// This file is the central control for the app. Its where the different components of the app are brought together, configured, and assembled into a working solution.
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { postsRouter } from '#routes/posts.routes';
import { errorHandler } from '#middleware/errorHandler';

/**
 * This is a Factory pattern that creates the Express app with injected dependencies.
 * This is the pattern that makes testing easy with Supertest.
 *
 * @param {{ repos: any }} deps
 * @returns {import('express').Express}
 */
export function createApp({ repos }) {
  // Express functions always return objects that have functionality built in
  // Initialize the app object that's returned from the Express function
  const app = express();

  // This is a built in feature that lets the app understand and parse JSON request bodies
  app.use(express.json());

  // This is a crucial Security too that sets special HTTP headers to protect the app from common online attacks
  app.use(helmet());

  // This is a logging tool that acts like a surveillance camera, logging requests the API gets and printing helpful info into the console.  (dev-friendly)
  app.use(morgan('dev'));

  // Health check endpoint - This creates a simple message to see if the app is alive and running correctly.
  app.get('/health', (_req, res) => { //the _ before req means that this can be ignored.
    res.json({ status: 'ok', message: 'App is running correctly' });
  });

  // Ths is where the repos are attached to to res.locals, which is a temp space, so controllers can access them easily
  app.use((_req, res, next) => {
    res.locals.repos = repos;
    next();
  });

  // Routes - this connects the postRouter to the main app
  app.use('/posts', postsRouter);

  // This installs the Error handling software. This middleware must be last (4 args signature) as it acts as a final safety net as if any problem that falls through all others will then be handled by the middleware, and prevent the ap from crashing. 
  app.use(errorHandler);

  return app;
}
