# wk1-lvl4-contentHubAPI

This is the repo for Week 1 of CodeX, Level 4. This is a simple API project for a content hub API.

# Week 1

## Day 1

Today’s work focused on setting up the project, getting comfortable with reading and deleting individual posts, and making sure the API responds clearly when something goes wrong.

### What I added

* **GET ** `<strong>/posts/:id</strong>`
  * Returns a single post by id
  * Returns a `404` if the post doesn’t exist
* **DELETE ** `<strong>/posts/:id</strong>`
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
    **Paginated ** `<strong>GET /posts</strong>`
* Added support for `limit` and `offset` query parameters to control how many posts are returned at a time
* Introduced a shared pagination utility to safely parse and normalize query values (query params arrive as strings and can’t be trusted directly)
* Updated the posts repository to return:
  * a paginated slice of posts (`items`)
  * the total number of posts available (`total`)
* Updated the controller response to include pagination metadata so the client knows how much data exists and how to request the next page
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

* Middleware order matters — Express runs top to bottom, and the app breaks if helpers are registered too late.
* Separating “known HTTP errors” from unexpected errors makes controllers cleaner and easier to reason about.
* Pagination is a server responsibility — the server decides what is safe and reasonable, even if the client requests extreme values.
* Separating pagination logic into a utility keeps controllers focused on request/response flow instead of validation details.
* Returning `{ items, total }` from the repo allows the API to paginate results while still exposing the full dataset size to the client.
* Although behavior changed for `GET /posts`, the underlying data is still in-memory and resets on server restart.
* Page-based pagination feels more natural for clients, but internally still translates to offset logic.
* Controllers should coordinate related data. Repositories should stay focused on their own resource.
* Throwing typed errors like `badRequest` and `notFound` keeps the API predictable and consistent.
* Automated tests confirm correctness, but manual testing in Postman builds confidence that the API behaves properly in real usage.
* Small validation changes can break multiple tests at once. That’s not a bad thing — it proves the tests are actually protecting behavior.

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

### Repository Adjustments

The comments repository was updated to include:
`authorId`

This aligns it with post ownership logic and allows update/delete operations to enforce ownership consistently across resources.

Test files were updated to reflect this new repository contract.

### Test Updates

With authentication introduced, existing tests required updates to reflect the new protected route behavior.

#### Authentication Test File

* Added a dedicated `auth.test.js`
* Verifies:
  * A user can register successfully
  * Passwords are hashed before storage
  * A user can log in with valid credentials
  * A JWT is returned on both register and login
* Uses an injected test JWT secret to keep behavior predictable

This confirms the authentication flow works end-to-end.

#### Posts Test Updates

Because `POST /posts` is now protected:

* Updated tests to:
  * Register a test user
  * Retrieve a valid JWT
  * Include `Authorization: Bearer <token>` header when creating posts
* Verified:
  * Public routes (`GET /posts`, `GET /posts/:id`) remain accessible
  * Pagination behavior remains unchanged
  * Protected routes correctly require authentication

This ensures route protection was added without breaking existing behavior.

#### Comments Test Updates

Since nested comment creation is now protected:

* Updated comment creation tests to:
  * Register a user
  * Send JWT in Authorization header
* Verified:
  * Comments can be created under an existing post
  * Attempting to comment on a missing post still returns `404`
  * Authentication middleware runs before route logic

These updates confirm that nested resources correctly integrate with authentication and ownership enforcement.

### Notes / Takeaways

* JWT authentication requires consistent secret handling across the application.
* Middleware should handle authentication. Repositories should remain unaware of tokens.
* Ownership enforcement belongs in the data layer, not in controllers.
* Returning special values (`null`, `'forbidden'`) keeps repositories HTTP-agnostic.
* Controllers are responsible for translating repo results into HTTP responses.
* Introducing authentication changes method contracts and responsibilities.
* Validating environment configuration at startup prevents subtle runtime failures.
* Formatting should be applied after major structural changes to reduce noise during debugging.
* Authentication changes ripple through test files — protected routes require token setup.
* Injecting configuration (`JWT_SECRET`) into test app instances keeps tests deterministic.
* Separating formatting commits from logic commits makes history easier to follow.
* Updating repositories requires updating test expectations to match new data contracts.
* Middleware order continues to matter — authentication must run before controllers execute.

