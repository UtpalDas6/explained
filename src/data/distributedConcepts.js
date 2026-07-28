import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /distributed section — 26 distributed systems theory
// topics, grouped Consensus & Coordination / Time & Ordering / Failure
// Detection & Fault Tolerance / Consistency Models / Fundamental Limits /
// Coordination & Anti-Entropy. Reuses the same before/after StateDemo every
// other section uses. Deliberately theory-focused (consensus, clocks,
// failure detection) to avoid overlapping the practical/applied distributed
// topics already covered in Systems, Databases, Cloud, and Event-Driven.
const demo = (props) => () => createElement(StateDemo, props)

export const distributedConcepts = [
  {
    id: 'leader-election',
    section: 'distributed',
    title: 'Leader Election',
    blurb: "A group of nodes agrees on exactly one of them to act as leader — coordinating writes or decisions — so the group doesn't need every node agreeing on every single action.",
    tag: 'Consensus & Coordination',
    Component: demo({
      command: 'elect a leader',
      before: [{ label: '5 nodes, no leader', sub: 'who decides? nodes could act independently, conflicting', color: 'var(--bad)' }],
      after: [{ label: 'Node 3 elected leader', sub: 'coordinates writes; others follow', color: 'var(--good)' }],
      note: {
        before: 'Without a single coordinator, multiple nodes might try to make conflicting decisions at the same time.',
        after: 'One elected leader serializes decisions for the group — followers defer to it, giving the cluster a single point of coordination.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Simplified Bully algorithm: highest node id wins\nnodes = [1, 2, 3, 4, 5]\ncandidates = nodes.filter(n => n.isAlive())\nleader = max(candidates)  // node 5, if alive\n// if the leader dies, remaining nodes detect it and re-elect` }],
    realWorld:
      'Kafka brokers elect a controller, ZooKeeper/etcd clusters elect a leader for writes, and Kubernetes control-plane components elect a leader to avoid running duplicate work.',
    pitfall:
      'A naive leader election with no proper consensus underneath can produce two leaders simultaneously during a network partition (split-brain) — each side electing its own, both acting with full authority.',
    fix:
      'Use a proven consensus protocol (Raft, Paxos) for leader election — they explicitly guarantee at most one leader is ever active, even across partitions.',
  },
  {
    id: 'paxos',
    section: 'distributed',
    title: 'Paxos',
    blurb: 'A consensus protocol that lets a group of nodes agree on a single value, even if some nodes fail or messages are delayed — the foundational, if famously hard to understand, agreement algorithm.',
    tag: 'Consensus & Coordination',
    Component: demo({
      command: 'reach consensus despite failures',
      before: [{ label: '3 nodes propose different values simultaneously', sub: 'no agreement — which one is "the" value?', color: 'var(--bad)' }],
      after: [{ label: 'majority (2 of 3) accepts one proposal', sub: 'that value is now permanently, provably agreed upon', color: 'var(--good)' }],
      note: {
        before: 'Multiple nodes proposing different values at once, with messages possibly lost or delayed, have no obvious way to agree on one final answer.',
        after: 'Once a majority accepts a specific proposal, that value is locked in — Paxos guarantees no other value can ever be chosen instead.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Simplified two-phase structure\nPhase 1 (Prepare):  proposer asks a majority "will you accept proposal N?"\nPhase 2 (Accept):   if a majority promises, proposer sends the actual value\n                     -> once a majority accepts, that value is chosen, permanently` }],
    realWorld:
      "Google's Chubby lock service and Spanner both use Paxos-family algorithms internally — anywhere a system needs to agree on one value despite node failures.",
    pitfall:
      "Paxos is notoriously difficult to implement correctly from the paper alone — its subtlety around message ordering has caused real, hard-to-find production bugs even at companies with deep expertise.",
    fix:
      'Use a battle-tested, off-the-shelf implementation (or Raft, explicitly designed to be easier to implement correctly) rather than hand-rolling Paxos from scratch.',
  },
  {
    id: 'raft',
    section: 'distributed',
    title: 'Raft Consensus',
    blurb: 'A consensus algorithm designed explicitly to be more understandable than Paxos while providing the same guarantees — the algorithm behind etcd, Consul, and most modern distributed databases.',
    tag: 'Consensus & Coordination',
    Component: demo({
      command: 'replicate the log via Raft',
      before: [{ label: 'leader crashes mid-write', sub: 'is the write committed or not? ambiguous', color: 'var(--bad)' }],
      after: [{ label: 'new leader elected, log reconciled', sub: 'only entries replicated to a majority are kept', color: 'var(--good)' }],
      note: {
        before: 'A leader crashing while a write is in flight leaves an ambiguous state — did enough nodes get the write before the crash?',
        after: 'Raft explicitly defines the recovery: only log entries replicated to a majority before the crash are kept, unambiguously.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Simplified Raft log replication\nleader.appendEntry(entry)\nfollowers.forEach(f => f.replicate(entry))\nif (acknowledgedBy(majority)) {\n  leader.commit(entry)  // safe: majority has it, survives any single-node failure\n}` }],
    realWorld:
      'etcd (which backs Kubernetes), Consul, and CockroachDB all use Raft specifically for its clearer mental model over Paxos.',
    pitfall:
      'Raft assumes a single leader handles all writes, which becomes a real throughput bottleneck for write-heavy workloads — every write replicates sequentially through that one leader.',
    fix:
      'Shard data across multiple independent Raft groups (each with its own leader) so write throughput scales with the number of shards instead of being capped by a single leader.',
  },
  {
    id: 'two-phase-commit',
    section: 'distributed',
    title: 'Two-Phase Commit (2PC)',
    blurb: 'A protocol for committing a transaction across multiple independent nodes atomically — every participant must agree to commit, or the whole transaction rolls back.',
    tag: 'Consensus & Coordination',
    Component: demo({
      command: 'commit atomically or abort',
      before: [{ label: 'Node A commits, Node B crashes before deciding', sub: "inconsistent — A has the change, B doesn't", color: 'var(--bad)' }],
      after: [{ label: 'PREPARE: all vote yes → COMMIT to all', sub: 'any vote no → ABORT to all — both nodes end up in the same state', color: 'var(--good)' }],
      note: {
        before: 'Without coordination, one node committing while another crashes before deciding leaves the system genuinely inconsistent.',
        after: 'A coordinator first asks every participant to vote before anyone actually commits — only if everyone says yes does the commit happen everywhere.',
      },
    }),
    code: [{ lang: 'text', snippet: `Phase 1 (Prepare): coordinator asks every participant "can you commit?"\n                    each participant locks resources and votes yes/no\nPhase 2 (Commit):   if ALL voted yes -> coordinator tells everyone to commit\n                     if ANY voted no  -> coordinator tells everyone to abort` }],
    realWorld:
      'XA transactions across multiple databases, and distributed transaction coordinators in enterprise middleware, use 2PC when a genuine all-or-nothing commit is required.',
    pitfall:
      'If the coordinator crashes after participants vote yes but before the final decision, every participant is stuck holding locks indefinitely — the classic "blocking" flaw of 2PC.',
    fix:
      "Use three-phase commit (adds a non-blocking recovery step) for high-availability needs, or favor the saga pattern's compensating-action approach when strict blocking is unacceptable.",
  },
  {
    id: 'quorum-systems',
    section: 'distributed',
    title: 'Quorum Systems (Read/Write Quorums)',
    blurb: 'Requiring a minimum number of nodes (a quorum) to agree before a read or write succeeds — the overlap between read and write quorums is what guarantees consistency.',
    tag: 'Consensus & Coordination',
    Component: demo({
      command: 'require a quorum',
      before: [{ label: 'write to 1 of 5 replicas, read from a different 1 of 5', sub: 'might read stale data — no overlap guaranteed', color: 'var(--bad)' }],
      after: [{ label: 'W=3, R=3, N=5 (W+R > N)', sub: 'every read quorum overlaps at least one node from every write quorum', color: 'var(--good)' }],
      note: {
        before: 'Writing to one replica and reading from a different single replica gives no guarantee the read ever sees that write.',
        after: 'With W+R greater than N, any read quorum and write quorum are mathematically guaranteed to share at least one node.',
      },
    }),
    code: [{ lang: 'text', snippet: `N = 5  // total replicas\nW = 3  // write quorum\nR = 3  // read quorum\n// W + R (6) > N (5) -> guaranteed overlap -> read always sees the latest write` }],
    realWorld:
      'Cassandra and DynamoDB both let you tune W and R per query — a stricter quorum trades latency and availability for stronger consistency, adjustable per operation.',
    pitfall:
      'Choosing W and R such that W + R <= N (for lower latency) means reads are no longer guaranteed to overlap writes — a read can return stale data with no warning.',
    fix:
      "Deliberately choose W + R > N whenever strong (read-your-writes) consistency is required for that operation, and accept the latency tradeoff explicitly.",
  },
  {
    id: 'distributed-transactions',
    section: 'distributed',
    title: 'Distributed Transactions',
    blurb: "Coordinating an atomic operation across multiple independent services or databases — genuinely hard because there's no single database enforcing ACID across all of them at once.",
    tag: 'Consensus & Coordination',
    Component: demo({
      command: 'coordinate across services',
      before: [{ label: 'single-DB transaction: BEGIN...COMMIT', sub: 'one database enforces atomicity — straightforward', color: 'var(--accent)' }],
      after: [{ label: 'across 3 independent services/databases', sub: 'needs 2PC, a saga, or an outbox — no free atomicity', color: 'var(--good)' }],
      note: {
        before: 'A transaction confined to a single database gets atomicity for free — the database engine enforces it.',
        after: 'The same guarantee across independent services requires an explicit coordination protocol.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Single DB: atomicity is free\nBEGIN; UPDATE accounts SET balance = balance - 50 WHERE id=1;\n       UPDATE accounts SET balance = balance + 50 WHERE id=2; COMMIT;\n\n// Across services: needs explicit coordination\n// 2PC (blocking, strong consistency) OR\n// Saga with compensations (non-blocking, eventual consistency)` }],
    realWorld:
      'A checkout flow touching payment, inventory, and shipping services (each with its own database) is the canonical distributed transaction problem — exactly why the saga pattern exists.',
    pitfall:
      'Reaching for 2PC by default because it "feels like a real transaction" imports real availability costs that most distributed business processes don\'t actually need.',
    fix:
      'Default to the saga pattern for most cross-service business processes, and reserve 2PC for the rare case that genuinely needs strict, synchronous all-or-nothing atomicity.',
  },
  {
    id: 'logical-clocks',
    section: 'distributed',
    title: 'Lamport Logical Clocks',
    blurb: "A simple counter-based scheme for establishing a 'happens-before' order between events across different machines, without needing synchronized physical clocks.",
    tag: 'Time & Ordering',
    Component: demo({
      command: 'assign logical timestamps',
      before: [{ label: 'Node A: 3:00:01.200pm, Node B: 3:00:01.150pm', sub: 'clocks slightly out of sync — which event really came first?', color: 'var(--bad)' }],
      after: [{ label: 'A sends msg with clock=5 → B sets clock=max(3,5)+1=6', sub: 'causal order preserved, no physical clock sync needed', color: 'var(--good)' }],
      note: {
        before: "Two machines' physical clocks are never perfectly synchronized — comparing raw timestamps can get the actual causal order wrong.",
        after: 'Each node keeps a simple counter, updated to exceed any timestamp it receives — this preserves true causal order without physical clock accuracy.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Lamport clock rule\non local event: clock = clock + 1\non send:        clock = clock + 1; attach clock to message\non receive(msg): clock = max(clock, msg.clock) + 1\n// guarantees: if A causally happened-before B, then clock(A) < clock(B)` }],
    realWorld:
      'Distributed databases and version control systems use logical clocks to establish consistent causal ordering without depending on synchronized wall-clock time.',
    pitfall:
      'Lamport clocks only guarantee ordering in one direction — clock(A) < clock(B) does NOT mean A happened-before B, since unrelated concurrent events can end up with either ordering.',
    fix:
      'Use vector clocks instead when the system genuinely needs to distinguish "A definitely happened before B" from "A and B were concurrent" — Lamport clocks alone can\'t make that distinction.',
  },
  {
    id: 'vector-clocks',
    section: 'distributed',
    title: 'Vector Clocks',
    blurb: 'An extension of Lamport clocks that tracks a full vector of counters (one per node) — able to definitively detect when two events are truly concurrent, not just causally ordered.',
    tag: 'Time & Ordering',
    Component: demo({
      command: 'detect true concurrency',
      before: [{ label: 'Lamport clock: A=5, B=6', sub: 'looks like A happened before B — but were they actually related?', color: 'var(--accent)' }],
      after: [{ label: 'vector clock: A=[2,0,1], B=[0,3,0]', sub: 'neither dominates the other → genuinely concurrent, conflicting writes', color: 'var(--good)' }],
      note: {
        before: 'A single Lamport counter can only say one number is smaller — it can\'t distinguish "genuinely caused by" from "just got a smaller number".',
        after: 'Comparing the full vectors reveals neither dominates in every position — the mathematical signature of two truly independent, concurrent events.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Vector clock: one counter per node, e.g. [nodeA, nodeB, nodeC]\nnode_a.clock = [2, 0, 1]\nnode_b.clock = [0, 3, 0]\n// neither vector is >= the other in every position -> concurrent, not causally related` }],
    realWorld:
      'DynamoDB (in its original design) and Riak use vector clocks specifically to detect concurrent, conflicting writes and surface the conflict for resolution rather than silently picking one.',
    pitfall:
      'A vector clock needs one entry per node — in a cluster with thousands of nodes or client devices, the vector becomes large and expensive to store and compare on every write.',
    fix:
      "Use a bounded or pruned vector clock variant (dropping entries for inactive nodes) once node count grows large enough that full vectors become a genuine storage cost.",
  },
  {
    id: 'clock-synchronization',
    section: 'distributed',
    title: 'Clock Synchronization',
    blurb: 'Keeping physical clocks across many machines close to agreement — never perfect, since network delay alone makes true simultaneity across machines fundamentally uncertain.',
    tag: 'Time & Ordering',
    Component: demo({
      command: 'sync via NTP',
      before: [{ label: 'unsynced clocks: Node A ahead by 400ms', sub: 'a log timestamped "before" might have actually happened after', color: 'var(--bad)' }],
      after: [{ label: 'NTP-synced: clocks within ~10ms of each other', sub: 'not perfect, but usually good enough', color: 'var(--good)' }],
      note: {
        before: "An unsynchronized clock running fast makes its timestamps unreliable relative to every other machine's.",
        after: 'Regular synchronization against a reference time source keeps clocks within a much smaller, bounded margin of error.',
      },
    }),
    code: [{ lang: 'text', snippet: `// NTP: periodically adjusts local clock toward a trusted reference\n// typical accuracy: a few to tens of milliseconds over the internet,\n// often sub-millisecond within a well-managed datacenter` }],
    realWorld:
      'Google Spanner uses TrueTime — GPS and atomic clocks plus an explicit uncertainty bound — specifically because ordinary NTP synchronization isn\'t tight enough for its global strict consistency.',
    pitfall:
      'Relying on synchronized wall-clock time to order events across machines (rather than a logical or vector clock) is fragile — even small clock drift can produce a wrong causal order, silently.',
    fix:
      'Use logical or vector clocks for ordering events that matter causally, and reserve synchronized physical time for human-facing timestamps and coarse-grained coordination.',
  },
  {
    id: 'failure-detectors',
    section: 'distributed',
    title: 'Failure Detectors',
    blurb: 'A mechanism (typically heartbeats) that guesses whether a remote node is alive or dead — necessarily imperfect, since a slow node and a dead node look identical from the outside.',
    tag: 'Failure Detection & Fault Tolerance',
    Component: demo({
      command: 'detect the failure',
      before: [{ label: 'no heartbeat received in 30s', sub: 'is the node dead, or just slow/partitioned?', color: 'var(--bad)' }],
      after: [{ label: 'phi accrual: suspicion level rises smoothly, crosses threshold', sub: 'declared "likely failed" based on historical heartbeat variance', color: 'var(--good)' }],
      note: {
        before: 'A missed heartbeat is genuinely ambiguous — dead, overloaded, or a briefly congested network.',
        after: 'A more sophisticated detector tracks historical heartbeat variance and produces a continuous suspicion level, not a binary guess.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Simple heartbeat detector: binary, brittle\nif (now - lastHeartbeat > timeout) { markDead(node) }\n\n// Phi accrual detector: continuous suspicion, adapts to normal jitter\nphi = suspicionLevel(now - lastHeartbeat, historicalIntervals)\nif (phi > threshold) { markSuspected(node) }` }],
    realWorld:
      'Cassandra uses a phi accrual failure detector because a fixed timeout either declares slow-but-healthy nodes dead too eagerly, or takes too long to notice genuinely dead ones.',
    pitfall:
      'It\'s fundamentally impossible to distinguish "the node is dead" from "the node is just very slow" with perfect accuracy — every detector trades false positives against detection latency.',
    fix:
      "Tune the detector's sensitivity to the actual cost of each mistake — a system where a false failure declaration is expensive should lean toward slower, more conservative detection.",
  },
  {
    id: 'split-brain',
    section: 'distributed',
    title: 'Split-Brain',
    blurb: "A network partition causes a cluster to split into two or more groups, each believing it's the legitimate, whole cluster — and each potentially electing its own leader independently.",
    tag: 'Failure Detection & Fault Tolerance',
    Component: demo({
      command: 'prevent dual leadership',
      before: [{ label: '5-node cluster splits: [3 nodes] | [2 nodes]', sub: 'both sides elect a leader, both accept writes', color: 'var(--bad)' }],
      after: [{ label: 'only the majority side ([3 nodes]) can elect a leader', sub: 'the minority side refuses writes until reconnected', color: 'var(--good)' }],
      note: {
        before: "Both halves of a partitioned cluster can each conclude they're on their own and elect an independent leader — now two leaders both accept conflicting writes.",
        after: 'Requiring a strict majority to elect a leader mathematically guarantees at most one side of any partition can ever reach it.',
      },
    }),
    code: [{ lang: 'text', snippet: `totalNodes = 5\nrequiredForLeader = Math.floor(totalNodes / 2) + 1  // 3\n// after partition: side A has 3 nodes (can elect a leader)\n//                   side B has 2 nodes (cannot reach quorum, correctly refuses)` }],
    realWorld:
      'This is the exact failure mode quorum-based consensus (Raft, Paxos) exists to prevent — a naive leader election scheme without a majority requirement is genuinely vulnerable.',
    pitfall:
      'A cluster with an even number of nodes (say, 4) can split into two equal halves — neither reaches a strict majority, the safe outcome, but the entire cluster becomes unavailable.',
    fix:
      'Deploy clusters with an odd number of nodes (3, 5, 7) so an even split that leaves nobody with a majority is structurally impossible.',
  },
  {
    id: 'byzantine-fault-tolerance',
    section: 'distributed',
    title: 'Byzantine Fault Tolerance',
    blurb: "Tolerating nodes that don't just fail cleanly, but actively lie or send conflicting, malicious information to different parts of the system — much harder than simple crash failures.",
    tag: 'Failure Detection & Fault Tolerance',
    Component: demo({
      command: 'tolerate a lying node',
      before: [{ label: 'crash-fault tolerant: assumes a failed node just stops responding', sub: 'a compromised node sending different lies to different peers breaks this', color: 'var(--bad)' }],
      after: [{ label: 'BFT protocol: tolerates up to f malicious nodes among 3f+1 total', sub: 'consensus still reached even if some nodes actively lie', color: 'var(--good)' }],
      note: {
        before: "Most consensus protocols assume a failed node simply stops responding — they don't account for one still running but sending contradictory information.",
        after: 'A Byzantine fault tolerant protocol explicitly tolerates a bounded number of actively malicious nodes and still reaches correct consensus among the honest majority.',
      },
    }),
    code: [{ lang: 'text', snippet: `// PBFT-style: needs 3f+1 total nodes to tolerate f Byzantine (malicious) nodes\ntotalNodes = 3 * f + 1\n// e.g. f=1 malicious node tolerated -> need 4 total nodes\n// requires multiple rounds of cross-verified messaging, more expensive than crash-tolerant consensus` }],
    realWorld:
      "Blockchain consensus (Bitcoin's proof-of-work, PBFT-based systems) is the primary real-world use case — a public, permissionless network genuinely can't assume every participant is honest.",
    pitfall:
      'Byzantine fault tolerant protocols are significantly more expensive than crash-fault-tolerant ones like Raft — using BFT inside a trusted, internal environment is unnecessary overhead.',
    fix:
      'Reserve Byzantine fault tolerance for genuinely adversarial environments (public blockchains, multi-organization systems with no mutual trust) — use Raft/Paxos for trusted internal infrastructure.',
  },
  {
    id: 'gossip-protocol',
    section: 'distributed',
    title: 'Gossip Protocol',
    blurb: 'Nodes periodically exchange state with a few random peers, spreading information through the cluster epidemic-style — no central broadcaster, but everyone eventually converges.',
    tag: 'Failure Detection & Fault Tolerance',
    Component: demo({
      command: 'spread via gossip',
      before: [{ label: 'central coordinator broadcasts to all 1,000 nodes', sub: "single point of failure, doesn't scale past a certain size", color: 'var(--bad)' }],
      after: [{ label: 'each node gossips to 3 random peers every second', sub: 'information reaches all 1,000 nodes in ~O(log n) rounds', color: 'var(--good)' }],
      note: {
        before: "A single central broadcaster is both a bottleneck and a single point of failure — doesn't scale gracefully.",
        after: "Each node only talks to a few random peers, but information still spreads through the whole cluster in a small, logarithmic number of rounds.",
      },
    }),
    code: [{ lang: 'text', snippet: `every gossipInterval:\n  peers = randomSample(allKnownNodes, 3)\n  peers.forEach(p => p.exchangeState(myState))\n// after O(log n) rounds, information has spread to the entire cluster` }],
    realWorld:
      "Cassandra uses gossip to spread cluster membership and node health information — every node eventually learns about every other's state without a central authority.",
    pitfall:
      "Gossip trades immediacy for resilience — information takes several rounds to fully propagate, so there's always a window where nodes have a slightly different view of cluster state.",
    fix:
      "Accept the propagation delay where it's tolerable (cluster membership, health status), and use a stronger consistency mechanism (consensus) for anything needing immediate agreement.",
  },
  {
    id: 'membership-protocol',
    section: 'distributed',
    title: 'Cluster Membership (SWIM Protocol)',
    blurb: 'How a distributed system tracks which nodes are currently part of the cluster and which have failed or left — combining gossip-style dissemination with efficient failure detection.',
    tag: 'Failure Detection & Fault Tolerance',
    Component: demo({
      command: 'detect and disseminate membership changes',
      before: [{ label: 'every node pings every other node directly', sub: "O(n²) network traffic — doesn't scale past a few hundred nodes", color: 'var(--bad)' }],
      after: [{ label: 'SWIM: each node pings 1 random peer, indirect pings on suspicion', sub: 'O(n) traffic, scales to thousands of nodes', color: 'var(--good)' }],
      note: {
        before: 'Every node checking every other directly means total messaging cost grows quadratically.',
        after: 'Each node only actively checks one random peer per round, with an indirect-probe fallback — total cost grows linearly, not quadratically.',
      },
    }),
    code: [{ lang: 'text', snippet: `// SWIM: each round, one node directly pings ONE random peer\nif (noResponse) {\n  // ask k other random nodes to indirectly ping the suspect\n  // avoids declaring a node dead just because of a transient network blip to you\n}` }],
    realWorld:
      'Consul, Serf (HashiCorp), and Cassandra\'s gossip layer all use SWIM-family protocols for efficient membership tracking without O(n²) all-to-all health checking.',
    pitfall:
      'A membership protocol optimized purely for scale can be slower to detect a genuinely failed node than a simpler, more expensive all-to-all approach.',
    fix:
      "Tune the protocol's probe interval and indirect-probe fan-out based on how quickly the system needs to detect failures versus acceptable background network chatter.",
  },
  {
    id: 'linearizability',
    section: 'distributed',
    title: 'Linearizability',
    blurb: 'The strongest common consistency model — every operation appears to take effect instantaneously at some point between when it was called and when it returned, as if there were only one copy of the data.',
    tag: 'Consistency Models',
    Component: demo({
      command: 'enforce linearizable order',
      before: [{ label: 'client A writes x=5, client B reads x → gets 3 (stale)', sub: 'even though A\'s write already returned "success"', color: 'var(--bad)' }],
      after: [{ label: 'client A writes x=5 (returns) → any later read sees x=5', sub: 'once a write completes, every subsequent operation reflects it', color: 'var(--good)' }],
      note: {
        before: 'A write that already returned "success" but a subsequent read still doesn\'t see breaks the intuitive guarantee most people assume.',
        after: 'Once any operation completes, every operation starting afterward is guaranteed to see its effect.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Linearizable: real-time order is respected\nt1: write(x, 5)  -----|  (completes)\nt2:                        read(x) -> must return 5, since t2 started after t1 completed` }],
    realWorld:
      'etcd and ZooKeeper both offer linearizable reads for exactly this reason — configuration and coordination data needs every reader to see the single, current, agreed-upon truth.',
    pitfall:
      'Linearizability is expensive — it typically requires coordinating with a quorum (or the leader) on every single read, adding real latency versus reading from any nearby replica.',
    fix:
      'Reserve linearizable reads for operations that genuinely need the strongest guarantee (leader election state, financial balances), and use a weaker, faster model elsewhere.',
  },
  {
    id: 'causal-consistency',
    section: 'distributed',
    title: 'Causal Consistency',
    blurb: 'Guarantees that causally related operations are seen by everyone in the same order — but unrelated, concurrent operations can be seen in different orders by different observers.',
    tag: 'Consistency Models',
    Component: demo({
      command: 'preserve causal order',
      before: [{ label: 'reply visible before the original comment it replies to', sub: "a causality violation — a reply shouldn't appear before its parent", color: 'var(--bad)' }],
      after: [{ label: 'reply always shown after its parent comment, everywhere', sub: 'causal order preserved, even though delivery timing can vary', color: 'var(--good)' }],
      note: {
        before: 'A causally dependent event (a reply) becoming visible before the event it depends on looks obviously, confusingly wrong.',
        after: 'Causal consistency guarantees this can never happen — a reply is only ever visible after the comment it replies to, everywhere.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Causal consistency: only enforces order for causally related events\npost("original comment")              // event A\nreplyTo(A, "great point!")             // event B, causally depends on A\n// guarantee: everyone sees A before B\n// but an unrelated comment C can appear in any order relative to A/B` }],
    realWorld:
      'Social media comment threads and collaborative document editing both need causal consistency — a reply appearing before its parent would be immediately, visibly broken.',
    pitfall:
      'Causal consistency is often confused with the much stronger linearizability — it only orders causally *related* events, so independent concurrent writes can be observed in different orders.',
    fix:
      "Understand exactly which guarantee an operation needs — causal consistency is enough (and much cheaper) for most user-facing content ordering; reserve linearizability for what truly needs it.",
  },
  {
    id: 'sloppy-quorum-hinted-handoff',
    section: 'distributed',
    title: 'Sloppy Quorums & Hinted Handoff',
    blurb: "When the 'correct' replicas for a write are unreachable, temporarily writing to a different, reachable node instead (a sloppy quorum) — with a hint to hand the data off once the right node recovers.",
    tag: 'Consistency Models',
    Component: demo({
      command: 'write to a substitute node',
      before: [{ label: 'write fails: 2 of 3 correct replicas are unreachable', sub: "strict quorum can't be met — write rejected entirely", color: 'var(--bad)' }],
      after: [{ label: 'write succeeds on 2 other, reachable nodes instead', sub: 'hint attached: forward to the real owner once it recovers', color: 'var(--good)' }],
      note: {
        before: 'A strict quorum satisfied only by specific designated replicas fails the write entirely when too many of them are unreachable.',
        after: 'Accepting the write on any reachable nodes (with a hint recording where it belongs) keeps the system available.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Strict quorum: write fails if the specific owning nodes are unreachable\nwrite(key, value, targetNodes=[A, B, C])  // fails if 2 of 3 are down\n\n// Sloppy quorum: falls back to ANY reachable nodes, with a hint\nwrite(key, value, hint="belongs to node A")  // succeeds on nodes D, E instead\n// once node A recovers, D and E hand off the hinted data to it` }],
    realWorld:
      "DynamoDB's original design (and Cassandra) both use sloppy quorums to prioritize availability during a partition — a write always succeeds somewhere.",
    pitfall:
      'A sloppy quorum genuinely weakens consistency — a read immediately after a sloppy write, hitting the correct (not-yet-handed-off) nodes, can miss data that technically already "succeeded".',
    fix:
      'Use sloppy quorums where availability matters more than strict consistency (shopping carts, session data), and disable the fallback for data where a missed read is genuinely unacceptable.',
  },
  {
    id: 'crdt',
    section: 'distributed',
    title: 'CRDTs (Conflict-Free Replicated Data Types)',
    blurb: 'Data structures specifically designed so concurrent, conflicting updates from different replicas can always be merged automatically into the same final result — no coordination required.',
    tag: 'Consistency Models',
    Component: demo({
      command: 'merge automatically',
      before: [{ label: 'replica A: cart = [apple]; replica B: cart = [banana]', sub: 'concurrent edits — "last write wins" merge loses one item', color: 'var(--bad)' }],
      after: [{ label: 'CRDT set union: merged cart = [apple, banana]', sub: 'both concurrent additions preserved automatically', color: 'var(--good)' }],
      note: {
        before: 'Two replicas each accept a different concurrent write — a naive "last write wins" merge arbitrarily throws one away.',
        after: 'A CRDT is mathematically designed so its merge always produces the same, sensible, conflict-free result — nothing is lost.',
      },
    }),
    code: [{ lang: 'text', snippet: `// G-Set (grow-only set) CRDT: merge = union, always converges\nreplicaA.cart = {apple}\nreplicaB.cart = {banana}\nmerged = replicaA.cart.union(replicaB.cart)  // {apple, banana} — deterministic, no data lost` }],
    realWorld:
      'Collaborative editing tools and offline-first mobile apps use CRDTs so multiple users editing concurrently — even fully offline — always merge back together automatically.',
    pitfall:
      "Not every data structure has a natural, sensible CRDT formulation — a bank balance can't be a CRDT (concurrent withdrawals need to be checked against each other, not blindly merged).",
    fix:
      'Use CRDTs for data where concurrent edits have obvious "combine them" semantics (sets, counters, collaborative text) — use consensus for data where conflicts need real business logic.',
  },
  {
    id: 'flp-impossibility',
    section: 'distributed',
    title: 'FLP Impossibility',
    blurb: 'A foundational theorem proving that in a fully asynchronous network (no bound on message delay), no consensus protocol can guarantee both correctness and termination if even one node might fail.',
    tag: 'Fundamental Limits',
    Component: demo({
      command: 'accept the impossibility',
      before: [{ label: '"surely a perfect consensus algorithm exists"', sub: 'a natural but mathematically false assumption', color: 'var(--accent)' }],
      after: [{ label: 'FLP (1985): no such algorithm exists, fully async + 1 faulty node', sub: 'a proven, permanent limit, not an engineering gap', color: 'var(--good)' }],
      note: {
        before: "It's tempting to assume better engineering could produce a consensus algorithm that always terminates correctly, no matter what.",
        after: 'The FLP theorem proves this is mathematically impossible in a fully asynchronous system — a permanent boundary, not a current limitation.',
      },
    }),
    code: [{ lang: 'text', snippet: `// FLP's core insight (informal):\n// in a fully asynchronous system, you can never distinguish\n// "a message is just slow" from "the sender crashed"\n// -> any consensus algorithm can be forced into indecision forever` }],
    realWorld:
      "Every real-world consensus system (Raft, Paxos) sidesteps FLP in practice by adding partial synchrony assumptions (timeouts, leader election) — not violating the theorem, just accepting it doesn't apply to bounded-delay networks.",
    pitfall:
      'Misreading FLP as "consensus is impossible in practice" leads to unnecessary despair — real systems achieve reliable consensus every day under reasonable network assumptions.',
    fix:
      "Understand FLP as defining the theoretical boundary, not a practical obstacle — real systems add timeouts and randomization that make termination overwhelmingly likely.",
  },
  {
    id: 'pacelc-theorem',
    section: 'distributed',
    title: 'PACELC Theorem',
    blurb: "Extends CAP theorem with a tradeoff that exists even when there's no partition: Else, choose between Latency and Consistency — CAP alone only describes behavior during a partition.",
    tag: 'Fundamental Limits',
    Component: demo({
      command: 'trade latency for consistency, even without a partition',
      before: [{ label: 'CAP theorem: only describes the tradeoff during a partition', sub: 'silent about the normal, no-partition case', color: 'var(--accent)' }],
      after: [{ label: 'PACELC: if Partitioned, choose A or C; Else, choose L or C', sub: 'a tradeoff exists even when everything is healthy', color: 'var(--good)' }],
      note: {
        before: "CAP theorem only talks about what happens during a network partition — silent about tradeoffs the other 99% of the time.",
        after: 'PACELC makes explicit that even with no partition, a system still chooses between waiting for confirmation (consistency) or responding immediately (latency).',
      },
    }),
    code: [{ lang: 'text', snippet: `// PACELC decision tree\nif (networkPartitioned) {\n  choose(Availability, Consistency)  // this is just CAP\n} else {\n  choose(Latency, Consistency)  // the "ELC" part CAP never mentions\n}` }],
    realWorld:
      'DynamoDB (PA/EL) and traditional synchronously-replicated SQL databases (PC/EC) sit at genuinely different points on this same tradeoff.',
    pitfall:
      'Evaluating a database purely on its CAP classification misses half the story — two AP systems can have very different latency/consistency behavior during normal, healthy operation.',
    fix:
      "When choosing a database, ask about its PACELC position specifically — the day-to-day (no-partition) tradeoff usually matters more in practice than the rare-partition behavior CAP describes.",
  },
  {
    id: 'network-partitions',
    section: 'distributed',
    title: 'Network Partitions',
    blurb: 'A break in network connectivity that splits a cluster into groups that can no longer talk to each other — not a rare edge case, but a routine, expected event any distributed system has to handle.',
    tag: 'Fundamental Limits',
    Component: demo({
      command: 'design for the partition',
      before: [{ label: '"the network is reliable" — a design assumption', sub: 'a partition happens, and the untested code path breaks badly', color: 'var(--bad)' }],
      after: [{ label: 'explicit partition handling: minority rejects writes, majority continues', sub: 'a tested, deliberate behavior, not a surprise', color: 'var(--good)' }],
      note: {
        before: 'A system designed assuming the network always works has genuinely untested behavior the moment a real partition happens.',
        after: 'A system explicitly designed for partitions has a deliberate, tested answer for exactly this scenario.',
      },
    }),
    code: [{ lang: 'text', snippet: `// One of the "Fallacies of Distributed Computing":\n// "The network is reliable" -- it is not, and code must handle when it isn't\non networkPartition():\n  if (haveQuorum()) { continueServingWrites() }\n  else { rejectWrites(); waitForReconnection() }` }],
    realWorld:
      'Every major cloud provider has had real, documented network partition incidents between availability zones — exactly why multi-AZ architectures explicitly plan for this failure mode.',
    pitfall:
      "Treating a network partition as rare and exceptional (instead of routine and expected) means the code path that handles it is rarely tested and often has undiscovered bugs.",
    fix:
      "Test partition behavior deliberately (chaos engineering, network fault injection) rather than leaving it as untested, theoretical code.",
  },
  {
    id: 'coordination-service',
    section: 'distributed',
    title: 'Coordination Services (ZooKeeper / etcd)',
    blurb: "A dedicated, highly-available service providing the primitives distributed applications need but shouldn't each reimplement themselves: leader election, configuration storage, service discovery.",
    tag: 'Coordination & Anti-Entropy',
    Component: demo({
      command: 'delegate to a coordination service',
      before: [{ label: 'every service hand-rolls its own leader election logic', sub: '20 services, 20 subtly different (and buggy) implementations', color: 'var(--bad)' }],
      after: [{ label: "all 20 services use etcd's built-in leader election primitive", sub: 'one well-tested implementation, used everywhere', color: 'var(--good)' }],
      note: {
        before: 'Distributed coordination is deceptively hard to get right — every team reimplementing it independently multiplies the chance of a subtle bug.',
        after: 'A dedicated, well-tested coordination service provides these primitives once, correctly — every service uses the same proven implementation.',
      },
    }),
    code: [{ lang: 'bash', snippet: `etcdctl lock /my-app/leader-election  # blocks until this process is the leader\netcdctl put /config/feature-flags '{"newCheckout": true}'  # shared config, watched by all instances` }],
    realWorld:
      'ZooKeeper (Kafka, Hadoop) and etcd (Kubernetes) both back critical infrastructure specifically because they solve leader election, configuration, and service discovery once, correctly.',
    pitfall:
      'A coordination service becomes a single, critical dependency — if it goes down, leader election and config lookups across the entire dependent fleet can be affected simultaneously.',
    fix:
      "Run the coordination service itself as a properly-sized, monitored, highly-available cluster (typically 3 or 5 nodes) — treat its reliability as seriously as the services depending on it.",
  },
  {
    id: 'read-repair',
    section: 'distributed',
    title: 'Read Repair & Anti-Entropy',
    blurb: 'Background processes that detect and fix inconsistencies between replicas that have drifted apart over time — either opportunistically during a normal read, or via a dedicated periodic sync.',
    tag: 'Coordination & Anti-Entropy',
    Component: demo({
      command: 'repair the stale replica',
      before: [{ label: 'replica C missed an update, still has the old value', sub: 'nobody notices until a client happens to read from C', color: 'var(--bad)' }],
      after: [{ label: 'read from A, B, C simultaneously; C\'s stale value is corrected on the spot', sub: 'the read itself repairs the inconsistency', color: 'var(--good)' }],
      note: {
        before: 'A replica that missed an update just silently sits stale — nothing actively notices or fixes it.',
        after: 'Querying multiple replicas on a read surfaces the disagreement immediately — the stale replica gets corrected as a side effect of the read.',
      },
    }),
    code: [{ lang: 'text', snippet: `values = readFromReplicas([A, B, C], key)\nif (values.C !== majorityValue(values)) {\n  writeBack(C, majorityValue(values))  // repaired inline, during the read\n}` }],
    realWorld:
      'Cassandra performs read repair by default on a configurable percentage of reads, plus a full anti-entropy repair (using Merkle trees) on a schedule.',
    pitfall:
      'Read repair alone only fixes data that actually gets read — a rarely-accessed key with a stale replica can stay inconsistent indefinitely.',
    fix:
      "Pair read repair (opportunistic, catches hot data fast) with a scheduled, full anti-entropy process (catches everything, including cold data) rather than relying on read repair alone.",
  },
  {
    id: 'merkle-trees',
    section: 'distributed',
    title: 'Merkle Trees',
    blurb: 'A tree of cryptographic hashes that lets two replicas compare their entire dataset for differences by exchanging only a handful of hashes, instead of every individual key.',
    tag: 'Coordination & Anti-Entropy',
    Component: demo({
      command: 'compare via hash tree',
      before: [{ label: 'compare 1,000,000 keys directly between two replicas', sub: 'transfers and compares every single key/value pair', color: 'var(--bad)' }],
      after: [{ label: 'compare root hashes first; descend only into mismatched branches', sub: 'finds the differing keys in O(log n) comparisons', color: 'var(--good)' }],
      note: {
        before: 'Comparing every key directly means transferring and checking the entire dataset just to find a handful of genuine differences.',
        after: 'A matching branch of a million keys is confirmed identical with a single hash comparison — only differing branches get descended into.',
      },
    }),
    code: [{ lang: 'text', snippet: `// If root hashes match: replicas are identical, done in 1 comparison\nif (treeA.rootHash === treeB.rootHash) return "in sync"\n\n// If they differ: recurse into child hashes to find exactly which keys differ\ncompareChildren(treeA, treeB)  // repeats until the specific differing leaf keys are found` }],
    realWorld:
      "Cassandra's anti-entropy repair and Git's own object model (comparing commit trees between two clones) both use this structure to efficiently find real differences between large, mostly-identical datasets.",
    pitfall:
      "Merkle trees have to be rebuilt (or incrementally maintained) as data changes — a stale tree gives an inaccurate comparison, potentially missing real differences.",
    fix:
      'Keep the Merkle tree incrementally updated as writes happen (rather than rebuilding from scratch) so comparisons always check against genuinely current tree state.',
  },
  {
    id: 'checkpointing-and-recovery',
    section: 'distributed',
    title: 'Distributed Snapshots (Checkpointing)',
    blurb: "Capturing a globally consistent snapshot of an entire distributed system's state — hard because there's no single instant \"now\" shared across every independent node.",
    tag: 'Coordination & Anti-Entropy',
    Component: demo({
      command: 'capture a consistent snapshot',
      before: [{ label: "each node saves its own state independently", sub: 'a message "in flight" can be captured by neither or both snapshots', color: 'var(--bad)' }],
      after: [{ label: 'Chandy-Lamport: marker messages flow through every channel', sub: 'in-flight messages captured exactly once, snapshot is globally consistent', color: 'var(--good)' }],
      note: {
        before: "Nodes saving state independently, without coordination, can create a snapshot where a message appears to have vanished — logically impossible, but exactly what an uncoordinated snapshot produces.",
        after: "A marker-based protocol ensures every in-flight message is captured by exactly one node's snapshot — the combined state is a valid, logically consistent global snapshot.",
      },
    }),
    code: [{ lang: 'text', snippet: `// Chandy-Lamport (simplified)\ninitiator.recordLocalState()\ninitiator.sendMarkerOnAllOutgoingChannels()\n\non receiveMarker(fromChannel):\n  if (firstMarkerReceived) {\n    recordLocalState()\n    sendMarkerOnAllOutgoingChannels()\n    startRecordingMessagesOn(otherChannels)  // until their markers arrive too\n  } else {\n    stopRecordingMessagesOn(fromChannel)  // this channel's in-flight messages are captured\n  }` }],
    realWorld:
      "Flink's checkpointing mechanism (for exactly-once stream processing) is directly based on Chandy-Lamport — lets a job recover to a consistent point after a crash without losing or double-counting data.",
    pitfall:
      "An ad-hoc snapshot mechanism (everyone dump state at roughly the same wall-clock time) looks reasonable but doesn't guarantee global consistency — in-flight messages can be silently lost or duplicated.",
    fix:
      'Use a proven distributed snapshot algorithm (Chandy-Lamport, or a framework\'s built-in checkpointing) rather than an ad-hoc "everyone save state around the same time" approach.',
  },
  {
    id: 'distributed-deadlock',
    section: 'distributed',
    title: 'Distributed Deadlock Detection',
    blurb: 'Detecting a cycle of nodes each waiting on a resource held by the next — genuinely harder across machines than on one, since no single node can see the full wait-for graph.',
    tag: 'Coordination & Anti-Entropy',
    Component: demo({
      command: 'detect the cycle',
      before: [{ label: 'Node A waits on a lock held by Node B; B waits on a lock held by A', sub: 'each node only sees its own local wait — the cycle is invisible', color: 'var(--bad)' }],
      after: [{ label: 'wait-for graph assembled across nodes: A → B → A', sub: 'the cycle is now visible, one transaction is aborted to break it', color: 'var(--good)' }],
      note: {
        before: "Each node only knows what it itself is waiting for — a cycle spanning multiple machines is invisible from any single node's perspective.",
        after: 'Combining wait-for information from every node into one global graph reveals the cycle explicitly.',
      },
    }),
    code: [{ lang: 'text', snippet: `// Each node reports its local wait-for edges to a coordinator (or via gossip)\nnodeA.waitingFor = { resource: 'lockB', heldBy: 'nodeB' }\nnodeB.waitingFor = { resource: 'lockA', heldBy: 'nodeA' }\n// coordinator assembles: A -> B -> A  == cycle detected\n// resolution: abort the "victim" transaction (e.g. the younger one) to break the cycle` }],
    realWorld:
      'Distributed database systems (spanning multiple nodes, each locking its own local resources) need this exact mechanism — a deadlock trivially visible on one machine is hidden across several.',
    pitfall:
      'Detecting a distributed deadlock too eagerly (based on incomplete or stale wait-for information) can produce phantom deadlocks — aborting a transaction that was just slow to report its state.',
    fix:
      'Use a well-tested distributed deadlock detection algorithm with proper staleness handling (or a simpler timeout-based abort) rather than a naively-assembled global wait-for graph.',
  },
]
