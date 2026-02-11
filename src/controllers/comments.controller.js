/**
 * This controller has 2 main jobs:
 *  - Make sure the parent post exists (because comments are “nested under posts”)
    - Delegate actual data work to the comments repo (list + create)
 */
import { notFound } from '#utils/httpErrors';
import { ensureBodyFields, ensure } from '#utils/guard';
import { parsePagination } from '#utils/pagination';

/**
 * GET /posts/:postId/comments
 */
export function listCommentsForPost(req, res) {
  const { posts, comments } = res.locals.repos;
  const postId = Number(req.params.postId);

  // Clear teaching step: ensure post exists before listing comments. Need this guard in place before the return to help prevent app crashes as the endpoint must behave different if posts exists or not.
  ensure(posts.getById(postId), notFound('Post not found')); //if posts exist it returns an empty list. if post does not exist, returns 404 msg of post not found.
  //how data is fetched and shaped into the response
  const { limit, offset } = parsePagination(req.query); // grabs from the repos and parses the pagination
  const result = comments.listForPost(postId, { limit, offset }); //calls the repo

  return res.ok(result.items, {
    //returns data + meta with our response helper, 'res.*', in the middleware
    pagination: { limit, offset, total: result.total },
  });
}

/**
 * POST /posts/:postId/comments
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
  });

  return res.created(created);
}