## Day 4

Day 4 marks the transition from an in-memory API to a persistent, database-backed system. Up until now, all data lived in memory and reset on server restart. Today’s work replaced that temporary layer with a real SQLite database, while preserving the architecture and contracts built in previous days.

The goal was not just to “add a database,” but to introduce persistence without breaking separation of concerns.

### What I added

#### SQLite Database Integration

* Introduced a SQLite database using Node’s built-in `node:sqlite` driver.
* Created a `db` folder to isolate database concerns from business logic.
* Added:
  * `database.js` — opens and configures the database connection.
  * `migrate.js` — runs schema setup.
  * `migrations/001_init.sql` — defines the initial schema.

The database now persists:

* `users`
* `posts`
* `comments`

This replaces the in-memory arrays used in previous days.

#### Schema Design (Relational Structure)

The initial migration defines:

* `users` table
  * Unique email
  * Hashed password storage
  * `created_at` timestamp
* `posts` table
  * Linked to `users` via `author_id`
  * `created_at` and `updated_at` timestamps
  * `ON DELETE CASCADE` for user cleanup
* `comments` table
  * Linked to both `posts` and `users`
  * `created_at` and `updated_at` timestamps
  * Cascading deletes to maintain integrity

Foreign key enforcement is enabled to ensure relational consistency.

This shifts the API from simulated relationships to real database constraints.

#### Repository Layer Migration

All repositories were refactored from in-memory storage to SQLite-backed implementations:

* `users.repo.js`
* `posts.repo.js`
* `comments.repo.js`

Key changes:

* Replaced arrays and manual id tracking with SQL queries.
* Introduced prepared statements for:
  * `SELECT`
  * `INSERT`
  * `UPDATE`
  * `DELETE`
  * `COUNT`
* Pagination now uses `LIMIT` and `OFFSET` directly in SQL.
* Ownership enforcement is handled inside SQL queries using:
  `WHERE id = ? AND author_id = ?`
  The repository contract remains the same:
* `null` → resource not found
* `'forbidden'` → wrong owner
* success → updated entity or `true`

Controllers were not rewritten. They continue to translate repository results into HTTP responses. This confirms that the abstraction layer held.

#### Repository Factory Update

`createRepos()` now accepts a database connection:
`createRepos(db)`

Repositories no longer create their own storage.

This establishes a clear dependency chain:

Database → Repositories → Controllers

The app does not need to know how data is stored.

#### Server Startup Changes

`server.js` now:

1. Validates environment variables.
2. Opens the SQLite database.
3. Runs migrations.
4. Injects the database into repositories.
5. Passes repositories into the app factory.

Startup flow now looks like:

Environment → Database → Migrations → Repositories → App

The application now initializes its data layer on startup.

#### Environment Configuration Updates

`ensureEnv()` was extended to include:

* `DB_PATH` validation
* Continued validation of `JWT_SECRET`

The server now depends on:

* A valid JWT secret
* A valid database file path

Startup will fail fast if configuration is missing.

#### Persistence Behavior Change

Data is no longer cleared when the server restarts.

The API now behaves like a real backend:

* Posts and comments persist.
* Relationships are enforced by the database.
* Cascading deletes maintain integrity.

### Structural Improvements

* Clear separation between:
  * Database setup
  * Schema definition
  * Repository logic
  * Controllers
* Repositories remain HTTP-agnostic.
* Controllers remain unaware of database details.
* Middleware order and response formatting remain unchanged.

The transition from in-memory to SQLite required minimal changes to controllers, confirming that the abstraction was correctly designed in earlier days.

### Notes / Takeaways

