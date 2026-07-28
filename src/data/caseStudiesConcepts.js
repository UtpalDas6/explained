import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /cases section — 14 classic system design interview case
// studies, grouped Feeds & Social / Real-Time & Location / Media Streaming /
// Commerce & Booking / Storage & Sync / Search & Discovery. Reuses the same
// StateDemo component every other section uses, framed as naive-first-pass
// design vs. the production-scale design and the specific technique that
// gets you from one to the other.
const demo = (props) => () => createElement(StateDemo, props)

export const caseStudiesConcepts = [
  {
    id: 'twitter-x',
    section: 'cases',
    title: 'Design Twitter / X',
    blurb: 'A feed of short posts from people you follow — the classic fan-out problem: push new posts to followers at write time, or pull them at read time?',
    tag: 'Feeds & Social',
    Component: demo({
      command: 'scale the fan-out',
      before: [{ label: '1 server, 1 DB', sub: 'SELECT posts WHERE author IN (following) ORDER BY time — computed on every read', color: 'var(--bad)' }],
      after: [{ label: 'fan-out-on-write to a precomputed timeline cache', sub: '+ fan-out-on-read for celebrities with millions of followers', color: 'var(--good)' }],
      note: {
        before: 'Every time you open the app, the server joins your following list against the posts table and sorts — fine for a few users, collapses under real load.',
        after: "New posts are pushed into every follower's precomputed timeline the instant they're posted — reads become a fast cache lookup. Accounts with millions of followers fall back to pull instead, since pushing one post to 100M timelines would be its own bottleneck.",
      },
    }),
    code: [{ lang: 'text', snippet: `Post:       { id, author_id, text, media_url, created_at }\nTimeline:   { user_id, post_id, ranked_score }  # precomputed, one row per (user, post) — this is the fan-out\nFollow:     { follower_id, followee_id }\n\n# fan-out-on-write (most users):\non new_post(post):\n  for follower in followers_of(post.author_id):\n    timeline.insert(follower.id, post.id)\n\n# fan-out-on-read (celebrity accounts, millions of followers):\non read_timeline(user):\n  merge(cached_timeline, live_query(celebrities_user_follows))` }],
    realWorld:
      "Twitter's own engineering blog documents exactly this hybrid fan-out strategy — pure push doesn't scale to celebrity accounts, pure pull doesn't scale to read volume, so production systems use both.",
    pitfall:
      'Pure fan-out-on-write for every account means a single post from an account with 50M followers triggers 50M timeline writes — a write storm that can take minutes and overwhelm the timeline store.',
    fix:
      "Use a follower-count threshold to switch strategies per account — fan-out-on-write below it, fan-out-on-read (merged at query time) above it, exactly like Twitter's hybrid model.",
  },
  {
    id: 'instagram',
    section: 'cases',
    title: 'Design Instagram',
    blurb: 'Photo/video sharing with a following-based feed and ephemeral Stories — object storage for media, a ranked feed, and a separate high-write, short-TTL path for Stories.',
    tag: 'Feeds & Social',
    Component: demo({
      command: 'separate the hot path',
      before: [{ label: 'photos + stories in the same table, same feed query', sub: '24h-TTL stories bloat the same index as permanent posts', color: 'var(--bad)' }],
      after: [{ label: 'posts: durable feed store', sub: 'stories: separate, short-TTL, high-write store — expired automatically', color: 'var(--good)' }],
      note: {
        before: "Stories are far higher write volume but expire in 24 hours — mixing them with permanent posts in one table means the feed index is constantly churning with data nobody keeps.",
        after: 'Stories live in their own store with a TTL that expires them automatically — the permanent feed store stays lean, and the ephemeral store is tuned for its very different write/read pattern.',
      },
    }),
    code: [{ lang: 'text', snippet: `Post:   { id, user_id, media_url (S3), caption, created_at }\nStory:  { id, user_id, media_url (S3), created_at, expires_at }  # TTL-indexed, auto-deleted\n\nFeedEntry:  { user_id, post_id, rank_score }  # precomputed, similar to Twitter's fan-out\n# media itself: uploaded directly to S3, CDN in front of it for reads — app servers never touch image bytes` }],
    realWorld:
      "Instagram's engineering blog has described exactly this split — Stories' write pattern (huge burst, 24h TTL) is different enough from the permanent feed that treating them as one system creates real operational pain.",
    pitfall:
      'Serving media (photos/videos) directly from application servers instead of a CDN means every image request competes with actual application logic for the same server capacity.',
    fix:
      'Upload media straight to object storage (S3) from the client via a pre-signed URL, and serve all reads through a CDN — application servers should never be in the hot path for media bytes.',
  },
  {
    id: 'google-keep',
    section: 'cases',
    title: 'Design Google Keep',
    blurb: 'A notes app that syncs across devices and works offline — the core challenge is merging edits made while offline without losing data, using the same ideas as CRDTs.',
    tag: 'Feeds & Social',
    Component: demo({
      command: 'handle the offline conflict',
      before: [{ label: 'last-write-wins by timestamp', sub: 'an offline edit is silently overwritten by an earlier online edit synced later', color: 'var(--bad)' }],
      after: [{ label: 'per-field CRDT merge (or op-based sync log)', sub: 'both edits preserved and merged — no data silently lost', color: 'var(--good)' }],
      note: {
        before: 'A note edited offline on a phone, then synced after an online edit from a laptop already landed, can get silently clobbered by naive timestamp comparison.',
        after: "Each field (or the whole note, structured as a CRDT) merges edits from both devices deterministically — a title change and a body change from two different offline sessions both survive.",
      },
    }),
    code: [{ lang: 'text', snippet: `Note: { id, owner_id, title, body, checklist_items: [...], version_vector: {device_a: 3, device_b: 1} }\n\non sync(local_note, remote_note):\n  if version_vector_concurrent(local_note, remote_note):\n    merged = merge_fields(local_note, remote_note)  # CRDT-style per-field merge\n  else:\n    merged = newer(local_note, remote_note)  # one strictly happened-after the other` }],
    realWorld:
      'Google Keep, Notion, and most offline-first note apps deal with exactly this — a device can be offline for days and still needs to merge back in without silently losing anything the user wrote.',
    pitfall:
      'Storing only the latest note snapshot (no edit history or version vector) makes it structurally impossible to detect whether two versions conflict or one simply supersedes the other.',
    fix:
      "Track a version vector (or operation log) per note so sync can distinguish \"strictly newer\" from \"concurrent, conflicting edits that both need to be kept\" — see the Distributed Systems section's Vector Clocks and CRDTs.",
  },
  {
    id: 'whatsapp',
    section: 'cases',
    title: 'Design WhatsApp',
    blurb: 'Real-time, end-to-end encrypted messaging at massive scale — the hard parts are message delivery guarantees and presence, not the chat UI.',
    tag: 'Real-Time & Location',
    Component: demo({
      command: 'guarantee delivery',
      before: [{ label: 'POST /send-message, fire and forget', sub: 'recipient offline → message silently lost', color: 'var(--bad)' }],
      after: [{ label: 'persistent WebSocket + message queue per user', sub: 'queued messages delivered the moment the recipient reconnects', color: 'var(--good)' }],
      note: {
        before: 'A plain HTTP request has no concept of "try again later" — if the recipient is offline at that exact moment, the message just never arrives.',
        after: 'Each user has a durable queue; a connected client gets messages pushed in real time, and a disconnected one picks up its queued messages the moment it reconnects.',
      },
    }),
    code: [{ lang: 'text', snippet: `Message: { id, sender_id, recipient_id, ciphertext, sent_at, delivered_at, read_at }\n\non send(message):\n  persist(message)  # durable, survives a server crash\n  if recipient.isOnline(): push_via_websocket(message)\n  else: queue_for_delivery(message)  # delivered on next connect\n\non recipient_reconnects():\n  deliver_all(queued_messages_for(recipient))` }],
    realWorld:
      'WhatsApp famously runs on a relatively small number of Erlang servers per user served, precisely because a lightweight, persistent-connection, queue-backed architecture like this scales extremely efficiently.',
    pitfall:
      'Storing message content in plaintext on the server (even temporarily, for delivery) is a real trust and compliance liability — a server breach exposes every message ever routed through it.',
    fix:
      'Use end-to-end encryption (like the Signal Protocol) so the server only ever handles ciphertext — it can route and queue messages without ever being able to read their content.',
  },
  {
    id: 'uber',
    section: 'cases',
    title: 'Design Uber',
    blurb: 'Matching riders to nearby drivers in real time — the core challenge is efficient geospatial queries at a scale where a naive distance scan is far too slow.',
    tag: 'Real-Time & Location',
    Component: demo({
      command: 'index by location',
      before: [{ label: 'scan every driver, compute distance to each', sub: 'O(n) per request — too slow with 100,000+ active drivers', color: 'var(--bad)' }],
      after: [{ label: 'geohash / quadtree index: query only nearby cells', sub: 'O(log n) — checks a small, relevant subset of drivers', color: 'var(--good)' }],
      note: {
        before: 'Computing the distance from the rider to literally every active driver is correct, but the cost grows linearly with driver count.',
        after: "A spatial index only has to check drivers in nearby cells — the search space shrinks from \"every driver in the city\" to \"drivers within a few blocks\".",
      },
    }),
    code: [{ lang: 'text', snippet: `DriverLocation: { driver_id, geohash, lat, lng, updated_at }  # updated every few seconds\n\non find_nearby_drivers(rider_location):\n  cell = geohash(rider_location, precision=6)  # ~1.2km x 0.6km cell\n  candidates = query_drivers_in_cells(neighboring_cells(cell))\n  return sort_by_actual_distance(candidates)[:5]` }],
    realWorld:
      "Uber's own engineering blog describes their H3 hexagonal grid system for exactly this — geospatial indexing turns \"find nearby drivers\" from an expensive full scan into a fast, targeted lookup.",
    pitfall:
      "Driver locations change constantly — an index that's expensive to update on every location ping becomes a bottleneck of its own if update cost isn't kept cheap.",
    fix:
      'Use a spatial index structure specifically designed for frequent updates (geohash buckets are cheap to update) rather than one optimized purely for query speed at the cost of update cost.',
  },
  {
    id: 'notification-system',
    section: 'cases',
    title: 'Design a Notification System',
    blurb: 'Delivering push notifications, emails, and SMS to millions of users reliably — the challenge is fanning out one trigger to many channels without one slow channel blocking the others.',
    tag: 'Real-Time & Location',
    Component: demo({
      command: 'decouple channels from the trigger',
      before: [{ label: 'trigger calls sendPush(), sendEmail(), sendSms() in sequence', sub: 'one slow/down channel blocks the whole notification', color: 'var(--bad)' }],
      after: [{ label: 'trigger publishes one event → separate queue + worker per channel', sub: 'an SMS outage only delays SMS, push and email still deliver instantly', color: 'var(--good)' }],
      note: {
        before: 'Calling each delivery channel synchronously in sequence means a slow or failing channel delays or blocks every channel after it.',
        after: "Publishing one event and letting independent workers per channel consume it fully decouples each channel's reliability — the Event-Driven Systems section's fan-out pattern.",
      },
    }),
    code: [{ lang: 'text', snippet: `on trigger_notification(user_id, event_type, payload):\n  event_bus.publish("NotificationTriggered", { user_id, event_type, payload })\n\n# each channel is an independent consumer — one being slow/down doesn't affect the others\npush_worker:  on NotificationTriggered -> send_push(user.device_tokens, payload)\nemail_worker: on NotificationTriggered -> send_email(user.email, render_template(payload))\nsms_worker:   on NotificationTriggered -> send_sms(user.phone, payload) if user.sms_enabled` }],
    realWorld:
      "Every large-scale product with push, email digests, and SMS 2FA uses this decoupled fan-out — the same pattern documented in the Event-Driven Systems section, applied to multi-channel delivery.",
    pitfall:
      "Sending every notification at full volume with no user preference or rate limiting produces notification fatigue — users disable notifications entirely, defeating the feature's purpose.",
    fix:
      'Respect per-user notification preferences and frequency caps (batch or digest low-priority notifications) — deliverability infrastructure and "should we even send this" are separate concerns, both necessary.',
  },
  {
    id: 'youtube',
    section: 'cases',
    title: 'Design YouTube',
    blurb: 'Video upload, transcoding into multiple resolutions, and streaming to billions of viewers — the core challenge is transcoding throughput and CDN delivery, not the upload itself.',
    tag: 'Media Streaming',
    Component: demo({
      command: 'transcode asynchronously',
      before: [{ label: 'upload blocks until transcoding to all resolutions finishes', sub: 'user waits minutes staring at a spinner', color: 'var(--bad)' }],
      after: [{ label: 'upload returns immediately, transcoding runs as an async job', sub: 'video goes live per-resolution as each finishes', color: 'var(--good)' }],
      note: {
        before: 'Transcoding a video into 5 resolutions takes real time — making the uploader wait for all of it synchronously is a terrible experience.',
        after: 'The upload just stores the raw file and returns success — a background pipeline transcodes each resolution independently, watchable as soon as the first is ready.',
      },
    }),
    code: [{ lang: 'text', snippet: `on upload(video_file):\n  raw_url = store_in_object_storage(video_file)\n  video = create(status="processing", raw_url=raw_url)\n  enqueue_transcode_job(video.id)  # returns immediately, doesn't block the upload\n\non transcode_job(video_id):\n  for resolution in [1080p, 720p, 480p, 360p]:\n    transcoded = transcode(video.raw_url, resolution)\n    store_and_publish(transcoded)  # each resolution goes live independently as it finishes` }],
    realWorld:
      'Every major video platform uses exactly this async transcode pipeline pattern — upload succeeds instantly, and a fleet of transcoding workers processes the heavy lifting in the background.',
    pitfall:
      'Serving video directly from origin storage (not a CDN) means every playback request — potentially millions concurrently for a viral video — hits the same origin servers.',
    fix:
      'Push transcoded video segments to a CDN and serve all playback from edge nodes — origin storage should only ever be hit once per region, not once per viewer.',
  },
  {
    id: 'netflix',
    section: 'cases',
    title: 'Design Netflix',
    blurb: 'Video streaming plus personalized recommendations — distinct from YouTube in that content is curated/licensed (not user-uploaded) and personalization is a first-class part of the product.',
    tag: 'Media Streaming',
    Component: demo({
      command: 'personalize the ranking',
      before: [{ label: 'same homepage row order for every user', sub: 'no personalization — a one-size-fits-all catalog', color: 'var(--bad)' }],
      after: [{ label: 'per-user ranking model scores every row/title', sub: 'homepage assembled from precomputed personalized rankings', color: 'var(--good)' }],
      note: {
        before: 'Every user seeing the identical homepage wastes the single biggest lever a streaming service has for engagement.',
        after: 'A recommendation model scores content per user, and the homepage is assembled from those personalized rankings — computed in advance, not live on every page load.',
      },
    }),
    code: [{ lang: 'text', snippet: `WatchHistory: { user_id, title_id, watched_pct, watched_at }\nRecommendationScore: { user_id, title_id, score }  # precomputed offline, refreshed periodically\n\non load_homepage(user):\n  rows = ["Continue Watching", "Because you watched X", "Trending", ...]\n  for row in rows:\n    row.titles = top_scored_titles(user, row.category)  # from precomputed RecommendationScore` }],
    realWorld:
      'Netflix has published extensively on their recommendation architecture — the homepage is assembled from dozens of independently-ranked rows, each backed by its own model.',
    pitfall:
      "Computing recommendations live, synchronously, on every homepage load doesn't scale — the model inference cost for millions of concurrent users at that latency budget is prohibitive.",
    fix:
      "Precompute recommendation scores in a batch/streaming pipeline that refreshes periodically, and serve the homepage from that cache — the same pattern as Twitter's fan-out-on-write.",
  },
  {
    id: 'ticketmaster',
    section: 'cases',
    title: 'Design Ticketmaster',
    blurb: 'Selling a fixed number of seats to a huge simultaneous audience — the defining challenge is preventing the same seat from being sold twice under extreme concurrent demand.',
    tag: 'Commerce & Booking',
    Component: demo({
      command: 'prevent double-booking',
      before: [{ label: 'check seat availability, then book it (2 separate steps)', sub: 'race condition: 2 users both pass the check before either books', color: 'var(--bad)' }],
      after: [{ label: "atomic reserve: UPDATE seats SET status='held' WHERE id=? AND status='available'", sub: 'only one of two concurrent requests actually updates a row', color: 'var(--good)' }],
      note: {
        before: 'Checking availability and then booking as two separate operations leaves a window where two users can both see "available" before either has actually claimed it.',
        after: "A single atomic conditional update means exactly one of two simultaneous requests wins — the database's own row-level locking resolves the race.",
      },
    }),
    code: [{ lang: 'text', snippet: `-- Atomic compare-and-swap: only ONE concurrent request can win this\nUPDATE seats SET status = 'held', held_by = ?, held_until = now() + interval '10 min'\nWHERE id = ? AND status = 'available';\n-- if 0 rows affected: someone else got there first, seat is gone\n\n-- separately: a background job releases 'held' seats whose hold expired\n-- without the user completing checkout in time` }],
    realWorld:
      "Real ticket-sale systems (and e-commerce flash sales generally) rely on exactly this atomic conditional write pattern — the same optimistic-locking idea from the Databases section, applied to seat inventory.",
    pitfall:
      'A seat "held" during checkout but never released if the user abandons the page permanently locks that seat out of inventory unless something actively cleans it up.',
    fix:
      'Attach a short expiration to every hold and run a background sweep that releases expired holds back to available — never rely on the client to explicitly release what it reserved.',
  },
  {
    id: 'payment-system',
    section: 'cases',
    title: 'Design a Payment System',
    blurb: 'Processing a charge exactly once, even under network retries — the design revolves around idempotency and an accurate, auditable ledger, not around card-processing logic itself.',
    tag: 'Commerce & Booking',
    Component: demo({
      command: 'guarantee exactly-once with a ledger',
      before: [{ label: 'POST /charge, retried on timeout', sub: 'customer charged twice — no way to tell a retry from a new charge', color: 'var(--bad)' }],
      after: [{ label: 'POST /charge with Idempotency-Key + append-only ledger', sub: 'retry returns the original result; ledger gives a full auditable history', color: 'var(--good)' }],
      note: {
        before: 'A network timeout after the charge actually succeeded leads the client to retry — with no idempotency key, that retry is indistinguishable from a brand-new charge.',
        after: 'An idempotency key lets a retry return the exact original result, and every state change is recorded as an immutable ledger entry.',
      },
    }),
    code: [{ lang: 'text', snippet: `LedgerEntry: { id, account_id, amount, type (charge/refund/payout), idempotency_key, created_at }\n# append-only — never updated or deleted, only ever added to\n\non charge(amount, idempotency_key):\n  existing = ledger.find_by_idempotency_key(idempotency_key)\n  if existing: return existing.result  # safe retry, no duplicate charge\n\n  result = payment_processor.charge(amount)  # delegate actual card processing\n  ledger.append({ amount, type: "charge", idempotency_key, result })\n  return result` }],
    realWorld:
      "Stripe's own API design centers on exactly this — idempotency keys on every mutating request, and an append-only ledger as the single source of truth for account balances.",
    pitfall:
      'Storing account balance as a single mutable number (instead of deriving it from the ledger) makes it possible for a bug to silently corrupt the balance with no way to know what it should have been.',
    fix:
      "Derive balance by summing ledger entries rather than treating a mutable balance column as the source of truth — this is the Event Sourcing pattern from the Event-Driven Systems section, applied to money.",
  },
  {
    id: 'dropbox',
    section: 'cases',
    title: 'Design Dropbox',
    blurb: 'Syncing files across devices efficiently — the core trick is chunking files and only transferring the blocks that actually changed, instead of re-uploading the whole file.',
    tag: 'Storage & Sync',
    Component: demo({
      command: 'sync only the changed blocks',
      before: [{ label: 'edit 1 line in a 2GB video file', sub: 'entire 2GB file re-uploaded to sync the change', color: 'var(--bad)' }],
      after: [{ label: 'file split into 4MB blocks, hashed', sub: 'only the ~1 changed block is re-uploaded', color: 'var(--good)' }],
      note: {
        before: 'Re-uploading an entire large file for a tiny edit wastes enormous bandwidth and makes sync painfully slow.',
        after: "Splitting the file into blocks and hashing each one means only the blocks whose hash actually changed need to be re-uploaded — one 4MB block, not the whole 2GB file.",
      },
    }),
    code: [{ lang: 'text', snippet: `FileBlock: { hash (SHA-256), data, ref_count }  # content-addressed, deduplicated across ALL users' files\nFileVersion: { file_id, version, block_hashes: [h1, h2, h3, ...] }  # ordered list of block references\n\non sync(local_file):\n  local_blocks = chunk_and_hash(local_file)\n  changed = local_blocks - remote_blocks_already_uploaded\n  upload(changed)  # only the blocks that actually differ\n  update_file_version(file_id, local_blocks)` }],
    realWorld:
      "Dropbox's own engineering blog describes exactly this block-level, content-addressed sync — because blocks are hashed, two different users uploading the identical chunk only store it once.",
    pitfall:
      "Fixed-size chunking has a subtle failure mode: inserting one byte at the start of a file shifts every subsequent chunk boundary, so nearly every block hash changes even though content mostly didn't.",
    fix:
      "Use content-defined chunking (rolling hash boundaries, like rsync's algorithm) instead of fixed-size blocks, so an insertion only shifts the boundaries immediately around it.",
  },
  {
    id: 'url-shortener',
    section: 'cases',
    title: 'Design a URL Shortener',
    blurb: 'Turning a long URL into a short, unique code and redirecting on lookup — deceptively simple, with the real design questions being ID generation and redirect latency at scale.',
    tag: 'Storage & Sync',
    Component: demo({
      command: 'generate unique codes at scale',
      before: [{ label: 'single server, auto-increment counter → base62 encode', sub: "single point of failure, can't scale writes horizontally", color: 'var(--bad)' }],
      after: [{ label: 'pre-allocated ID ranges per server (or a dedicated ID service)', sub: 'each server generates unique codes independently, no per-request coordination', color: 'var(--good)' }],
      note: {
        before: 'A single auto-increment counter is a single point of failure and a write bottleneck — every request has to go through it, serialized.',
        after: "Each server is handed its own range of ids to allocate from — no cross-server coordination needed per request, similar to Twitter's Snowflake IDs.",
      },
    }),
    code: [{ lang: 'text', snippet: `UrlMapping: { short_code (base62, ~7 chars), long_url, created_at, expires_at }\n\non shorten(long_url):\n  id = next_id_from_my_preallocated_range()  # no cross-server coordination\n  short_code = base62_encode(id)\n  store(short_code, long_url)\n  return short_code\n\non redirect(short_code):\n  long_url = cache.get(short_code) ?? db.get(short_code)  # cache-first, hot path\n  return HTTP_302(long_url)` }],
    realWorld:
      "This exact ID-generation problem is why Snowflake IDs exist — see the Systems section's own Snowflake ID concept for the general-purpose version of this technique.",
    pitfall:
      "Redirects (the read path) vastly outnumber shortening requests — routing every redirect through the primary database instead of a cache wastes capacity on the system's highest-volume operation.",
    fix:
      "Cache short_code → long_url mappings aggressively (they're immutable once created) and serve nearly all redirects from cache — the database only handles cache misses and the low-volume write path.",
  },
  {
    id: 'web-crawler',
    section: 'cases',
    title: 'Design a Web Crawler',
    blurb: 'Systematically discovering and downloading web pages at scale — the hard parts are avoiding re-crawling the same URL forever and respecting per-domain politeness limits.',
    tag: 'Search & Discovery',
    Component: demo({
      command: 'dedupe and rate-limit per domain',
      before: [{ label: 'crawl every discovered URL immediately, no dedup', sub: 'same page crawled repeatedly; one domain gets hammered, gets you blocked', color: 'var(--bad)' }],
      after: [{ label: 'Bloom filter for seen URLs + per-domain rate-limited queue', sub: 'never re-crawls the same URL, spreads load politely across domains', color: 'var(--good)' }],
      note: {
        before: "Without deduplication, the crawler wastes enormous effort re-downloading pages it's already seen — and without pacing, a site can rate-limit or block it entirely.",
        after: 'A Bloom filter cheaply checks "have I seen this URL before?" without storing every URL in full, and a per-domain queue ensures no single site gets hammered.',
      },
    }),
    code: [{ lang: 'text', snippet: `seen_urls: BloomFilter  # cheap, approximate "have I crawled this?" check\n\non discover_url(url):\n  if not seen_urls.might_contain(url):\n    seen_urls.add(url)\n    domain_queue[domain_of(url)].enqueue(url)  # separate queue per domain\n\non crawl_worker():\n  for domain in active_domains:\n    if domain.can_crawl_now():  # respects per-domain rate limit + robots.txt crawl-delay\n      url = domain_queue[domain].dequeue()\n      page = fetch(url)\n      extract_and_discover_links(page)` }],
    realWorld:
      "Google's original crawler architecture (and every production crawler since) uses exactly this combination — a Bloom filter for cheap dedup at scale, and strict per-domain politeness.",
    pitfall:
      "A Bloom filter can have false positives — it can wrongly claim a URL was already seen when it wasn't, silently skipping a page the crawler should have visited.",
    fix:
      "Accept the small false-positive rate as a deliberate tradeoff (tune the filter size) — storing every URL exactly doesn't scale to the crawl sizes this technique is built for.",
  },
  {
    id: 'autocomplete',
    section: 'cases',
    title: 'Design Autocomplete / Typeahead Search',
    blurb: 'Suggesting completions as a user types — needs sub-100ms responses on every keystroke, which rules out querying a general-purpose database and calls for a purpose-built prefix index.',
    tag: 'Search & Discovery',
    Component: demo({
      command: 'index by prefix',
      before: [{ label: "SELECT * FROM queries WHERE text LIKE 'user_input%' ORDER BY frequency", sub: 'a scan gets slower as the table grows — too slow for every keystroke', color: 'var(--bad)' }],
      after: [{ label: 'trie (prefix tree) held in memory, top-k cached per node', sub: 'O(prefix length) lookup, independent of how many total queries exist', color: 'var(--good)' }],
      note: {
        before: "A LIKE 'prefix%' query is fundamentally a scan-and-filter operation whose cost scales with data size — not fast enough for a suggestion fired on every keystroke.",
        after: 'A trie walks exactly as many nodes as the prefix is long, completely independent of total dataset size — and each node caches its own top-k most frequent completions.',
      },
    }),
    code: [{ lang: 'text', snippet: `TrieNode: { children: {char: TrieNode}, top_k_completions: [(query, frequency), ...] }\n\non type(prefix):\n  node = trie.root\n  for char in prefix:\n    node = node.children[char]  # O(prefix length), not O(dataset size)\n  return node.top_k_completions  # precomputed and cached at each node\n\n# updated periodically (not on every keystroke) as query frequency data changes\non rebuild_trie():\n  for query, frequency in top_queries_by_volume():\n    trie.insert(query, frequency)` }],
    realWorld:
      "Google Search's autocomplete, and most search-bar typeahead features, use exactly this trie-based approach — lookup cost is bounded by input length, not dataset size.",
    pitfall:
      'Rebuilding the trie from scratch on every new query submission (to keep frequency counts current) is far too expensive to do synchronously and in real time at any real scale.',
    fix:
      'Rebuild (or incrementally update) the trie on a periodic batch schedule from aggregated query logs, rather than trying to keep it perfectly, synchronously up to date.',
  },
]
