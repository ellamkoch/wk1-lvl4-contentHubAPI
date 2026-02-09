# wk1-lvl4-contentHubAPI

This is the repo for Week 1 of CodeX, Level 4. This is a simple API project for a content hub API.

## Day 1

Today’s work focused on setting up the project, getting comfortable with reading and deleting individual posts, and making sure the API responds clearly when something goes wrong.

### What I added

* **GET `/posts/:id`**
  * Returns a single post by id
  * Returns a `404` if the post doesn’t exist
* **DELETE `/posts/:id`**
  * Deletes a post by id
  * Returns:
    * `200` when the delete succeeds
    * `404` when the post doesn’t exist
    * `400` when the id is invalid (ex: `0` or non-numeric)

### Testing

* Wrote tests for:
  * Successful deletes
  * Missing posts (404)
  * Invalid ids (400)
* All tests are passing with Vitest + Supertest
* Also manually verified the full create → delete flow in Postman to confirm real request behavior

### Notes / bumps along the way

* Since posts are stored in memory, data only exists while the server is running — restarting the server clears everything.
* I learned the difference between:
  * a **missing** id (404)
  * and an **invalid** id (400)
* Accidentally tested the wrong HTTP verb at first (GET vs DELETE), which was a good reminder that verbs matter just as much as routes.

## Day 2

Day 2 focused on strengthening the internal structure of the API by introducing shared middleware for responses and errors, and setting up patterns that will support pagination and related data later on.

### What I added

* **Centralized HTTP error handling**

  * Introduced a lightweight `HttpError` model
  * Controllers now throw typed errors (ex: `notFound`, `badRequest`)
  * A central error handler formats all error responses consistently
* **Global response helpers**

  * Added middleware to attach helpers like:
    * `res.ok`
    * `res.created`
    * `res.noContent`
  * All successful responses now follow a consistent shape:
    * `{ data: ... }`
    * optional `{ meta: ... }` for future pagination
* **Catch-all 404 handler**

  * Added a `notFoundHandler` middleware
  * Ensures unknown routes return a clean JSON 404 instead of Express defaults
* **Updated app wiring**

  * Ensured middleware order supports:
    * response helpers before routes
    * route handling
    * unknown route detection
    * centralized error handling at the end
  * Extended the `createApp` factory to support injected config for future use

### Notes / takeaways

* Middleware order matters — Express runs top to bottom, and the app breaks if helpers are registered too late.
* Separating “known HTTP errors” from unexpected errors makes controllers cleaner and easier to reason about.
* This commit doesn’t change API behavior yet, but it sets a solid foundation for pagination and comments in upcoming steps.



