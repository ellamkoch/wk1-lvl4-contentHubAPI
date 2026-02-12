/**
This file contains the server-side logic for handling incoming HTTP Post/get/delete requests within a backend API. It defines specific API endpoints for managing post resources to either read existing posts or add new ones.

IMPORTANT CONTEXT (Express / HTTP):
- req (request) is provided by Express and represents the incoming HTTP request.
  It contains things like URL params, query params, and request body data.
- res (response) is also provided by Express and is used to send a reply back
  to the client, including status codes and JSON data.

  A controller’s job is to:
    - read data from the request (req)
    - decide what should happen
    - send a response back to the client (res)

  It should NOT worry about where data is stored long-term. That’s the repository’s job.

 Day 3 note:
  - Some routes are protected by requireAuth middleware.
  - For protected routes, req.user is available (set from the JWT) and is used for ownership (authorId).

______________________________________________________________________________________________________________________
 * GET /posts - This function handles a GET request to the /posts route. A GET request is used to retrieve data.
  User Involvement:
    - The user's app asks the server for posts with pagination limitations set by the params.
    - The server fetches the posts from the repository.
    - The client can request a subset of posts using limit and page query params.
    - User can request a page of posts using limit + page, while offset is computed internally
*/

import { notFound, forbidden } from '#utils/httpErrors'; // helpers that creates a standard 404 error object to throw
import { ensureBodyFields } from '#utils/guard'; //guard that enforces required fields in req.body so we don't have to rewrite (!title || !body) logic every time its needed.
import { parsePagination } from '#utils/pagination'; //controllers shouldn't manually parse/validate query params. this is to help normalize them into safe integers.

export function listPosts(req, res) {
  //with pagination we need req to be read for limits/pages in posts that are listed.
  /** res.locals is an Express-provided object that can store data for the lifetime of THIS request.
   * In our app the repos are stored on res.locals.repos.
   * Repo here means data repository (our in-memory data layer), not a GitHub repo.
   */
  const { posts } = res.locals.repos; //gets posts repo with this request.
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
  const result = posts.list({ limit, offset });

  return res.ok(result.items, {
    pagination: { limit, page, total: result.total },
  });
}

/**  Get /posts/:id
  This function handles a GET request to /posts/:id (a single post by id). I.e.,  GET /posts/3
  includeComments is optional: GET /posts/:id?includeComments=true

IMPORTANT CONTEXT (Route Params):
- ":id" is a route parameter. Express parses it from the URL and stores it on "req.params.id"
- "req.params""" values are always strings, so we convert the id to a Number to match how our repository stores ids.

User involvement:
  - The user's app requests one specific post by id.
  - The server looks up that post in the repository.
  - If the post exists, the server returns it.
  - If the post does NOT exist, the server returns a 404.
  */
export function getPost(req, res) {
  const { posts, comments } = res.locals.repos; //updated for day 2 homework for query param as the includeComments query param lets us optionally attach comments for this post.

  const id = Number(req.params.id); // Grab the id from the URL (req.params) and convert it to a Number.
  const includeComments = req.query.includeComments === 'true'; //checks for the query param for the day 2 homework, i.e., /posts/123?includeComments=true

  const post = posts.getById(id); // Ask the repository for the post with this id.

  if (!post) {
    //if a post isn't found, it throws an error
    throw notFound('Post not found');
  }

  if (includeComments) {
    //includes comments in the return below , even if empty, that match the post id
    const { items } = comments.listForPost(id);
    return res.ok({ ...post, comments: items });
  }

  return res.ok(post); //otherwise returns the successfully found post, now with comments it may have attached to it..
}
/**
 * POST /posts - requires auth now
 * This function handles a POST request to the /posts route.
 * A POST request is used to create new data.
 * Posts now track ownership thanks to authorId.
 *
 * IMPORTANT CONTEXT (Request Body):
  - The client sends data in the request body (req.body).
  - req.body is only available if we have JSON middleware enabled (express.json()).
  - req.user is set by requireAuth middleware (decoded from JWT)

 *
 User involvement:
  - The user submits a new post (title + body) from their app.
  - The server validates that required fields exist.
  - If the request is missing data, the server returns a 400 (Bad Request).
  - If the data is valid, the server creates the post and returns a 201 (Created).
    */
export function createPost(req, res) {
  // Pull title and body from the incoming request body.
  const { posts } = res.locals.repos;
  ensureBodyFields(req.body, ['title', 'body']); //reinforces required fields in a simple reusable way.

  const { title, body } = req.body ?? {};

  const created = posts.create({ title, body, authorId: req.user.id }); // Creates the new post using our repository, tagging it with the authorId of the user that created it.
  return res.created(created); // Returns the created post so the client can see the new id and data.
}

/**
 * PUT /posts/:id (AUTH + OWNER)
 * Repo returns: updated post | null (not found) | 'forbidden' (wrong owner)
 */
export function updatePost(req, res) {
  const { posts } = res.locals.repos;
  const id = Number(req.params.id);

  ensureBodyFields(req.body, ['title', 'body']);

  const updated = posts.update({
    id,
    title: req.body.title,
    body: req.body.body,
    authorId: req.user.id,
  });

  if (updated === null) throw notFound('Post not found');
  if (updated === 'forbidden') throw forbidden('You do not own this post');

  return res.ok(updated);
}

export function deletePost(req, res) {
  const { posts } = res.locals.repos;

  const id = Number(req.params.id); // Grab the id from the URL (req.params) and convert it to a Number.

  // ask the repo to delete the post by a particular id
  const result = posts.delete({ id, authorId: req.user.id }); // Ask repo to delete this post if the current user owns it

  //guards to return an error if nothing was deleted and treat it like a not found error or a forbidden error
  if (result === null) throw notFound('Post not found');
  if (result === 'forbidden') throw forbidden('You do not own this post');

  // If delete works, we return a 204 response to say the request succeeded.
  return res.noContent();
}
