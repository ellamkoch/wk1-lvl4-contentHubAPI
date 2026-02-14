/**
 * Posts Controller
 *
 * This file contains HTTP-focused handler functions for the /posts routes.
 * Controllers:
 *  - read input from the request (params, query, body)
 *  - call the repository to do the actual data work
 *  - send the final HTTP response (status + JSON)
 *
 * Controllers do NOT:
 *  - talk to Prisma directly
 *  - decide database rules/ownership checks (repo does that)
 *  - decide how data is stored long-term
 *
 * Auth note:
 *  - Some routes are protected by requireAuth middleware.
 *  - On protected routes, req.user is available (decoded from JWT) and is used for ownership.
 *
 * Query parsing note:
 *  - Query params arrive as strings (or undefined).
 *  - We use helpers like parsePagination, parseBoolean, and parseCsvSet to keep controllers consistent.
 */

/**
 * GET /posts
 *
 * Returns a paginated list of posts.
 *
 * Query params (optional):
 *  - limit, page (handled by parsePagination)
 *  - includeCounts=true/false/1/0
 *      When true, the repo includes Prisma _count data (ex: comment counts per post).
 *
 * Controller responsibility:
 *  - parse/normalize query params
 *  - pass limit/offset + options into the repo
 *  - return { data, meta } via res.ok(...)
 */

import { notFound, forbidden } from '#utils/httpErrors';
import { ensureBodyFields } from '#utils/guard';
import { parsePagination } from '#utils/pagination';
import { parseBoolean, parseCsvSet } from '#utils/queryParams';

export async function listPosts(req, res) {
  //with pagination we need req to be read for limits/pages in posts that are listed.
  /** res.locals is an Express-provided object that can store data for the lifetime of THIS request.
   * In our app the repos are stored on res.locals.repos.
    * Repo here means "repository object" (data access layer), not a GitHub repo.
   */
  const { posts } = res.locals.repos; //gets posts repo with this request.

  const includeCounts = parseBoolean(req.query.includeCounts);
  /**
   * Pulls pagination info from the query string (?limit=&page=).
   * parsePagination handles:
   * - converting strings to numbers
   * - applying default values
   * - clamping to safe ranges
   * - computing offset from page/limit
   */

  const { limit, page, offset } = parsePagination(req.query);

  /** This asks the posts repository for a specific "window" of data. The repository does NOT care about pages or query params.
   * It only cares about:
   * - how many items to return (limit)
   * - where to start in the list (offset)
   * This separation keeps pagination strategy out of the data layer.
   */
  const result = await posts.list({ limit, offset, includeCounts });

  return res.ok(result.items, {
    pagination: { limit, page, total: result.total },
  });
}

/**
 * GET /posts/:id
 *
 * Returns a single post by id.
 * IDs are strings (UUIDs) in Postgres/Prisma, so we do NOT Number() them.
 *
 * Optional includes (via query param):
 *  - ?include=author,comments
 *
 * How includes work:
 *  - We parse include into a Set for clean "has()" checks.
 *  - We then call posts.getByIdWithIncludes(...) which can attach:
 *      - author (selected fields only)
 *      - comments (ordered oldest → newest), with each comment's author
 *
 * If no post exists for that id, we throw a 404.
 */

export async function getPost(req, res) {
  const { posts } = res.locals.repos; //updated for day 2 homework for query param as the includeComments query param lets us optionally attach comments for this post.

  const id = req.params.id; // Grab the id from the URL (req.params) and convert it to a Number.

 const include = parseCsvSet(req.query.include); // "include" is a CSV string like "comments,author" → parseCsvSet gives us a Set we can check with include.has(...)

  const includeAuthor = include.has('author');
  const includeComments = include.has('comments');

  const post = await posts.getByIdWithIncludes(id, {
    includeAuthor,
    includeComments,
  });

  if (!post) {
    //if a post isn't found, it throws an error
    throw notFound('Post not found');
  }

   return res.ok(post); //otherwise returns the successfully found post, now with comments it may have attached to it..
}
/**
 * POST /posts (AUTH REQUIRED)
 *
 * Creates a new post owned by the authenticated user.
 * - Validates required fields (title, body)
 * - Uses req.user.id as authorId
 * - Returns 201 Created with the new post
 */

export async function createPost(req, res) {
  // Pull title and body from the incoming request body.
  const { posts } = res.locals.repos;
  ensureBodyFields(req.body, ['title', 'body']); //reinforces required fields in a simple reusable way.

  const { title, body } = req.body ?? {};

  const created = await posts.create({ title, body, authorId: req.user.id }); // Creates the new post using our repository, tagging it with the authorId of the user that created it.
  return res.created(created); // Returns the created post so the client can see the new id and data.
}

/**
 * PUT /posts/:id (AUTH + OWNER)
 * Repo returns:
 * - updated post object (success)
 * - null (not found)
 * - 'forbidden' (wrong owner)
 */

export async function updatePost(req, res) {
  const { posts } = res.locals.repos;
  const id = req.params.id;

  ensureBodyFields(req.body, ['title', 'body']);

  const updated = await posts.update({
    id,
    title: req.body.title,
    body: req.body.body,
    authorId: req.user.id,
  });

  if (updated === null) throw notFound('Post not found');
  if (updated === 'forbidden') throw forbidden('You do not own this post');

  return res.ok(updated);
}

/**
 * DELETE /posts/:id (AUTH + OWNER)
 * Repo returns:
 * - true (deleted)
 * - null (not found)
 * - 'forbidden' (wrong owner)
 *
 * Controller returns 204 No Content on success.
 */

export async function deletePost(req, res) {
  const { posts } = res.locals.repos;

  const id = req.params.id; // Grab the id from the URL params (UUID string)

  // ask the repo to delete the post by a particular id
  const result = await posts.delete({ id, authorId: req.user.id }); // Ask repo to delete this post if the current user owns it

  //guards to return an error if nothing was deleted and treat it like a not found error or a forbidden error
  if (result === null) throw notFound('Post not found');
  if (result === 'forbidden') throw forbidden('You do not own this post');

  // If delete works, we return a 204 response to say the request succeeded.
  return res.noContent();
}
