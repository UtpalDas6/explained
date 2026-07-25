# Explained — system design, visualized

An interactive visualizer for classic system design concepts. Every concept is a small,
self-contained scene you can poke at — send a request, kill a node, trigger a partition —
and watch the mechanism actually move, instead of reading a static diagram.

Built with React + Vite, animated with **GSAP**, **Framer Motion**, **Three.js**
(via `@react-three/fiber`), and **anime.js**.

## Why

Most system design explainers are static diagrams or walls of text. The mechanics they
describe — a cache miss populating on the way back, a hash ring remapping only a slice of
keys when a node joins, a circuit breaker tripping after N failures — are all *dynamic*
processes. Seeing them animate, and being able to trigger the failure case yourself, makes
the underlying idea click faster than reading about it.

## Running it locally

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). Pick a concept from the
sidebar; each one has its own controls (buttons, toggles, occasionally a text input) and a
one-line explanation of what you're looking at underneath.

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

## Concepts

28 concepts, grouped roughly by theme:

**Caching**
- **Caching** — a request checks the cache before the database; hit vs. miss, with the
  miss path populating the cache on the way back.
- **Cache Write Strategies** — cache-aside, write-through, write-behind, and refresh-ahead,
  each as a distinct animated write path between client, cache, and DB.
- **Rate Limiting** — a token bucket absorbs short bursts, then starts returning 429s once
  it runs dry.
- **CDN** — edge nodes cache content close to users; only the first request per edge pays
  the round trip to the distant origin.

**Data distribution**
- **Sharding** — keys are routed to one of N shards by `hash(key) % N`.
- **Consistent Hashing** — keys walk a hash ring clockwise to their node; adding or
  removing a node only remaps the slice of keys between it and its neighbor.
- **Horizontal Partitioning** — rows are split across tables by an ordered key range.
- **Vertical Partitioning** — columns are split into separate tables by access pattern,
  joined back by a key.
- **Federation** — a monolithic database splits into several databases by function
  (users, products, orders), trading cross-table joins for independent scaling.
- **Denormalization** — a normalized schema (one join, one write) vs. a denormalized one
  (no join, but N writes to keep duplicated data in sync).
- **NoSQL Data Models** — the same record shaped four ways: key-value, document,
  wide-column, and graph.
- **Database Indexing** — a B-Tree's O(log n) search path vs. an LSM-Tree's
  append-only write path (memtable → SSTable flush → compaction).

**Replication & consistency**
- **Replication** — a primary propagates writes to replicas, synchronously or
  asynchronously, with visible replication lag.
- **Master-Slave vs Master-Master** — one writer never conflicts; two writers scale
  writes but can disagree before they've synced (with a last-write-wins resolver).
- **Consistency Patterns** — weak, eventual, and strong consistency, and whether a read
  immediately after a write sees it.
- **CAP Theorem** — trigger a network partition and choose CP (reject writes) or AP
  (accept writes, risk divergence).
- **Failover** — active-passive has a real outage window while a standby promotes;
  active-active has none.

**Traffic & APIs**
- **Load Balancing** — round-robin, random, and least-connections routing across a
  server pool.
- **API Gateway** — one entry point routes by path to different backend services and
  enforces auth/rate-limiting centrally before anything reaches a backend.
- **Proxy vs Reverse Proxy** — a forward proxy hides the client from the destination;
  a reverse proxy hides the backend from the client.
- **Circuit Breaker** — a full Closed → Open → Half-Open → Closed state machine driven
  by request outcomes.
- **DNS Resolution** — the resolver's recursive walk through root → TLD → authoritative
  servers, then a cached answer until its TTL expires.
- **WebSocket vs Polling vs SSE** — three connection patterns run side by side on the
  same timeline, showing the overhead difference directly.

**Distributed systems building blocks**
- **Message Queue** — a producer and consumer talk through a FIFO queue instead of
  directly, with visible queue depth.
- **Task Queue & Back Pressure** — a bounded queue drained by a pool of parallel workers;
  once it's full, submissions are rejected outright instead of growing forever.
- **Distributed Lock** — clients race to acquire a lock on a shared resource; the loser
  queues and gets it on release, FIFO.
- **Unique ID Generation** — a real Snowflake ID (41-bit timestamp + 10-bit machine id +
  12-bit sequence, packed with `BigInt`), broken down bit by bit.
- **Bloom Filter** — a bit array set by k hash functions per item; demonstrates the one
  failure mode a Bloom filter can have (a false positive), never a false negative.

## Project structure

```
src/
  App.jsx                 sidebar + routing (plain useState, no router library)
  data/concepts.js         the concept registry — add an entry here to add a concept
  concepts/
    <Concept>.jsx           one file per concept, self-contained
    Packet.jsx              shared "glowing sphere arcs from A to B" three.js primitive
    ChipTable.jsx            shared framer-motion chip/table primitive (used by
                             Vertical Partitioning and Federation)
```

Adding a new concept means: write a component in `src/concepts/`, import it in
`src/data/concepts.js`, add a registry entry (`id`, `title`, `blurb`, `tag`, `Component`).
That's the entire integration surface — no other file needs to change.

## Notes on the visualizations

- Three.js scenes reuse a single `Packet` component (a sphere that arcs from one 3D point
  to another and fires a callback on arrival) rather than each concept reimplementing its
  own animation loop.
- Where two concepts share a genuinely identical visual (Vertical Partitioning and
  Federation both animate table columns/tables between containers via Framer Motion
  shared-layout transitions), the chip/table primitive is factored into `ChipTable.jsx`.
- A few real bugs turned up during development and are worth knowing about if you extend
  this:
  - `useFrame` in a three.js scene keeps firing every rendered frame even after an
    animation logically finishes, until the state update that removes the object actually
    unmounts it — so an arrival callback needs a fired-once guard, or counters relying on
    it will occasionally double-fire.
  - Calling one piece of state's setter from inside another's *functional updater*
    (`setA(a => { setB(...); return ... })`) gets doubly invoked under React StrictMode in
    development, which silently duplicates anything non-idempotent (log entries, counters).
    The fix is to keep updaters pure and call other setters as sibling statements instead.
  - A free-running `setInterval` that needs to make one *coordinated* decision across two
    pieces of state (e.g. "is the TTL low **and** is the cached value stale") can't safely
    read them via two separate ref mirrors — ticks can race ahead of renders. Consolidating
    the related fields into one state object, updated by a single functional `setState`,
    fixes it.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [GSAP](https://gsap.com/) — timeline-driven SVG/DOM animation (attribute tweens,
  sequencing)
- [Framer Motion](https://motion.dev/) — shared-layout transitions, hover/entrance motion
- [Three.js](https://threejs.org/) via [`@react-three/fiber`](https://docs.pmnd.rs/react-three-fiber)
  and [`@react-three/drei`](https://github.com/pmndrs/drei) — 3D scenes
- [anime.js](https://animejs.com/) — lightweight punch-in effects (cache hit/miss pulses)

## Inspiration

The concept list draws on the classic system design references:
[ByteByteGoHq/system-design-101](https://github.com/ByteByteGoHq/system-design-101) and
[donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer).
This project doesn't reuse any of their text or images — every visualization here is an
original interactive scene built from scratch.
