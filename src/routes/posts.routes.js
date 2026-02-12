/**
 * Posts Routes
 *
 * Public routes:
 * - GET /posts
 * - GET /posts/:id
 * - GET /posts/:postId/comments
 *
 * Protected routes (requireAuth):
 * - POST /posts
 * - PUT /posts/:id
 * - DELETE /posts/:id
 * - POST /posts/:postId/comments
 *
 * Authentication is enforced at the route level.
 * Authorization (ownership checks) is handled in controllers.
 */

import { Router } from 'express';
import {
  listPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
} from '#controllers/posts.controller';
import { listCommentsForPost, createCommentForPost } from '#controllers/comments.controller';
import { requireAuth } from '#middleware/requireAuth'; //router protects specific endpoints with this

export const postsRouter = Router();
//public routes
postsRouter.get('/', listPosts);
postsRouter.get('/:id', getPost);
//routes that require auth
postsRouter.post('/', requireAuth, createPost);
postsRouter.put('/:id', requireAuth, updatePost);
postsRouter.delete('/:id', requireAuth, deletePost);
//This nests the comments inside a post
postsRouter.get('/:postId/comments', listCommentsForPost); //viewing comments is public
postsRouter.post('/:postId/comments', requireAuth, createCommentForPost); //auth required to create comments