* Moving from in-memory storage to SQLite validates the separation of concerns built earlier.
* Prepared statements improve both safety and clarity.
* Ownership enforcement can be expressed directly in SQL rather than manual array checks.
* Pagination logic remains controller-driven, but slicing now happens at the database level.
* Relational constraints shift integrity enforcement from application logic to the database.
* Startup order matters: the database must exist before repositories are created.
* Injecting dependencies (like `db`) makes architecture predictable and testable.
* Refactoring storage should not require rewriting controllers if layers are properly separated.
* Persistence changes how tests behave, since data no longer resets automatically.
* Introducing a database transforms the API from a simulation into a real backend system.

# Week 2

## Day 1

Week 2 begins the transition from SQLite to a Postgres-based system using Prisma. The focus today was not on swapping databases yet, but on preparing the application for asynchronous data access so the architecture remains stable during the transition.

### What I updated

* **Converted controllers to async functions**
  * Updated all post-related controllers to use `<span>async</span>`/`<span>await</span>`
  * Ensured repository calls are awaited consistently
  * Preserved all existing response shapes and status codes
* **Adjusted authentication typing**
  * Removed numeric casting from `<span>req.user.id</span>`
  * Allows future compatibility with database-generated IDs
* **Maintained architectural boundaries**
  * Controllers remain storage-agnostic
  * Repositories remain HTTP-agnostic
  * No endpoint behavior or contracts were changed
* **Installed and configured Prisma**
  * Added `@prisma/client`, `@prisma/adapter-pg`, `pg`, and `dotenv`
  * Aligned all Prisma packages to the same version (`7.4.x`)
  * Added `"postinstall": "npx prisma generate"` to ensure the client generates automatically
  * Added `/generated/prisma` to `.gitignore`
* **Created Prisma schema and configuration**
  * Defined `User`, `Post`, and `Comment` models in `schema.prisma`
  * Configured `DATABASE_URL` (runtime) and `DIRECT_URL` (migrations)
  * Successfully ran:
    * `npx prisma migrate dev`
    * `npx prisma generate`
* **Refactored repositories to use Prisma**
  * Replaced SQLite queries and prepared statements with Prisma methods
  * Preserved repository return contracts:
    * `null` → not found
    * `'forbidden'` → ownership violation
    * success → entity or boolean
  * Controllers and response envelopes remain unchanged
* **Updated server wiring**
  * Removed SQLite initialization and migration runner
  * Injected Prisma client into `createRepos`
  * Added graceful shutdown handling with `prisma.$disconnect()`

### Notes / bumps along the way

* Prisma setup was more involved than expected — version alignment and configuration details required careful troubleshooting.
* Runtime and migration database URLs must be configured separately.
* A small configuration typo (`JWT_Secret` vs `JWT_SECRET`) temporarily broke authentication.
* Once properly wired, the engine swap did not require rewriting controllers — the architecture held.

### Takeaways

* Preparing controllers for async behavior before swapping databases prevents cascading refactors.
* Engine swaps are easier when contracts are already stable.
* Environment configuration bugs can be just as disruptive as database bugs.
* Strict version alignment matters when working with ORM tooling.
* Small naming inconsistencies can break authentication flows.
* Infrastructure transitions test patience — but the architecture held.

## Day 2

Day 2 focused on expanding query flexibility, strengthening Prisma error handling, and refining the controller–repository relationship without changing endpoint contracts. It also included hands-on SQL work inside Supabase to better understand how the database layer behaves underneath Prisma.

### What I updated

* **Optional related data loading for `GET /posts/:id`**

  * Added support for `?include=author`
  * Added support for `?include=comments`
  * Supports combined usage: `?include=author,comments`
  * Introduced `parseCsvSet` utility to safely parse comma-separated query values
  * Repository now builds dynamic Prisma `include` objects
  * Default response remains lightweight when no includes are requested
* **Conditional comment counts for `GET /posts`**

  * Added support for `?includeCounts=true`
  * Introduced `parseBoolean` utility to normalize query booleans
  * Repository conditionally attaches Prisma `_count` metadata
  * Default behavior unchanged unless explicitly requested
* **Query parsing utilities**

  * Created `utils/queryParams.js`
    * `parseBoolean(value)`
    * `parseCsvSet(value)`
  * Centralized query parsing logic
  * Controllers no longer manually interpret raw query strings
