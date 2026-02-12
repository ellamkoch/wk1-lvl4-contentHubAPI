# wk1-lvl4-contentHubAPI

This is the repo for Week 1 of CodeX, Level 4. This is a simple API project for a content hub API.

## Day 1

Today’s work focused on setting up the project, getting comfortable with reading and deleting individual posts, and making sure the API responds clearly when something goes wrong.

### What I added

- **GET `/posts/:id`**
  - Returns a single post by id
  - Returns a `404` if the post doesn’t exist
- **DELETE `/posts/:id`**
  - Deletes a post by id
  - Returns:
    - `200` when the delete succeeds
    - `404` when the post doesn’t exist
    - `400` when the id is invalid (ex: `0` or non-numeric)

### Testing

- Wrote tests for:
  - Successful deletes
  - Missing posts (404)
  - Invalid ids (400)
- All tests are passing with Vitest + Supertest
- Also manually verified the full create → delete flow in Postman to confirm real request behavior

### Notes / bumps along the way

- Since posts are stored in memory, data only exists while the server is running — restarting the server clears everything.
- I learned the difference between:
  - a **missing** id (404)
  - and an **invalid** id (400)
- Accidentally tested the wrong HTTP verb at first (GET vs DELETE), which was a good reminder that verbs matter just as much as routes.

## Day 2

Day 2 focused on strengthening the internal structure of the API by introducing shared middleware for responses and errors, and setting up patterns that will support pagination and related data later on.

### What I added

- **Centralized HTTP error handling**

  - Introduced a lightweight `HttpError` model
  - Controllers now throw typed errors (ex: `notFound`, `badRequest`)
  - A central error handler formats all error responses consistently
- **Global response helpers**

  - Added middleware to attach helpers like:
    - `res.ok`
    - `res.created`
    - `res.noContent`
  - All successful responses now follow a consistent shape:
    - `{ data: ... }`
    - optional `{ meta: ... }` for future pagination
- **Catch-all 404 handler**

  - Added a `notFoundHandler` middleware
  - Ensures unknown routes return a clean JSON 404 instead of Express defaults
- **Updated app wiring**

  - Ensured middleware order supports:
    - response helpers before routes
    - route handling
    - unknown route detection
    - centralized error handling at the end
  - Extended the `createApp` factory to support injected config for future use
    **Paginated `GET /posts`**
- Added support for `limit` and `offset` query parameters to control how many posts are returned at a time
- Introduced a shared pagination utility to safely parse and normalize query values (query params arrive as strings and can’t be trusted directly)
- Updated the posts repository to return:

  - a paginated slice of posts (`items`)
  - the total number of posts available (`total`)
- Updated the controller response to include pagination metadata so the client knows how much data exists and how to request the next page

* **Added comments as a nested resource under posts**
  * Implemented:
    * `GET /posts/:postId/comments`
    * `POST /posts/:postId/comments`
  * Comments are scoped to a parent post and cannot exist independently.
  * Requests for comments on a missing post return a clean `404`.
* **Comments repository**
  * Added a new in-memory `comments` repository.
  * Stores comments with:
    * a unique id
    * the parent `postId`
    * the comment body
  * Supports listing comments per post and creating new comments.
* **Comments controller**
  * Verifies the parent post exists before listing or creating comments.
  * Validates required request body fields.
  * Uses the same response helpers and error handling as posts to keep API behavior consistent.
* **Routing updates**
  * Nested comment routes directly inside the posts router.
  * Keeps the URL structure clear and reinforces the relationship between posts and comments.
* **Testing**
  * Added tests to verify:
    * comments can be created for an existing post
    * comments can be listed per post
    * attempting to comment on a missing post returns a standardized `404`
  * Updated existing post tests to reflect pagination metadata and error envelope changes.

### Assignments for Day 2

As part of the Day 2 homework, I extended the API further by adjusting pagination strategy and adding conditional related data loading.

#### 1. Alternative Pagination Strategy (Page-Based)

Originally, pagination used `limit` and `offset` directly. For the assignment, I updated the API to support **page-based pagination** , which is more intuitive from a client perspective.

* Clients now request:

  * `GET /posts?limit=2&page=1`
* The pagination utility:

  * Parses and normalizes `limit` and `page`
  * Converts `page` into an internal `offset`
  * Ensures values are clamped and safe
* The repository still slices using `limit` and `offset`
* The response includes:

  ```
  {
     data: [...],
     meta: {
        pagination: {
           limit: 2,
           page: 1,
           total: 3
        }
     }
  }
  ```

This keeps:

* The **controller responsible for pagination strategy**
* The **repository responsible only for slicing data**

The data layer remains unaware of “pages” and continues to work with offsets internally.

#### 2. Optional Related Data via Query Param

Added support for conditionally including comments when fetching a single post:

* `GET /posts/:id`
* `GET /posts/:id?includeComments=true`

If `includeComments=true`:

* The controller fetches comments scoped to that post
* Comments are attached to the response under a `comments` field

If not provided:

* The API returns only the post

This keeps:

* The base endpoint lightweight by default
* Related data loading explicit and controlled by the client

It also reinforces separation of concerns:

* Posts repo handles posts
* Comments repo handles comments
* Controller orchestrates relationships between them

### Testing (Expanded)

