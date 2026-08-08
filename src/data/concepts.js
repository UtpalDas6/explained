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
    youtubeId: 'nXYs7WS5Ez8',
    code: [
      {
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
      {
        lang: 'python',
        snippet: `# Cache-aside with Redis in front of Postgres
async def get_user(id):
    cached = await redis.get(f'user:{id}')
    if cached:
        return json.loads(cached)

    user = await db.fetch_one('SELECT * FROM users WHERE id = $1', id)
    await redis.set(f'user:{id}', json.dumps(user), ex=300)  # 5 min TTL
    return user`,
      },
    ],
    realWorld:
      'Redis or Memcached in front of Postgres/MySQL for hot reads (user profiles, product pages, session data). Also how your browser\'s HTTP cache and a CDN edge behave for static assets.',
    pitfall:
      'Stale reads are the default failure mode: without explicit invalidation on write, users can see old data until the TTL expires — TTL-only caching trades correctness for simplicity.',
    fix:
      'Invalidate (or update) the cache entry on every write that touches the same key, not just on read misses — cache-aside plus write invalidation, or switch to write-through if staleness is unacceptable.',
  },
  {
    id: 'sharding',
    title: 'Sharding',
    blurb: 'Data is split across nodes by a hash of its key.',
    tag: 'three.js',
    Component: Sharding,
    youtubeId: '92z3SUcNgb8',
    code: [
      {
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
      {
        lang: 'python',
        snippet: `# Route a key to one of N shard connection pools
def shard_for(user_id, shard_count=4):
    digest = hashlib.md5(user_id.encode()).hexdigest()
    bucket = int(digest[:8], 16) % shard_count
    return shard_pools[bucket]

pool = shard_for(user_id)
await pool.fetch('SELECT * FROM orders WHERE user_id = $1', user_id)`,
      },
    ],
    realWorld:
      'Vitess (used by YouTube, Slack) shards MySQL this way; MongoDB and Elasticsearch shard collections/indices across nodes automatically using the same hash-bucket idea.',
    pitfall:
      'Cross-shard queries and joins get slow or impossible, and resharding later means migrating live data across nodes — pick the shard key carefully upfront, because changing it is expensive.',
    fix:
      'Choose a shard key that matches your most common query pattern, so most queries hit one shard, and build resharding tooling (consistent hashing, virtual shards) before you need it, not during an emergency.',
  },
  {
    id: 'replication',
    title: 'Replication',
    blurb: 'Writes on a primary propagate to replicas, sync or async.',
    tag: 'three.js',
    Component: Replication,
    youtubeId: 'UZqZy05Z8pY',
    code: [
      {
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
      {
        lang: 'python',
        snippet: `primary = await asyncpg.create_pool(host='db-primary.internal')
replica = await asyncpg.create_pool(host='db-replica.internal')

@app.get('/posts')
async def list_posts():
    return await replica.fetch('SELECT * FROM posts ORDER BY created_at DESC LIMIT 20')

@app.post('/posts')
async def create_post(post: PostIn):
    await primary.execute('INSERT INTO posts (title, body) VALUES ($1, $2)', post.title, post.body)`,
      },
    ],
    realWorld:
      'AWS RDS / Cloud SQL read replicas take exactly this shape: writes go to the primary endpoint, read-heavy endpoints (feeds, search, reporting) hit replica endpoints to keep load off the primary.',
    pitfall:
      'Async replication lags behind the primary — a read right after a write can miss it entirely, which is a real bug ("I just saved this, where did it go?") if the app doesn\'t read its own writes from the primary.',
    fix:
      'Read from the primary immediately after a write in the same request or session (read-your-writes), or track replica lag and route read-after-write traffic to the primary until the replica catches up.',
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    blurb: 'Keys walk a ring to their node — adding/removing nodes remaps only a slice.',
    tag: 'gsap',
    Component: ConsistentHashing,
    youtubeId: 'C7tnEewba1I',
    code: [
      {
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
      {
        lang: 'python',
        snippet: `class HashRing:
    def __init__(self, nodes):
        self.ring = sorted(((node_hash(n), n) for n in nodes))

    def node_for(self, key):
        h = node_hash(key)
        for angle, node in self.ring:
            if angle >= h:
                return node
        return self.ring[0][1]`,
      },
    ],
    realWorld:
      'DynamoDB and Cassandra partition data across nodes this way. Memcached client libraries (ketama) and most CDN request routers use the same trick so adding a cache node doesn\'t invalidate everything at once.',
    pitfall:
      'Naive hashing gives poor key distribution across a small node count; production systems need virtual nodes per physical node to avoid hot spots and lopsided load.',
    fix:
      'Add multiple virtual nodes per physical node (100-200 is typical) so the ring has enough points to average out uneven load, even with only a handful of real nodes.',
  },
  {
    id: 'horizontal-partitioning',
    title: 'Horizontal Partitioning',
    blurb: 'Rows are split across tables by an ordered key range, same schema everywhere.',
    tag: 'three.js',
    Component: HorizontalPartitioning,
    youtubeId: 'WauNLW96DWg',
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
    pitfall:
      'Any query that doesn\'t include the partition key scans every partition — often slower than an unpartitioned table, since partitioning only helps the access pattern it was designed around.',
    fix:
      'Always include the partition key in the WHERE clause, and add a secondary index or a lookup table if you genuinely need to query by a different column often.',
  },
  {
    id: 'vertical-partitioning',
    title: 'Vertical Partitioning',
    blurb: 'Columns are split into separate tables by access pattern, joined by a key.',
    tag: 'framer-motion',
    Component: VerticalPartitioning,
    youtubeId: 'a9zgQrTvU8g',
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
    pitfall:
      'Any query that needs both halves now pays an extra join or round trip, so splitting a table that\'s usually queried as a whole just adds latency for no benefit.',
    fix:
      'Only split off columns that are rarely read together with the hot path — keep anything commonly joined in the same table, and denormalize a few hot fields back if the join shows up in a profiler.',
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
    pitfall:
      'Round-robin and random ignore actual server load, and sticky sessions quietly defeat the whole point of load balancing if the app isn\'t actually stateless underneath.',
    fix:
      'Use least-connections or a latency-aware algorithm instead of round-robin for uneven workloads, and move session state out of the app server (Redis, JWT) so sticky sessions aren\'t needed at all.',
  },
  {
    id: 'cdn',
    title: 'CDN',
    blurb: 'Edge nodes cache content close to users; only the first request per edge hits the distant origin.',
    tag: 'three.js',
    Component: Cdn,
    youtubeId: '3qGMjqMk_FA',
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
    pitfall:
      'Cached at the edge means a bad deploy or bug stays live at every PoP until the TTL expires or someone triggers an explicit purge — a CDN rollback isn\'t instant.',
    fix:
      'Version your asset URLs (a hash in the filename) so a new deploy is a new URL instead of a cache-busting problem, and keep an automated purge step in your deploy pipeline for anything that can\'t be versioned.',
  },
  {
    id: 'message-queue',
    title: 'Message Queue',
    blurb: 'A producer and consumer talk through a FIFO queue instead of directly.',
    tag: 'three.js',
    Component: MessageQueue,
    youtubeId: 'WJbP0apHdrw',
    code: [
      {
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
      {
        lang: 'python',
        snippet: `# Producer — API handler, returns immediately
channel.basic_publish(exchange='', routing_key='emails', body=json.dumps({'to': to, 'subject': subject}))
return {'queued': True}, 202

# Consumer — separate worker process
def on_message(ch, method, properties, body):
    send_email(json.loads(body))
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue='emails', on_message_callback=on_message)`,
      },
    ],
    realWorld:
      'RabbitMQ or SQS decoupling a slow operation (sending an email, generating a PDF, calling a flaky third-party API) from the request that triggered it, so the API can respond instantly.',
    pitfall:
      'Decoupling buys resilience but adds a new failure mode: a message that\'s never successfully processed (a poison message) can silently stall the whole pipeline without a dead-letter queue to catch it.',
    fix:
      'Set a max retry count per message and route anything that exceeds it to a dead-letter queue, so one bad message can\'t block every message behind it.',
  },
  {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    blurb: 'During a network partition you must choose: reject writes (CP) or risk divergence (AP).',
    tag: 'gsap',
    Component: CapTheorem,
    youtubeId: 'sPRRNpg8n8g',
    code: [
      {
        lang: 'js',
        snippet: `// Cassandra: consistency level chosen per query
await client.execute(query, params, { consistencyLevel: 'QUORUM' }) // CP-leaning
await client.execute(query, params, { consistencyLevel: 'ONE' })    // AP-leaning, faster, may read stale`,
      },
      {
        lang: 'python',
        snippet: `# Cassandra: consistency level chosen per query
session.execute(query, params, consistency_level=ConsistencyLevel.QUORUM)  # CP-leaning
session.execute(query, params, consistency_level=ConsistencyLevel.ONE)     # AP-leaning, faster, may read stale`,
      },
    ],
    realWorld:
      'Cassandra\'s tunable consistency levels and DynamoDB\'s choice between "eventually consistent" (default, cheaper, faster) and "strongly consistent" reads are CAP made into an API parameter.',
    pitfall:
      'CAP only bites during an actual network partition — teams often over-engineer for partition tolerance when, in their real deployment, partitions are rare, short, and not the thing that\'s actually going to hurt them.',
    fix:
      'Measure actual partition frequency and duration before optimizing for it — most systems are better served defaulting to strong consistency and only relaxing it where a specific, measured need justifies the complexity.',
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting',
    blurb: 'A token bucket absorbs bursts, then rejects requests once it runs dry.',
    tag: 'gsap',
    Component: RateLimiting,
    code: [
      {
        lang: 'js',
        snippet: `const key = \`ratelimit:\${userId}\`
const count = await redis.incr(key)
if (count === 1) await redis.expire(key, 60)
if (count > 100) return res.status(429).send('Too Many Requests')`,
      },
      {
        lang: 'python',
        snippet: `key = f'ratelimit:{user_id}'
count = await redis.incr(key)
if count == 1:
    await redis.expire(key, 60)
if count > 100:
    raise HTTPException(status_code=429, detail='Too Many Requests')`,
      },
    ],
    realWorld:
      'API gateways (Kong, AWS API Gateway) and middleware like express-rate-limit enforce exactly this. Stripe and GitHub publish their rate limits and `Retry-After` headers built on the same token-bucket idea.',
    pitfall:
      'A rate limit enforced with an in-memory counter per app instance doesn\'t limit anything once there\'s more than one instance — it needs a shared store like Redis to actually be correct under concurrency.',
    fix:
      'Back the counter with a shared store like Redis (INCR + EXPIRE) so every app instance reads and writes the same count, or move rate limiting to a shared layer like an API gateway.',
  },
  {
    id: 'proxy-vs-reverse-proxy',
    title: 'Proxy vs Reverse Proxy',
    blurb: 'A forward proxy hides the client; a reverse proxy hides the server.',
    tag: 'gsap',
    Component: ProxyVsReverseProxy,
    youtubeId: 'k1J9Gqa-Cz0',
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
    pitfall:
      'Mixing the two up is the most common mistake: a misconfigured reverse proxy that leaks backend headers or internal hostnames defeats the entire reason for putting it there.',
    fix:
      'Strip or overwrite identifying headers (Server, X-Powered-By, internal hostnames) at the proxy layer, and test what an external client actually sees, not just what the config file claims to hide.',
  },
  {
    id: 'circuit-breaker',
    title: 'Circuit Breaker',
    blurb: 'Repeated failures trip the breaker open, failing fast until a trial request succeeds again.',
    tag: 'state machine',
    Component: CircuitBreaker,
    youtubeId: '91aLUfHS56Q',
    code: [
      {
        lang: 'js',
        snippet: `const breaker = new CircuitBreaker(callPaymentService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
})
breaker.fallback(() => ({ status: 'queued for retry' }))

const result = await breaker.fire(order)`,
      },
      {
        lang: 'python',
        snippet: `breaker = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=10)

@breaker
def call_payment_service(order):
    return payment_client.charge(order)

try:
    result = call_payment_service(order)
except pybreaker.CircuitBreakerError:
    result = {'status': 'queued for retry'}`,
      },
    ],
    realWorld:
      'resilience4j (Java) and opossum (Node.js) — successors to Netflix\'s original Hystrix — wrap exactly this pattern around calls to flaky downstream services, so one slow dependency doesn\'t take down the whole request pipeline.',
    pitfall:
      'Too sensitive a threshold trips on normal blips and fails healthy requests; too loose a one lets a genuinely broken dependency keep timing out every request instead of failing fast.',
    fix:
      'Tune the error-rate threshold and reset timeout against real traffic patterns instead of guesses, and always pair it with a fallback response so a tripped breaker degrades gracefully instead of failing hard.',
  },
  {
    id: 'bloom-filter',
    title: 'Bloom Filter',
    blurb: 'A compact bit array that can say "definitely not present" or "maybe present" — never a false negative.',
    tag: 'hashing',
    Component: BloomFilter,
    youtubeId: 'Vxdcj2Gu9AM',
    code: [
      {
        lang: 'js',
        snippet: `const filter = new BloomFilter(1_000_000, 4) // ~1M items, 4 hash fns
filter.add(email)

if (!filter.has(email)) {
  // definitely new — safe to skip an expensive DB lookup
}`,
      },
      {
        lang: 'python',
        snippet: `bf = BloomFilter(capacity=1_000_000, error_rate=0.001)
bf.add(email)

if email not in bf:
    # definitely new — safe to skip an expensive DB lookup
    pass`,
      },
    ],
    realWorld:
      'Chrome\'s Safe Browsing list, Medium\'s "already read this" tracking, and Cassandra/HBase all use a Bloom filter to cheaply skip a disk read when they can prove something isn\'t there.',
    pitfall:
      'False positives are guaranteed by design (never false negatives) — using a Bloom filter as the actual source of truth instead of a cheap pre-filter in front of a real lookup will silently return wrong answers.',
    fix:
      'Always treat a Bloom filter as a pre-filter in front of the real check, never as the final answer — a positive result should still trigger the actual lookup.',
  },
  {
    id: 'snowflake-id',
    title: 'Unique ID Generation',
    blurb: 'Snowflake IDs pack a timestamp, machine id, and sequence into one sortable 64-bit number.',
    tag: 'bit-packing',
    Component: SnowflakeId,
    youtubeId: '2BQL_Dj4N-g',
    code: [
      {
        lang: 'js',
        snippet: `const generator = new Snowflake({ machineId: 3, epoch: 1704067200000 })
const id = generator.nextId() // e.g. 7123456789012345n — sortable by creation time`,
      },
      {
        lang: 'python',
        snippet: `generator = Snowflake(machine_id=3, epoch=1704067200000)
id = generator.next_id()  # e.g. 7123456789012345 — sortable by creation time`,
      },
    ],
    realWorld:
      'Twitter\'s original Snowflake service, Discord message IDs, and Instagram\'s sharded ID generator all use this scheme so every service instance can mint globally-unique, roughly-time-ordered IDs with zero coordination.',
    pitfall:
      'Clock skew, leap seconds, or an NTP correction that moves the clock backward can produce duplicate or out-of-order IDs unless the generator explicitly detects and guards against it.',
    fix:
      'Detect backward clock jumps explicitly and either wait it out or fail the generator rather than emitting IDs — most implementations also rely on NTP with monotonic clock guards to avoid this in the first place.',
  },
  {
    id: 'distributed-lock',
    title: 'Distributed Lock',
    blurb: 'Only one client holds the lock at a time; others queue until it is released.',
    tag: 'mutex',
    Component: DistributedLock,
    youtubeId: '96iiKRBX3eg',
    code: [
      {
        lang: 'js',
        snippet: `// Redlock pattern against Redis
const lock = await redlock.acquire([\`lock:invoice:\${id}\`], 5000)
try {
  await processInvoice(id)
} finally {
  await lock.release()
}`,
      },
      {
        lang: 'python',
        snippet: `# Redlock pattern against Redis
lock = redlock.lock(f'lock:invoice:{id}', ttl=5000)
try:
    process_invoice(id)
finally:
    redlock.unlock(lock)`,
      },
    ],
    realWorld:
      'Preventing a payment webhook that got delivered twice from double-charging a customer, or electing a single leader among several instances of a scheduled job so it doesn\'t run N times at once.',
    pitfall:
      'A lock held past its TTL — because the client stalled — can expire and let a second client acquire it too, both now believing they hold exclusive access; this exact edge case is why Redlock\'s safety guarantees are disputed.',
    fix:
      'Keep the critical section shorter than the lock TTL, heartbeat the lock while work is still in progress, and use a fencing token so a late or stale holder\'s writes get rejected even if it thinks it still owns the lock.',
  },
  {
    id: 'database-indexing',
    title: 'Database Indexing',
    blurb: 'B-Trees optimize for fast reads; LSM-Trees optimize for fast, append-only writes.',
    tag: 'trees',
    Component: DatabaseIndexing,
    youtubeId: 'BkwgzVN7lOc',
    code: {
      lang: 'sql',
      snippet: `-- Postgres/MySQL: B-Tree by default
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Cassandra/RocksDB/LevelDB: LSM-Tree under the hood,
-- optimized for the exact write-heavy path this app has.`,
    },
    realWorld:
      'Adding `CREATE INDEX` to fix a slow `WHERE` clause in Postgres is using a B-Tree. Choosing Cassandra or ScyllaDB for a write-heavy event pipeline is choosing an LSM-Tree storage engine instead.',
    pitfall:
      'Every index speeds up the reads it was built for but slows every write to that table, and an index the query planner never actually uses is pure overhead — more indexes isn\'t automatically faster.',
    fix:
      'Index only the columns your actual query patterns filter or sort by, and periodically audit for indexes the query planner never uses — most databases expose usage stats for exactly this.',
  },
  {
    id: 'websocket-vs-polling-vs-sse',
    title: 'WebSocket vs Polling vs SSE',
    blurb: 'Three ways a client stays updated, from repeated round trips to one open connection.',
    tag: 'gsap',
    Component: WebSocketVsPollingVsSse,
    youtubeId: 'nyu4i0rbHrw',
    code: [
      {
        lang: 'js',
        snippet: `// Server-Sent Events endpoint
app.get('/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
  const send = (data) => res.write(\`data: \${JSON.stringify(data)}\\n\\n\`)
  bus.on('update', send)
  req.on('close', () => bus.off('update', send))
})`,
      },
      {
        lang: 'python',
        snippet: `# Server-Sent Events endpoint
@app.get('/events')
async def events():
    async def stream():
        async for update in bus.subscribe('update'):
            yield f'data: {json.dumps(update)}\\n\\n'
    return StreamingResponse(stream(), media_type='text/event-stream')`,
      },
    ],
    realWorld:
      'Slack and Discord use WebSockets for chat (bidirectional, low latency). Live dashboards and stock tickers often use SSE (server-only push, simpler than WebSocket). A basic "check for new notifications" widget is usually just polling.',
    pitfall:
      'WebSockets need sticky sessions or a shared pub/sub backplane behind a load balancer, or a message published from one server instance silently never reaches a client connected to a different one.',
    fix:
      'Put a pub/sub backplane (Redis, NATS) behind the WebSocket servers so a message published on any instance reaches every connected client, regardless of which instance they\'re attached to.',
  },
  {
    id: 'api-gateway',
    title: 'API Gateway',
    blurb: 'One entry point routes by path to different services and enforces auth/rate-limits centrally.',
    tag: 'three.js',
    Component: ApiGateway,
    youtubeId: '7Swbm9qRmTs',
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
    pitfall:
      'A single gateway becomes a single point of failure and a latency floor for every request behind it — one misbehaving plugin (a slow auth check) can degrade every service downstream at once.',
    fix:
      'Run the gateway in a redundant, horizontally-scaled cluster with health checks and fast timeouts on every plugin, so one slow check degrades instead of cascading into a full outage.',
  },
  {
    id: 'consistency-patterns',
    title: 'Consistency Patterns',
    blurb: 'Weak, eventual, and strong consistency differ in whether a read right after a write sees it.',
    tag: 'gsap',
    Component: ConsistencyPatterns,
    code: [
      {
        lang: 'js',
        snippet: `// DynamoDB: consistency is a per-read parameter
await dynamo.get({ TableName, Key, ConsistentRead: false }) // eventual (default, cheaper)
await dynamo.get({ TableName, Key, ConsistentRead: true })  // strong (costs more, always fresh)`,
      },
      {
        lang: 'python',
        snippet: `# DynamoDB: consistency is a per-read parameter
table.get_item(Key=key, ConsistentRead=False)  # eventual (default, cheaper)
table.get_item(Key=key, ConsistentRead=True)   # strong (costs more, always fresh)`,
      },
    ],
    realWorld:
      'DynamoDB\'s `ConsistentRead` flag and MongoDB\'s read/write concern levels expose this exact tradeoff directly in the client API, per query.',
    pitfall:
      'Picking eventual consistency for something like an account balance or inventory count, without deliberately handling the read-your-own-write gap, is how double-spends and overselling actually happen in production.',
    fix:
      'Use strong consistency (or a distributed lock/transaction) specifically for balance and inventory operations, and reserve eventual consistency for data where brief staleness genuinely doesn\'t matter.',
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
    pitfall:
      'Automatic failover still has a detection-and-promotion window — real downtime, just shorter — and a too-aggressive health check can trigger a failover on a transient blip that would\'ve resolved itself.',
    fix:
      'Tune health-check thresholds to tolerate brief blips — require several consecutive failures before failing over — while still keeping the detection window short enough to matter.',
  },
  {
    id: 'rds-proxy',
    title: 'RDS Proxy',
    blurb: 'A pooling proxy multiplexes many app connections onto a few real DB connections, and hides failover from clients.',
    tag: 'state machine',
    Component: RdsProxy,
    code: [
      {
        lang: 'js',
        snippet: `// Lambda connects to the proxy endpoint, not the DB directly —
// the proxy holds a small pool of real Postgres connections open
// and reuses them across thousands of short-lived invocations
const client = new Client({ host: 'myapp.proxy-abc123.us-east-1.rds.amazonaws.com' })
await client.connect()
await client.query('SELECT * FROM orders WHERE id = $1', [id])`,
      },
      {
        lang: 'python',
        snippet: `# Lambda connects to the proxy endpoint, not the DB directly —
# the proxy holds a small pool of real Postgres connections open
# and reuses them across thousands of short-lived invocations
conn = psycopg2.connect(host='myapp.proxy-abc123.us-east-1.rds.amazonaws.com')
cur = conn.cursor()
cur.execute('SELECT * FROM orders WHERE id = %s', (id,))`,
      },
    ],
    realWorld:
      'AWS RDS Proxy sitting in front of a Lambda-triggered API so a traffic spike opens thousands of function invocations without each one grabbing (and exhausting) a raw Postgres connection, and so a Multi-AZ failover reconnects the pool instead of erroring out every client at once.',
    pitfall:
      'Pooled connections can hold an open transaction across requests if application code doesn\'t explicitly commit or rollback, which leaks locks on the real database and starves the whole pool for every other client.',
    fix:
      'Always explicitly commit or rollback before returning a connection to the pool, and set a statement/idle timeout so a stuck transaction gets killed instead of holding a slot forever.',
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
    pitfall:
      'TTL is a request, not a guarantee — plenty of resolvers and ISPs cache longer than instructed, so lowering a record\'s TTL before a migration doesn\'t fully protect you from stale answers.',
    fix:
      'Lower the TTL well before a planned migration (hours or days ahead) to give slow-to-honor resolvers time to catch up, and keep the old endpoint alive during the transition instead of relying on TTL alone.',
  },
  {
    id: 'master-replication-topology',
    title: 'Master-Slave vs Master-Master',
    blurb: 'One writer never conflicts; two writers scale writes but can disagree before they sync.',
    tag: 'state machine',
    Component: MasterReplicationTopology,
    youtubeId: 'Ot7qFGjay8g',
    code: {
      lang: 'sql',
      snippet: `-- MySQL multi-primary needs offset auto_increment to avoid PK collisions
SET GLOBAL auto_increment_increment = 2;
SET GLOBAL auto_increment_offset = 1; -- node 1: 1,3,5…  node 2: 2,4,6…`,
    },
    realWorld:
      'MySQL Group Replication and Postgres BDR support multi-primary, but most teams default to single-primary (master-slave) specifically to avoid building conflict resolution — it\'s a real ongoing engineering cost.',
    pitfall:
      'Multi-primary writes can silently diverge, and "last write wins" is usually the wrong conflict resolution strategy for anything that isn\'t a simple overwrite — most teams underestimate how often this actually happens.',
    fix:
      'Pick an explicit conflict-resolution strategy up front (CRDTs, vector clocks, or app-level merge logic) instead of defaulting to last-write-wins, or avoid multi-primary entirely unless write availability during a partition is a real requirement.',
  },
  {
    id: 'federation',
    title: 'Federation',
    blurb: 'Splitting one database into several by function trades cross-table joins for independent scaling.',
    tag: 'framer-motion',
    Component: Federation,
    code: [
      {
        lang: 'js',
        snippet: `// Two separate connection pools — the join now happens in app code
const user = await usersDb.query('SELECT * FROM users WHERE id = $1', [id])
const orders = await ordersDb.query('SELECT * FROM orders WHERE user_id = $1', [id])
return { ...user, orders }`,
      },
      {
        lang: 'python',
        snippet: `# Two separate connection pools — the join now happens in app code
user = await users_db.fetch_one('SELECT * FROM users WHERE id = $1', id)
orders = await orders_db.fetch_all('SELECT * FROM orders WHERE user_id = $1', id)
return {**user, 'orders': orders}`,
      },
    ],
    realWorld:
      'The standard first step when splitting a monolith into microservices: give "users", "orders", and "products" their own databases along service boundaries before splitting the application code itself.',
    pitfall:
      'Splitting a database means giving up cross-database transactions and joins — moving money between two now-federated services needs a saga or two-phase process, not a single atomic UPDATE anymore.',
    fix:
      'Use a saga — a sequence of local transactions with compensating rollback steps — for any operation that spans federated services, instead of assuming a single atomic transaction will work.',
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
    pitfall:
      'Every duplicated field is a place data can drift out of sync after a partial write — the database no longer enforces consistency for you, so the application has to own it explicitly.',
    fix:
      'Update all duplicated copies in the same write path (a single service/transaction owns the write), or use an async job to keep copies eventually consistent if synchronous updates are too slow.',
  },
  {
    id: 'nosql-data-models',
    title: 'NoSQL Data Models',
    blurb: 'The same record shaped four ways: key-value, document, wide-column, and graph.',
    tag: 'compare',
    Component: NoSqlDataModels,
    code: [
      {
        lang: 'js',
        snippet: `// Document (MongoDB)
db.users.insertOne({ _id: 1, name: 'Ada', tags: ['admin'] })

// Key-value (Redis)
await redis.set('user:1', JSON.stringify({ name: 'Ada' }))`,
      },
      {
        lang: 'python',
        snippet: `# Document (MongoDB)
db.users.insert_one({'_id': 1, 'name': 'Ada', 'tags': ['admin']})

# Key-value (Redis)
await redis.set('user:1', json.dumps({'name': 'Ada'}))`,
      },
    ],
    realWorld:
      'MongoDB for flexible product catalogs, Redis for sessions/cache, Cassandra for write-heavy time-series data, Neo4j for fraud rings and recommendation graphs — picking the model to fit the access pattern.',
    pitfall:
      'Modeling a document or key-value store the way you\'d model a relational one — deep joins reconstructed in application code — throws away the model\'s actual advantage and just adds a slower, less consistent read path.',
    fix:
      'Model around your actual access patterns — embed what you read together, denormalize instead of joining — rather than porting a normalized relational schema directly into a document or key-value store.',
  },
  {
    id: 'cache-write-strategies',
    title: 'Cache Write Strategies',
    blurb: 'Cache-aside, write-through, write-behind, and refresh-ahead move data between cache and DB differently.',
    tag: 'gsap',
    Component: CacheWriteStrategies,
    code: [
      {
        lang: 'js',
        snippet: `// write-through: never inconsistent, slower writes
await cache.set(key, value)
await db.write(key, value)

// write-behind: instant ack, DB catches up async
await cache.set(key, value)
flushQueue.push({ key, value })`,
      },
      {
        lang: 'python',
        snippet: `# write-through: never inconsistent, slower writes
await cache.set(key, value)
await db.write(key, value)

# write-behind: instant ack, DB catches up async
await cache.set(key, value)
flush_queue.append({'key': key, 'value': value})`,
      },
    ],
    realWorld:
      'Write-through for anything financial (never allowed to be stale). Write-behind for high-throughput counters like "likes" or view counts, where losing the last few increments on a crash is an acceptable tradeoff for speed.',
    pitfall:
      'Write-behind can silently lose the last few writes if the process crashes before they flush to the database — never reach for it on anything (payments, inventory) that must never be lost.',
    fix:
      'Use write-through (or synchronous write-behind with a durable queue) for anything that must never be lost, and reserve pure write-behind for data where losing the last few seconds of writes is genuinely acceptable.',
  },
  {
    id: 'task-queue-back-pressure',
    title: 'Task Queue & Back Pressure',
    blurb: 'A worker pool drains a bounded queue; once it is full, new submissions are rejected outright.',
    tag: 'three.js',
    Component: TaskQueueBackPressure,
    code: [
      {
        lang: 'js',
        snippet: `const queue = new Queue('image-resize', { redis, defaultJobOptions: { attempts: 3 } })
queue.process(5, async (job) => resizeImage(job.data)) // 5 concurrent workers

await queue.add(uploadData) // rejects/backs off once the queue is saturated`,
      },
      {
        lang: 'python',
        snippet: `app = Celery('image-resize', broker='redis://localhost')
app.conf.worker_concurrency = 5  # 5 concurrent workers
app.conf.task_acks_late = True

@app.task(max_retries=3)
def resize_image(data):
    ...

resize_image.delay(upload_data)  # backs off once the queue is saturated`,
      },
    ],
    realWorld:
      'Sidekiq (Ruby), BullMQ (Node), and Celery (Python) all implement this: a bounded job queue with a worker pool for uploads, emails, and report generation, with back pressure to stop the queue from growing unbounded under load.',
    pitfall:
      'Rejecting once the queue is full is deliberate back pressure, not a bug — skip it and an unbounded queue just moves the outage downstream, from "requests fail fast" to "the whole worker process runs out of memory."',
    fix:
      'Set an explicit queue capacity and reject or shed load once it\'s full, and surface that rejection back to the caller (a 429 or retry signal) instead of letting the queue grow unbounded.',
  },
]