* **Prisma-aware global error handling**

  * Expanded `errorHandler` to map Prisma errors:
    * `P2002` → `409 UNIQUE_CONSTRAINT`
    * `P2003` → `409 FOREIGN_KEY_CONSTRAINT`
    * `P2025` → `404 RECORD_NOT_FOUND`
  * Added internal `mapPrismaError()` helper
  * Introduced `createErrorHandler()` factory pattern
  * Ensured consistent `{ ok: false, error: {...} }` response envelope
* **Repository enhancements (Posts)**

  * Added `getByIdWithIncludes(id, options)`
  * Added optional `_count` support in `list()`
  * Cleaned up UUID handling (no numeric casting)
  * Preserved return contracts:
    * `null` → not found
    * `'forbidden'` → ownership violation
    * success → entity or boolean
* **Controller cleanup**

  * Removed outdated manual comment attachment logic
  * Fully aligned with UUID string IDs
  * Preserved response structure and status codes
* **App wiring confirmation**

  * Ensured `createErrorHandler()` is properly invoked in `createApp()`
  * Middleware order remains correct:
    * response helpers → routes → 404 handler → error handler
      **Supabase SQL exploration**
* Followed along in Supabase SQL editor during lecture
* Observed how foreign keys and constraints behave at the database level
* Saw how database-level constraint violations surface as Prisma error codes
* Reinforced understanding of how Prisma maps relational behavior into application logic

### Testing

* Manually verified behavior in Postman:
  * `GET /posts/:id?include=author`
  * `GET /posts/:id?include=comments`
  * `GET /posts/:id?include=author,comments`
  * `GET /posts?includeCounts=true`
* Confirmed:
  * `_count` only appears when requested
  * Includes attach related data correctly
  * Missing resources return `404`
  * Prisma constraint errors return normalized responses

### Notes / Takeaways

* Query flexibility should be explicit and opt-in.
* Controllers coordinate relationships; repositories shape data.
* Prisma errors must be normalized to protect API boundaries.
* UUID-based IDs remove numeric validation logic.
* Small parsing utilities reduce duplication across controllers.
* Expanding features without rewriting architecture confirms abstraction strength.

## Day 3

Day 3 focused on stabilizing the Prisma workflow and removing the legacy SQLite migration system. The goal was to make database setup, resets, and CI execution predictable without changing endpoint behavior or architectural boundaries.

### What I updated

#### Database Reset & Seed Tooling

* Added `prisma/seed.js`
  * Entry point for `npx prisma db seed`
  * Guards execution to `development` only
  * Logs created record counts
* Added `prisma/seedData.js`
  * Centralized seed helpers:
    * `clearDatabase(prisma)` — deletes rows in dependency order
    * `seedDatabase(prisma)` — inserts deterministic demo data
  * Deletes in Foreign Key-safe order:
    * comments → posts → users
  * Returns created entities for logging
* Added `scripts/dbReset.js`
  * Runs:
    * `clearDatabase()`
    * then `seedDatabase()`
  * Does **not** drop schema
  * Safe to run repeatedly

Added new `package.json` scripts:

* `db:generate`
* `db:migrate:dev`
* `db:migrate:deploy`
* `db:seed`
* `db:reset`
* `prisma:debug`

Configured Prisma seed entry:

```
"prisma": {
  "seed": "node prisma/seed.js"
}
```

This creates a clear development flow:

* Generate client
* Apply migrations
* Reset data safely
* Seed deterministic records

#### Removed Legacy SQLite Migration System

Deleted:

* `src/db/database.js`
* `src/db/migrate.js`
* `migrations/001_init.sql`
* `migrations/.keep`

Prisma now fully manages:

* Schema definition (`schema.prisma`)
* Migration generation
* Migration application

There is no longer a dual migration system.

#### CI Workflow Updates

Updated `.github/workflows/ci.yml`:

* Runs on push to `main`
* Spins up a Postgres 16 service container
* Sets `DATABASE_URL` to the CI database
* Runs:
  * `prisma generate`
  * `prisma migrate deploy`
  * `npm test`
