Most system design content is a static diagram and a wall of text.

So I built something different: an interactive visualizer where you actually watch the mechanism move instead of reading about it.

**28 classic system design concepts** — caching, sharding, consistent hashing, CAP theorem, circuit breakers, distributed locks, DNS resolution, and more — each one a live scene you can poke at:

→ Kill a primary node and watch active-passive failover leave a real outage gap — while active-active has none
→ Add a node to a consistent hashing ring and see only a *slice* of keys remap, not the whole thing
→ Trip a circuit breaker after 3 failures and watch it walk Closed → Open → Half-Open → Closed
→ Race 3 clients for a distributed lock and watch the loser queue up, FIFO
→ Trigger a network partition and choose CP or AP — and actually see the tradeoff play out

Every concept ships with three layers:
• A real animated visualization (GSAP, Framer Motion, Three.js, anime.js — not a GIF)
• A realistic code snippet (Redis, nginx, SQL — not pseudocode)
• Where it actually shows up in production (AWS RDS, Cassandra, Sidekiq, Kong, DynamoDB...)

Built with React + Vite, deployed on GitHub Pages, fully open source.

Live: https://utpaldas6.github.io/explained/
Code: https://github.com/UtpalDas6/explained

If you've ever crammed for a system design interview by staring at the same static diagrams everyone else stares at, this is the version I wish existed.

#SystemDesign #SoftwareEngineering #WebDevelopment #React #OpenSource #TechInterview
