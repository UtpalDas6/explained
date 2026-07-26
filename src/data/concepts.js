import Caching from '../concepts/Caching.jsx'
import Sharding from '../concepts/Sharding.jsx'
import Replication from '../concepts/Replication.jsx'
import ConsistentHashing from '../concepts/ConsistentHashing.jsx'
import HorizontalPartitioning from '../concepts/HorizontalPartitioning.jsx'
import VerticalPartitioning from '../concepts/VerticalPartitioning.jsx'
import LoadBalancing from '../concepts/LoadBalancing.jsx'
import Cdn from '../concepts/Cdn.jsx'
import MessageQueue from '../concepts/MessageQueue.jsx'
import CapTheorem from '../concepts/CapTheorem.jsx'
import RateLimiting from '../concepts/RateLimiting.jsx'
import ProxyVsReverseProxy from '../concepts/ProxyVsReverseProxy.jsx'
import CircuitBreaker from '../concepts/CircuitBreaker.jsx'
import BloomFilter from '../concepts/BloomFilter.jsx'
import SnowflakeId from '../concepts/SnowflakeId.jsx'
import DistributedLock from '../concepts/DistributedLock.jsx'
import DatabaseIndexing from '../concepts/DatabaseIndexing.jsx'
import WebSocketVsPollingVsSse from '../concepts/WebSocketVsPollingVsSse.jsx'
import ApiGateway from '../concepts/ApiGateway.jsx'
import ConsistencyPatterns from '../concepts/ConsistencyPatterns.jsx'
import Failover from '../concepts/Failover.jsx'
import RdsProxy from '../concepts/RdsProxy.jsx'
import DnsResolution from '../concepts/DnsResolution.jsx'
import MasterReplicationTopology from '../concepts/MasterReplicationTopology.jsx'
import Federation from '../concepts/Federation.jsx'
import Denormalization from '../concepts/Denormalization.jsx'
import NoSqlDataModels from '../concepts/NoSqlDataModels.jsx'
import CacheWriteStrategies from '../concepts/CacheWriteStrategies.jsx'
import TaskQueueBackPressure from '../concepts/TaskQueueBackPressure.jsx'