#### Automated Testing

* All tests pass using **Vitest + Supertest**
* Updated test files to reflect:
  * Standardized response envelopes
  * Page-based pagination (`limit` + `page`)
  * Error codes (`not_found`, `bad_request`)
* Verified:
  * Pagination metadata
  * Nested comments behavior
  * 404 handling for missing parent posts
  * 400 handling for invalid ids

#### Manual Verification (Postman)

Performed additional manual checks in Postman to confirm real-world behavior:

* Created posts and verified pagination works with `page`
* Created nested comments under valid posts
* Confirmed `404` when commenting on missing posts
* Verified:
  * `GET /posts/:id?includeComments=true` attaches comments
  * `GET /posts/:id` does not include comments by default
  * Invalid ids return `400 bad_request`
  * Missing resources return `404 not_found`

This confirms:

* Tests reflect actual runtime behavior
* Middleware, controllers, and repos are wired correctly
* Response formatting is consistent across endpoints

### Notes / takeaways

- Middleware order matters — Express runs top to bottom, and the app breaks if helpers are registered too late.
- Separating “known HTTP errors” from unexpected errors makes controllers cleaner and easier to reason about.
- Pagination is a server responsibility — the server decides what is safe and reasonable, even if the client requests extreme values.
- Separating pagination logic into a utility keeps controllers focused on request/response flow instead of validation details.
- Returning `{ items, total }` from the repo allows the API to paginate results while still exposing the full dataset size to the client.
- Although behavior changed for `GET /posts`, the underlying data is still in-memory and resets on server restart.
- Page-based pagination feels more natural for clients, but internally still translates to offset logic.
- Controllers should coordinate related data. Repositories should stay focused on their own resource.
- Throwing typed errors like `badRequest` and `notFound` keeps the API predictable and consistent.
- Automated tests confirm correctness, but manual testing in Postman builds confidence that the API behaves properly in real usage.
- Small validation changes can break multiple tests at once. That’s not a bad thing — it proves the tests are actually protecting behavior.

## Day 3

Day 3 introduced authentication and ownership to the API. Up until this point, anyone could create, update, or delete resources. Today’s work added JWT-based authentication and enforced resource ownership at the repository level.

This marks the transition from a simple CRUD API to something that behaves more like a real backend system.

### What I added

#### Authentication (JWT-based)

* Added `POST /auth/register`
  * Accepts `email`, `name`, and `password`
  * Hashes the password using `bcryptjs`
  * Stores only the password hash (never plaintext)
  * Returns a signed JWT on successful registration
* Added `POST /auth/login`
  * Validates credentials
  * Verifies password using bcrypt
  * Returns a signed JWT if credentials are valid
  * Returns a generic `401 unauthorized` for invalid credentials

#### JWT Utilities

* Created shared JWT utilities:
  * `signToken` — signs a token with:
    * `sub` (user id)
    * expiration (`2h`)
  * `verifyToken` — verifies and decodes the token payload
* JWT secret is:
  * Loaded from environment variables
  * Validated during server startup
  * Injected into the app via configuration

#### Password Hashing

* Introduced password utilities:
  * `hashPassword`
  * `verifyPassword`
* Uses `bcryptjs`
* Passwords are salted and hashed before storage
* Plaintext passwords are never stored in memory

Installed dependencies:

`npm install jsonwebtoken bcryptjs`

### Route Protection (Middleware)

* Created `requireAuth` middleware
  * Extracts Bearer token from the `Authorization` header
  * Verifies the token using the JWT secret
  * Attaches the decoded user id to `req.user`
  * Rejects:
    * Missing tokens
    * Invalid tokens
    * Malformed headers

Protected routes now include:

* `POST /posts`
* `PUT /posts/:id`
* `DELETE /posts/:id`
* `POST /posts/:postId/comments`
* `PUT /comments/:id`
* `DELETE /comments/:id`

### Ownership Enforcement

Posts and comments now include:
`authorId`

Ownership rules are enforced inside the repository layer:

* If a resource does not exist → return `null`
* If the resource exists but belongs to another user → return `'forbidden'`
* If the requesting user is the owner → perform update/delete

Controllers translate repository return values into HTTP responses:

* `null` → `404 not_found`
* `'forbidden'` → `403 forbidden`
* success → `200` or `204`

This preserves clear separation of concerns:

* Authentication handled in middleware
* Ownership enforced in the repository
* HTTP responses shaped in the controller

### Structural Updates

* Added a `users` repository (in-memory)
* Updated `createRepos()` to inject:
  * `posts`
  * `comments`
  * `users`
* Updated `createApp()` to accept injected configuration
* Updated `server.js` to:
  * Validate environment variables
  * Inject `JWT_SECRET` into app config

This completes the dependency chain:

Environment → App Config → Middleware → Controllers → Repositories

### Notes / Takeaways

* JWT authentication requires consistent secret handling across the application.
* Middleware should handle authentication. Repositories should remain unaware of tokens.
* Ownership enforcement belongs in the data layer, not in controllers.
* Returning special values (`null`, `'forbidden'`) keeps repositories HTTP-agnostic.
* Controllers are responsible for translating repo results into HTTP responses.
* Introducing authentication changes method contracts and responsibilities.
* Validating environment configuration at startup prevents subtle runtime failures.

