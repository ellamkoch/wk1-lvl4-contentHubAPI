/**
 * This controller’s jobs:
 * - Enforce nesting rules (post must exist for /posts/:postId/comments)
 * - Validate request bodies (ensureBodyFields)
 * - Attach ownership (authorId from req.user) when creating/updating/deleting
 * - Delegate data work to the comments repo and translate repo results into typed HTTP errors
 */

import { notFound, forbidden } from '#utils/httpErrors';
import { ensureBodyFields, ensure } from '#utils/guard';
import { parsePagination } from '#utils/pagination';

/**
 * GET /posts/:postId/comments
 */
export function listCommentsForPost(req, res) {
  const { posts, comments } = res.locals.repos;
  const postId = Number(req.params.postId);

  // Clear teaching step: ensure post exists before listing comments. Ensures parent post exists so this nested endpoint can return 404 if the post doesn't exist.
  ensure(posts.getById(postId), notFound('Post not found')); // If the post exists, we can return its comments (possibly empty). If not, throw 404.

  //how data is fetched and shaped into the response
  const { limit, page } = parsePagination(req.query); // Parses limit/page from req.query and clamps them safely.
  const result = comments.listForPost(postId, { limit, page }); //calls the repo

  return res.ok(result.items, {
    //returns data + meta with our response helper, 'res.*', in the middleware
    pagination: { limit, page, total: result.total },
  });
}

/**
 * POST /posts/:postId/comments (auth required)
 */
export function createCommentForPost(req, res) {
  const { posts, comments } = res.locals.repos;
  const postId = Number(req.params.postId);

  //guards needed for this
  ensure(posts.getById(postId), notFound('Post not found')); //ensure the post exists or list 404 not found error, like above.
  ensureBodyFields(req.body, ['body']); //ensures the body contains the required fields.

  const created = comments.create({
    postId,
    body: req.body.body,
    authorId: req.user.id,
  });

  return res.created(created);
}

/**
 * PUT /comments/:id (AUTH + OWNER)
 */
export function updateComment(req, res) {
  const { comments } = res.locals.repos;
  const id = Number(req.params.id);

  ensureBodyFields(req.body, ['body']);

  //repo tries to update only if authorId matches. repo returns a special value if not owner
  const updated = comments.update({
    id,
    body: req.body.body,
    authorId: req.user.id,
  });

  if (updated === null) throw notFound('Comment not found');
  if (updated === 'forbidden') throw forbidden('You do not own this comment');

  return res.ok(updated);
}

/**
 * DELETE /comments/:id (AUTH + OWNER)
 */
export function deleteComment(req, res) {
  const { comments } = res.locals.repos;
  const id = Number(req.params.id);

  const result = comments.delete({ id, authorId: req.user.id });

  if (result === null) throw notFound('Comment not found');
  if (result === 'forbidden') throw forbidden('You do not own this comment');

  return res.noContent();
}