* Standardized Node version to **24**
* Enabled npm caching

This ensures tests run against an isolated database and do not depend on Supabase. CI now matches the local Node runtime.

#### ESLint Update

Updated `eslint.config.js` to ignore:
`generated/**`
This prevents Prisma-generated client files from being linted.

### Notes / Takeaways

* Resetting data is safer than dropping schema in remote environments.
* Prisma should be the single migration authority once adopted.
* CI should not rely on production databases.
* Keeping CI Node version aligned with local development prevents subtle runtime differences.
* Removing legacy systems reduces long-term complexity.

## Branch: `questions`

This branch contains small, targeted modifications I made while answering the questions bank to prep for the 1st Badge Interview of Level 4.

### A1 — Add `GET /health` with consistent response envelope + `X-Request-Id`

I added a simple health check endpoint to prove I understand:

* response helpers (`res.ok`)
* headers on responses
* consistent envelope formatting

**Health endpoint**

* Added `GET /health`
  * Returns a 200 with a consistent JSON response body using `res.ok(...)`
  * Adds header: `X-Request-Id: health-check`

Verified in Postman:

* Response header includes `X-Request-Id`
* Response body returns the standardized `{ data: ... }` shape from the response helper

### A2 — Switch one update route to PATCH + support partial updates

I changed the posts update route from `PUT` to `PATCH` and updated the controller so it can **update only the fields provided** .

**Route change**

* Updated posts router:
  * `PATCH /posts/:id` (auth required)

**Controller update behavior**

* `updatePost` now builds a partial `updates` object:
  * If `title` is provided → update title
  * If `body` is provided → update body
* If the client sends **no valid fields** , the controller throws a `400`:
  * This prevents “empty” updates and proves partial-update logic is intentional.

**Why this matters**

* `PUT` usually implies “replace the full resource”
* `PATCH` implies “partial update”
* This change shows I understand HTTP semantics *and* how to guard invalid request bodies.

Verified in Postman:

* Sent only `body` → post updated successfully, title unchanged.

### Debugging / test fixes that happened while doing A1–A2 and part of A4 🧯

While updating code to support the questions, tests started failing — not because the endpoints were wrong, but because **middleware wiring and response shapes matter** .

What I fixed:

* **Error handler factory was not being invoked**
  * `createErrorHandler` is a factory, so it must be mounted like this:
    * `app.use(createErrorHandler());`
  * Once I fixed that, the API stopped returning “mystery 500s” and started returning consistent `{ ok: false, error: { ... } }` responses again.
* **UUID expectations + “missing id” tests**
  * IDs are UUID strings now (Prisma/Postgres), so the “missing resource” tests must use a UUID-shaped value.
  * I used a constant like:
    * `00000000-0000-0000-0000-000000000000`
* **Template literal mistakes were causing bad URLs**
  * Some failing tests were literally hitting `/posts/${MISSING_UUID}` as a string (or malformed `${}`), which produced unexpected behavior.
  * Correct format:
    * ``/posts/${MISSING_UUID}``
* **Unique emails for auth tests**
  * Re-registering the same email can hit unique constraints, so tests use a unique email like:
    * ``bob+${Date.now()}@example.com``
  * `Date.now()` returns a new number each run, so the email is always unique and registration won’t collide.
* **Pagination expectation (why “I created 3” doesn’t always mean “total is 3”)**
  * If the DB already has seeded posts (or tests run in a shared DB state), `total` might be **>= 3** , not exactly 3.
  * So tests should assert:
    * `total` is **at least** what we created, unless the test resets the DB.

### A4 — Max Limit Guard (Validation)

To prevent clients from requesting excessive amounts of data, I added a max limit guard directly inside the shared pagination utility (`parsePagination`).

If a client provides:
`GET /posts?limit=500`

The API now throws a `400 bad_request` before reaching the repository.

**Implementation details:**

* Guard added inside `parsePagination`
* If `limit > 100` → throw `badRequest('Limit cannot exceed 100')`
* Error is formatted by the centralized error handler
* Controllers remain clean
* Repository remains unaware of pagination limits

This ensures:

