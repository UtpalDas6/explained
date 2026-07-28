import { createElement } from 'react'
import SystemDiagram from '../concepts/shared/SystemDiagram.jsx'

// Registry for the /cases section — 14 classic system design interview case
// studies, grouped Feeds & Social / Real-Time & Location / Media Streaming /
// Commerce & Booking / Storage & Sync / Search & Discovery. Each renders a
// real block diagram (nodes in layers, measured SVG connectors) via
// SystemDiagram, with a "trace the request" walkthrough highlighting the
// path step by step — draw.io-style architecture, not a text comparison.
const diagram = (props) => () => createElement(SystemDiagram, props)

export const caseStudiesConcepts = [
  {
    id: 'twitter-x',
    section: 'cases',
    title: 'Design Twitter / X',
    blurb: 'A feed of short posts from people you follow — the classic fan-out problem: push new posts to followers at write time, or pull them at read time?',
    tag: 'Feeds & Social',
    Component: diagram({
      traceLabel: 'Trace a new post',
      intro: 'Click to trace a post from creation through fan-out to a follower\'s feed.',
      nodes: [
        { id: 'client', label: 'User', sub: 'posts a tweet', layer: 0 },
        { id: 'api', label: 'Tweet Service', layer: 1 },
        { id: 'db', label: 'Tweets DB', sub: 'permanent storage', layer: 2 },
        { id: 'fanout', label: 'Fan-out Worker', layer: 2 },
        { id: 'timeline', label: 'Timeline Cache', sub: 'per follower', layer: 3 },
        { id: 'follower', label: "Follower's Feed", sub: 'fast cache read', layer: 4 },
      ],
      edges: [
        { from: 'client', to: 'api' },
        { from: 'api', to: 'db' },
        { from: 'api', to: 'fanout' },
        { from: 'fanout', to: 'timeline' },
        { from: 'timeline', to: 'follower' },
      ],
      steps: ['client', 'api', 'db', 'fanout', 'timeline', 'follower'],
      captions: [
        'A user posts a tweet.',
        'The Tweet Service receives it and persists it, then kicks off fan-out.',
        'The tweet itself is stored once, permanently — the single source of truth.',
        'A fan-out worker looks up every follower of this account.',
        "It writes the tweet into each follower's precomputed timeline cache.",
        "The follower's feed is just a fast cache read — celebrity accounts skip this and fall back to a live merge at read time instead.",
      ],
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
    Component: diagram({
      traceLabel: 'Trace an upload',
      intro: 'Click to trace a post or story from upload to a viewer.',
      nodes: [
        { id: 'client', label: 'User', sub: 'uploads media', layer: 0 },
        { id: 'api', label: 'Upload API', layer: 1 },
        { id: 'postsdb', label: 'Posts DB', sub: 'durable, permanent', layer: 2 },
        { id: 'storiesstore', label: 'Stories Store', sub: '24h TTL, auto-expires', layer: 2 },
        { id: 'cdn', label: 'CDN', layer: 3 },
        { id: 'viewer', label: 'Viewer', layer: 4 },
      ],
      edges: [
        { from: 'client', to: 'api' },
        { from: 'api', to: 'postsdb' },
        { from: 'api', to: 'storiesstore' },
        { from: 'postsdb', to: 'cdn' },
        { from: 'storiesstore', to: 'cdn' },
        { from: 'cdn', to: 'viewer' },
      ],
      steps: ['client', 'api', 'postsdb', 'storiesstore', 'cdn', 'viewer'],
      captions: [
        'A user uploads a photo, video, or story.',
        'The Upload API routes it based on type.',
        'Permanent posts go to the durable Posts DB, feeding the ranked feed.',
        'Stories go to a separate store with a 24h TTL — expired automatically, never touching the permanent index.',
        'Either way, the media itself is pushed to a CDN — application servers never touch image bytes again.',
        'The viewer loads media straight from the CDN edge, not from origin storage.',
      ],
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
    Component: diagram({
      traceLabel: 'Trace a sync',
      intro: 'Click to trace two offline edits merging back together.',
      nodes: [
        { id: 'phone', label: 'Phone', sub: 'edited offline', layer: 0 },
        { id: 'laptop', label: 'Laptop', sub: 'edited online', layer: 0 },
        { id: 'sync', label: 'Sync Service', layer: 1 },
        { id: 'merge', label: 'CRDT Merge', sub: 'per-field, deterministic', layer: 2 },
        { id: 'notesdb', label: 'Notes Store', layer: 3 },
        { id: 'alldevices', label: 'All Devices', sub: 'converge to same state', layer: 4 },
      ],
      edges: [
        { from: 'phone', to: 'sync' },
        { from: 'laptop', to: 'sync' },
        { from: 'sync', to: 'merge' },
        { from: 'merge', to: 'notesdb' },
        { from: 'notesdb', to: 'alldevices' },
      ],
      steps: ['phone', 'laptop', 'sync', 'merge', 'notesdb', 'alldevices'],
      captions: [
        'The phone made an edit while offline, days ago.',
        'The laptop made a different edit while online, just now.',
        'Both versions reach the Sync Service once the phone reconnects.',
        'A CRDT-style merge combines both edits deterministically — neither is silently overwritten.',
        'The merged note is written back to the Notes Store as the new canonical version.',
        'Every device converges to the same merged state on its next sync.',
      ],
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
    Component: diagram({
      traceLabel: 'Trace a message',
      intro: 'Click to trace a message to an offline recipient.',
      nodes: [
        { id: 'sender', label: 'Sender', layer: 0 },
        { id: 'chatserver', label: 'Chat Server', layer: 1 },
        { id: 'msgstore', label: 'Message Store', sub: 'durable', layer: 2 },
        { id: 'queue', label: 'Per-User Queue', layer: 2 },
        { id: 'recipient', label: 'Recipient', sub: 'offline → delivered on reconnect', layer: 3 },
      ],
      edges: [
        { from: 'sender', to: 'chatserver' },
        { from: 'chatserver', to: 'msgstore' },
        { from: 'chatserver', to: 'queue' },
        { from: 'queue', to: 'recipient' },
      ],
      steps: ['sender', 'chatserver', 'msgstore', 'queue', 'recipient'],
      captions: [
        'The sender sends a message.',
        'The Chat Server receives it over a persistent connection.',
        'It persists the message durably — this survives a server crash.',
        "Since the recipient is offline, it's placed on their durable queue instead of pushed immediately.",
        'The moment the recipient reconnects, every queued message is delivered — nothing was lost.',
      ],
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
    Component: diagram({
      traceLabel: 'Trace a ride request',
      intro: 'Click to trace a rider request through geospatial matching.',
      nodes: [
        { id: 'rider', label: 'Rider', sub: 'requests a ride', layer: 0 },
        { id: 'matching', label: 'Matching Service', layer: 1 },
        { id: 'geoindex', label: 'Geohash Index', layer: 2 },
        { id: 'nearby', label: 'Nearby Drivers', sub: 'small candidate set', layer: 3 },
        { id: 'driver', label: 'Matched Driver', layer: 4 },
      ],
      edges: [
        { from: 'rider', to: 'matching' },
        { from: 'matching', to: 'geoindex' },
        { from: 'geoindex', to: 'nearby' },
        { from: 'nearby', to: 'driver' },
      ],
      steps: ['rider', 'matching', 'geoindex', 'nearby', 'driver'],
      captions: [
        'The rider requests a ride at their current location.',
        'The Matching Service looks up who could take it.',
        "Instead of scanning every driver, it queries the geohash index for the rider's cell.",
        'Only a small set of nearby drivers comes back — not the entire city.',
        'The closest available driver from that small set is matched.',
      ],
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
    Component: diagram({
      traceLabel: 'Trace a notification',
      intro: 'Click to trace one trigger fanning out to every channel.',
      nodes: [
        { id: 'trigger', label: 'Event Trigger', layer: 0 },
        { id: 'bus', label: 'Event Bus', layer: 1 },
        { id: 'push', label: 'Push Worker', layer: 2 },
        { id: 'email', label: 'Email Worker', layer: 2 },
        { id: 'sms', label: 'SMS Worker', sub: 'down right now', layer: 2 },
        { id: 'device', label: "User's Device", layer: 3 },
      ],
      edges: [
        { from: 'trigger', to: 'bus' },
        { from: 'bus', to: 'push' },
        { from: 'bus', to: 'email' },
        { from: 'bus', to: 'sms' },
        { from: 'push', to: 'device' },
        { from: 'email', to: 'device' },
      ],
      steps: ['trigger', 'bus', 'push', 'device'],
      captions: [
        'Something happens that should notify a user.',
        'One event is published — the trigger has no idea which channels exist.',
        'The push worker (an independent consumer) picks it up immediately.',
        "It's delivered to the user's device instantly — a struggling SMS provider elsewhere never touches this path at all.",
      ],
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
    Component: diagram({
      traceLabel: 'Trace an upload',
      intro: 'Click to trace a video from upload to playback.',
      nodes: [
        { id: 'uploader', label: 'Uploader', layer: 0 },
        { id: 'uploadapi', label: 'Upload API', layer: 1 },
        { id: 'rawstorage', label: 'Raw Storage', layer: 2 },
        { id: 'transcodequeue', label: 'Transcode Queue', layer: 2 },
        { id: 'workers', label: 'Transcode Workers', sub: '1080p / 720p / 480p / 360p', layer: 3 },
        { id: 'cdn', label: 'CDN', layer: 4 },
        { id: 'viewer', label: 'Viewer', layer: 5 },
      ],
      edges: [
        { from: 'uploader', to: 'uploadapi' },
        { from: 'uploadapi', to: 'rawstorage' },
        { from: 'uploadapi', to: 'transcodequeue' },
        { from: 'transcodequeue', to: 'workers' },
        { from: 'workers', to: 'cdn' },
        { from: 'cdn', to: 'viewer' },
      ],
      steps: ['uploader', 'uploadapi', 'rawstorage', 'transcodequeue', 'workers', 'cdn', 'viewer'],
      captions: [
        'The uploader sends a raw video file.',
        'The Upload API stores it and returns success immediately.',
        'The raw file lands in object storage — the upload itself is already done.',
        'A transcode job is enqueued in the background, not run synchronously.',
        'Workers transcode each resolution independently and publish it as soon as it finishes.',
        'Finished segments push to the CDN edge.',
        'The viewer streams from the CDN — origin storage is never hit per-viewer.',
      ],
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
    Component: diagram({
      traceLabel: 'Trace a homepage load',
      intro: 'Click to trace how a personalized homepage gets built.',
      nodes: [
        { id: 'watchhistory', label: 'Watch History', layer: 0 },
        { id: 'recpipeline', label: 'Batch Ranking Pipeline', sub: 'runs offline, periodically', layer: 1 },
        { id: 'reccache', label: 'Recommendation Cache', sub: 'precomputed per user', layer: 2 },
        { id: 'viewer', label: 'Viewer', sub: 'opens the app', layer: 3 },
        { id: 'homepage', label: 'Homepage Service', layer: 4 },
      ],
      edges: [
        { from: 'watchhistory', to: 'recpipeline' },
        { from: 'recpipeline', to: 'reccache' },
        { from: 'viewer', to: 'homepage' },
        { from: 'homepage', to: 'reccache' },
      ],
      steps: ['watchhistory', 'recpipeline', 'reccache', 'viewer', 'homepage'],
      captions: [
        'Every watch, in the background, accumulates in watch history.',
        'A batch ranking pipeline processes it periodically — not on any single request.',
        "The resulting per-user scores land in a recommendation cache, ready ahead of time.",
        'Later, the viewer opens the app.',
        'The Homepage Service just reads the precomputed cache — no live model inference on the request path.',
      ],
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
    Component: diagram({
      traceLabel: 'Trace two concurrent buyers',
      intro: 'Click to trace two buyers racing for the same seat.',
      nodes: [
        { id: 'buyera', label: 'Buyer A', layer: 0 },
        { id: 'buyerb', label: 'Buyer B', sub: 'same seat, same instant', layer: 0 },
        { id: 'bookingapi', label: 'Booking API', layer: 1 },
        { id: 'seatsdb', label: 'Seats Table', sub: 'atomic compare-and-swap', layer: 2 },
        { id: 'winner', label: 'Winner', sub: 'seat held', layer: 3 },
      ],
      edges: [
        { from: 'buyera', to: 'bookingapi' },
        { from: 'buyerb', to: 'bookingapi' },
        { from: 'bookingapi', to: 'seatsdb' },
        { from: 'seatsdb', to: 'winner' },
      ],
      steps: ['buyera', 'buyerb', 'bookingapi', 'seatsdb', 'winner'],
      captions: [
        'Buyer A clicks "Reserve" on seat 14C.',
        'Buyer B clicks the exact same seat, a few milliseconds later.',
        'Both requests reach the Booking API almost simultaneously.',
        "The database's atomic conditional update only lets one of them actually flip the row.",
        "One buyer wins the seat; the other's identical request affects zero rows and sees it's already gone.",
      ],
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
    Component: diagram({
      traceLabel: 'Trace a retried charge',
      intro: 'Click to trace a charge request that gets retried after a timeout.',
      nodes: [
        { id: 'client', label: 'Client', sub: 'retries after a timeout', layer: 0 },
        { id: 'paymentapi', label: 'Payment API', layer: 1 },
        { id: 'idcheck', label: 'Idempotency Check', layer: 2 },
        { id: 'processor', label: 'Payment Processor', layer: 3 },
        { id: 'ledger', label: 'Append-Only Ledger', layer: 3 },
        { id: 'response', label: 'Response', sub: 'same result, both times', layer: 4 },
      ],
      edges: [
        { from: 'client', to: 'paymentapi' },
        { from: 'paymentapi', to: 'idcheck' },
        { from: 'idcheck', to: 'processor' },
        { from: 'processor', to: 'ledger' },
        { from: 'ledger', to: 'response' },
      ],
      steps: ['client', 'paymentapi', 'idcheck', 'processor', 'ledger', 'response'],
      captions: [
        "The client's first request times out before it sees the response.",
        'It retries the exact same charge, with the same idempotency key.',
        'The Payment API checks: has this idempotency key been seen before?',
        "First time through, it actually delegates the charge to the payment processor.",
        'The result is recorded as an immutable ledger entry, keyed by that idempotency key.',
        "On retry, the same key is found — the original result is returned, and the card is never charged twice.",
      ],
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
    Component: diagram({
      traceLabel: 'Trace a sync',
      intro: 'Click to trace a small edit syncing across devices.',
      nodes: [
        { id: 'localfile', label: 'Local File', sub: '1 line edited', layer: 0 },
        { id: 'chunker', label: 'Chunk & Hash', layer: 1 },
        { id: 'diff', label: 'Diff Against Remote', layer: 2 },
        { id: 'blockstore', label: 'Block Store', sub: 'deduplicated', layer: 3 },
        { id: 'otherdevices', label: 'Other Devices', layer: 4 },
      ],
      edges: [
        { from: 'localfile', to: 'chunker' },
        { from: 'chunker', to: 'diff' },
        { from: 'diff', to: 'blockstore' },
        { from: 'blockstore', to: 'otherdevices' },
      ],
      steps: ['localfile', 'chunker', 'diff', 'blockstore', 'otherdevices'],
      captions: [
        'A user edits one line in a large file.',
        'The file is split into fixed-size blocks and each block is hashed.',
        "Comparing hashes against what's already uploaded finds exactly the one changed block.",
        'Only that block — not the whole file — is uploaded to the deduplicated block store.',
        'Other devices pull just that one changed block to stay in sync.',
      ],
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
    Component: diagram({
      traceLabel: 'Trace a shorten + redirect',
      intro: 'Click to trace a URL being shortened, then followed.',
      nodes: [
        { id: 'client', label: 'Client', sub: 'shortens a URL', layer: 0 },
        { id: 'api', label: 'Shortener API', layer: 1 },
        { id: 'idgen', label: 'Pre-Allocated ID Range', layer: 2 },
        { id: 'urldb', label: 'URL Mapping Store', layer: 2 },
        { id: 'cache', label: 'Redirect Cache', layer: 3 },
        { id: 'browser', label: 'Browser', sub: 'follows the short link', layer: 4 },
      ],
      edges: [
        { from: 'client', to: 'api' },
        { from: 'api', to: 'idgen' },
        { from: 'api', to: 'urldb' },
        { from: 'urldb', to: 'cache' },
        { from: 'cache', to: 'browser' },
      ],
      steps: ['client', 'api', 'idgen', 'urldb', 'cache', 'browser'],
      captions: [
        'A client submits a long URL to shorten.',
        'The Shortener API handles it — with no cross-server coordination needed.',
        'It pulls the next id from its own pre-allocated range, encodes it, done.',
        'The mapping is stored — and immediately cached, since it will never change.',
        'A later redirect hits the cache first, not the database.',
        "The browser gets an instant 302 — the database only ever sees cache misses and the low-volume write path.",
      ],
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
    Component: diagram({
      traceLabel: 'Trace a crawl',
      intro: 'Click to trace one URL through discovery, crawling, and link extraction.',
      nodes: [
        { id: 'seed', label: 'Seed URLs', layer: 0 },
        { id: 'dedup', label: 'Bloom Filter Dedup', layer: 1 },
        { id: 'domainqueues', label: 'Per-Domain Queues', sub: 'rate-limited', layer: 2 },
        { id: 'workers', label: 'Crawl Workers', layer: 3 },
        { id: 'pagestore', label: 'Page Store', layer: 4 },
        { id: 'linkextractor', label: 'Link Extractor', layer: 4 },
      ],
      edges: [
        { from: 'seed', to: 'dedup' },
        { from: 'dedup', to: 'domainqueues' },
        { from: 'domainqueues', to: 'workers' },
        { from: 'workers', to: 'pagestore' },
        { from: 'workers', to: 'linkextractor' },
        { from: 'linkextractor', to: 'dedup' },
      ],
      steps: ['seed', 'dedup', 'domainqueues', 'workers', 'pagestore', 'linkextractor'],
      captions: [
        'A URL starts as a seed (or is discovered on a crawled page).',
        "The Bloom filter cheaply checks: has this exact URL been crawled before?",
        "New URLs land in a queue specific to their domain, respecting that domain's rate limit.",
        'A crawl worker fetches the page once the domain allows it.',
        'The page content is saved to the page store.',
        "Its links are extracted and fed straight back into the dedup filter — new ones enter the queue, seen ones are dropped.",
      ],
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
    Component: diagram({
      traceLabel: 'Trace a keystroke',
      intro: 'Click to trace what happens on every keystroke.',
      nodes: [
        { id: 'querylogs', label: 'Query Logs', layer: 0 },
        { id: 'rebuild', label: 'Periodic Trie Rebuild', layer: 1 },
        { id: 'user', label: 'User', sub: 'types "sea..."', layer: 2 },
        { id: 'trie', label: 'Trie Lookup', sub: 'in-memory', layer: 3 },
        { id: 'topk', label: 'Cached Top-K', sub: 'per node', layer: 4 },
        { id: 'suggestions', label: 'Suggestions Shown', layer: 5 },
      ],
      edges: [
        { from: 'querylogs', to: 'rebuild' },
        { from: 'rebuild', to: 'trie' },
        { from: 'user', to: 'trie' },
        { from: 'trie', to: 'topk' },
        { from: 'topk', to: 'suggestions' },
      ],
      steps: ['querylogs', 'rebuild', 'user', 'trie', 'topk', 'suggestions'],
      captions: [
        'In the background, every search query gets logged.',
        'Periodically (not per-keystroke), the trie is rebuilt from aggregated query frequency.',
        'Later, a user types a prefix.',
        "The lookup walks the trie one character at a time — O(prefix length), not O(dataset size).",
        "Each node it reaches already has its top-k most frequent completions cached.",
        'Those suggestions are shown instantly — well under 100ms.',
      ],
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
