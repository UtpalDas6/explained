import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /api section — 25 REST API design principles, grouped
// Resource Design / HTTP Semantics / Responses / Security / Performance &
// Scale / Evolution. Each demo toggles bad-practice vs. fixed, reusing the
// same before/after StateDemo the Git Commands section uses.
const demo = (props) => () => createElement(StateDemo, props)

export const apiConcepts = [
  {
    id: 'resource-naming',
    section: 'api',
    title: 'Resource Naming',
    blurb: 'Endpoints name a resource (a noun) that HTTP methods act on — the verb belongs in the method, not the URL.',
    tag: 'Resource Design',
    Component: demo({
      command: 'fix the route',
      before: [{ label: 'GET /getUserById?id=1', color: 'var(--bad)' }],
      after: [{ label: 'GET /users/1', color: 'var(--good)' }],
      note: {
        before: 'The verb "get" is baked into the path, and the id is a query param instead of part of the resource address.',
        after: 'The URL names the resource; GET, the HTTP method, already says what to do with it.',
      },
    }),
    code: [{ lang: 'http', snippet: `# Bad\nGET /getUserById?id=1\nPOST /createUser\n\n# Good\nGET /users/1\nPOST /users` }],
    realWorld:
      'Every well-known public API (Stripe, GitHub, Twilio) names endpoints after resources — /charges, /repos/{owner}/{repo}, /messages — and lets the HTTP verb carry the action.',
    pitfall:
      'Chasing "pure" REST nouns for genuinely action-like operations (like "send a password reset email") produces awkward, contorted resource names that are harder to understand than an honest verb would be.',
    fix:
      'Model the action as a sub-resource instead of forcing a verb into a noun path — POST /password-resets rather than POST /users/1/sendPasswordReset.',
  },
  {
    id: 'nested-resources',
    section: 'api',
    title: 'Nested Resources',
    blurb: 'A resource that only exists inside a parent is addressed under it — the URL mirrors the ownership.',
    tag: 'Resource Design',
    Component: demo({
      command: 'nest under the parent',
      before: [{ label: 'GET /orders?userId=1', color: 'var(--bad)' }],
      after: [{ label: 'GET /users/1/orders', color: 'var(--good)' }],
      note: {
        before: "Orders and their owner are related only through a query parameter — nothing in the URL says they're connected.",
        after: "The path itself expresses the relationship: these are specifically this user's orders.",
      },
    }),
    code: [{ lang: 'http', snippet: `# Bad\nGET /orders?userId=1\n\n# Good\nGET /users/1/orders` }],
    realWorld:
      "GitHub's /repos/{owner}/{repo}/issues — an issue only makes sense in the context of its repo, so the URL nests it there instead of a flat /issues?repo=.",
    pitfall:
      'Nesting too deeply (/users/1/orders/5/items/9/reviews/3) makes URLs unwieldy and forces every client to know the full ownership chain just to address one resource.',
    fix:
      'Nest one level for a true parent-child relationship, but give deeply-related resources their own top-level, independently addressable route (e.g. /items/9) once nesting gets past two levels.',
  },
  {
    id: 'collection-vs-singleton',
    section: 'api',
    title: 'Collection vs Singleton Resources',
    blurb: 'A plural path returns a list; a specific id returns one item — mixing the two shapes under one route confuses clients.',
    tag: 'Resource Design',
    Component: demo({
      command: 'split list from item',
      before: [{ label: 'GET /user', sub: 'returns array or object?', color: 'var(--bad)' }],
      after: [
        { label: 'GET /users', sub: '→ [ ]', color: 'var(--good)' },
        { label: 'GET /users/1', sub: '→ { }', color: 'var(--good)' },
      ],
      note: {
        before: 'One ambiguous route — the client has to guess or inspect the response to know if it is a list or a single object.',
        after: 'The plural collection always returns an array; the id-suffixed route always returns a single object — predictable from the URL alone.',
      },
    }),
    code: [{ lang: 'http', snippet: `# Bad\nGET /user   # array or object, depending on...?\n\n# Good\nGET /users     -> [ {...}, {...} ]\nGET /users/1   -> { ... }` }],
    realWorld:
      "REST conventions like Rails' resourceful routing (GET /users vs GET /users/:id) exist exactly so client code can predict the response shape without runtime type-checking.",
    pitfall:
      'A singular route that sometimes returns one object and sometimes a list (depending on filters) forces every client to write defensive type-checking around the response.',
    fix:
      'Keep the collection route (plural) always returning an array — even a single filtered match — and reserve the item route (with an id) for a single object.',
  },
  {
    id: 'http-methods',
    section: 'api',
    title: 'HTTP Methods',
    blurb: 'GET, POST, PUT, PATCH, and DELETE each carry a specific meaning that clients, caches, and proxies rely on.',
    tag: 'HTTP Semantics',
    Component: demo({
      command: 'use the right verb',
      before: [{ label: 'POST /users/1/delete', color: 'var(--bad)' }],
      after: [{ label: 'DELETE /users/1', color: 'var(--good)' }],
      note: {
        before: 'POST is being used for everything — deleting, updating, reading — so nothing in the HTTP layer knows what this request actually does.',
        after: 'DELETE tells every cache, proxy, and browser exactly what kind of operation this is, without reading the URL.',
      },
    }),
    code: [{ lang: 'http', snippet: `GET    /users/1     # read\nPOST   /users       # create\nPUT    /users/1     # replace fully\nPATCH  /users/1     # update partially\nDELETE /users/1     # remove` }],
    realWorld:
      'Browsers, CDNs, and HTTP libraries all branch on the method — GET requests get cached and retried automatically, POST requests never are, purely based on the verb.',
    pitfall:
      "Treating PUT and PATCH as interchangeable loses meaning — PUT means \"replace the whole resource\", PATCH means \"apply a partial update\" — using PUT for a partial update silently wipes fields the client didn't send.",
    fix:
      'Use PATCH (not PUT) for partial updates, and make sure PUT handlers genuinely replace the full resource, treating omitted fields as intentionally cleared.',
  },
  {
    id: 'idempotency',
    section: 'api',
    title: 'Idempotency',
    blurb: 'Calling the same request twice should produce the same end state as calling it once — true for GET/PUT/DELETE, not guaranteed for POST.',
    tag: 'HTTP Semantics',
    Component: demo({
      command: 'retry safely',
      before: [
        { label: 'POST /orders (retry)', color: 'var(--bad)' },
        { label: '2 orders created', color: 'var(--bad)' },
      ],
      after: [
        { label: 'PUT /orders/42 (retry)', color: 'var(--good)' },
        { label: 'still 1 order', color: 'var(--good)' },
      ],
      note: {
        before: 'A network timeout causes the client to retry a POST — the server has no way to know it already handled the first attempt, so it creates a duplicate.',
        after: 'PUT with a client-chosen id is naturally idempotent — retrying it lands on the exact same resource state either way.',
      },
    }),
    code: [{ lang: 'http', snippet: `# Not idempotent — retry risks a duplicate\nPOST /orders {"item": "widget"}\n\n# Idempotent — retry is safe\nPUT /orders/42 {"item": "widget"}` }],
    realWorld:
      'Payment APIs (Stripe) build their entire retry story around idempotency — a flaky network must never be able to charge a card twice.',
    pitfall:
      'Assuming POST is idempotent because "it usually works" is exactly the assumption that causes duplicate charges or duplicate orders under real-world network retries.',
    fix:
      'For POST endpoints that create something with side effects, require an idempotency key so retries are provably safe rather than assumed safe.',
  },
  {
    id: 'idempotency-keys',
    section: 'api',
    title: 'Idempotency Keys',
    blurb: 'A client-generated key lets a server recognize a retried POST and return the original result instead of repeating the side effect.',
    tag: 'HTTP Semantics',
    Component: demo({
      command: 'attach an idempotency key',
      before: [{ label: 'POST /charges', sub: 'no key', color: 'var(--bad)' }],
      after: [{ label: 'POST /charges', sub: 'Idempotency-Key: abc123', color: 'var(--good)' }],
      note: {
        before: 'Two identical POST requests look completely indistinguishable to the server — it has no way to tell "retry" from "second real request".',
        after: 'The server stores abc123 → the first response. A retry with the same key returns that cached result instead of charging again.',
      },
    }),
    code: [{ lang: 'http', snippet: `POST /charges\nIdempotency-Key: abc123\n\n{ "amount": 2000, "currency": "usd" }` }],
    realWorld:
      'Stripe, PayPal, and most payment gateways require an Idempotency-Key header on every charge request specifically to make network retries safe.',
    pitfall:
      "A key that's reused across genuinely different requests (not just retries) silently returns stale results for a request that should have gone through.",
    fix:
      'Generate a fresh idempotency key per logical operation (e.g. a UUID per checkout attempt), and only reuse it when deliberately retrying that exact same operation.',
  },
  {
    id: 'status-codes',
    section: 'api',
    title: 'HTTP Status Codes',
    blurb: 'The response status communicates outcome at a glance — success, client error, or server error — before the body is even parsed.',
    tag: 'HTTP Semantics',
    Component: demo({
      command: 'return the right code',
      before: [{ label: '200 OK', sub: 'body: {"error": "not found"}', color: 'var(--bad)' }],
      after: [{ label: '404 Not Found', color: 'var(--good)' }],
      note: {
        before: 'The status says success, but the body says failure — every client now has to parse the body just to know if the request worked.',
        after: 'The status code alone tells any client, cache, or monitoring tool that this request failed, with no body parsing required.',
      },
    }),
    code: [{ lang: 'http', snippet: `200 OK          # success\n201 Created     # POST that made something\n400 Bad Request # client sent something invalid\n401/403         # auth failed / not allowed\n404 Not Found\n429 Too Many Requests\n500 Internal Server Error` }],
    realWorld:
      'Monitoring and alerting tools (Datadog, load balancer health checks) key off status codes directly — a 5xx rate spike pages someone automatically; a 200 with an error buried in the body does not.',
    pitfall:
      'Inventing custom status codes or misusing existing ones (like 200 for everything, or 400 for a server bug) breaks the shared vocabulary every HTTP client and proxy already understands.',
    fix:
      'Stick to standard status codes and their documented meaning — 2xx success, 4xx the client\'s fault, 5xx the server\'s fault — and put details in the body, not the code.',
  },
  {
    id: 'content-negotiation',
    section: 'api',
    title: 'Content Negotiation',
    blurb: 'The Accept and Content-Type headers let client and server agree on a response format without baking it into the URL.',
    tag: 'HTTP Semantics',
    Component: demo({
      command: 'negotiate via headers',
      before: [{ label: 'GET /users/1.json', color: 'var(--bad)' }],
      after: [{ label: 'GET /users/1', sub: 'Accept: application/json', color: 'var(--good)' }],
      note: {
        before: 'The format is hardcoded into the URL — supporting XML too means either a second URL or a parameter, and one resource has multiple addresses.',
        after: 'One URL, one resource — the Accept header tells the server which representation to send back.',
      },
    }),
    code: [{ lang: 'http', snippet: `GET /users/1\nAccept: application/json\n\n# same resource, different representation\nGET /users/1\nAccept: application/xml` }],
    realWorld:
      "GitHub's API returns different response shapes (preview features, diff format) based entirely on custom Accept header values, with no change to the URL.",
    pitfall:
      'Supporting content negotiation nobody actually uses (XML alongside JSON, for a client base that\'s 100% JSON) is speculative complexity maintained for a scenario that never comes up.',
    fix:
      'Default to JSON and only add real content negotiation once a second format has an actual consumer — a `.json` suffix convention is a fine placeholder until then.',
  },
  {
    id: 'error-format',
    section: 'api',
    title: 'Consistent Error Format',
    blurb: 'Every error response shares the same shape, so client error-handling code is written once instead of per-endpoint.',
    tag: 'Responses',
    Component: demo({
      command: 'standardize the error body',
      before: [{ label: '{"msg": "bad"} / {"err": "..."}', color: 'var(--bad)' }],
      after: [{ label: '{"error": {"code", "message", "field"}}', color: 'var(--good)' }],
      note: {
        before: "Different endpoints invented their own error shape — a generic error handler on the client can't rely on any consistent field name.",
        after: 'One schema for every error, everywhere — a single client-side error handler can parse code, message, and field from any endpoint.',
      },
    }),
    code: [{ lang: 'http', snippet: `{\n  "error": {\n    "code": "validation_error",\n    "message": "email is required",\n    "field": "email"\n  }\n}` }],
    realWorld:
      'Stripe and most mature APIs document one canonical error object shape used across every single endpoint, precisely so SDKs can handle errors generically.',
    pitfall:
      'Leaking raw internals into the error body (a stack trace, a SQL error message) both confuses API consumers and can expose implementation details to attackers.',
    fix:
      'Map internal exceptions to a small, stable set of public error codes and messages at the API boundary — log the raw internal error server-side, never return it to the client.',
  },
  {
    id: 'partial-response',
    section: 'api',
    title: 'Partial Responses (Field Selection)',
    blurb: 'Letting the client request only the fields it needs avoids over-fetching a large object for a small use case.',
    tag: 'Responses',
    Component: demo({
      command: 'select fields',
      before: [{ label: 'GET /users/1', sub: '→ 40-field object', color: 'var(--bad)' }],
      after: [{ label: 'GET /users/1?fields=id,name', sub: '→ 2-field object', color: 'var(--good)' }],
      note: {
        before: 'A mobile client that only needs a name and avatar downloads the full user object anyway — every field, every request.',
        after: 'The client asks for exactly what it needs, cutting payload size without a new endpoint for every combination of fields.',
      },
    }),
    code: [{ lang: 'http', snippet: `GET /users/1?fields=id,name\n\n{ "id": 1, "name": "Ada Lovelace" }` }],
    realWorld:
      "Google APIs' `fields` parameter and GraphQL's entire query model both exist to solve this — a mobile client on a slow connection benefits the most.",
    pitfall:
      'A fully open field-selection syntax turns into a mini query language the server has to validate, secure, and optimize — an unbounded feature request in disguise.',
    fix:
      'Start with a small allow-list of commonly-requested field subsets (or skip it until over-fetching is a measured problem) rather than building arbitrary field selection speculatively.',
  },
  {
    id: 'pagination',
    section: 'api',
    title: 'Pagination',
    blurb: 'Large collections are returned in bounded pages instead of one unbounded response — by offset or by cursor.',
    tag: 'Responses',
    Component: demo({
      command: 'paginate the list',
      before: [{ label: 'GET /orders', sub: '→ 2,000,000 rows', color: 'var(--bad)' }],
      after: [{ label: 'GET /orders?cursor=abc&limit=50', sub: '→ 50 rows + next cursor', color: 'var(--good)' }],
      note: {
        before: 'One request tries to return the entire table — slow for the server, slow for the client, and impossible to render all at once anyway.',
        after: 'A bounded page comes back fast, plus a cursor telling the client exactly how to fetch the next one.',
      },
    }),
    code: [{ lang: 'http', snippet: `GET /orders?cursor=abc123&limit=50\n\n{\n  "data": [ ... 50 items ... ],\n  "next_cursor": "def456"\n}` }],
    realWorld:
      "Every API with growing collections (Stripe's list endpoints, GitHub's paginated issues) caps page size and returns a next-page token rather than trusting the client to ask for the whole set.",
    pitfall:
      'Offset-based pagination (?offset=1000&limit=50) skips or duplicates rows when the underlying data changes between page requests — an insert before offset 1000 shifts everything after it.',
    fix:
      'Prefer cursor-based pagination (an opaque token pointing at "after this row") over raw offsets once the collection changes while being paginated through.',
  },
  {
    id: 'response-envelope',
    section: 'api',
    title: 'Envelope vs Bare Response',
    blurb: 'Wrapping the payload in a top-level {data, meta} envelope — or returning it bare — is a deliberate, consistent choice either way.',
    tag: 'Responses',
    Component: demo({
      command: 'pick one shape, consistently',
      before: [
        { label: '/users → [ ]', color: 'var(--bad)' },
        { label: '/orders → {"data": [ ]}', color: 'var(--bad)', dim: true },
      ],
      after: [
        { label: '/users → {"data": [ ], "meta": {...}}', color: 'var(--good)' },
        { label: '/orders → {"data": [ ], "meta": {...}}', color: 'var(--good)' },
      ],
      note: {
        before: 'Two endpoints, two different response shapes — client code has to special-case each one instead of using one generic response parser.',
        after: "Every endpoint wraps its payload the same way, so pagination metadata, rate-limit info, or request ids have a home that doesn't collide with `data`.",
      },
    }),
    code: [{ lang: 'http', snippet: `{\n  "data": [ {...}, {...} ],\n  "meta": { "total": 340, "next_cursor": "abc" }\n}` }],
    realWorld:
      "JSON:API and most large platform APIs standardize on an envelope specifically so cross-cutting metadata (pagination, warnings) has a home that doesn't collide with the actual payload.",
    pitfall:
      "A bare-array response (no envelope) has nowhere to put pagination metadata later, forcing a breaking change (array → object) the day pagination becomes necessary.",
    fix:
      'Pick an envelope (or deliberately not) at the start and apply it uniformly — retrofitting one onto an already-shipped bare-array API is a breaking change every consumer has to handle.',
  },
  {
    id: 'hateoas',
    section: 'api',
    title: 'HATEOAS (Hypermedia Links)',
    blurb: 'A response includes links to related actions and resources, so clients discover what to do next instead of hardcoding URLs.',
    tag: 'Responses',
    Component: demo({
      command: 'add hypermedia links',
      before: [{ label: '{"id": 42, "status": "pending"}', color: 'var(--bad)' }],
      after: [{ label: '{"id": 42, "status": "pending", "links": {"cancel": "/orders/42/cancel"}}', color: 'var(--good)' }],
      note: {
        before: 'The client has to already know (from documentation, hardcoded) that a pending order can be cancelled and what URL does it.',
        after: "The response itself says what's possible next — a client can render a Cancel button purely from the presence of that link.",
      },
    }),
    code: [{ lang: 'http', snippet: `{\n  "id": 42,\n  "status": "pending",\n  "links": {\n    "self": "/orders/42",\n    "cancel": "/orders/42/cancel"\n  }\n}` }],
    realWorld:
      "PayPal's and Stripe's APIs return actionable links on many resources — a subscription response includes the exact URL to cancel it, no separate lookup needed.",
    pitfall:
      'Full HATEOAS with every possible transition linked is a lot of server-side bookkeeping for a benefit most API consumers never actually use — they hardcode URLs from the docs anyway.',
    fix:
      'Add links selectively for state-dependent actions where "what can I do next" genuinely varies (like a workflow status), rather than hypermedia-linking every response uniformly.',
  },
  {
    id: 'authentication',
    section: 'api',
    title: 'Authentication',
    blurb: "Proving who's calling — an API key, OAuth token, or JWT attached to every request — before authorization is even considered.",
    tag: 'Security',
    Component: demo({
      command: 'require a credential',
      before: [{ label: 'GET /account', sub: 'no credentials', color: 'var(--bad)' }],
      after: [{ label: 'GET /account', sub: 'Authorization: Bearer <token>', color: 'var(--good)' }],
      note: {
        before: 'Anyone can call this endpoint — there is no way to know who is asking.',
        after: 'The bearer token identifies the caller before any business logic runs.',
      },
    }),
    code: [{ lang: 'http', snippet: `GET /account\nAuthorization: Bearer eyJhbGciOi...` }],
    realWorld:
      "OAuth 2.0 bearer tokens (GitHub, Google APIs) and simple API keys (Stripe's sk_live_... keys) are the two dominant patterns — pick based on whether a human ever logs in through this API or only machines call it.",
    pitfall:
      'Passing credentials as a URL query parameter (?api_key=...) leaks them into server logs, browser history, and Referer headers — anywhere the URL itself gets recorded.',
    fix:
      'Always send credentials in a header (Authorization: Bearer ... or a custom header), never as a query parameter, so they never end up logged alongside the URL.',
  },
  {
    id: 'authorization',
    section: 'api',
    title: 'Authorization & Scopes',
    blurb: 'Being authenticated only proves identity — authorization decides what that identity is actually allowed to do.',
    tag: 'Security',
    Component: demo({
      command: 'check the scope',
      before: [{ label: 'valid token → full access', color: 'var(--bad)' }],
      after: [{ label: 'token scope: orders:read', sub: 'DELETE /orders/1 → 403', color: 'var(--good)' }],
      note: {
        before: 'Any authenticated request succeeds, regardless of what that specific token was actually issued for.',
        after: "The token's scope is checked per-endpoint — a read-only token gets a 403 on a delete, even though it's a perfectly valid, authenticated token.",
      },
    }),
    code: [{ lang: 'http', snippet: `DELETE /orders/1\nAuthorization: Bearer <token with scope: orders:read>\n\n→ 403 Forbidden { "error": { "code": "insufficient_scope" } }` }],
    realWorld:
      'OAuth scopes (repo, read:user on GitHub) let a user grant a third-party app narrow access — read my profile — without handing over full account control.',
    pitfall:
      "Conflating authentication with authorization — checking only \"is this token valid\" and skipping \"is this token allowed to do this\" — is how a read-only integration ends up able to delete data.",
    fix:
      'Check scope/permission on every mutating endpoint explicitly, as a separate step after authentication succeeds, not as an assumed side effect of having a valid token.',
  },
  {
    id: 'api-rate-limiting',
    section: 'api',
    title: 'Rate Limiting',
    blurb: 'Capping how many requests a client can make in a window protects the service from being overwhelmed, accidentally or otherwise.',
    tag: 'Security',
    Component: demo({
      command: 'throttle the client',
      before: [{ label: '1,000 req/sec from one client', color: 'var(--bad)' }],
      after: [{ label: '429 Too Many Requests', sub: 'Retry-After: 30', color: 'var(--good)' }],
      note: {
        before: "One misbehaving script (or a genuine traffic spike) can degrade the service for every other client, with nothing pushing back.",
        after: "The offending client gets a clear signal — back off, try again in 30 seconds — instead of silently degrading everyone else's experience.",
      },
    }),
    code: [{ lang: 'http', snippet: `429 Too Many Requests\nRetry-After: 30\nX-RateLimit-Remaining: 0\nX-RateLimit-Reset: 1735689600` }],
    realWorld:
      "GitHub's and Twitter's APIs both return X-RateLimit-Remaining headers on every response so well-behaved clients can self-throttle before ever hitting 429.",
    pitfall:
      'A 429 with no Retry-After header (or no rate-limit headers at all) forces clients to guess a backoff interval, which usually means an underpowered fixed guess that either retries too eagerly or too slowly.',
    fix:
      'Always include Retry-After on a 429, and expose X-RateLimit-Remaining/-Reset on successful responses so clients can pace themselves proactively.',
  },
  {
    id: 'cors',
    section: 'api',
    title: 'CORS',
    blurb: 'Cross-Origin Resource Sharing headers tell browsers which other origins are allowed to call this API from client-side JavaScript.',
    tag: 'Security',
    Component: demo({
      command: 'allow the origin',
      before: [{ label: 'fetch from app.example.com', sub: 'blocked by browser', color: 'var(--bad)' }],
      after: [{ label: 'Access-Control-Allow-Origin: app.example.com', sub: 'request succeeds', color: 'var(--good)' }],
      note: {
        before: 'The browser itself blocks the response before JavaScript ever sees it — the API never even rejected the request, the browser did.',
        after: 'The server explicitly allows this origin, so the browser lets the response through to the calling script.',
      },
    }),
    code: [{ lang: 'http', snippet: `Access-Control-Allow-Origin: https://app.example.com\nAccess-Control-Allow-Credentials: true` }],
    realWorld:
      'Any API called directly from browser JavaScript on a different domain (a SPA calling api.example.com) needs CORS headers configured, or every request fails silently in devtools.',
    pitfall:
      "`Access-Control-Allow-Origin: *` (wildcard) alongside credentialed requests (cookies, Authorization headers) is both invalid per spec and a real security hole if browsers were to allow it — it defeats the entire origin-restriction point.",
    fix:
      'Explicitly allow-list specific origins rather than wildcarding, especially for any endpoint that reads cookies or authenticated headers.',
  },
  {
    id: 'api-caching',
    section: 'api',
    title: 'Caching (ETags & Cache-Control)',
    blurb: 'Letting clients and proxies skip re-fetching unchanged data — via freshness (Cache-Control) or validation (ETag) — saves real bandwidth and latency.',
    tag: 'Performance & Scale',
    Component: demo({
      command: 'add cache headers',
      before: [{ label: 'GET /products/1', sub: 'every request hits the DB', color: 'var(--bad)' }],
      after: [{ label: 'GET /products/1', sub: 'If-None-Match: "v3" → 304 Not Modified', color: 'var(--good)' }],
      note: {
        before: 'Every single request re-fetches and re-serializes the full resource, even when nothing has changed since the last call.',
        after: "The client already has version v3 cached — the server confirms it's still current with an empty 304, skipping the full response body.",
      },
    }),
    code: [{ lang: 'http', snippet: `GET /products/1\nIf-None-Match: "v3"\n\n→ 304 Not Modified   # no body sent` }],
    realWorld:
      "CDNs and browsers both honor Cache-Control and ETag automatically — a well-cached API endpoint can serve most traffic from an edge cache without hitting the origin server at all.",
    pitfall:
      "Caching a response that's actually personalized per-user (without Vary: Authorization or marking it private) can leak one user's data to a shared cache serving a different user.",
    fix:
      'Mark personalized responses `Cache-Control: private` (or no-store) and set `Vary` correctly, reserving public/shared caching for genuinely identical-for-everyone responses.',
  },
  {
    id: 'compression',
    section: 'api',
    title: 'Response Compression',
    blurb: 'Compressing response bodies (gzip/brotli) trades a little CPU time for a lot less data over the wire.',
    tag: 'Performance & Scale',
    Component: demo({
      command: 'compress the body',
      before: [{ label: '200 OK — 2.4 MB JSON', color: 'var(--bad)' }],
      after: [{ label: '200 OK', sub: 'Content-Encoding: gzip — 340 KB', color: 'var(--good)' }],
      note: {
        before: 'The full, uncompressed payload goes out on every request — slow especially on mobile or high-latency connections.',
        after: "The same data, compressed — the client's Accept-Encoding header requested it, and decompression is transparent on their end.",
      },
    }),
    code: [{ lang: 'http', snippet: `GET /reports/monthly\nAccept-Encoding: gzip\n\n200 OK\nContent-Encoding: gzip` }],
    realWorld:
      "Virtually every production API and CDN enables gzip/brotli by default — it's one of the highest bandwidth-savings-to-effort ratios available, usually a single reverse-proxy config line.",
    pitfall:
      'Compressing tiny responses (a few bytes) wastes more CPU on compression overhead than it saves in transfer, and can occasionally make the payload larger.',
    fix:
      'Set a minimum size threshold (most reverse proxies default around 1KB) below which responses are sent uncompressed.',
  },
  {
    id: 'bulk-operations',
    section: 'api',
    title: 'Bulk / Batch Operations',
    blurb: 'A dedicated batch endpoint processes many items in one round trip instead of forcing N individual requests.',
    tag: 'Performance & Scale',
    Component: demo({
      command: 'batch the requests',
      before: [{ label: '100 × POST /items', sub: '100 round trips', color: 'var(--bad)' }],
      after: [{ label: 'POST /items/batch [100 items]', sub: '1 round trip', color: 'var(--good)' }],
      note: {
        before: 'Creating 100 items means 100 separate HTTP round trips — each with its own latency, auth check, and connection overhead.',
        after: 'One request carries all 100 — the server processes them together and returns per-item results in a single response.',
      },
    }),
    code: [{ lang: 'http', snippet: `POST /items/batch\n{ "items": [ {...}, {...}, ... 100 items ] }\n\n200 OK\n{ "results": [ {"status": "ok"}, {"status": "error", ...}, ... ] }` }],
    realWorld:
      "Bulk endpoints in Elasticsearch's _bulk API and Stripe's batch operations exist specifically for high-volume clients where per-request overhead would otherwise dominate.",
    pitfall:
      "A batch endpoint that fails the entire batch on one bad item (rather than reporting per-item success/failure) forces the client to retry everything, including the 99 items that actually succeeded.",
    fix:
      'Return a per-item result array (success or specific error, indexed to the input) so the client can retry only the items that actually failed.',
  },
  {
    id: 'long-running-operations',
    section: 'api',
    title: 'Long-Running Operations',
    blurb: 'An operation that takes real time returns immediately with a status you can poll, instead of holding the connection open.',
    tag: 'Performance & Scale',
    Component: demo({
      command: 'accept and poll',
      before: [{ label: 'POST /reports', sub: 'client waits 90s', color: 'var(--bad)' }],
      after: [{ label: '202 Accepted', sub: 'Location: /reports/status/abc', color: 'var(--good)' }],
      note: {
        before: "The client's connection sits open for 90 seconds — a slow proxy, a mobile network hiccup, or a client timeout can kill the request before it finishes.",
        after: "The server accepts the job immediately and hands back a URL to poll — the actual work happens asynchronously, decoupled from any one connection's lifetime.",
      },
    }),
    code: [{ lang: 'http', snippet: `POST /reports\n\n202 Accepted\nLocation: /reports/status/abc\n\nGET /reports/status/abc\n{ "status": "processing" }  # then later: "done"` }],
    realWorld:
      "Video transcoding, large report generation, and async batch jobs (AWS APIs, Stripe payouts) all use 202 Accepted plus a status-polling endpoint rather than blocking the original request.",
    pitfall:
      "Making the client poll on a tight fixed interval (every 500ms) for a job that takes minutes wastes requests and can trip the API's own rate limiter.",
    fix:
      'Return a suggested poll interval (or use exponential backoff client-side), or upgrade to a webhook/websocket notification for operations with unpredictable duration.',
  },
  {
    id: 'webhooks',
    section: 'api',
    title: 'Webhooks',
    blurb: 'The API pushes an event to a client-provided URL when something happens, instead of the client polling for changes.',
    tag: 'Performance & Scale',
    Component: demo({
      command: 'push instead of poll',
      before: [{ label: 'client polls GET /orders/1 every 5s', color: 'var(--bad)' }],
      after: [{ label: 'server POSTs to client callback URL', sub: 'the moment order.status changes', color: 'var(--good)' }],
      note: {
        before: "The client burns requests checking for a change that, most of the time, hasn't happened yet.",
        after: 'The moment the event actually occurs, the server notifies the client directly — zero wasted requests, near-instant delivery.',
      },
    }),
    code: [{ lang: 'http', snippet: `POST https://client.example.com/webhooks/orders\nX-Signature: hmac-sha256=...\n\n{ "event": "order.completed", "order_id": 42 }` }],
    realWorld:
      "Stripe's payment events, GitHub's repository events, and Slack's app events are all delivered via webhooks — polling those APIs for changes would be both slower and rate-limited into uselessness.",
    pitfall:
      'An unauthenticated webhook endpoint lets anyone who guesses (or finds) the URL send fake events — a fake "payment succeeded" webhook is a real fraud vector if not verified.',
    fix:
      'Sign every webhook payload (an HMAC signature header, verified with a shared secret) so the receiver can confirm the event genuinely came from the API, not an attacker.',
  },
  {
    id: 'versioning',
    section: 'api',
    title: 'API Versioning',
    blurb: 'A version marker (in the URL or a header) lets breaking changes ship without instantly breaking every existing client.',
    tag: 'Evolution',
    Component: demo({
      command: 'version the endpoint',
      before: [{ label: 'PUT /users/1 changes shape', sub: 'every client breaks at once', color: 'var(--bad)' }],
      after: [
        { label: '/v1/users/1', sub: 'old clients', color: 'var(--text-dim)' },
        { label: '/v2/users/1', sub: 'new shape', color: 'var(--good)' },
      ],
      note: {
        before: 'Changing the response shape in place breaks every client still expecting the old one, all at the same instant the change deploys.',
        after: 'v1 keeps working exactly as before while v2 ships the new shape — clients migrate on their own schedule.',
      },
    }),
    code: [{ lang: 'http', snippet: `GET /v1/users/1   # unchanged, old shape\nGET /v2/users/1   # new shape\n\n# or header-based:\nGET /users/1\nAccept: application/vnd.api+json;version=2` }],
    realWorld:
      "Stripe pins each API key to a specific API version at the account level; GitHub uses Accept header versioning — both let a breaking change ship without an instant flag day.",
    pitfall:
      'Versioning too eagerly (a new major version for every small change) fragments the API into many barely-different versions that are all a maintenance burden to support simultaneously.',
    fix:
      'Reserve a new version for genuinely breaking changes only — ship additive, backward-compatible changes into the existing version instead.',
  },
  {
    id: 'backward-compatibility',
    section: 'api',
    title: 'Backward-Compatible Changes',
    blurb: 'Adding new optional fields is safe; renaming, removing, or repurposing existing ones breaks every client that depends on them.',
    tag: 'Evolution',
    Component: demo({
      command: 'add, never remove',
      before: [{ label: 'rename "name" → "fullName"', color: 'var(--bad)' }],
      after: [{ label: 'add "fullName", keep "name"', color: 'var(--good)' }],
      note: {
        before: 'Any client reading `response.name` gets undefined the instant this ships — a rename is a breaking change dressed up as a small edit.',
        after: "Old clients keep reading `name` unaffected; new clients can adopt `fullName` whenever they're ready.",
      },
    }),
    code: [{ lang: 'http', snippet: `# Bad — breaking\n{ "fullName": "Ada Lovelace" }   // "name" is just gone\n\n# Good — additive\n{ "name": "Ada Lovelace", "fullName": "Ada Lovelace" }` }],
    realWorld:
      "Postel's Law (\"be liberal in what you accept, conservative in what you send\") is the whole philosophy behind additive API evolution — most stable public APIs (Stripe, Twilio) have never removed a field, only added new ones.",
    pitfall:
      '"Just a small rename" is the most common breaking change that ships by accident — it looks harmless in a diff but silently breaks every client parsing the old field name.',
    fix:
      'Treat field removal/rename as a breaking change requiring a new API version — add the new field alongside the old one and deprecate the old one on its own timeline.',
  },
  {
    id: 'deprecation',
    section: 'api',
    title: 'Deprecation',
    blurb: 'Marking an endpoint or field as deprecated — with a Sunset header and a timeline — gives clients advance warning before it disappears.',
    tag: 'Evolution',
    Component: demo({
      command: 'announce the sunset',
      before: [{ label: '/v1/users removed with no warning', color: 'var(--bad)' }],
      after: [{ label: '/v1/users', sub: 'Deprecation: true, Sunset: 2027-01-01', color: 'var(--good)' }],
      note: {
        before: 'The endpoint just vanishes one day — every client still calling it starts getting hard failures with no warning.',
        after: 'Every response carries the deprecation notice and exact sunset date — clients (and monitoring) can see it coming well in advance.',
      },
    }),
    code: [{ lang: 'http', snippet: `GET /v1/users/1\n\n200 OK\nDeprecation: true\nSunset: Fri, 1 Jan 2027 00:00:00 GMT\nLink: <https://docs.example.com/migrate-v2>; rel="deprecation"` }],
    realWorld:
      "The Deprecation and Sunset HTTP headers (RFC 8594) let Google, GitHub, and other large API providers announce an endpoint's retirement date directly in every response, machine-readable.",
    pitfall:
      'Announcing deprecation only in a changelog or email that most integrators never read means the "advance warning" never actually reaches the people who need it.',
    fix:
      'Put the deprecation notice in the response headers themselves (Deprecation, Sunset, Link to migration docs) so it surfaces directly in the traffic clients already generate.',
  },
]