* Every endpoint using pagination is automatically protected
* The rule is enforced consistently across the API
* Absurd queries are rejected early
* Error formatting stays standardized

Example response:

```
{
  "ok": false,
  "error": {
    "code": "bad_request",
    "message": "Limit cannot exceed 100"
  }
}
```

### A5 — Content-Type and JSON Handling

#### What I implemented

The API expects JSON request bodies for create and update routes. Express only parses the request body when the client sends: `Content-Type: application/json`

During testing, an update request failed with: `415 Unsupported Media Type`

This occurred because the request body was sent without explicitly setting the JSON content type.

The fix in the test:

```
.set('Content-Type', 'application/json')
.send({ body: 'Edited' })
```

The application uses `express.json()` middleware, so properly formatted JSON with the correct header is required for `req.body` to be populated.

#### Why this matters

* Express does not parse request bodies automatically.
* Clients must declare the body format.
* Missing or incorrect `Content-Type` headers prevent validation middleware from functioning.
* Proper JSON handling is part of honoring the HTTP contract, not just route logic.

### A6 — CORS and Preflight Requests

#### What I implemented

CORS was initially enabled globally: `app.use(cors());`

This allows requests from all origins.

To restrict access, I added environment-based configuration: `app.use(cors({ origin: ALLOWED_ORIGIN }));`

`ALLOWED_ORIGIN` is loaded from environment configuration and injected into the app.

This limits which frontend origins can access the API.

#### Preflight Behavior

Browsers automatically send an `OPTIONS` request before certain cross-origin calls when:

* The method is not simple (PUT, PATCH, DELETE)
* Custom headers are included (e.g., Authorization)

The CORS middleware handles these preflight checks automatically.

Postman does not trigger preflight behavior because it is not a browser.

#### Why this matters

* CORS is a browser-enforced security layer.
* Preflight checks occur before the main request.
* Restricting allowed origins improves security.
* CORS configuration belongs in middleware, not controllers.

### A7 — Nested Ownership Enforcement (403 on Child Resource)

#### What I implemented

I added support for updating nested comments under posts:

```
postsRouter.put(
  '/:postId/comments/:commentId',
  requireAuth,
  updateComment
);
```

Ownership enforcement remains in the repository layer.

Repository contract:

* `null` → resource not found
* `'forbidden'` → resource exists but belongs to another user
* success → updated entity

The controller translates:

* `null` → 404
* `'forbidden'` → 403

#### Test proving 403 behavior

The automated test creates two users:

1. User A creates a post.
2. User B creates a comment under that post.
3. User A attempts to update User B’s comment.

Expected result:`403 Forbidden`

Verified with:

```
.expect(403);
expect(updateRes.body.error.code).toBe('forbidden');
```

#### Why this matters

* Authentication verifies identity.
* Authorization enforces ownership.
* Nested resources require independent ownership checks.
* Repositories remain HTTP-agnostic.
* Controllers translate repository outcomes into HTTP responses.
* This prevents privilege escalation on child resources.

### A8 — Route structure and API versioning (e.g., `/api/v1`)

#### What I implemented

Routes are organized by resource using dedicated routers:

* `posts.routes.js`
* `auth.routes.js`
* `comments.routes.js`

Each router defines only its own resource endpoints. They are mounted centrally inside `createApp()`.

Example from `createApp()`:

```
// Routes
app.use('/posts', postsRouter);
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);
```

To demonstrate API versioning without breaking existing behavior or tests, I mounted the same routers under a versioned namespace:

```
// Versioned routes
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/comments', commentsRouter);
```

This allows both:

```
GET /posts
GET /api/v1/posts
```

to resolve to the same router logic.

#### Why this matters

Route grouping keeps the API modular and scalable.

Versioning at the mount level:

* does not require rewriting controllers
* does not duplicate logic
* protects future breaking changes

If a future change alters response shape or validation behavior, a new version (e.g. `/api/v2`) can be introduced without breaking existing clients.

Versioning belongs at the routing layer, not inside controllers.

### A9 — Debugging Workflow (Postman, Logs, Request IDs)

#### What I implemented

