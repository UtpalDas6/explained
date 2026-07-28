import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /db section — 25 SQL and NoSQL database topics, grouped
// SQL / NoSQL Data Models / Consistency & Scale / Schema & Modeling. Reuses
// the same before/after StateDemo the Git Commands and API Design sections
// use — a database concept is, just like those, a state comparison.
const demo = (props) => () => createElement(StateDemo, props)

export const dbConcepts = [
  {
    id: 'acid-transactions',
    section: 'db',
    title: 'ACID Transactions',
    blurb: 'A transaction groups multiple operations so they all succeed together or none of them happen at all.',
    tag: 'SQL',
    Component: demo({
      command: 'wrap in a transaction',
      before: [
        { label: 'UPDATE balance -50 (step 1)', color: 'var(--bad)' },
        { label: 'crash before step 2', color: 'var(--bad)' },
      ],
      after: [{ label: 'BEGIN; UPDATE -50; UPDATE +50; COMMIT;', color: 'var(--good)' }],
      note: {
        before: 'Money left one account but never arrived at the other — a crash mid-transfer leaves the database inconsistent.',
        after: 'Both updates commit together or neither does — a crash anywhere in between rolls the whole transaction back automatically.',
      },
    }),
    code: [{ lang: 'sql', snippet: `BEGIN;\nUPDATE accounts SET balance = balance - 50 WHERE id = 1;\nUPDATE accounts SET balance = balance + 50 WHERE id = 2;\nCOMMIT;` }],
    realWorld:
      'Bank transfers, order checkout (charge card + decrement inventory), and any multi-step write where a partial failure would corrupt data all rely on transactions.',
    pitfall:
      'Long-running transactions hold locks (and in MVCC systems, block cleanup) for their entire duration — a transaction left open by a stuck client can stall unrelated queries.',
    fix:
      "Keep transactions short — do slow work (API calls, heavy computation) outside the transaction boundary, and set a statement/idle-in-transaction timeout so a stuck client can't hold locks indefinitely.",
  },
  {
    id: 'normalization',
    section: 'db',
    title: 'Normalization',
    blurb: 'Splitting data into related tables to eliminate duplicate, update-prone copies of the same fact.',
    tag: 'SQL',
    Component: demo({
      command: 'normalize the schema',
      before: [{ label: 'orders: id, customer_name, customer_email, item', color: 'var(--bad)' }],
      after: [
        { label: 'customers: id, name, email', color: 'var(--good)' },
        { label: 'orders: id, customer_id, item', color: 'var(--good)' },
      ],
      note: {
        before: "Every order row repeats the customer's name and email — updating an email means updating every order row that customer ever placed.",
        after: "Customer data lives in one place; orders just reference it by id — updating an email touches exactly one row.",
      },
    }),
    code: [{ lang: 'sql', snippet: `-- Before: repeated on every row\n-- orders(id, customer_name, customer_email, item)\n\n-- After: normalized\nCREATE TABLE customers (id INT PRIMARY KEY, name TEXT, email TEXT);\nCREATE TABLE orders (id INT PRIMARY KEY, customer_id INT REFERENCES customers(id), item TEXT);` }],
    realWorld:
      'Textbook relational schema design (3NF) — nearly every OLTP system (e-commerce, banking, SaaS apps) normalizes core entities like customers, products, and orders into separate tables.',
    pitfall:
      'Fully normalizing everything means every read needs several joins — for read-heavy analytical queries, that can turn a simple report into a slow, join-heavy query.',
    fix:
      'Normalize for the transactional (write) path, then deliberately denormalize (or use a materialized view/read replica) for read-heavy reporting paths once query performance actually suffers.',
  },
  {
    id: 'keys-constraints',
    section: 'db',
    title: 'Primary & Foreign Keys',
    blurb: 'A primary key uniquely identifies a row; a foreign key constrains a column to only reference a row that actually exists.',
    tag: 'SQL',
    Component: demo({
      command: 'add the constraint',
      before: [{ label: 'orders.customer_id = 999', sub: 'no such customer', color: 'var(--bad)' }],
      after: [{ label: 'INSERT rejected: FK violation', color: 'var(--good)' }],
      note: {
        before: 'Nothing stops an order from pointing at a customer id that was never created — or was deleted later.',
        after: 'The foreign key constraint makes the insert fail immediately instead of silently creating orphaned, unlinkable data.',
      },
    }),
    code: [{ lang: 'sql', snippet: `CREATE TABLE orders (\n  id INT PRIMARY KEY,\n  customer_id INT NOT NULL REFERENCES customers(id)\n);` }],
    realWorld:
      'Every relational schema depends on primary keys for row identity and foreign keys to keep relationships valid — an order referencing a deleted customer is exactly the orphaned-row bug foreign keys prevent.',
    pitfall:
      'Foreign key constraints add a real check on every insert/update/delete — at very high write volume, or once a schema is sharded across databases, that overhead (and the requirement that the referenced row live in the same database) becomes a genuine constraint.',
    fix:
      'Keep foreign keys within a single database/shard where the check is cheap; enforce cross-shard relationships at the application layer once the schema spans multiple databases.',
  },
  {
    id: 'joins',
    section: 'db',
    title: 'SQL Joins',
    blurb: 'INNER, LEFT, RIGHT, and FULL joins each decide differently what happens to rows with no match on the other side.',
    tag: 'SQL',
    Component: demo({
      command: 'switch join type',
      before: [{ label: 'INNER JOIN', sub: 'drops customers with 0 orders', color: 'var(--bad)' }],
      after: [{ label: 'LEFT JOIN', sub: 'keeps every customer, NULLs for no orders', color: 'var(--good)' }],
      note: {
        before: 'A report meant to show "all customers" silently excludes anyone who has never placed an order.',
        after: "LEFT JOIN keeps every row from the left table (customers), filling in NULLs where there's no matching order.",
      },
    }),
    code: [{ lang: 'sql', snippet: `SELECT c.name, o.id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;` }],
    realWorld:
      '"Show me all customers and their order count, including customers with zero orders" is the textbook case for LEFT JOIN over INNER JOIN — get it wrong and the report quietly hides rows.',
    pitfall:
      "A join on a column that isn't indexed on either side forces a full table scan on every query — fine on a small table, a serious performance problem once tables grow.",
    fix:
      'Index the join column(s) on both sides — check the query plan (EXPLAIN) to confirm the database is actually using the index, not scanning the whole table.',
  },
  {
    id: 'isolation-levels',
    section: 'db',
    title: 'Isolation Levels',
    blurb: "How much one transaction can see of another transaction's in-progress changes — a tradeoff between correctness and concurrency.",
    tag: 'SQL',
    Component: demo({
      command: 'raise the isolation level',
      before: [{ label: 'Read Committed', sub: 'non-repeatable reads possible', color: 'var(--bad)' }],
      after: [{ label: 'Serializable', sub: 'transactions behave as if run one at a time', color: 'var(--good)' }],
      note: {
        before: 'Reading the same row twice in one transaction can return two different values if another transaction commits in between.',
        after: 'The database guarantees the same result as if every transaction ran completely alone, one after another — at the cost of more blocking/retries under contention.',
      },
    }),
    code: [{ lang: 'sql', snippet: `BEGIN;\nSET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\nSELECT balance FROM accounts WHERE id = 1;\n-- ...\nCOMMIT;` }],
    realWorld:
      "Financial systems and inventory counts (don't oversell the last item in stock) often need Serializable or Repeatable Read; most everyday web app queries run fine at the default Read Committed.",
    pitfall:
      'Defaulting every transaction to Serializable "to be safe" adds real contention and retry overhead across the whole application, most of which never actually needed that guarantee.',
    fix:
      "Use the weakest isolation level that's still correct for each transaction — reserve Serializable/Repeatable Read for the few operations (like inventory decrements) that genuinely need it.",
  },
  {
    id: 'locking',
    section: 'db',
    title: 'Optimistic vs Pessimistic Locking',
    blurb: 'Pessimistic locking blocks other writers up front; optimistic locking lets them proceed and only checks for conflicts at commit time.',
    tag: 'SQL',
    Component: demo({
      command: 'switch locking strategy',
      before: [{ label: 'SELECT ... FOR UPDATE', sub: 'row locked, other writers wait', color: 'var(--accent)' }],
      after: [{ label: 'UPDATE ... WHERE version = 3', sub: '0 rows updated → conflict detected, no lock held', color: 'var(--good)' }],
      note: {
        before: 'Pessimistic: the row is locked the moment it\'s read, so every other transaction wanting to touch it simply waits.',
        after: "Optimistic: no lock is held — the write only succeeds if the version column hasn't changed since it was read; a mismatch means someone else got there first.",
      },
    }),
    code: [{ lang: 'sql', snippet: `-- Optimistic: version column guards the write\nUPDATE products SET stock = stock - 1, version = version + 1\nWHERE id = 42 AND version = 3;\n-- 0 rows affected -> someone else updated it first, retry` }],
    realWorld:
      "High-contention rows (a popular product's stock count on Black Friday) often use optimistic locking to avoid the queueing pessimistic locks would cause under heavy concurrent writes.",
    pitfall:
      'Optimistic locking under very high contention means most writes fail and retry repeatedly, which can be worse than just queueing behind a pessimistic lock in the first place.',
    fix:
      'Use optimistic locking for low-to-moderate contention (most rows, most of the time), and fall back to pessimistic locking for the specific hot rows where retries would dominate.',
  },
  {
    id: 'n-plus-one',
    section: 'db',
    title: 'The N+1 Query Problem',
    blurb: 'Fetching a list, then issuing one extra query per item to load related data — N+1 round trips instead of one join.',
    tag: 'SQL',
    Component: demo({
      command: 'fix with a join',
      before: [
        { label: '1 query for orders', color: 'var(--bad)' },
        { label: '+ N queries, one per order', color: 'var(--bad)' },
      ],
      after: [{ label: '1 query: orders JOIN items', color: 'var(--good)' }],
      note: {
        before: '100 orders means 101 total queries — one to list them, then one more per order to fetch its items in a loop.',
        after: 'A single join (or a batched IN (...) query) fetches everything in one round trip, regardless of how many orders there are.',
      },
    }),
    code: [{ lang: 'sql', snippet: `-- Bad: N+1\nSELECT * FROM orders;\n-- then, per order: SELECT * FROM items WHERE order_id = ?\n\n-- Good: one query\nSELECT o.*, i.* FROM orders o JOIN items i ON i.order_id = o.id;` }],
    realWorld:
      'The single most common ORM performance bug — Rails, Django, and Hibernate all have a well-known "N+1" footgun when lazy-loading an association inside a loop.',
    pitfall:
      "It's invisible locally with a handful of test rows (2 queries either way) and only shows up as real latency once the list grows to hundreds of items in production.",
    fix:
      "Eager-load associations (includes/select_related/JOIN FETCH) up front, or batch the related lookups into one `WHERE id IN (...)` query instead of one query per row.",
  },
  {
    id: 'query-plans',
    section: 'db',
    title: 'Query Execution Plans (EXPLAIN)',
    blurb: 'EXPLAIN shows exactly how the database intends to run a query — which indexes it uses, and which tables it scans in full.',
    tag: 'SQL',
    Component: demo({
      command: 'run EXPLAIN',
      before: [{ label: 'slow query', sub: 'unknown cause', color: 'var(--bad)' }],
      after: [{ label: 'Seq Scan on orders (cost=0..48291)', sub: 'missing index found', color: 'var(--good)' }],
      note: {
        before: 'A query takes 4 seconds and nobody knows why — guessing at the cause without evidence.',
        after: 'The plan reveals a full sequential scan over the whole table — the actual, concrete reason for the slowness, and exactly which index would fix it.',
      },
    }),
    code: [{ lang: 'sql', snippet: `EXPLAIN ANALYZE\nSELECT * FROM orders WHERE customer_id = 42;\n-- Seq Scan on orders (cost=0.00..48291.00 rows=3 width=97)\n--   Filter: (customer_id = 42)` }],
    realWorld:
      'The first tool reached for when a query is slow in production — reading a query plan turns "it\'s slow" into a specific, fixable diagnosis.',
    pitfall:
      'EXPLAIN alone shows the *planned* cost estimate, not what actually happened — a plan that looks fine on paper can still be slow if the database\'s row-count statistics are stale.',
    fix:
      'Use EXPLAIN ANALYZE (which actually runs the query and reports real timings) rather than plain EXPLAIN, and re-run statistics collection if the estimated vs actual row counts are wildly different.',
  },
  {
    id: 'composite-indexes',
    section: 'db',
    title: 'Composite & Covering Indexes',
    blurb: 'An index on multiple columns (in a specific order) — or one that includes every column a query needs, avoiding a trip back to the table.',
    tag: 'SQL',
    Component: demo({
      command: 'add a composite index',
      before: [{ label: 'WHERE status=? AND created_at>?', sub: 'no matching index', color: 'var(--bad)' }],
      after: [{ label: 'INDEX (status, created_at)', sub: 'query uses it directly', color: 'var(--good)' }],
      note: {
        before: "Two separate single-column indexes can't both be used efficiently for one query filtering on both columns together.",
        after: 'A composite index on (status, created_at) matches the query\'s filter exactly, in the order the columns are actually used.',
      },
    }),
    code: [{ lang: 'sql', snippet: `CREATE INDEX idx_orders_status_date\n  ON orders (status, created_at);\n\nSELECT status, created_at FROM orders\nWHERE status = 'shipped' AND created_at > '2026-01-01';` }],
    realWorld:
      'Any query filtering or sorting on more than one column benefits from a matching composite index — column order in the index has to match how the query filters, leftmost first.',
    pitfall:
      "Column order in a composite index matters — an index on (status, created_at) doesn't help a query filtering only on created_at, since it can't be used without a leading match on status.",
    fix:
      'Order composite index columns to match the most selective/most commonly-filtered column first, and check EXPLAIN to confirm the index is actually being used.',
  },
  {
    id: 'window-functions',
    section: 'db',
    title: 'Window Functions',
    blurb: 'Computes a value across a set of related rows (a running total, a rank) without collapsing them into one row the way GROUP BY does.',
    tag: 'SQL',
    Component: demo({
      command: 'add a window function',
      before: [{ label: 'GROUP BY collapses rows', sub: 'one row per customer, detail lost', color: 'var(--bad)' }],
      after: [{ label: 'RANK() OVER (PARTITION BY ...)', sub: 'every row kept, ranked within its group', color: 'var(--good)' }],
      note: {
        before: 'GROUP BY answers "total per customer" but can\'t also show each individual order alongside that total in the same row.',
        after: "A window function computes the aggregate per group while keeping every original row intact.",
      },
    }),
    code: [{ lang: 'sql', snippet: `SELECT\n  customer_id,\n  amount,\n  RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rank\nFROM orders;` }],
    realWorld:
      'Leaderboards, running totals, "top 3 orders per customer", and month-over-month deltas are all natural window-function queries that would otherwise need awkward self-joins.',
    pitfall:
      "Window functions run after WHERE/GROUP BY but before ORDER BY/LIMIT in query execution order, which trips people up trying to filter on a window function's result directly in the same WHERE clause.",
    fix:
      "Wrap the windowed query in a subquery (or use a CTE) and filter on the window function's output in the outer query's WHERE clause instead.",
  },
  {
    id: 'key-value-store',
    section: 'db',
    title: 'Key-Value Stores',
    blurb: 'The simplest data model — an opaque value retrieved by a single key, with no querying inside the value itself.',
    tag: 'NoSQL Data Models',
    Component: demo({
      command: 'GET by key',
      before: [{ label: 'SELECT * FROM sessions WHERE id=?', sub: 'B-tree lookup + query planner overhead', color: 'var(--accent)' }],
      after: [{ label: 'GET session:abc123', sub: 'O(1) hash lookup', color: 'var(--good)' }],
      note: {
        before: 'A relational lookup still goes through a query planner and index traversal, even for the simplest "get this by id" query.',
        after: 'A key-value store skips all of that — hash the key, return the value, nothing else to plan.',
      },
    }),
    code: [{ lang: 'text', snippet: `SET session:abc123 '{"userId": 42, "expiresAt": ...}' EX 3600\nGET session:abc123` }],
    realWorld:
      'Redis and DynamoDB power session storage, caching layers, and shopping carts — anywhere the access pattern really is just "fetch this one blob by its id".',
    pitfall:
      'Reaching for a key-value store when the app actually needs to query *inside* the value ("find all sessions for user 42") forces either scanning every key or maintaining a manual secondary index.',
    fix:
      'Add a secondary index structure explicitly (a second key-value mapping, or a proper database) once queries need anything beyond "fetch by exact key".',
  },
  {
    id: 'document-store',
    section: 'db',
    title: 'Document Stores',
    blurb: 'Stores self-contained, semi-structured documents (usually JSON) — related data nests inside one document instead of across tables.',
    tag: 'NoSQL Data Models',
    Component: demo({
      command: 'store as one document',
      before: [{ label: 'orders + order_items', sub: '2 SQL tables + a JOIN', color: 'var(--accent)' }],
      after: [{ label: '{ "order": {...}, "items": [...] }', sub: 'one document, one read', color: 'var(--good)' }],
      note: {
        before: 'Reading an order and its line items means joining two tables — correct, but two logical concepts spread across physical storage.',
        after: 'The whole order, items included, is one self-contained document — read it in a single lookup, no join required.',
      },
    }),
    code: [{ lang: 'json', snippet: `{\n  "_id": "order_123",\n  "customer": "Ada Lovelace",\n  "items": [\n    { "sku": "widget", "qty": 2 },\n    { "sku": "gadget", "qty": 1 }\n  ]\n}` }],
    realWorld:
      "MongoDB and Firestore model content that's naturally hierarchical and usually read together — a blog post with its comments, a product with its reviews — as a single document.",
    pitfall:
      'Documents that grow unbounded (a "comments" array on a popular post) eventually hit the size limit, or make every read of the post drag along thousands of comments nobody asked for.',
    fix:
      'Split fast-growing, independently-queried sub-collections into their own documents/collection referencing the parent, instead of nesting them inside a single ever-growing document.',
  },
  {
    id: 'wide-column-store',
    section: 'db',
    title: 'Wide-Column Stores',
    blurb: 'Rows can have different columns from each other, and columns are grouped into families optimized for fast range scans over huge datasets.',
    tag: 'NoSQL Data Models',
    Component: demo({
      command: 'query a column family',
      before: [{ label: 'fixed schema', sub: 'every row has the same columns', color: 'var(--accent)' }],
      after: [{ label: 'row "sensor_42"', sub: '{temp_2026, humidity_2026} — sparse, per-row columns', color: 'var(--good)' }],
      note: {
        before: 'A rigid table schema forces every row to carry every possible column, even when most rows only populate a handful.',
        after: "Each row only stores the columns it actually has — sparse by design, grouped so range scans over one family stay fast at massive scale.",
      },
    }),
    code: [{ lang: 'cql', snippet: `CREATE TABLE sensor_readings (\n  sensor_id text,\n  reading_time timestamp,\n  value double,\n  PRIMARY KEY (sensor_id, reading_time)\n);\n-- clusters rows by sensor_id, orders by reading_time within it` }],
    realWorld:
      "Cassandra and HBase back write-heavy, massive-scale workloads — IoT sensor data, time-series metrics, activity feeds — where a single relational database's single-machine limits would be hit fast.",
    pitfall:
      "Wide-column stores are built for known, fixed query patterns (the partition key must be chosen up front) — an ad-hoc query on a column outside the key design requires a full, expensive cluster scan.",
    fix:
      "Design the partition/clustering key around actual query patterns before writing data — retrofitting a new query pattern later often means re-modeling and rewriting the data.",
  },
  {
    id: 'graph-database',
    section: 'db',
    title: 'Graph Databases',
    blurb: 'Stores nodes and the relationships between them as first-class citizens — traversing connections is the primary operation, not a join.',
    tag: 'NoSQL Data Models',
    Component: demo({
      command: 'traverse relationships',
      before: [{ label: 'friends_of_friends: recursive JOIN, 3+ levels deep', color: 'var(--bad)' }],
      after: [{ label: 'MATCH (a)-[:FRIEND]->()-[:FRIEND]->(b)', sub: 'native traversal', color: 'var(--good)' }],
      note: {
        before: 'Each additional degree of connection means another JOIN — performance degrades sharply as the relational query gets deeper.',
        after: 'A graph database walks relationships directly, node to node — traversal depth barely affects performance the way repeated joins do.',
      },
    }),
    code: [{ lang: 'cypher', snippet: `MATCH (me:Person {name: "Ada"})-[:FRIEND*2]-(fof)\nRETURN DISTINCT fof.name;` }],
    realWorld:
      "Social networks (a connection graph), fraud detection (tracing chains of related accounts), and recommendation engines all model relationships as primary data — exactly what Neo4j is built for.",
    pitfall:
      'Modeling data as a graph when the actual access pattern is simple lookups (not relationship traversal) adds real operational complexity for a benefit the workload never uses.',
    fix:
      'Reach for a graph database specifically when the core queries are about relationship traversal — a relational or document database is simpler and sufficient for most other access patterns.',
  },
  {
    id: 'time-series-database',
    section: 'db',
    title: 'Time-Series Databases',
    blurb: 'Optimized specifically for timestamped data arriving in order — high write throughput, and queries that aggregate over time windows.',
    tag: 'NoSQL Data Models',
    Component: demo({
      command: 'aggregate by time bucket',
      before: [{ label: 'SQL GROUP BY date_trunc(...)', sub: 'slow over billions of rows on general storage', color: 'var(--bad)' }],
      after: [{ label: 'avg(temp) per 5-min bucket', sub: 'pre-aggregated, purpose-built', color: 'var(--good)' }],
      note: {
        before: 'A general-purpose relational database can compute a time-bucketed average, but scanning billions of timestamped rows on the fly gets slow.',
        after: 'A time-series database stores data column-oriented by time and often pre-aggregates ("rolls up") older data into cheaper summaries.',
      },
    }),
    code: [{ lang: 'influxql', snippet: `SELECT mean(temperature)\nFROM sensor_data\nWHERE time > now() - 1h\nGROUP BY time(5m);` }],
    realWorld:
      'InfluxDB, TimescaleDB, and Prometheus all specialize in exactly this shape of data — infrastructure metrics, IoT sensor readings, stock prices.',
    pitfall:
      'Storing every raw data point forever without any downsampling or retention policy eventually makes even a purpose-built time-series database slow and expensive to query over long ranges.',
    fix:
      'Set a retention/downsampling policy up front — keep raw resolution for recent data, roll old data up into coarser aggregates (or drop it) once fine-grained history stops being useful.',
  },
  {
    id: 'base-vs-acid',
    section: 'db',
    title: 'BASE vs ACID',
    blurb: 'ACID guarantees strict consistency at the cost of availability under partition; BASE trades strict consistency for availability and speed.',
    tag: 'Consistency & Scale',
    Component: demo({
      command: 'relax to BASE',
      before: [{ label: 'ACID: strict, immediately consistent', sub: 'can block on partition', color: 'var(--accent)' }],
      after: [{ label: 'BASE: Basically Available, Soft state, Eventually consistent', color: 'var(--good)' }],
      note: {
        before: "An ACID system refuses to serve a read/write it can't guarantee is fully consistent — correctness first, even at the cost of availability.",
        after: 'A BASE system keeps serving requests during a partition, accepting that different replicas might briefly disagree before converging.',
      },
    }),
    code: [{ lang: 'text', snippet: `ACID: Atomicity, Consistency, Isolation, Durability\nBASE: Basically Available, Soft state, Eventual consistency` }],
    realWorld:
      'Bank ledgers lean ACID (a wrong balance is unacceptable); social media like counts lean BASE (off by one for a few seconds is fine, and staying available matters more).',
    pitfall:
      'Picking BASE by default "because it scales better" for data that actually needs strict correctness (money, inventory, anything with legal consequence) trades away guarantees the domain requires.',
    fix:
      'Match the guarantee to the data — ACID for anything where a stale or momentarily-wrong read causes real harm, BASE where eventual correctness and availability matter more than an instant.',
  },
  {
    id: 'eventual-consistency',
    section: 'db',
    title: 'Eventual Consistency',
    blurb: 'After a write, replicas will converge to the same value — just not necessarily immediately.',
    tag: 'Consistency & Scale',
    Component: demo({
      command: 'read the stale replica',
      before: [{ label: 'write to primary → read from replica', sub: 'old value', color: 'var(--bad)' }],
      after: [{ label: 'replication catches up', sub: 'same value everywhere', color: 'var(--good)' }],
      note: {
        before: 'A write lands on the primary, but a read that hits a lagging replica microseconds later can still see the old value.',
        after: 'Given enough time (usually milliseconds), replication catches up and every replica converges on the same, latest value.',
      },
    }),
    code: [{ lang: 'text', snippet: `1. write("user:42.name", "Ada")  -> primary\n2. read("user:42.name")          -> replica (might still say old name)\n3. ...replication lag closes...\n4. read("user:42.name")          -> "Ada", consistent everywhere` }],
    realWorld:
      "DNS propagation and most NoSQL replica reads (DynamoDB's eventually-consistent reads, Cassandra at a lower consistency level) work exactly this way, trading staleness for lower latency and higher availability.",
    pitfall:
      'A user who just updated their own profile and immediately reloads can see their old data if the read hits a replica that hasn\'t caught up — a confusing, hard-to-reproduce bug report.',
    fix:
      'Use read-your-writes consistency for the specific case of a user reading their own recent write (route that read to the primary, or a known-caught-up replica), leaving other reads eventually consistent.',
  },
  {
    id: 'replication-lag',
    section: 'db',
    title: 'Read Replicas & Replication Lag',
    blurb: "Read replicas scale read throughput by copying the primary's writes — but that copying takes real, measurable time.",
    tag: 'Consistency & Scale',
    Component: demo({
      command: 'measure the lag',
      before: [{ label: 'primary: write committed', color: 'var(--accent)' }],
      after: [{ label: 'replica: 200ms behind', sub: 'a read here might miss the latest write', color: 'var(--good)' }],
      note: {
        before: 'The primary has the very latest data the instant a write commits.',
        after: 'The replica is still catching up — reads sent here see a snapshot from a moment ago, not right now.',
      },
    }),
    code: [{ lang: 'sql', snippet: `-- app routes writes here\nINSERT INTO orders (...) VALUES (...);  -- primary\n\n-- app routes most reads here, to spread load\nSELECT * FROM orders WHERE id = ...;    -- replica, might be ~200ms stale` }],
    realWorld:
      'Read-heavy apps (most web apps) route writes to a primary and spread reads across several replicas — standard for scaling read throughput without a bigger single machine.',
    pitfall:
      "Sending a read immediately after a write to a replica that hasn't caught up makes it look like the write silently failed or reverted, when it actually just landed on a lagging copy.",
    fix:
      "Route reads that must see the very latest write back to the primary, or track replication lag and route around a replica that's fallen too far behind.",
  },
  {
    id: 'write-ahead-log',
    section: 'db',
    title: 'Write-Ahead Log (WAL)',
    blurb: "Every change is appended to a sequential log before it's applied to the actual data files — the durability guarantee behind crash recovery.",
    tag: 'Consistency & Scale',
    Component: demo({
      command: 'crash and recover',
      before: [{ label: 'write applied directly to data file, crash', sub: 'partial write, corrupted page', color: 'var(--bad)' }],
      after: [{ label: 'WAL entry fsynced first, then crash', sub: 'replay the log on restart, fully recovers', color: 'var(--good)' }],
      note: {
        before: "If the server crashes mid-write with no log, there's no reliable record of what was in progress — the data file can be left half-written.",
        after: 'The WAL entry is durable on disk before anything else happens — on restart, the database replays it and reaches the exact pre-crash state.',
      },
    }),
    code: [{ lang: 'text', snippet: `1. Append "UPDATE accounts SET balance=950 WHERE id=1" to WAL\n2. fsync() the WAL to disk\n3. Apply the change to the actual data pages (can happen later)\n4. Acknowledge the write as committed` }],
    realWorld:
      "Postgres, MySQL (InnoDB), and Kafka all use a write-ahead (or append-only) log as their core durability mechanism — the reason a database survives a power loss without losing committed data.",
    pitfall:
      "WAL grows unbounded if it's never checkpointed/truncated once its entries are safely applied to the main data files — an ignored WAL can fill the disk.",
    fix:
      "Let the database's checkpoint process run regularly (most do this automatically) so old WAL segments are reclaimed once their changes are durably applied elsewhere.",
  },
  {
    id: 'mvcc',
    section: 'db',
    title: 'Multi-Version Concurrency Control (MVCC)',
    blurb: 'Readers see a consistent snapshot of the data without blocking writers, because writes create new versions instead of overwriting in place.',
    tag: 'Consistency & Scale',
    Component: demo({
      command: 'read without blocking',
      before: [{ label: "reader blocks until writer's lock releases", color: 'var(--bad)' }],
      after: [{ label: 'reader sees the pre-write snapshot', sub: "writer creates a new row version", color: 'var(--good)' }],
      note: {
        before: 'A traditional locking read/write conflict forces the reader to simply wait for the writer to finish.',
        after: 'MVCC keeps the old version around for any reader who started before the write — the writer creates a new version instead of blocking or overwriting in place.',
      },
    }),
    code: [{ lang: 'text', snippet: `T1 (reader):  BEGIN; SELECT balance FROM accounts WHERE id=1;  -- sees version 1: 100\nT2 (writer):  BEGIN; UPDATE accounts SET balance=50 WHERE id=1; COMMIT;  -- version 2\nT1 (reader):  SELECT balance FROM accounts WHERE id=1;  -- still version 1: 100` }],
    realWorld:
      "Postgres, MySQL (InnoDB), and Oracle all use MVCC so long-running reports never block, or get blocked by, concurrent writes — readers and writers don't fight over the same row.",
    pitfall:
      'Old row versions have to stick around for any transaction that might still need them — a long-running transaction can prevent old versions from being cleaned up, growing table size over time.',
    fix:
      "Keep transactions short so old versions can be garbage-collected promptly, and monitor/tune the database's vacuum (or equivalent) process rather than leaving defaults untouched at scale.",
  },
  {
    id: 'schema-on-write-vs-read',
    section: 'db',
    title: 'Schema-on-Write vs Schema-on-Read',
    blurb: 'A relational database enforces structure at write time; many NoSQL/data-lake systems defer that check until the data is actually read.',
    tag: 'Schema & Modeling',
    Component: demo({
      command: 'defer the schema check',
      before: [{ label: 'INSERT rejected', sub: 'column "phone" missing NOT NULL', color: 'var(--accent)' }],
      after: [{ label: '{ name: "Ada" } stored as-is', sub: 'no phone field — checked at read time', color: 'var(--good)' }],
      note: {
        before: "A rigid schema rejects the write immediately if it doesn't match the expected shape — safety, at the cost of flexibility.",
        after: "The document is stored however it arrives — any assumptions about its shape are the reading application's responsibility.",
      },
    }),
    code: [{ lang: 'text', snippet: `-- Schema-on-write (SQL): enforced at INSERT time\nINSERT INTO users (name, phone) VALUES ('Ada', NULL); -- fails if phone is NOT NULL\n\n// Schema-on-read (document store): stored as-is\ndb.users.insertOne({ name: "Ada" }); // no phone field at all — fine` }],
    realWorld:
      'Data lakes (raw logs, event streams landing in S3/Parquet) are schema-on-read by design — ingestion never blocks on shape, each downstream consumer applies its own expected schema.',
    pitfall:
      'Schema-on-read pushes all validation onto every single reader — without a shared contract, different consumers can silently disagree about what a missing or malformed field means.',
    fix:
      'Pair schema-on-read storage with a shared schema registry or validation layer (Avro/Protobuf schemas, or a JSON Schema check at the read boundary) so readers agree on structure.',
  },
  {
    id: 'embedding-vs-referencing',
    section: 'db',
    title: 'Embedding vs Referencing',
    blurb: 'In document databases, related data can be nested inline (embedded) or stored separately and linked by id (referenced) — the classic NoSQL modeling choice.',
    tag: 'Schema & Modeling',
    Component: demo({
      command: 'switch to referencing',
      before: [{ label: 'post: { title, comments: [ ...5,000 comments ] }', color: 'var(--bad)' }],
      after: [{ label: 'post: { title }, comments: [{ postId, text }]', color: 'var(--good)' }],
      note: {
        before: 'Every read of the post drags along all 5,000 embedded comments, whether the reader wants them or not.',
        after: 'The post document stays small and fast to read; comments live in their own collection, fetched (and paginated) separately when needed.',
      },
    }),
    code: [{ lang: 'json', snippet: `// Embedded — fine for a small, bounded list\n{ "order": { "id": 1, "shipping": { "street": "...", "city": "..." } } }\n\n// Referenced — better for large or independently-queried data\n{ "post": { "id": 1, "title": "..." } }\n{ "comment": { "postId": 1, "text": "..." } }` }],
    realWorld:
      "MongoDB's own modeling guidance is exactly this tradeoff — embed data that's small, bounded, and always read together; reference data that's large, unbounded, or queried independently.",
    pitfall:
      "Embedding a one-to-many relationship that's actually unbounded (comments, activity log entries) is the single most common document-modeling mistake — fine in a demo, bad in production.",
    fix:
      'Embed only small, bounded, always-together data (an address inside an order); reference anything that can grow without a natural limit or gets queried on its own.',
  },
  {
    id: 'database-migrations',
    section: 'db',
    title: 'Database Migrations',
    blurb: 'Versioned, incremental scripts that evolve a schema over time — so every environment reaches the same structure the same way.',
    tag: 'Schema & Modeling',
    Component: demo({
      command: 'apply the migration',
      before: [{ label: 'prod schema ≠ dev schema', sub: 'manually patched, drifted apart', color: 'var(--bad)' }],
      after: [{ label: 'migration 0042 applied everywhere, in order', sub: 'schemas identical', color: 'var(--good)' }],
      note: {
        before: 'Someone ran an ALTER TABLE by hand on production once, and now no single script describes how the schema got to its current state.',
        after: "Every environment runs the exact same ordered sequence of migration files — the schema's history is fully reproducible from scratch.",
      },
    }),
    code: [{ lang: 'sql', snippet: `-- migrations/0042_add_phone_to_users.sql\nALTER TABLE users ADD COLUMN phone TEXT;` }],
    realWorld:
      'Every serious framework (Rails, Django, Prisma) ships a migration system for exactly this reason — schema changes need to be versioned, ordered, and reproducible like application code.',
    pitfall:
      'A migration that locks a large table for the duration of an ALTER TABLE (adding a column with a default, on some databases) can cause real production downtime if run naively during peak traffic.',
    fix:
      'Use online/non-blocking migration patterns for large tables (add a nullable column first, backfill in batches, then add constraints) instead of a single blocking ALTER TABLE.',
  },
  {
    id: 'connection-pooling',
    section: 'db',
    title: 'Connection Pooling',
    blurb: 'Reusing a fixed set of already-open database connections instead of opening (and tearing down) a new one per request.',
    tag: 'Schema & Modeling',
    Component: demo({
      command: 'reuse a pooled connection',
      before: [{ label: 'new connection per request', sub: 'TCP handshake + auth, every time', color: 'var(--bad)' }],
      after: [{ label: 'borrow from pool of 20 open connections', sub: 'no handshake, instant', color: 'var(--good)' }],
      note: {
        before: 'Every request pays the full cost of opening a fresh database connection before it can even run a query.',
        after: 'A small pool of already-authenticated connections is reused across requests — borrow, run the query, return it, no setup cost.',
      },
    }),
    code: [{ lang: 'text', snippet: `pool = createPool({ max: 20, min: 5 })\nconst conn = await pool.acquire()\nawait conn.query('SELECT * FROM users WHERE id = ?', [1])\npool.release(conn)` }],
    realWorld:
      'Every production web framework (Rails, Django, most ORMs) pools database connections by default — opening a raw connection per request is a well-known way to bring a database to its knees.',
    pitfall:
      'A pool sized larger than the database can actually handle (each connection has real memory/CPU cost server-side) can overwhelm the database even though the app looks like it\'s "reusing connections responsibly".',
    fix:
      "Size the pool to the database's actual connection capacity, not just app-side guesswork — use a proxy like PgBouncer or RDS Proxy to multiplex many app connections onto fewer real ones if needed.",
  },
  {
    id: 'compaction',
    section: 'db',
    title: 'Compaction & Vacuuming',
    blurb: 'Background housekeeping that reclaims space from deleted/overwritten data and keeps storage structures efficient to read.',
    tag: 'Schema & Modeling',
    Component: demo({
      command: 'run compaction',
      before: [{ label: 'LSM-tree: 6 overlapping SSTable levels', sub: 'reads check every level', color: 'var(--bad)' }],
      after: [{ label: 'compacted: 1 merged, sorted SSTable', sub: 'reads check far less', color: 'var(--good)' }],
      note: {
        before: 'Every write created a new small file on disk — a read has to check many overlapping files to find the latest version of a key.',
        after: 'Compaction merges those files into fewer, larger, sorted ones — reads get faster, and space from overwritten/deleted keys is reclaimed.',
      },
    }),
    code: [{ lang: 'text', snippet: `-- Postgres MVCC: dead row versions need reclaiming\nVACUUM ANALYZE orders;\n\n-- Cassandra/RocksDB (LSM-tree): merge SSTables\nnodetool compact` }],
    realWorld:
      'Postgres runs autovacuum to reclaim dead MVCC row versions; Cassandra, RocksDB, and LevelDB all run background compaction to merge their append-only SSTable files.',
    pitfall:
      'Falling behind on compaction/vacuum (disabled or misconfigured, or throttled too aggressively) lets dead data and file fragmentation build up until reads and disk usage both degrade badly.',
    fix:
      "Monitor vacuum/compaction lag as a first-class metric — tune autovacuum thresholds (Postgres) or compaction strategy (Cassandra) to keep pace with actual write volume, rather than leaving defaults untouched at scale.",
  },
]
