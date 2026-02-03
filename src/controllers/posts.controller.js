
//This file contains the server-side logic for handling incoming HTTP Post requests within a backed API. It defines specific API endpoints for managing post resources to either read existing posts or add new ones.
/**
 * GET /posts - //This function handles a GET request to the /posts route. A GET request is used to retrieve data.
  User Involvement:
//When a user's app asks the server for all existing posts, this function runs. It fetches the list of posts from a data source (posts.list()) and sends them back to the user's app as a JSON response.
*/
export function listPosts(_req, res) {
  const { posts } = res.locals.repos; //
  res.json({ data: posts.list() });
}

/**
 * POST /posts - This function handles a POST request to the /posts route. A POST request is used to send new data to the server to create something new.
    User Involvement:
    * When a user submits a new post (with a title and body) from their app, this function receives that information.
    * It first checks if both the title and body are provided.
    * Error Handling: If either is missing, the server sends back an error message with a 400 status code (meaning "Bad Request"), telling the app that something was wrong with the request.
    * Success: If the data is valid, it creates the new post in the data source (posts.create(...)) and sends back the newly created post data with a 201 status code (meaning "Created"), confirming the action was successful.
    */
export function createPost(req, res) {
  const { title, body } = req.body ?? {};
  const { posts } = res.locals.repos;

  if (!title || !body) {
    return res.status(400).json({
      error: { message: 'title and body are required' },
    });
  }

  const created = posts.create({ title, body });
  return res.status(201).json({ data: created });
}
