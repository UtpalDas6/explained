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
import DnsResolution from '../concepts/DnsResolution.jsx'
import MasterReplicationTopology from '../concepts/MasterReplicationTopology.jsx'
import Federation from '../concepts/Federation.jsx'
import Denormalization from '../concepts/Denormalization.jsx'
import NoSqlDataModels from '../concepts/NoSqlDataModels.jsx'
import CacheWriteStrategies from '../concepts/CacheWriteStrategies.jsx'
import TaskQueueBackPressure from '../concepts/TaskQueueBackPressure.jsx'

// Registry of concepts. Add a new entry here to add a new concept to the app.
export const concepts = [
  {
    id: 'caching',
    title: 'Caching',
    blurb: 'Requests check a fast cache before hitting the slow database.',
    tag: 'gsap + anime.js',
    Component: Caching,
  },
  {
    id: 'sharding',
    title: 'Sharding',
    blurb: 'Data is split across nodes by a hash of its key.',
    tag: 'three.js',
    Component: Sharding,
  },
  {
    id: 'replication',
    title: 'Replication',
    blurb: 'Writes on a primary propagate to replicas, sync or async.',
    tag: 'three.js',
    Component: Replication,
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    blurb: 'Keys walk a ring to their node — adding/removing nodes remaps only a slice.',
    tag: 'gsap',
    Component: ConsistentHashing,
  },
  {
    id: 'horizontal-partitioning',
    title: 'Horizontal Partitioning',
    blurb: 'Rows are split across tables by an ordered key range, same schema everywhere.',
    tag: 'three.js',
    Component: HorizontalPartitioning,
  },
  {
    id: 'vertical-partitioning',
    title: 'Vertical Partitioning',
    blurb: 'Columns are split into separate tables by access pattern, joined by a key.',
    tag: 'framer-motion',
    Component: VerticalPartitioning,
  },
  {
    id: 'load-balancing',
    title: 'Load Balancing',
    blurb: 'A load balancer spreads requests across servers by round-robin, random, or least-connections.',
    tag: 'three.js',
    Component: LoadBalancing,
  },
  {
    id: 'cdn',
    title: 'CDN',
    blurb: 'Edge nodes cache content close to users; only the first request per edge hits the distant origin.',
    tag: 'three.js',
    Component: Cdn,
  },
  {
    id: 'message-queue',
    title: 'Message Queue',
    blurb: 'A producer and consumer talk through a FIFO queue instead of directly.',
    tag: 'three.js',
    Component: MessageQueue,
  },
  {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    blurb: 'During a network partition you must choose: reject writes (CP) or risk divergence (AP).',
    tag: 'gsap',
    Component: CapTheorem,
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting',
    blurb: 'A token bucket absorbs bursts, then rejects requests once it runs dry.',
    tag: 'gsap',
    Component: RateLimiting,
  },
  {
    id: 'proxy-vs-reverse-proxy',
    title: 'Proxy vs Reverse Proxy',
    blurb: 'A forward proxy hides the client; a reverse proxy hides the server.',
    tag: 'gsap',
    Component: ProxyVsReverseProxy,
  },
  {
    id: 'circuit-breaker',
    title: 'Circuit Breaker',
    blurb: 'Repeated failures trip the breaker open, failing fast until a trial request succeeds again.',
    tag: 'state machine',
    Component: CircuitBreaker,
  },
  {
    id: 'bloom-filter',
    title: 'Bloom Filter',
    blurb: 'A compact bit array that can say "definitely not present" or "maybe present" — never a false negative.',
    tag: 'hashing',
    Component: BloomFilter,
  },
  {
    id: 'snowflake-id',
    title: 'Unique ID Generation',
    blurb: 'Snowflake IDs pack a timestamp, machine id, and sequence into one sortable 64-bit number.',
    tag: 'bit-packing',
    Component: SnowflakeId,
  },
  {
    id: 'distributed-lock',
    title: 'Distributed Lock',
    blurb: 'Only one client holds the lock at a time; others queue until it is released.',
    tag: 'mutex',
    Component: DistributedLock,
  },
  {
    id: 'database-indexing',
    title: 'Database Indexing',
    blurb: 'B-Trees optimize for fast reads; LSM-Trees optimize for fast, append-only writes.',
    tag: 'trees',
    Component: DatabaseIndexing,
  },
  {
    id: 'websocket-vs-polling-vs-sse',
    title: 'WebSocket vs Polling vs SSE',
    blurb: 'Three ways a client stays updated, from repeated round trips to one open connection.',
    tag: 'gsap',
    Component: WebSocketVsPollingVsSse,
  },
  {
    id: 'api-gateway',
    title: 'API Gateway',
    blurb: 'One entry point routes by path to different services and enforces auth/rate-limits centrally.',
    tag: 'three.js',
    Component: ApiGateway,
  },
  {
    id: 'consistency-patterns',
    title: 'Consistency Patterns',
    blurb: 'Weak, eventual, and strong consistency differ in whether a read right after a write sees it.',
    tag: 'gsap',
    Component: ConsistencyPatterns,
  },
  {
    id: 'failover',
    title: 'Failover',
    blurb: 'Active-passive has a real outage gap while a standby promotes; active-active has none.',
    tag: 'state machine',
    Component: Failover,
  },
  {
    id: 'dns-resolution',
    title: 'DNS Resolution',
    blurb: 'A resolver walks root → TLD → authoritative servers, then caches the answer until its TTL expires.',
    tag: 'gsap',
    Component: DnsResolution,
  },
  {
    id: 'master-replication-topology',
    title: 'Master-Slave vs Master-Master',
    blurb: 'One writer never conflicts; two writers scale writes but can disagree before they sync.',
    tag: 'state machine',
    Component: MasterReplicationTopology,
  },
  {
    id: 'federation',
    title: 'Federation',
    blurb: 'Splitting one database into several by function trades cross-table joins for independent scaling.',
    tag: 'framer-motion',
    Component: Federation,
  },
  {
    id: 'denormalization',
    title: 'Denormalization',
    blurb: 'Duplicating data trades a slower join for a single fast lookup — and N writes instead of one.',
    tag: 'tradeoff',
    Component: Denormalization,
  },
  {
    id: 'nosql-data-models',
    title: 'NoSQL Data Models',
    blurb: 'The same record shaped four ways: key-value, document, wide-column, and graph.',
    tag: 'compare',
    Component: NoSqlDataModels,
  },
  {
    id: 'cache-write-strategies',
    title: 'Cache Write Strategies',
    blurb: 'Cache-aside, write-through, write-behind, and refresh-ahead move data between cache and DB differently.',
    tag: 'gsap',
    Component: CacheWriteStrategies,
  },
  {
    id: 'task-queue-back-pressure',
    title: 'Task Queue & Back Pressure',
    blurb: 'A worker pool drains a bounded queue; once it is full, new submissions are rejected outright.',
    tag: 'three.js',
    Component: TaskQueueBackPressure,
  },
]