// Registry of concepts. Add a new entry here to add a new concept to the app.
// `code` is a realistic snippet of how you'd actually implement/configure the concept
// in a real stack (not the visualization's own source) — `realWorld` is where it shows
// up in production systems.
export const concepts = [
  {
    id: 'caching',
    title: 'Caching',
    blurb: 'Requests check a fast cache before hitting the slow database.',
    tag: 'gsap + anime.js',
    Component: Caching,
    code: {
      lang: 'js',
      snippet: `// Cache-aside with Redis in front of Postgres
async function getUser(id) {
  const cached = await redis.get(\`user:\${id}\`)
  if (cached) return JSON.parse(cached)

  const user = await db.query('SELECT * FROM users WHERE id = $1', [id])
  await redis.set(\`user:\${id}\`, JSON.stringify(user), 'EX', 300) // 5 min TTL
  return user
}`,
    },
    realWorld:
      'Redis or Memcached in front of Postgres/MySQL for hot reads (user profiles, product pages, session data). Also how your browser\'s HTTP cache and a CDN edge behave for static assets.',
  },
  {
    id: 'sharding',
    title: 'Sharding',
    blurb: 'Data is split across nodes by a hash of its key.',
    tag: 'three.js',
    Component: Sharding,
    code: {
      lang: 'js',
      snippet: `// Route a key to one of N shard connection pools
function shardFor(userId, shardCount = 4) {
  const hash = crypto.createHash('md5').update(userId).digest('hex')
  const bucket = parseInt(hash.slice(0, 8), 16) % shardCount
  return shardPools[bucket]
}

const pool = shardFor(userId)
await pool.query('SELECT * FROM orders WHERE user_id = $1', [userId])`,
    },
    realWorld:
      'Vitess (used by YouTube, Slack) shards MySQL this way; MongoDB and Elasticsearch shard collections/indices across nodes automatically using the same hash-bucket idea.',
  },
  {
    id: 'replication',
    title: 'Replication',
    blurb: 'Writes on a primary propagate to replicas, sync or async.',
    tag: 'three.js',
    Component: Replication,
    code: {
      lang: 'js',
      snippet: `const primary = new Pool({ host: 'db-primary.internal' })
const replica = new Pool({ host: 'db-replica.internal' })

app.get('/posts', async (req, res) => {
  const { rows } = await replica.query('SELECT * FROM posts ORDER BY created_at DESC LIMIT 20')
  res.json(rows)
})
app.post('/posts', async (req, res) => {
  await primary.query('INSERT INTO posts (title, body) VALUES ($1, $2)', [req.body.title, req.body.body])
})`,
    },
    realWorld:
      'AWS RDS / Cloud SQL read replicas take exactly this shape: writes go to the primary endpoint, read-heavy endpoints (feeds, search, reporting) hit replica endpoints to keep load off the primary.',
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    blurb: 'Keys walk a ring to their node — adding/removing nodes remaps only a slice.',
    tag: 'gsap',
    Component: ConsistentHashing,
    code: {
      lang: 'js',
      snippet: `class HashRing {
  constructor(nodes) {
    this.ring = nodes
      .map((n) => ({ node: n, angle: hash(n) }))
      .sort((a, b) => a.angle - b.angle)
  }
  nodeFor(key) {
    const h = hash(key)
    return this.ring.find((n) => n.angle >= h)?.node ?? this.ring[0].node
  }
}`,
    },
    realWorld:
      'DynamoDB and Cassandra partition data across nodes this way. Memcached client libraries (ketama) and most CDN request routers use the same trick so adding a cache node doesn\'t invalidate everything at once.',
  },
  {
    id: 'horizontal-partitioning',
    title: 'Horizontal Partitioning',
    blurb: 'Rows are split across tables by an ordered key range, same schema everywhere.',
    tag: 'three.js',
    Component: HorizontalPartitioning,
    code: {
      lang: 'sql',
      snippet: `-- Native range partitioning in Postgres
CREATE TABLE orders (
  id bigint, created_at timestamp, total numeric
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');`,
    },
    realWorld:
      'Postgres/MySQL declarative partitioning for time-series-shaped tables (orders, logs, events) so old partitions can be dropped or archived cheaply. BigQuery and Snowflake partition tables the same way for query pruning.',
  },
  {
    id: 'vertical-partitioning',
    title: 'Vertical Partitioning',
    blurb: 'Columns are split into separate tables by access pattern, joined by a key.',
    tag: 'framer-motion',
    Component: VerticalPartitioning,
    code: {
      lang: 'sql',
      snippet: `-- Split a wide, frequently-scanned users table
CREATE TABLE users_core (id bigint PRIMARY KEY, name text, email text);
CREATE TABLE users_profile (
  user_id bigint REFERENCES users_core(id),
  bio text, avatar_url text, preferences jsonb
);`,
    },
    realWorld:
      'Pulling rarely-read blobs (bio, avatar, preferences) out of a hot users table so the common query path (auth lookups) scans a smaller, cache-friendlier table — a common step when a monolith\'s "users" table has grown huge.',
  },
  {
    id: 'load-balancing',
    title: 'Load Balancing',
    blurb: 'A load balancer spreads requests across servers by round-robin, random, or least-connections.',
    tag: 'three.js',
    Component: LoadBalancing,
    code: {
      lang: 'nginx',
      snippet: `upstream app_servers {
  least_conn;
  server 10.0.1.10:3000;
  server 10.0.1.11:3000;
  server 10.0.1.12:3000;
}

server {
  location / {
    proxy_pass http://app_servers;
  }
}`,
    },
    realWorld:
      'nginx/HAProxy upstream blocks, AWS ALB target groups, and a Kubernetes Service (via kube-proxy or an Envoy sidecar) all implement one of these algorithms to spread traffic across pods/instances.',
  },
  {
    id: 'cdn',
    title: 'CDN',
    blurb: 'Edge nodes cache content close to users; only the first request per edge hits the distant origin.',
    tag: 'three.js',
    Component: Cdn,
    code: {
      lang: 'http',
      snippet: `GET /app.css HTTP/1.1
Host: cdn.example.com

HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000, immutable
Age: 4213
X-Cache: HIT`,
    },
    realWorld:
      'Cloudflare, Fastly, and CloudFront serve static assets (and increasingly full HTML pages) from edge PoPs near the user, only reaching back to origin on a cache miss or once the `max-age` TTL expires.',
  },
  {
    id: 'message-queue',
    title: 'Message Queue',
    blurb: 'A producer and consumer talk through a FIFO queue instead of directly.',
    tag: 'three.js',
    Component: MessageQueue,
    code: {
      lang: 'js',
      snippet: `// Producer — API handler, returns immediately
await channel.sendToQueue('emails', Buffer.from(JSON.stringify({ to, subject })))
res.status(202).json({ queued: true })

// Consumer — separate worker process
channel.consume('emails', async (msg) => {
  await sendEmail(JSON.parse(msg.content.toString()))
  channel.ack(msg)
})`,
    },
    realWorld:
      'RabbitMQ or SQS decoupling a slow operation (sending an email, generating a PDF, calling a flaky third-party API) from the request that triggered it, so the API can respond instantly.',
  },
  {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    blurb: 'During a network partition you must choose: reject writes (CP) or risk divergence (AP).',
    tag: 'gsap',
    Component: CapTheorem,
    code: {
      lang: 'js',
      snippet: `// Cassandra: consistency level chosen per query
await client.execute(query, params, { consistencyLevel: 'QUORUM' }) // CP-leaning
await client.execute(query, params, { consistencyLevel: 'ONE' })    // AP-leaning, faster, may read stale`,
    },
    realWorld:
      'Cassandra\'s tunable consistency levels and DynamoDB\'s choice between "eventually consistent" (default, cheaper, faster) and "strongly consistent" reads are CAP made into an API parameter.',
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting',
    blurb: 'A token bucket absorbs bursts, then rejects requests once it runs dry.',
    tag: 'gsap',
    Component: RateLimiting,
    code: {
      lang: 'js',
      snippet: `const key = \`ratelimit:\${userId}\`
const count = await redis.incr(key)
if (count === 1) await redis.expire(key, 60)
if (count > 100) return res.status(429).send('Too Many Requests')`,
    },
    realWorld:
      'API gateways (Kong, AWS API Gateway) and middleware like express-rate-limit enforce exactly this. Stripe and GitHub publish their rate limits and `Retry-After` headers built on the same token-bucket idea.',
  },
  {
    id: 'proxy-vs-reverse-proxy',
    title: 'Proxy vs Reverse Proxy',
    blurb: 'A forward proxy hides the client; a reverse proxy hides the server.',
    tag: 'gsap',
    Component: ProxyVsReverseProxy,
    code: {
      lang: 'nginx',
      snippet: `# Reverse proxy: client only ever talks to nginx,
# never learns which backend instance answered
location /api/ {
  proxy_pass http://internal_service:8080;
  proxy_set_header Host $host;
}`,
    },
    realWorld:
      'nginx/Envoy sitting in front of a microservice fleet is a reverse proxy. A corporate outbound proxy or a VPN client is a forward proxy — the destination site sees the proxy\'s IP, not the employee\'s.',
  },
  {
    id: 'circuit-breaker',
    title: 'Circuit Breaker',
    blurb: 'Repeated failures trip the breaker open, failing fast until a trial request succeeds again.',
    tag: 'state machine',
    Component: CircuitBreaker,
    code: {
      lang: 'js',
      snippet: `const breaker = new CircuitBreaker(callPaymentService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
})
breaker.fallback(() => ({ status: 'queued for retry' }))

const result = await breaker.fire(order)`,
    },
    realWorld:
      'resilience4j (Java) and opossum (Node.js) — successors to Netflix\'s original Hystrix — wrap exactly this pattern around calls to flaky downstream services, so one slow dependency doesn\'t take down the whole request pipeline.',
  },
  {
    id: 'bloom-filter',
    title: 'Bloom Filter',
    blurb: 'A compact bit array that can say "definitely not present" or "maybe present" — never a false negative.',
    tag: 'hashing',
    Component: BloomFilter,
    code: {
      lang: 'js',
      snippet: `const filter = new BloomFilter(1_000_000, 4) // ~1M items, 4 hash fns
filter.add(email)

if (!filter.has(email)) {
  // definitely new — safe to skip an expensive DB lookup
}`,
    },
    realWorld:
      'Chrome\'s Safe Browsing list, Medium\'s "already read this" tracking, and Cassandra/HBase all use a Bloom filter to cheaply skip a disk read when they can prove something isn\'t there.',
  },
  {
    id: 'snowflake-id',
    title: 'Unique ID Generation',
    blurb: 'Snowflake IDs pack a timestamp, machine id, and sequence into one sortable 64-bit number.',
    tag: 'bit-packing',
    Component: SnowflakeId,
    code: {
      lang: 'js',
      snippet: `const generator = new Snowflake({ machineId: 3, epoch: 1704067200000 })
const id = generator.nextId() // e.g. 7123456789012345n — sortable by creation time`,
    },
    realWorld:
      'Twitter\'s original Snowflake service, Discord message IDs, and Instagram\'s sharded ID generator all use this scheme so every service instance can mint globally-unique, roughly-time-ordered IDs with zero coordination.',
  },
  {
    id: 'distributed-lock',
    title: 'Distributed Lock',
    blurb: 'Only one client holds the lock at a time; others queue until it is released.',
    tag: 'mutex',
    Component: DistributedLock,
    code: {
      lang: 'js',
      snippet: `// Redlock pattern against Redis
const lock = await redlock.acquire([\`lock:invoice:\${id}\`], 5000)
try {
  await processInvoice(id)
} finally {
  await lock.release()
}`,
    },
    realWorld:
      'Preventing a payment webhook that got delivered twice from double-charging a customer, or electing a single leader among several instances of a scheduled job so it doesn\'t run N times at once.',
  },
  {
    id: 'database-indexing',
    title: 'Database Indexing',
    blurb: 'B-Trees optimize for fast reads; LSM-Trees optimize for fast, append-only writes.',
    tag: 'trees',
    Component: DatabaseIndexing,
    code: {
      lang: 'sql',
      snippet: `-- Postgres/MySQL: B-Tree by default
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Cassandra/RocksDB/LevelDB: LSM-Tree under the hood,
-- optimized for the exact write-heavy path this app has.`,
    },
    realWorld:
      'Adding `CREATE INDEX` to fix a slow `WHERE` clause in Postgres is using a B-Tree. Choosing Cassandra or ScyllaDB for a write-heavy event pipeline is choosing an LSM-Tree storage engine instead.',
  },
  {
    id: 'websocket-vs-polling-vs-sse',
    title: 'WebSocket vs Polling vs SSE',
    blurb: 'Three ways a client stays updated, from repeated round trips to one open connection.',
    tag: 'gsap',
    Component: WebSocketVsPollingVsSse,
    code: {
      lang: 'js',
      snippet: `// Server-Sent Events endpoint
app.get('/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
  const send = (data) => res.write(\`data: \${JSON.stringify(data)}\\n\\n\`)
  bus.on('update', send)
  req.on('close', () => bus.off('update', send))
})`,
    },
    realWorld:
      'Slack and Discord use WebSockets for chat (bidirectional, low latency). Live dashboards and stock tickers often use SSE (server-only push, simpler than WebSocket). A basic "check for new notifications" widget is usually just polling.',
  },
  {
    id: 'api-gateway',
    title: 'API Gateway',
    blurb: 'One entry point routes by path to different services and enforces auth/rate-limits centrally.',
    tag: 'three.js',
    Component: ApiGateway,
    code: {
      lang: 'yaml',
      snippet: `# Kong route configuration
routes:
  - paths: ["/orders"]
    service: orders-service
    plugins:
      - rate-limiting: { minute: 100 }
      - jwt: {}`,
    },
    realWorld:
      'Kong, AWS API Gateway, and Apigee sit in front of a microservice fleet doing exactly this: one place to enforce auth and rate limits instead of every service reimplementing it.',
  },
  {
    id: 'consistency-patterns',
    title: 'Consistency Patterns',
    blurb: 'Weak, eventual, and strong consistency differ in whether a read right after a write sees it.',
    tag: 'gsap',
    Component: ConsistencyPatterns,
    code: {
      lang: 'js',
      snippet: `// DynamoDB: consistency is a per-read parameter
await dynamo.get({ TableName, Key, ConsistentRead: false }) // eventual (default, cheaper)
await dynamo.get({ TableName, Key, ConsistentRead: true })  // strong (costs more, always fresh)`,
    },
    realWorld:
      'DynamoDB\'s `ConsistentRead` flag and MongoDB\'s read/write concern levels expose this exact tradeoff directly in the client API, per query.',
  },
  {
    id: 'failover',
    title: 'Failover',
    blurb: 'Active-passive has a real outage gap while a standby promotes; active-active has none.',
    tag: 'state machine',
    Component: Failover,
    code: {
      lang: 'yaml',
      snippet: `# AWS RDS: automatic active-passive failover
Engine: postgres
MultiAZ: true # standby in another AZ, promoted automatically on primary failure`,
    },
    realWorld:
      'AWS RDS Multi-AZ (active-passive) vs. a multi-region active-active API behind global load balancing (Cloudflare, Route 53 latency routing) — the RDS failover has a real (short) outage window; the active-active setup doesn\'t.',
  },
  {
    id: 'rds-proxy',
    title: 'RDS Proxy',
    blurb: 'A pooling proxy multiplexes many app connections onto a few real DB connections, and hides failover from clients.',
    tag: 'state machine',
    Component: RdsProxy,
    code: {
      lang: 'js',
      snippet: `// Lambda connects to the proxy endpoint, not the DB directly —
// the proxy holds a small pool of real Postgres connections open
// and reuses them across thousands of short-lived invocations
const client = new Client({ host: 'myapp.proxy-abc123.us-east-1.rds.amazonaws.com' })
await client.connect()
await client.query('SELECT * FROM orders WHERE id = $1', [id])`,
    },
    realWorld:
      'AWS RDS Proxy sitting in front of a Lambda-triggered API so a traffic spike opens thousands of function invocations without each one grabbing (and exhausting) a raw Postgres connection, and so a Multi-AZ failover reconnects the pool instead of erroring out every client at once.',
  },
  {
    id: 'dns-resolution',
    title: 'DNS Resolution',
    blurb: 'A resolver walks root → TLD → authoritative servers, then caches the answer until its TTL expires.',
    tag: 'gsap',
    Component: DnsResolution,
    code: {
      lang: 'bash',
      snippet: `$ dig example.com

;; ANSWER SECTION:
example.com.  300  IN  A  93.184.216.34   ; TTL = 300s`,
    },
    realWorld:
      'Route 53 / Cloudflare DNS and your ISP\'s resolver do exactly this recursive walk once, then cache. Lowering a record\'s TTL before a migration trades cache efficiency for faster failover.',
  },
  {
    id: 'master-replication-topology',
    title: 'Master-Slave vs Master-Master',
    blurb: 'One writer never conflicts; two writers scale writes but can disagree before they sync.',
    tag: 'state machine',
    Component: MasterReplicationTopology,
    code: {
      lang: 'sql',
      snippet: `-- MySQL multi-primary needs offset auto_increment to avoid PK collisions
SET GLOBAL auto_increment_increment = 2;
SET GLOBAL auto_increment_offset = 1; -- node 1: 1,3,5…  node 2: 2,4,6…`,
    },
    realWorld:
      'MySQL Group Replication and Postgres BDR support multi-primary, but most teams default to single-primary (master-slave) specifically to avoid building conflict resolution — it\'s a real ongoing engineering cost.',
  },
  {
    id: 'federation',
    title: 'Federation',
    blurb: 'Splitting one database into several by function trades cross-table joins for independent scaling.',
    tag: 'framer-motion',
    Component: Federation,
    code: {
      lang: 'js',
      snippet: `// Two separate connection pools — the join now happens in app code
const user = await usersDb.query('SELECT * FROM users WHERE id = $1', [id])
const orders = await ordersDb.query('SELECT * FROM orders WHERE user_id = $1', [id])
return { ...user, orders }`,
    },
    realWorld:
      'The standard first step when splitting a monolith into microservices: give "users", "orders", and "products" their own databases along service boundaries before splitting the application code itself.',
  },
  {
    id: 'denormalization',
    title: 'Denormalization',
    blurb: 'Duplicating data trades a slower join for a single fast lookup — and N writes instead of one.',
    tag: 'tradeoff',
    Component: Denormalization,
    code: {
      lang: 'sql',
      snippet: `-- Denormalized: the order row carries a copy of the customer's name,
-- so listing orders never has to join back to users
ALTER TABLE orders ADD COLUMN customer_name text;`,
    },
    realWorld:
      'Read-heavy analytics tables, materialized views, and most NoSQL document models (MongoDB, DynamoDB) lean on denormalization by default since cheap joins usually aren\'t even available.',
  },
  {
    id: 'nosql-data-models',
    title: 'NoSQL Data Models',
    blurb: 'The same record shaped four ways: key-value, document, wide-column, and graph.',
    tag: 'compare',
    Component: NoSqlDataModels,
    code: {
      lang: 'js',
      snippet: `// Document (MongoDB)
db.users.insertOne({ _id: 1, name: 'Ada', tags: ['admin'] })

// Key-value (Redis)
await redis.set('user:1', JSON.stringify({ name: 'Ada' }))`,
    },
    realWorld:
      'MongoDB for flexible product catalogs, Redis for sessions/cache, Cassandra for write-heavy time-series data, Neo4j for fraud rings and recommendation graphs — picking the model to fit the access pattern.',
  },
  {
    id: 'cache-write-strategies',
    title: 'Cache Write Strategies',
    blurb: 'Cache-aside, write-through, write-behind, and refresh-ahead move data between cache and DB differently.',
    tag: 'gsap',
    Component: CacheWriteStrategies,
    code: {
      lang: 'js',
      snippet: `// write-through: never inconsistent, slower writes
await cache.set(key, value)
await db.write(key, value)

// write-behind: instant ack, DB catches up async
await cache.set(key, value)
flushQueue.push({ key, value })`,
    },
    realWorld:
      'Write-through for anything financial (never allowed to be stale). Write-behind for high-throughput counters like "likes" or view counts, where losing the last few increments on a crash is an acceptable tradeoff for speed.',
  },
  {
    id: 'task-queue-back-pressure',
    title: 'Task Queue & Back Pressure',
    blurb: 'A worker pool drains a bounded queue; once it is full, new submissions are rejected outright.',
    tag: 'three.js',
    Component: TaskQueueBackPressure,
    code: {
      lang: 'js',
      snippet: `const queue = new Queue('image-resize', { redis, defaultJobOptions: { attempts: 3 } })
queue.process(5, async (job) => resizeImage(job.data)) // 5 concurrent workers

await queue.add(uploadData) // rejects/backs off once the queue is saturated`,
    },
    realWorld:
      'Sidekiq (Ruby), BullMQ (Node), and Celery (Python) all implement this: a bounded job queue with a worker pool for uploads, emails, and report generation, with back pressure to stop the queue from growing unbounded under load.',
  },
]
