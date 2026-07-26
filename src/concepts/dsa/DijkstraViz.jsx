import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const POS = {
  A: { x: 50, y: 130 },
  B: { x: 180, y: 40 },
  C: { x: 180, y: 220 },
  D: { x: 320, y: 40 },
  E: { x: 320, y: 220 },
}
const EDGES = [
  ['A', 'B', 4],
  ['A', 'C', 2],
  ['B', 'C', 1],
  ['B', 'D', 5],
  ['C', 'D', 8],
  ['C', 'E', 10],
  ['D', 'E', 2],
]
const NODES = Object.keys(POS)
const START = 'A'

function buildAdj() {
  const adj = Object.fromEntries(NODES.map((n) => [n, []]))
  for (const [a, b, w] of EDGES) {
    adj[a].push([b, w])
    adj[b].push([a, w])
  }
  return adj
}

function computeSteps() {
  const adj = buildAdj()
  const dist = Object.fromEntries(NODES.map((n) => [n, Infinity]))
  dist[START] = 0
  const visited = new Set()
  const steps = [{ dist: { ...dist }, visited: [], current: null }]
  while (visited.size < NODES.length) {
    let u = null
    let best = Infinity
    for (const n of NODES) {
      if (!visited.has(n) && dist[n] < best) {
        best = dist[n]
        u = n
      }
    }
    if (u === null) break
    visited.add(u)
    for (const [v, w] of adj[u]) {
      if (!visited.has(v) && dist[u] + w < dist[v]) dist[v] = dist[u] + w
    }
    steps.push({ dist: { ...dist }, visited: [...visited], current: u })
  }
  return steps
}

export default function DijkstraViz() {
  const steps = useMemo(computeSteps, [])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]
  const atEnd = stepIdx >= steps.length - 1

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    if (stepIdx + 2 === steps.length) playSuccess()
    else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <svg width="380" height="260" viewBox="0 0 380 260">
          {EDGES.map(([a, b, w]) => (
            <g key={`${a}${b}`}>
              <line x1={POS[a].x} y1={POS[a].y} x2={POS[b].x} y2={POS[b].y} stroke="var(--border)" strokeWidth="2" />
              <text x={(POS[a].x + POS[b].x) / 2} y={(POS[a].y + POS[b].y) / 2 - 6} textAnchor="middle" fontSize="11" className="mono" fill="var(--text-dim)">{w}</text>
            </g>
          ))}
          {Object.entries(POS).map(([id, p]) => {
            const isCurrent = id === step.current
            const isVisited = step.visited.includes(id)
            return (
              <g key={id} transform={`translate(${p.x},${p.y})`}>
                <circle
                  r="20"
                  fill={isCurrent ? 'rgba(74,222,128,0.2)' : isVisited ? 'rgba(110,231,255,0.15)' : 'var(--panel-2)'}
                  stroke={isCurrent ? 'var(--good)' : isVisited ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth="2"
                />
                <text textAnchor="middle" dy="-2" fontSize="14" className="mono" fill="var(--text)">{id}</text>
                <text textAnchor="middle" dy="12" fontSize="10" className="mono" fill="var(--text-dim)">
                  {step.dist[id] === Infinity ? '∞' : step.dist[id]}
                </text>
              </g>
            )
          })}
        </svg>

        <div style={{ minWidth: 160 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>shortest distance from {START}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {NODES.map((n) => (
              <div key={n} className="mono" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', borderRadius: 6, background: 'var(--panel-2)', border: `1px solid ${n === step.current ? 'var(--good)' : 'var(--border)'}`, fontSize: 13 }}>
                <span>{n}</span>
                <span>{step.dist[n] === Infinity ? '∞' : step.dist[n]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.current ? `Locked in ${step.current} at distance ${step.dist[step.current]} — the closest unvisited node is always final once picked, and its edges relax its neighbors' distances.` : 'Start node has distance 0, everything else starts at ∞.'}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Same "always expand the closest node" idea as BFS, but with a priority queue instead of a plain queue since edges now have weights. O((V+E) log V) with a binary heap for the priority queue.
      </p>
    </div>
  )
}
