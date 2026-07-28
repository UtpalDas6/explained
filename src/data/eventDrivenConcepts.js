import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /events section — 26 event-driven systems topics, grouped
// Fundamentals / Delivery & Guarantees / Event Sourcing & CQRS / Stream
// Processing / Architecture Patterns / Reliability & Scale. Reuses the same
// before/after StateDemo every other section uses.
const demo = (props) => () => createElement(StateDemo, props)

export const eventDrivenConcepts = [
  {
    id: 'event-vs-command',
    section: 'events',
    title: 'Events vs Commands',
    blurb: 'A command tells a specific service what to do and expects it to happen; an event announces that something already happened, with no expectation anyone acts on it.',
    tag: 'Fundamentals',
    Component: demo({
      command: 'switch to an event',
      before: [{ label: 'ChargeCard command', sub: 'sent directly to Billing Service, expects success/failure back', color: 'var(--accent)' }],
      after: [{ label: 'OrderPlaced event', sub: 'broadcast — Billing, Inventory, Email all react independently', color: 'var(--good)' }],
      note: {
        before: 'A command is addressed to one specific service — the sender is coupled to knowing exactly who should handle it and waiting for a direct response.',
        after: "An event just states a fact that already happened — the sender doesn't know or care who's listening, and any number of services can react independently.",
      },
    }),
    code: [{ lang: 'js', snippet: `// Command: imperative, targeted, expects a response\nbillingService.chargeCard({ orderId, amount })\n\n// Event: a fact, broadcast, no response expected\neventBus.publish('OrderPlaced', { orderId, amount, items })` }],
    realWorld:
      '"PlaceOrder" is a command (aimed at the order service, expecting success/failure); "OrderPlaced" is the resulting event that inventory, billing, and email services all independently react to.',
    pitfall:
      'Naming an event in the imperative ("ChargeCard") instead of past tense ("CardCharged") blurs the distinction and tempts a publisher into expecting a specific response, defeating the point of decoupling.',
    fix:
      'Name events strictly in the past tense and commands in the imperative — the naming convention itself keeps the two concepts from blurring together.',
  },
  {
    id: 'pub-sub',
    section: 'events',
    title: 'Publish/Subscribe',
    blurb: 'Publishers broadcast events to a topic without knowing who (if anyone) is listening; subscribers register interest without the publisher knowing they exist.',
    tag: 'Fundamentals',
    Component: demo({
      command: 'add another subscriber',
      before: [{ label: 'OrderService calls emailService.send() directly', sub: 'hardcoded, tightly coupled', color: 'var(--bad)' }],
      after: [{ label: 'OrderService publishes "OrderPlaced"', sub: 'Email, Analytics, Loyalty all subscribe independently — zero changes to OrderService', color: 'var(--good)' }],
      note: {
        before: "OrderService has to know about, import, and directly call every service that needs to react — adding a new reactor means editing OrderService's code.",
        after: 'OrderService just publishes a fact — any number of subscribers can be added or removed later without ever touching the publisher.',
      },
    }),
    code: [{ lang: 'js', snippet: `eventBus.publish('OrderPlaced', order)\n\n// each subscriber registers independently, publisher never knows they exist\neventBus.subscribe('OrderPlaced', emailService.sendConfirmation)\neventBus.subscribe('OrderPlaced', analyticsService.track)\neventBus.subscribe('OrderPlaced', loyaltyService.addPoints)` }],
    realWorld:
      "Kafka topics, SNS topics, and Redis pub/sub all implement this exact pattern — it's the foundational primitive nearly every event-driven system is built on top of.",
    pitfall:
      'A publisher with no idea who\'s subscribed makes it genuinely hard to answer "what actually happens when I publish this event?" — real behavior is scattered across every subscriber\'s codebase.',
    fix:
      'Maintain a central catalog of which services subscribe to which events (many event platforms expose this natively) so real system behavior is discoverable, not just implicit.',
  },
  {
    id: 'event-notification-vs-carried-state',
    section: 'events',
    title: 'Event Notification vs Event-Carried State Transfer',
    blurb: 'A thin event just says "something changed, go look it up"; a fat event carries the actual changed data along with it — a real tradeoff between coupling and payload size.',
    tag: 'Fundamentals',
    Component: demo({
      command: 'carry the state in the event',
      before: [{ label: '{event: "OrderUpdated", orderId: 42}', sub: 'subscriber must call back to fetch the full order', color: 'var(--accent)' }],
      after: [{ label: '{event: "OrderUpdated", orderId: 42, items: [...], total: 89.99}', sub: 'subscriber has everything it needs already', color: 'var(--good)' }],
      note: {
        before: 'A thin notification tells a subscriber something changed but not what — it has to make a synchronous call back to the source just to find out.',
        after: 'The event itself carries the full changed state — no callback needed, and the subscriber keeps working even if the source is temporarily down.',
      },
    }),
    code: [{ lang: 'js', snippet: `// Notification-style: thin, requires a callback\n{ event: 'OrderUpdated', orderId: 42 }\n// -> subscriber must: GET /orders/42\n\n// State-transfer style: fat, self-contained\n{ event: 'OrderUpdated', orderId: 42, items: [...], total: 89.99, status: 'shipped' }` }],
    realWorld:
      'High-availability systems favor carried-state events specifically so subscribers keep functioning even during a source-service outage — no synchronous callback dependency to break.',
    pitfall:
      'Carried-state events tightly couple every subscriber to the exact shape of the source data at publish time — a field added or removed later can break subscribers relying on the old shape.',
    fix:
      'Version event schemas explicitly (see schema registry) and keep carried-state events focused on genuinely commonly-needed fields, rather than dumping an entire internal object into every event.',
  },
  {
    id: 'event-driven-vs-request-response',
    section: 'events',
    title: 'Event-Driven vs Request-Response',
    blurb: "Request-response is synchronous and tightly coupled in time; event-driven is asynchronous — the sender doesn't wait, and the receiver doesn't have to be up right now.",
    tag: 'Fundamentals',
    Component: demo({
      command: 'decouple in time',
      before: [{ label: 'OrderService calls InventoryService.reserve() synchronously', sub: 'blocks until Inventory responds — or times out', color: 'var(--bad)' }],
      after: [{ label: 'OrderService publishes "OrderPlaced", moves on', sub: "InventoryService processes it whenever it's ready", color: 'var(--good)' }],
      note: {
        before: "A synchronous call means OrderService is blocked (and can fail) if InventoryService is slow or briefly down — their availability is now coupled.",
        after: 'OrderService publishes and immediately continues — InventoryService can process the event seconds later without OrderService ever knowing.',
      },
    }),
    code: [{ lang: 'js', snippet: `// Request-response: synchronous, coupled availability\nconst result = await inventoryService.reserve(orderId, items)  // blocks\n\n// Event-driven: asynchronous, decoupled availability\neventBus.publish('OrderPlaced', { orderId, items })  // returns immediately` }],
    realWorld:
      'Order processing pipelines (payment, inventory, shipping, notification) commonly go event-driven precisely so a slow or temporarily-down shipping service never blocks checkout itself.',
    pitfall:
      'Trading synchronous calls for events everywhere means giving up the immediate "did it actually work?" answer a request-response call gives.',
    fix:
      'Use event-driven flows where eventual completion is acceptable, and keep synchronous request-response for the specific interactions where the caller genuinely needs an immediate answer.',
  },
  {
    id: 'fan-out',
    section: 'events',
    title: 'Fan-Out',
    blurb: 'One event triggers many independent, parallel consumers — each processes the same event for its own purpose, without any of them waiting on each other.',
    tag: 'Fundamentals',
    Component: demo({
      command: 'fan out to consumers',
      before: [{ label: 'UserSignedUp → serially: email, then analytics, then CRM', sub: 'total time = sum of all three', color: 'var(--bad)' }],
      after: [{ label: 'UserSignedUp → email, analytics, CRM triggered in parallel', sub: 'total time = the slowest one alone', color: 'var(--good)' }],
      note: {
        before: 'Processing each reaction one after another means total time is the sum of every step — and a failure partway through can leave later steps never run.',
        after: "Each consumer receives its own independent copy of the event and processes it in parallel — one consumer failing doesn't block the others.",
      },
    }),
    code: [{ lang: 'yaml', snippet: `topic: UserSignedUp\nsubscribers:\n  - email-service      # sends welcome email\n  - analytics-service  # tracks signup metric\n  - crm-service        # creates CRM contact\n# all three receive the event independently and in parallel` }],
    realWorld:
      'SNS-to-multiple-SQS-queues (AWS fan-out) and Kafka consumer groups reading the same topic both implement this — one event, many independent downstream reactions.',
    pitfall:
      'Fan-out to many consumers multiplies the total processing cost of every single event — 10 consumers cost 10x whatever one would, even if most do very little.',
    fix:
      "Only fan an event out to consumers that genuinely need to react to it — a consumer that just logs for debugging doesn't need the same delivery tier as one triggering a real action.",
  },
  {
    id: 'delivery-guarantees',
    section: 'events',
    title: 'Delivery Guarantees (At-Most/At-Least/Exactly-Once)',
    blurb: 'Three different promises a messaging system can make about how many times a message might be delivered — each requires a different design on the consumer side.',
    tag: 'Delivery & Guarantees',
    Component: demo({
      command: 'pick the right guarantee',
      before: [{ label: 'at-most-once: fire and forget', sub: 'message can be silently lost, never redelivered', color: 'var(--bad)' }],
      after: [{ label: 'at-least-once + idempotent consumer', sub: 'never silently lost, safe even if redelivered', color: 'var(--good)' }],
      note: {
        before: '"Fire and forget" delivery means a message lost to a network blip or crashed consumer is just gone — nobody notices, nothing retries it.',
        after: 'At-least-once guarantees a message is never silently dropped — paired with an idempotent consumer, a redelivery is completely safe to process again.',
      },
    }),
    code: [{ lang: 'text', snippet: `At-most-once:  send, don't confirm  -> can lose messages, never duplicates\nAt-least-once: send, retry until confirmed -> never loses, can duplicate\nExactly-once:  the hardest to build; usually at-least-once + dedup under the hood` }],
    realWorld:
      "Most production messaging systems (Kafka, SQS) default to at-least-once — it's the practical sweet spot, since true exactly-once delivery across a network is provably hard.",
    pitfall:
      '"Exactly-once" is often advertised but rarely means what it sounds like — it usually means "at-least-once plus deduplication", not a guarantee a message arrives exactly one time.',
    fix:
      'Design consumers to be idempotent by default rather than relying on a messaging system\'s "exactly-once" claim to fully eliminate the need for that safety.',
  },
  {
    id: 'idempotent-consumers',
    section: 'events',
    title: 'Idempotent Consumers',
    blurb: 'A consumer that processes the same message twice (a redelivery) without causing a duplicate side effect — the mechanism that makes at-least-once delivery safe.',
    tag: 'Delivery & Guarantees',
    Component: demo({
      command: 'process the duplicate safely',
      before: [{ label: 'PaymentReceived event redelivered', sub: 'charged the customer twice', color: 'var(--bad)' }],
      after: [{ label: 'PaymentReceived event redelivered', sub: 'consumer checks: already processed event abc123 — skip', color: 'var(--good)' }],
      note: {
        before: 'A naive consumer just re-runs its logic on every message it receives — a redelivered event causes a real duplicate side effect.',
        after: "The consumer checks whether it's already processed this exact event id before doing work — a redelivery becomes a safe no-op.",
      },
    }),
    code: [{ lang: 'python', snippet: `def handle_payment_received(event):\n    if processed_events.exists(event.id):\n        return  # already handled, safe no-op\n    charge_customer(event.amount)\n    processed_events.mark_done(event.id)` }],
    realWorld:
      'Every payment, order fulfillment, and inventory decrement consumer built on at-least-once messaging needs this — the single most important safety property in event-driven systems.',
    pitfall:
      'Deduplicating based only on message content (not a unique event id) fails when two genuinely different events happen to have identical content.',
    fix:
      'Always deduplicate on a unique event id assigned at publish time, never on message content.',
  },
  {
    id: 'message-ordering',
    section: 'events',
    title: 'Message Ordering',
    blurb: 'Whether messages are guaranteed to arrive in the order they were sent — true within a single partition/queue, generally not true across the whole system.',
    tag: 'Delivery & Guarantees',
    Component: demo({
      command: 'guarantee ordering where it matters',
      before: [{ label: 'OrderCreated and OrderCancelled on separate partitions', sub: 'cancellation can arrive before creation', color: 'var(--bad)' }],
      after: [{ label: 'both keyed by orderId → same partition', sub: 'strict order guaranteed for that order', color: 'var(--good)' }],
      note: {
        before: 'Events for the same order landing on different partitions have no ordering guarantee — a cancellation processed before its own creation is a real bug.',
        after: 'Keying both events by the same order id routes them to the same partition, where ordering is guaranteed.',
      },
    }),
    code: [{ lang: 'text', snippet: `producer.send(topic='orders', key=order.id, value=OrderCreated(order))\nproducer.send(topic='orders', key=order.id, value=OrderCancelled(order))\n# same key -> same partition -> strict order guaranteed between these two` }],
    realWorld:
      'Kafka guarantees strict ordering only within a partition, not across an entire topic — exactly why partition keys matter so much in system design.',
    pitfall:
      'Assuming global ordering across an entire topic (when the guarantee is only per-partition) leads to subtle bugs that only appear once messages actually land on different partitions under real load.',
    fix:
      'Key events by an entity id (order id, user id) whenever relative order between related events matters, so they consistently land on the same partition together.',
  },
  {
    id: 'dead-letter-queue',
    section: 'events',
    title: 'Dead Letter Queue',
    blurb: "A separate queue where messages go after repeatedly failing to process — so a poison message doesn't get retried forever, blocking everything behind it.",
    tag: 'Delivery & Guarantees',
    Component: demo({
      command: 'route to the DLQ',
      before: [{ label: 'malformed message retried infinitely', sub: 'blocks every message queued behind it', color: 'var(--bad)' }],
      after: [{ label: 'fails 5 times → moved to DLQ', sub: 'queue keeps processing everything else', color: 'var(--good)' }],
      note: {
        before: 'A message that can never succeed gets retried forever — and depending on the queue, can block everything behind it from ever being processed.',
        after: 'After a bounded number of retries, the message moves aside into its own queue for investigation — the main queue keeps flowing.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `queue:\n  name: orders-processing\n  maxRetries: 5\n  deadLetterQueue: orders-processing-dlq\n  # after 5 failed attempts, message moves to the DLQ instead of retrying forever` }],
    realWorld:
      "SQS, RabbitMQ, and every serious message queue support DLQs natively — the standard mechanism preventing one bad message from taking down an entire pipeline.",
    pitfall:
      'A DLQ nobody actually monitors becomes a silent graveyard — messages pile up representing real failed business operations nobody ever notices.',
    fix:
      'Alert on DLQ depth (any message landing there is worth investigating) rather than treating the DLQ as a place messages go to be forgotten.',
  },
  {
    id: 'outbox-pattern',
    section: 'events',
    title: 'Transactional Outbox Pattern',
    blurb: "Writing a database change and the event announcing it in the same local transaction — so the event can never be published for a write that didn't actually happen.",
    tag: 'Delivery & Guarantees',
    Component: demo({
      command: 'write both atomically',
      before: [{ label: 'save order to DB, then publish "OrderCreated"', sub: 'crash between the two steps loses the event silently', color: 'var(--bad)' }],
      after: [{ label: 'save order + outbox row, same transaction', sub: 'a separate process reliably publishes from the outbox table', color: 'var(--good)' }],
      note: {
        before: 'If the process crashes after saving to the database but before publishing, the order exists but nobody downstream ever finds out.',
        after: 'Both writes commit atomically in the same transaction — a separate relay process reliably publishes from the outbox table afterward.',
      },
    }),
    code: [{ lang: 'sql', snippet: `BEGIN;\nINSERT INTO orders (...) VALUES (...);\nINSERT INTO outbox (event_type, payload) VALUES ('OrderCreated', '{...}');\nCOMMIT;\n-- a separate poller reads unpublished outbox rows and publishes them reliably` }],
    realWorld:
      'This is the standard solution to the classic "dual write" problem — a database and a message broker are two separate systems that can\'t share one atomic transaction directly.',
    pitfall:
      'The outbox table itself needs cleanup (published rows accumulating forever) and the relay process introduces its own latency before the event is actually published.',
    fix:
      'Periodically prune published outbox rows, and use change-data-capture tooling (like Debezium) to minimize publish latency instead of a slow-polling relay.',
  },
  {
    id: 'event-sourcing',
    section: 'events',
    title: 'Event Sourcing',
    blurb: 'Storing every state change as an immutable event, and deriving current state by replaying them — instead of storing (and overwriting) just the current state directly.',
    tag: 'Event Sourcing & CQRS',
    Component: demo({
      command: 'replay the events',
      before: [{ label: 'accounts table: balance = 150', sub: 'no record of how it got there', color: 'var(--accent)' }],
      after: [{ label: 'Deposited(100), Deposited(75), Withdrew(25)', sub: 'replay: 0+100+75-25 = 150, full history preserved', color: 'var(--good)' }],
      note: {
        before: 'A traditional table stores only the current value — every previous state and every change that led here is gone, overwritten by each update.',
        after: 'Every change is preserved as its own immutable event — current state is derivable by replaying them, full history never lost.',
      },
    }),
    code: [{ lang: 'python', snippet: `events = [Deposited(100), Deposited(75), Withdrew(25)]\nbalance = sum(e.amount if isinstance(e, Deposited) else -e.amount for e in events)\n# 150 — but unlike a plain balance column, every step that led here is preserved` }],
    realWorld:
      'Banking ledgers, audit-heavy domains (healthcare records, financial trading), and any system where "how did we get here" matters as much as the state itself are natural fits.',
    pitfall:
      'Replaying the entire event history to compute current state gets slower as history grows — a years-old account with millions of events is genuinely expensive to reconstruct from scratch.',
    fix:
      'Periodically save a snapshot of derived state (e.g. every 1,000 events) so replay only needs to start from the latest snapshot forward.',
  },
  {
    id: 'cqrs',
    section: 'events',
    title: 'CQRS (Command Query Responsibility Segregation)',
    blurb: 'Using a different model (and often a different data store) for writes (commands) than for reads (queries), instead of forcing one schema to serve both.',
    tag: 'Event Sourcing & CQRS',
    Component: demo({
      command: 'split read and write models',
      before: [{ label: 'one normalized table serves writes and reporting reads', sub: 'reporting queries need 6 joins, slow', color: 'var(--bad)' }],
      after: [{ label: 'writes → normalized DB; reads → denormalized read model', sub: 'reporting query becomes a single lookup', color: 'var(--good)' }],
      note: {
        before: 'The same normalized schema optimized for consistent writes also has to serve complex read queries — reporting suffers.',
        after: "Writes update the source-of-truth model; a separate read model, kept in sync via events, is shaped for the queries that actually run.",
      },
    }),
    code: [{ lang: 'text', snippet: `// Write side: normalized, optimized for consistency\nPOST /orders -> writes to orders, order_items, customers tables\n\n// Read side: denormalized, optimized for this specific query\nGET /orders/summary -> reads from a pre-joined order_summary_view,\n                        kept updated by consuming OrderCreated events` }],
    realWorld:
      'E-commerce dashboards, analytics views, and any read pattern that would otherwise require expensive joins commonly get their own dedicated, denormalized read model.',
    pitfall:
      'The read model is only ever eventually consistent with the write model — a query immediately after a write can return stale data.',
    fix:
      "Accept eventual consistency for the read model where it's genuinely tolerable, and route \"read your own recent write\" back to the write-side source of truth directly.",
  },
  {
    id: 'event-replay',
    section: 'events',
    title: 'Event Replay',
    blurb: 'Re-processing a stream of historical events from the beginning (or a specific point) — to rebuild state, backfill a new consumer, or recover from a bug.',
    tag: 'Event Sourcing & CQRS',
    Component: demo({
      command: 'replay from the beginning',
      before: [{ label: 'new AnalyticsService added today', sub: 'has zero historical data — only sees events from now on', color: 'var(--bad)' }],
      after: [{ label: 'AnalyticsService replays the full retained event log', sub: 'builds complete historical state from day one', color: 'var(--good)' }],
      note: {
        before: 'A brand-new consumer starting today has no idea what happened before it existed.',
        after: 'Replaying the full retained event history lets the new consumer build up exactly the same state it would have had from the beginning.',
      },
    }),
    code: [{ lang: 'bash', snippet: `kafka-consumer --topic orders --from-beginning \\\n  --group new-analytics-service\n# reprocesses the entire retained log, rebuilding this consumer's state from scratch` }],
    realWorld:
      'Adding a new analytics service to an already-running system, or recovering from a consumer bug that processed events incorrectly for a week, both rely on replay.',
    pitfall:
      'Replay only works for events still retained by the broker — a topic with a short retention window has already permanently lost anything older.',
    fix:
      'Set retention based on whether replay is a genuine requirement (indefinite retention, or archiving to cold storage) rather than defaulting to a short window.',
  },
  {
    id: 'stream-processing',
    section: 'events',
    title: 'Stream Processing',
    blurb: 'Processing events continuously, one at a time (or in micro-batches) as they arrive, instead of waiting to run a batch job over accumulated data.',
    tag: 'Stream Processing',
    Component: demo({
      command: 'process continuously',
      before: [{ label: "nightly batch job: yesterday's fraud caught the next morning", sub: 'up to 24h delay', color: 'var(--bad)' }],
      after: [{ label: 'stream processor: each transaction scored instantly', sub: 'fraud caught in milliseconds', color: 'var(--good)' }],
      note: {
        before: "A nightly batch job means every insight is delayed by up to a full day.",
        after: 'Each event is processed the moment it arrives — the same logic now runs in milliseconds instead of waiting for the next batch window.',
      },
    }),
    code: [{ lang: 'python', snippet: `stream = kafka_stream.subscribe('transactions')\nfor transaction in stream:\n    if fraud_score(transaction) > 0.9:\n        flag_for_review(transaction)  # happens within milliseconds of the event` }],
    realWorld:
      'Fraud detection, real-time dashboards, and live recommendation updates all need stream processing — the value of the insight decays fast.',
    pitfall:
      'Stream processing logic is genuinely harder to reason about than batch logic — handling out-of-order events and late data without the luxury of "wait until all data is in" adds real complexity.',
    fix:
      "Default to batch processing unless the use case genuinely needs low latency — stream processing's added complexity should be a deliberate tradeoff, not a default.",
  },
  {
    id: 'windowing',
    section: 'events',
    title: 'Windowing',
    blurb: 'Grouping a continuous, unbounded stream of events into finite time buckets (tumbling, sliding, or session windows) so aggregations like "count per minute" are computable.',
    tag: 'Stream Processing',
    Component: demo({
      command: 'bucket into windows',
      before: [{ label: 'unbounded stream: "count of clicks"', sub: 'count of what time range? undefined', color: 'var(--bad)' }],
      after: [{ label: 'tumbling 1-minute windows', sub: '[12:00-12:01): 340 clicks, [12:01-12:02): 290 clicks', color: 'var(--good)' }],
      note: {
        before: "An unbounded stream has no natural point to say \"sum it up now\" — an aggregate over an infinite stream isn't computable.",
        after: 'Chopping the stream into fixed time buckets makes each bucket\'s aggregate a well-defined, computable number.',
      },
    }),
    code: [{ lang: 'text', snippet: `stream\n  .window(tumbling(1, 'minute'))\n  .aggregate(count)\n// [12:00-12:01): 340\n// [12:01-12:02): 290` }],
    realWorld:
      'Real-time dashboards ("requests per second") and rate limiting both fundamentally rely on windowing to turn an infinite stream into finite, computable numbers.',
    pitfall:
      "An event arriving late (network delay, a device reconnecting) can land after its correct window has already closed — a naive setup silently drops it or gets the count wrong.",
    fix:
      'Configure explicit allowed lateness (a grace period after a window closes during which late events are still incorporated) rather than assuming every event arrives on the first try.',
  },
  {
    id: 'event-time-vs-processing-time',
    section: 'events',
    title: 'Event Time vs Processing Time',
    blurb: 'Event time is when something actually happened; processing time is when the system got around to handling it — the two can differ, and conflating them causes real bugs.',
    tag: 'Stream Processing',
    Component: demo({
      command: 'use event time, not processing time',
      before: [{ label: 'windowed by processing time', sub: "a delayed mobile event lands in the wrong hour's bucket", color: 'var(--bad)' }],
      after: [{ label: 'windowed by the timestamp embedded in the event', sub: 'correctly bucketed by when it actually happened', color: 'var(--good)' }],
      note: {
        before: "A mobile app event generated at 11:58pm but delivered at 12:03am gets counted in the wrong day's aggregate if bucketed by arrival time.",
        after: 'Using the timestamp the event carries puts it in the correct bucket regardless of network delay before it arrived.',
      },
    }),
    code: [{ lang: 'text', snippet: `event = { type: 'click', occurred_at: '2026-01-14T23:58:00Z', received_at: '2026-01-15T00:03:00Z' }\n# window by occurred_at (event time), not received_at (processing time)` }],
    realWorld:
      'Mobile and IoT event pipelines deal with this constantly — devices go offline and later flush a backlog of events, each carrying its own true event time.',
    pitfall:
      "Defaulting to processing time (simpler — just use 'now') silently produces wrong aggregates whenever there's any delay or reordering between when something happened and when it was processed.",
    fix:
      'Embed a true event timestamp in every event at the source, and window/aggregate on that timestamp specifically.',
  },
  {
    id: 'stateful-stream-processing',
    section: 'events',
    title: 'Stateful Stream Processing',
    blurb: 'Some stream operations need memory of what came before (a running total, a join across two streams) — that state has to live and survive somewhere as the stream keeps flowing.',
    tag: 'Stream Processing',
    Component: demo({
      command: 'maintain state across events',
      before: [{ label: 'stateless: each event processed with zero memory', sub: '"running total" is impossible without state', color: 'var(--accent)' }],
      after: [{ label: 'local state store, checkpointed regularly', sub: 'running_total += event.amount, survives restarts', color: 'var(--good)' }],
      note: {
        before: 'A purely stateless processor can transform or filter each event on its own, but has no way to compute a running total.',
        after: 'A local, checkpointed state store maintains the running total across events, and can recover to its last known-good value after a crash.',
      },
    }),
    code: [{ lang: 'python', snippet: `def process(event, state_store):\n    state_store['running_total'] += event.amount\n    state_store.checkpoint()  # periodically persisted, so a crash can recover\n    return state_store['running_total']` }],
    realWorld:
      'Kafka Streams and Flink both provide built-in, fault-tolerant state stores — running aggregates, joins between live streams, and deduplication all need this.',
    pitfall:
      'State kept only in memory, with no checkpointing to durable storage, is lost entirely if the processor crashes — every running total silently resets to zero.',
    fix:
      "Use a stream processing framework's built-in checkpointed state store rather than hand-rolled in-memory state.",
  },
  {
    id: 'complex-event-processing',
    section: 'events',
    title: 'Complex Event Processing (CEP)',
    blurb: 'Detecting meaningful patterns across a sequence of related events — not any single event alone, but a specific combination or order of several.',
    tag: 'Stream Processing',
    Component: demo({
      command: 'detect the pattern',
      before: [{ label: 'single event: FailedLogin', sub: 'unremarkable on its own', color: 'var(--accent)' }],
      after: [{ label: '5 FailedLogins from the same IP within 60s', sub: 'trigger a security alert', color: 'var(--good)' }],
      note: {
        before: 'A single failed login is completely unremarkable — everyone mistypes a password sometimes.',
        after: 'The pattern — five failures, same source, tight time window — is what signals a brute-force attempt, and only shows up by correlating multiple events.',
      },
    }),
    code: [{ lang: 'text', snippet: `pattern:\n  match: FailedLogin\n  where: same source_ip\n  count: 5\n  within: 60s\n  then: trigger SecurityAlert` }],
    realWorld:
      'Fraud detection, security monitoring (brute-force logins), and industrial monitoring (sensor sequences indicating failure) all rely on CEP to spot patterns no single event reveals.',
    pitfall:
      'CEP rules that are too broad generate constant false positives, while rules too narrow miss real incidents that don\'t match the exact defined pattern.',
    fix:
      'Tune CEP rule thresholds against real historical data rather than guessing, and iterate as false-positive/false-negative rates become visible.',
  },
  {
    id: 'saga-pattern',
    section: 'events',
    title: 'Saga Pattern',
    blurb: 'Manages a transaction that spans multiple services by breaking it into a sequence of local transactions, each with a compensating action to undo it if a later step fails.',
    tag: 'Architecture Patterns',
    Component: demo({
      command: 'compensate on failure',
      before: [{ label: 'PaymentCharged → InventoryReserve fails', sub: 'payment stays charged, nothing rolls back', color: 'var(--bad)' }],
      after: [{ label: 'InventoryReserve fails → compensating RefundPayment triggered', sub: 'the saga rolls itself back, step by step', color: 'var(--good)' }],
      note: {
        before: "There's no real distributed transaction across independent services — a later failure doesn't automatically undo earlier steps that already succeeded.",
        after: 'Each step has a defined compensating action — a later failure triggers compensations for everything that already succeeded.',
      },
    }),
    code: [{ lang: 'text', snippet: `saga OrderSaga:\n  1. ChargePayment       compensate: RefundPayment\n  2. ReserveInventory    compensate: ReleaseInventory\n  3. ScheduleShipping    compensate: CancelShipping\n\n# step 2 fails -> run compensation for step 1 (RefundPayment), stop` }],
    realWorld:
      "Order checkout flows spanning payment, inventory, and shipping services — none sharing a database — are the textbook saga case, since a real ACID transaction across all three isn't possible.",
    pitfall:
      "Compensating actions aren't always a perfect, symmetric undo — a payment refund can fail too, or a confirmation email can't be unsent.",
    fix:
      'Design compensating actions to be idempotent and retriable themselves, and accept that some compensations are inherently imperfect — plan for that gap explicitly.',
  },
  {
    id: 'choreography-vs-orchestration',
    section: 'events',
    title: 'Choreography vs Orchestration',
    blurb: 'Choreography: each service reacts to events independently, no central coordinator. Orchestration: one central process explicitly directs every step in sequence.',
    tag: 'Architecture Patterns',
    Component: demo({
      command: 'add a central orchestrator',
      before: [{ label: 'choreography: services react to each other\'s events', sub: 'the actual flow is implicit, scattered across services', color: 'var(--accent)' }],
      after: [{ label: 'orchestration: OrderSaga calls charge() → reserve() → ship()', sub: 'the flow is one readable, explicit sequence', color: 'var(--good)' }],
      note: {
        before: "Each service only knows its own small reaction — nobody can read one place and see the whole flow end to end.",
        after: 'A central orchestrator explicitly calls each step in order — the entire flow is readable top-to-bottom in one place.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Choreography: implicit, distributed across services\nPaymentService:   on OrderPlaced -> charge(), emit PaymentCharged\nInventoryService: on PaymentCharged -> reserve(), emit InventoryReserved\n\n// Orchestration: explicit, centralized\nclass OrderSaga {\n  async run(order) {\n    await payment.charge(order)\n    await inventory.reserve(order)\n    await shipping.schedule(order)\n  }\n}` }],
    realWorld:
      'Simple flows often start with choreography for loose coupling; complex flows with many steps and branches tend to move to orchestration once the choreographed flow gets hard to trace.',
    pitfall:
      'Choreography scales badly past a handful of steps — with no central description of the flow, understanding what actually happens requires mentally simulating every handler.',
    fix:
      "Start with choreography for simple, few-step flows; introduce an explicit orchestrator once the flow grows enough steps that nobody can hold the whole thing in their head.",
  },
  {
    id: 'event-driven-microservices',
    section: 'events',
    title: 'Event-Driven Microservices',
    blurb: "Services communicate primarily by publishing and reacting to events rather than calling each other's APIs directly — decoupling not just at build time, but at runtime too.",
    tag: 'Architecture Patterns',
    Component: demo({
      command: 'decouple via events',
      before: [{ label: 'OrderService directly calls InventoryService.reserve()', sub: 'InventoryService being down breaks OrderService too', color: 'var(--bad)' }],
      after: [{ label: 'OrderService publishes OrderPlaced; Inventory reacts whenever ready', sub: 'InventoryService being down just delays reservation, checkout still works', color: 'var(--good)' }],
      note: {
        before: "A direct call means OrderService's own availability is now coupled to InventoryService's.",
        after: "OrderService publishes and moves on — if Inventory is temporarily down, the event just waits until it's back.",
      },
    }),
    code: [{ lang: 'text', snippet: `// Direct call: runtime coupling\nclass OrderService {\n  async placeOrder(order) {\n    await this.inventoryService.reserve(order)  // fails if Inventory is down\n  }\n}\n\n// Event-driven: runtime decoupling\nclass OrderService {\n  async placeOrder(order) {\n    await this.eventBus.publish('OrderPlaced', order)  // always succeeds\n  }\n}` }],
    realWorld:
      "Large-scale e-commerce and fintech platforms lean heavily on event-driven microservices so one service's outage doesn't cascade into every service that would otherwise call it directly.",
    pitfall:
      'Event-driven decoupling trades immediate consistency and simple debugging for resilience — tracing an async event chain is harder than reading a stack trace from a synchronous call.',
    fix:
      "Invest in distributed tracing and event correlation ids — the debugging cost of event-driven architecture has to be paid back with better observability tooling.",
  },
  {
    id: 'schema-registry',
    section: 'events',
    title: 'Schema Registry & Event Schema Evolution',
    blurb: "A central service that validates and versions event schemas — so a producer can't publish an event shape a consumer has no idea how to parse.",
    tag: 'Architecture Patterns',
    Component: demo({
      command: 'validate against the registry',
      before: [{ label: 'producer changes event shape silently', sub: 'consumers start failing to parse it, in production', color: 'var(--bad)' }],
      after: [{ label: 'producer registers schema v2, backward-compatible', sub: 'old and new consumers both keep working', color: 'var(--good)' }],
      note: {
        before: 'Without a shared, enforced contract, a producer can change what an event looks like at any time — every consumer relying on the old shape breaks.',
        after: "The registry validates a new schema version is backward-compatible before allowing it — consumers on the old schema keep working.",
      },
    }),
    code: [{ lang: 'json', snippet: `{\n  "subject": "OrderPlaced-value",\n  "version": 2,\n  "compatibility": "BACKWARD",\n  "schema": { "type": "record", "fields": [\n    { "name": "orderId", "type": "string" },\n    { "name": "total", "type": "double" },\n    { "name": "currency", "type": "string", "default": "USD" }\n  ]}\n}` }],
    realWorld:
      'Confluent Schema Registry (for Kafka, using Avro/Protobuf) exists specifically to prevent the exact class of incident where a schema change silently breaks every downstream consumer.',
    pitfall:
      "A schema registry only enforces what it's configured to enforce — a compatibility mode set too loosely doesn't actually block a breaking change from being published.",
    fix:
      "Set the registry's compatibility mode explicitly (usually BACKWARD or FULL) and treat a rejected schema registration as a hard CI failure, not a warning.",
  },
  {
    id: 'consumer-lag',
    section: 'events',
    title: 'Consumer Lag & Rebalancing',
    blurb: "Consumer lag is how far behind a consumer is from the latest published event — a rising lag means the consumer can't keep up with the rate events arrive.",
    tag: 'Reliability & Scale',
    Component: demo({
      command: 'add more consumers',
      before: [{ label: '1 consumer, lag climbing', sub: '10K → 50K → 200K events behind', color: 'var(--bad)' }],
      after: [{ label: 'scaled to 4 consumers (matching partition count)', sub: 'lag stabilizes and starts shrinking', color: 'var(--good)' }],
      note: {
        before: 'A single consumer processing events slower than they arrive falls progressively further behind.',
        after: 'Adding consumers (up to the number of partitions) lets processing happen in parallel — throughput increases and lag shrinks.',
      },
    }),
    code: [{ lang: 'bash', snippet: `kafka-consumer-groups --describe --group order-processor\n# TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG\n# orders  0          14200           14350           150\n# orders  1          14100           14380           280\n# rising LAG over time -> consumers can't keep up, add more (up to partition count)` }],
    realWorld:
      "Every team running Kafka in production monitors consumer lag as a core health metric — the earliest, clearest signal a consumer needs to scale out.",
    pitfall:
      'Adding more consumers than there are partitions does nothing — a partition can only be actively read by one consumer within a group at a time.',
    fix:
      "Scale partition count (harder to change later) to match the maximum parallelism you'll realistically need, since consumer count can never usefully exceed it.",
  },
  {
    id: 'log-compacted-topics',
    section: 'events',
    title: 'Log-Compacted Topics',
    blurb: 'A topic retention mode that keeps only the latest event per key, discarding older ones — turning an event log into something that behaves like a durable key-value snapshot.',
    tag: 'Reliability & Scale',
    Component: demo({
      command: 'compact by key',
      before: [{ label: 'user:42 updated 500 times', sub: 'all 500 events retained forever', color: 'var(--accent)' }],
      after: [{ label: 'compacted: only the latest event for user:42 kept', sub: '499 older versions discarded', color: 'var(--good)' }],
      note: {
        before: "A normal, time-based-retention topic keeps every single update — for an entity updated frequently, that's a lot of history nobody usually needs.",
        after: 'Compaction keeps just the most recent event per key — the topic behaves like a durable snapshot of current state rather than a full history log.',
      },
    }),
    code: [{ lang: 'text', snippet: `cleanup.policy=compact\n# for topic "user-profiles", keyed by user_id:\n# only the latest UserProfileUpdated event per user_id is retained\n# -> replaying the topic reconstructs current state for every user, not full history` }],
    realWorld:
      "Kafka Streams' internal state-store topics, and any \"current state of every entity\" use case, commonly use compacted topics instead of time-based retention.",
    pitfall:
      'Log compaction discards intermediate history — if a use case later needs "what did this look like at every point in time", a compacted topic has already permanently lost that information.',
    fix:
      'Use compaction specifically for "current state" use cases, and keep a separate, non-compacted topic (or a proper event-sourcing store) for anything needing full historical detail.',
  },
  {
    id: 'topic-partitioning',
    section: 'events',
    title: 'Topic Partitioning',
    blurb: 'Splitting a topic into multiple independent partitions is what enables parallel processing — throughput scales with partition count, and it caps concurrent consumers.',
    tag: 'Reliability & Scale',
    Component: demo({
      command: 'split into more partitions',
      before: [{ label: '1 partition, 1 consumer', sub: '1,000 events/sec throughput ceiling', color: 'var(--bad)' }],
      after: [{ label: '8 partitions, 8 consumers', sub: '~8,000 events/sec ceiling — scales roughly linearly', color: 'var(--good)' }],
      note: {
        before: 'A single partition can only be read by one consumer at a time within a group — throughput is capped at what that one consumer can process.',
        after: 'Eight independent partitions let eight consumers work in parallel — total throughput scales roughly linearly with partitions.',
      },
    }),
    code: [{ lang: 'bash', snippet: `kafka-topics --create --topic orders --partitions 8 --replication-factor 3\n# up to 8 consumers in one group can now process this topic in parallel` }],
    realWorld:
      "Every high-throughput Kafka deployment sizes partition count deliberately up front, since it caps maximum consumer parallelism for that topic's entire lifetime.",
    pitfall:
      "Increasing partition count on an existing topic doesn't repartition already-published events, and it can change which partition future events with the same key land on — breaking ordering for that key.",
    fix:
      'Provision partition count generously up front based on projected peak throughput — significantly easier to over-provision than to repartition a live, ordering-sensitive topic.',
  },
  {
    id: 'broker-vs-brokerless',
    section: 'events',
    title: 'Broker-Based vs Brokerless Messaging',
    blurb: 'A broker (Kafka, RabbitMQ) sits between producer and consumer, buffering and persisting messages; brokerless (ZeroMQ, direct webhooks) sends messages directly, with no intermediary.',
    tag: 'Reliability & Scale',
    Component: demo({
      command: 'add a broker',
      before: [{ label: 'direct HTTP webhook: consumer down → event lost forever', sub: 'no buffer, no replay, no persistence', color: 'var(--bad)' }],
      after: [{ label: 'via Kafka: consumer down → event waits in the topic', sub: 'processed whenever the consumer comes back', color: 'var(--good)' }],
      note: {
        before: 'A direct webhook call is delivered right now or not at all — if the receiver is down at that exact moment, the event is simply gone.',
        after: "The broker persists the event durably — a consumer that's temporarily down just picks up where it left off once it's back.",
      },
    }),
    code: [{ lang: 'text', snippet: `// Brokerless: direct, fragile\nawait fetch('https://consumer.example.com/webhook', { method: 'POST', body: event })\n// consumer down at this instant -> event is gone\n\n// Broker-based: durable, resilient\nproducer.send('orders-topic', event)\n// consumer processes whenever it's ready, even hours later` }],
    realWorld:
      'Kafka and RabbitMQ back most production event-driven systems for the durability and replay guarantees a broker provides — brokerless messaging trades that for lower latency and simplicity.',
    pitfall:
      "Running a message broker is real operational overhead (a stateful, clustered system to size, monitor, upgrade) — not every system's reliability requirements justify that cost.",
    fix:
      'Use brokerless, direct delivery for genuinely low-stakes, best-effort notifications where occasional loss is fine, and reserve a broker for events where durability actually matters.',
  },
]