I used Postman and logging to debug request flow end-to-end.

##### Postman setup

For protected routes:

```
Authorization: Bearer <token>
Content-Type: application/json
```

Example test request:

```
.set('Authorization', `Bearer ${token}`)
.set('Content-Type', 'application/json')
.send({ body: 'Edited' })
```

##### Health route with request ID correlation

I added a request-id log to verify header handling:

```
app.get('/health', (req, res) => {
  const requestId = req.get('X-Request-Id');

  if (requestId) {
    console.log(`RequestId: ${requestId}`);
  }

  return res.ok({ status: 'ok' });
});
```

In Postman, I manually added: `X-Request-Id: health-001`

This allowed me to correlate:

* the Postman request
* the terminal log
* the response

##### Logging

Morgan middleware: `app.use(morgan('dev'));`

This logs: `GET /posts 200 12ms`

which helps confirm:

* route hit
* status code
* execution timing

#### Why this matters

Postman verifies real HTTP behavior:

* headers
* auth
* content-type
* body parsing

Logs confirm what the server actually received.

Request IDs make debugging easier when multiple requests are in-flight.

This shows understanding of request lifecycle, not just route logic.

### B1 — Backend Structure (MVC-style separation with React as View)

#### What I implemented

I structured the backend using separation of concerns:

**Routes**

Define endpoints and mount middleware.

Example: `postsRouter.patch('/:id', requireAuth, updatePost);`

**Controllers**

Handle HTTP concerns only:

```
export async function updatePost(req, res) {
  const { posts } = res.locals.repos;
  const id = req.params.id;

  const updates = {};
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.body !== undefined) updates.body = req.body.body;

  if (Object.keys(updates).length === 0) {
    throw badRequest({ message: 'Provide at least one field to update' });
  }

  const updated = await posts.update({
    id,
    ...updates,
    authorId: req.user.id,
  });

  if (updated === null) throw notFound('Post not found');
  if (updated === 'forbidden') throw forbidden('You do not own this post');

  return res.ok(updated);
}
```

Controllers:

* read params/query/body
* call repo
* return HTTP response

They do **not** :

* call Prisma directly
* enforce ownership rules
* shape database includes

**Repositories**

Handle data access and business rules:

```
async update({ id, title, body, authorId }) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return null;
  if (existing.authorId !== authorId) return 'forbidden';

  return prisma.post.update({
    where: { id },
    data: { title, body },
  });
}
```

Repositories:

* contain Prisma logic
* enforce ownership
* return HTTP-agnostic contracts

#### Why this matters

This separation allows:

* database swaps without rewriting controllers
* clean test boundaries
* predictable behavior
* smaller, focused files

React is the “View.”

The backend exposes JSON contracts only.

Moving `includeCounts` normalization from the controller into the repository reinforced that data-shaping belongs in the data layer.

### B2 — Middleware Order & Why the Error Handler Must Be Last

#### Middleware Order in `createApp()`

```
app.use(express.json());
app.use(requireJson);
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

app.use(respond);

app.use('/posts', postsRouter);
app.use('/auth', authRouter);

app.use(notFoundHandler);

app.use(createErrorHandler());
```

#### Why error handler must be last

Express executes middleware top-to-bottom.

If a controller throws: `throw notFound('Post not found');`

Express looks for middleware with the signature: `(err, req, res, next)`

When calling: `next(err);`

Express skips normal middleware and jumps directly to the next error middleware.

If `createErrorHandler()` is not mounted last:

* errors may not be formatted
* responses may default to 500
* test expectations fail

#### What happens when calling `next(err)`

1. Express stops executing normal middleware.
2. It looks forward in the stack.
3. It executes the first error middleware it finds.

That is why this must be last: `app.use(createErrorHandler());`

#### Validation example to prove middleware order

If we insert a validation middleware:

```
postsRouter.patch(
  '/:id',
  requireAuth,
  validatePostUpdate,
  updatePost
);
```

Execution order:

1. `requireAuth`
2. `validatePostUpdate`
3. `updatePost`
4. error handler (if thrown)

This demonstrates understanding of middleware stacking and execution flow.

