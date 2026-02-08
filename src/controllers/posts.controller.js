
/**
This file contains the server-side logic for handling incoming HTTP Post requests within a backed API. It defines specific API endpoints for managing post resources to either read existing posts or add new ones.

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
______________________________________________________________________________________________________________________
 * GET /posts - This function handles a GET request to the /posts route. A GET request is used to retrieve data.
  User Involvement:
    - The user's app asks the server for all existing posts.
    - The server fetches the posts from the repository.
    - The server sends them back as JSON in the HTTP response.
*/
export function listPosts(_req, res) {
/** res.locals is an Express-provided object that can store data for the lifetime of THIS request.
   * In our app the repos are stored on res.locals.repos. Think of repos as storage at this point,
   * Not an online github repo, but a local github repo.
  */
  const { posts } = res.locals.repos; //deconstructing the object post here to assign the value of res.locals.repos.posts to it.
  /** res.json(...) sends a JSON response back to the client. res.json(...) sends a JSON response back to the client.
   * If we do not set a status code manually, Express defaults to 200 (OK).
  */
  res.json({ data: posts.list() });
}

/**  Get /posts/:id
  This function handles a GET request to /posts/:id (a single post by id). I.e.,  GET /posts/3
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
  const { posts } = res.locals.repos;

  const id = Number(req.params.id); // Grab the id from the URL (req.params) and convert it to a Number.

  const post = posts.getById(id); // Ask the repository for the post with this id.

  if (!post) { // If no post is found, we intentionally return a 404 not found error msg.
    /** return stops the function so we don't try to send another response.
     * res.status(404) sets the HTTP status code.
     * .json(...) sends the JSON body and ends the response.*/
    return res.status(404).json({ error: { message: 'Post not found' } })
  }
  // If the post IS found, we return it with a 200 (OK) response.
  return res.status(200).json({ data: post });
  }
/**
 * POST /posts
 * This function handles a POST request to the /posts route.
 * A POST request is used to create new data.
 *
 * IMPORTANT CONTEXT (Request Body):
- The client sends data in the request body (req.body).
- req.body is only available if we have JSON middleware enabled (express.json()).
 *
 User involvement:
  - The user submits a new post (title + body) from their app.
  - The server validates that required fields exist.
  - If the request is missing data, the server returns a 400 (Bad Request).
  - If the data is valid, the server creates the post and returns a 201 (Created).
    */
export function createPost(req, res) {
  // Pull title and body from the incoming request body.
  const { title, body } = req.body ?? {}; // ?? keeps the app from crashing and says if req.body is left null or undefined to return an empty object.
  const { posts } = res.locals.repos;

  // This is the Validation portion of this function and says if these 2 are not found when creating the post, then its to return the error msg.
  // 400 means: "The client request is missing required information."
  if (!title || !body) {
    return res.status(400).json({
      error: { message: 'title and body are required' },
    });
  }

  const created = posts.create({ title, body }); // Creates the new post using our repository.
  return res.status(201).json({ data: created }); // Returns the created post so the client can see the new id and data.
}

export function deletePost(req, res) {
  const { posts } = res.locals.repos;

  const id = Number(req.params.id); // Grab the id from the URL (req.params) and convert it to a Number.
  //validates the id and returns the 400 msg if its invalid
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: { message: 'Invalid post id' },
    });
  }
  // ask the repo to delete the post by a particular id
  const deletedPost = posts.deleteById(id); // Ask the repository for the post with this id.
  //guard to return an error if nothing was deleted and treat it like a not found error
  if (!deletedPost) {
    return res.status(404).json({
      error: {message: 'Post not found'},
    });
  }

  // If delete works, we return it with a 200 (OK) response.
  return res.status(200).json({
    data: deletedPost
   });
  }
