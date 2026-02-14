// This file is the central assembly point for the app.
// It’s where middleware, routes, and global handlers are configured and wired together.
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { createErrorHandler } from '#middleware/errorHandler';
import { notFoundHandler } from '#middleware/notFoundHandler';
import { respond } from '#middleware/responds';

import { postsRouter } from '#routes/posts.routes';
import { authRouter } from '#routes/auth.routes';
import { commentsRouter } from '#routes/comments.routes';

/**
 * Factory function that creates and returns an Express app with injected dependencies.
 * This pattern makes testing easier with Supertest because we can pass in test repos/config.
 *
 * @param {{ repos: any, config?: object }} deps
 * @returns {import('express').Express}
 */

export function createApp({ repos, config = {} }) {
  // Create the Express app instance
  const app = express();

  app.locals.config = config; // Store config so it’s accessible app-wide (app.locals is available in middleware/routes)

  app.use(express.json());// Built-in middleware that parses JSON request bodies into req.body

  app.use(helmet()); // Security middleware that sets HTTP headers to protect against common attacks

  app.use(morgan('dev'));// Logging middleware that prints request details to the console (dev-friendly)

    // Middleware Response helpers (res.ok/res.created, etc.)
  app.use(respond); // Must run before routes so controllers can use these helpers.

// Health check endpoint - confirms the API is up
  app.get('/health', (_req, res) => {
    //the _ before req means that this can be ignored.
    res.json({ status: 'ok', message: 'App is running correctly' });
  });

   app.use((_req, res, next) => {  // Attach repositories to res.locals so controllers can access them during the request
    res.locals.repos = repos;
    next();
  });

  // Routes - this connects the Routers to the main app
  app.use('/posts', postsRouter);
  app.use('/auth', authRouter);
  app.use('/comments', commentsRouter);

 // Catch-all 404 handler (must be after routes so it only runs when no route matches)
  app.use(notFoundHandler);

  // Global error handler (must be last).
  // createErrorHandler() returns the actual 4-argument Express error middleware.
  // Only runs when an error is thrown or next(err) is called.
  app.use(createErrorHandler);

  return app;
}