### B3 — Async Error Handling in Express (Async Controllers + Centralized Error Middleware)

#### What I implemented

All controllers are defined as `async` functions. When an error is thrown inside an async controller (for example `throw notFound('Post not found')`), Express forwards the rejected Promise to the centralized error middleware.

Example from a controller:

```
export async function getPost(req, res) {
  const { posts } = res.locals.repos;
  const post = await posts.getById(req.params.id);

  if (!post) {
    throw notFound('Post not found');
  }

  return res.ok(post);
}
```

There is no duplicated `try/catch` block in the controller.

If an error is thrown:

* Express forwards it to the global error middleware.
* The centralized error handler formats the response.
* The client receives the standardized error envelope.

Middleware such as `requireAuth`, `requireJson`, and `notFoundHandler` explicitly call `next(err)` to forward errors into the same centralized pipeline.

#### Why this matters

* Controllers remain clean and focused on HTTP orchestration.
* No repetitive `try/catch { next(err) }` blocks.
* All failures — sync or async — flow into one standardized error handler.
* Error formatting is consistent across the API.

### B4 — Global Error Envelope & Standardized Error Codes

#### Global Error Envelope

All failures are normalized into a consistent JSON shape by the centralized error handler:

```
{
  "ok": false,
  "error": {
    "code": "...",
    "message": "...",
    "details": ...
  }
}
```

This formatting is handled by the shared `sendError()` helper inside `createErrorHandler()`.

#### Prisma Error Mapping

Known Prisma database errors are mapped to appropriate HTTP status codes:

* `P2002` → `409` UNIQUE_CONSTRAINT
* `P2003` → `409` FOREIGN_KEY_CONSTRAINT
* `P2025` → `404` RECORD_NOT_FOUND

This ensures database failures are translated into meaningful HTTP responses rather than leaking raw ORM errors.

#### API_ERROR_DETAILS Environment Gating

I added environment-based gating for error details:
`const API_ERROR_DETAILS = process.env.API_ERROR_DETAILS ?? 'false';`

In the error handler:

```
const showDetails =
  req.app.locals.config.API_ERROR_DETAILS === 'true';

```

If enabled (`true`):

* `error.details` is included for debugging.

If disabled (default):

* `details` is returned as `null`.

This keeps the error envelope shape identical while preventing internal information leakage in production environments.

#### Why this matters

* The frontend can reliably read `error.code` and react predictably.
* Status codes are intentional and consistent.
* Database implementation details are abstracted away.
* Production environments remain secure by default.

### B5 — JWT Authentication Flow (Register → Login → Token → Protected Routes)

#### Registration (Password Hashing)

Passwords are never stored in plain text.

During registration:

* The password is hashed using `bcrypt`.
* The stored value is a salted hash.
* Plain text passwords are never persisted.

Example:

```
export function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}
```

#### Login (Token Creation)

During login:

* The submitted password is compared using `bcrypt.compareSync`.
* If valid, a JWT is created.

Token signing:

```
export function signToken(userId, secret) {
  return jwt.sign({ sub: userId }, secret, { expiresIn: '12h' });
}
```

The `sub` (subject) claim stores the user ID.

#### Protected Routes (Token Verification)

Clients send:
`Authorization: Bearer <token>`

The `requireAuth` middleware:

1. Validates header format.
2. Verifies token signature and expiration.
3. Extracts `payload.sub`.
4. Attaches: `req.user = { id: payload.sub };`

Controllers then use `req.user.id` for ownership enforcement.

#### Token Expiration Handling

If a token is expired or invalid:

```
catch {
  return next(unauthorized('Invalid token'));
}
```

The request returns:

```
{
  "ok": false,
  "error": {
    "code": "unauthorized",
    "message": "Invalid token",
    "details": null
  }
}
```

This returns HTTP `401` and keeps the message intentionally vague for security.

#### Why this matters

* Passwords are securely hashed.
* Authentication is stateless.
* Token expiration is enforced server-side.
* Identity (`req.user`) is attached before controller logic.
* Authorization (ownership checks) remains separate from authentication.

