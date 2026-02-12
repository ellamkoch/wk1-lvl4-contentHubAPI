/**
 * Comments Routes
 *
 * This file handles comment modification.
 *
 * Protected routes:
 * - PUT /comments/:id
 * - DELETE /comments/:id
 *
 * requireAuth middleware ensures:
 * - Valid JWT token is present
 * - req.user is set before controller runs
 *
 * Only authenticated users can update or delete comments.
 */

import { Router } from 'express';
import { requireAuth } from '#middleware/requireAuth';
import { updateComment, deleteComment } from '#controllers/comments.controller';

export const commentsRouter = Router();

commentsRouter.put('/:id', requireAuth, updateComment);
commentsRouter.delete('/:id', requireAuth, deleteComment);
