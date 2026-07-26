import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const POS = {
  A: { x: 60, y: 40 },
  B: { x: 60, y: 160 },
  C: { x: 190, y: 100 },
  D: { x: 320, y: 40 },
  E: { x: 320, y: 160 },
  F: { x: 440, y: 100 },
}
const EDGES = [['A', 'C'], ['B', 'C'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']]
const NODES = Object.keys(POS)

function computeSteps() {
  const adj = Object.fromEntries(NODES.map((n) => [n, []]))
  const indeg = Object.fromEntries(NODES.map((n) => [n, 0]))
  for (const [a, b] of EDGES) {
    adj[a].push(b)
    indeg[b]++
  }
  const queue = NODES.filter((n) => indeg[n] === 0)
  const order = []
  const steps = [{ queue: [...queue], order: [], current: null, indeg: { ...indeg } }]
  while (queue.length) {
    const node = queue.shift()
    order.push(node)
    for (const nb of adj[node]) {
      indeg[nb]--
      if (indeg[nb] === 0) queue.push(nb)
    }
    steps.push({ queue: [...queue], order: [...order], current: node, indeg: { ...indeg } })
  }
  return steps
}

export default function TopoSortViz() {
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
        <svg width="480" height="220" viewBox="0 0 480 220">
          <defs>
            <marker id="topo-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--border)" />
            </marker>
          </defs>
          {EDGES.map(([a, b]) => (
            <line key={`${a}${b}`} x1={POS[a].x} y1={POS[a].y} x2={POS[b].x} y2={POS[b].y} stroke="var(--border)" strokeWidth="2" markerEnd="url(#topo-arrow)" />
          ))}
          {Object.entries(POS).map(([id, p]) => {
            const isVisited = step.order.includes(id)
            const isCurrent = id === step.current
            const isQueued = step.queue.includes(id)
            return (
              <g key={id} transform={`translate(${p.x},${p.y})`}>
                <circle
                  r="18"
                  fill={isCurrent ? 'rgba(74,222,128,0.2)' : isVisited ? 'rgba(110,231,255,0.15)' : isQueued ? 'rgba(167,139,250,0.12)' : 'var(--panel-2)'}
                  stroke={isCurrent ? 'var(--good)' : isVisited ? 'var(--accent)' : isQueued ? 'var(--accent-2)' : 'var(--border)'}
                  strokeWidth="2"
                />
                <text textAnchor="middle" dy="5" fontSize="14" className="mono" fill="var(--text)">{id}</text>
                <text textAnchor="middle" dy="32" fontSize="10" className="mono" fill="var(--text-dim)">in={step.indeg[id]}</text>
              </g>
            )
          })}
        </svg>

        <div style={{ minWidth: 180 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>queue (0 in-degree, ready)</div>
          <div className="mono" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-2)', minHeight: 20, marginBottom: 16 }}>
            [{step.queue.join(', ')}]
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>topological order</div>
          <div className="mono" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-2)', minHeight: 20 }}>
            {step.order.length ? step.order.join(' → ') : '—'}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        Kahn's algorithm: repeatedly pull a node with zero remaining in-degree (nothing left pointing into it), emit it, and decrement its neighbors' in-degree. If the queue empties before every node is emitted, the graph has a cycle — there's no valid order.
      </p>
    </div>
  )
}
