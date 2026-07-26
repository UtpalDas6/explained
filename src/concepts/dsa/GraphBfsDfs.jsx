import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const POS = {
  A: { x: 200, y: 40 },
  B: { x: 110, y: 120 },
  C: { x: 290, y: 120 },
  D: { x: 60, y: 200 },
  E: { x: 160, y: 200 },
  F: { x: 290, y: 200 },
  G: { x: 160, y: 280 },
}
const ADJ = {
  A: ['B', 'C'],
  B: ['A', 'D', 'E'],
  C: ['A', 'F'],
  D: ['B'],
  E: ['B', 'G'],
  F: ['C'],
  G: ['E'],
}
const EDGES = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F'], ['E', 'G']]
const START = 'A'

function computeBfsSteps() {
  const visited = new Set([START])
  const queue = [START]
  const steps = [{ visited: [...visited], frontier: [...queue], current: null }]
  while (queue.length) {
    const node = queue.shift()
    for (const nb of ADJ[node]) {
      if (!visited.has(nb)) {
        visited.add(nb)
        queue.push(nb)
      }
    }
    steps.push({ visited: [...visited], frontier: [...queue], current: node })
  }
  return steps
}

function computeDfsSteps() {
  const visited = new Set()
  const stack = [START]
  const steps = [{ visited: [], frontier: [...stack], current: null }]
  while (stack.length) {
    const node = stack.pop()
    if (visited.has(node)) continue
    visited.add(node)
    for (const nb of [...ADJ[node]].reverse()) {
      if (!visited.has(nb)) stack.push(nb)
    }
    steps.push({ visited: [...visited], frontier: [...stack], current: node })
  }
  return steps
}

export default function GraphBfsDfs() {
  const [mode, setMode] = useState('bfs')
  const steps = useMemo(() => (mode === 'bfs' ? computeBfsSteps() : computeDfsSteps()), [mode])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[Math.min(stepIdx, steps.length - 1)]
  const atEnd = stepIdx >= steps.length - 1

  const setMode_ = (m) => {
    setMode(m)
    setStepIdx(0)
    playWhoosh()
  }
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

  const order = step.visited

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${mode === 'bfs' ? 'primary' : ''}`} onClick={() => setMode_('bfs')}>BFS (queue)</button>
        <button className={`btn ${mode === 'dfs' ? 'primary' : ''}`} onClick={() => setMode_('dfs')}>DFS (stack)</button>
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <svg width="340" height="300" viewBox="0 0 340 300">
          {EDGES.map(([a, b]) => (
            <line key={`${a}${b}`} x1={POS[a].x} y1={POS[a].y} x2={POS[b].x} y2={POS[b].y} stroke="var(--border)" strokeWidth="2" />
          ))}
          {Object.entries(POS).map(([id, p]) => {
            const isVisited = order.includes(id)
            const isCurrent = id === step.current
            const isFrontier = step.frontier.includes(id)
            return (
              <g key={id} transform={`translate(${p.x},${p.y})`}>
                <circle
                  r="18"
                  fill={isCurrent ? 'rgba(74,222,128,0.2)' : isVisited ? 'rgba(110,231,255,0.15)' : isFrontier ? 'rgba(167,139,250,0.12)' : 'var(--panel-2)'}
                  stroke={isCurrent ? 'var(--good)' : isVisited ? 'var(--accent)' : isFrontier ? 'var(--accent-2)' : 'var(--border)'}
                  strokeWidth="2"
                />
                <text textAnchor="middle" dy="5" fontSize="14" className="mono" fill="var(--text)">{id}</text>
              </g>
            )
          })}
        </svg>

        <div style={{ minWidth: 180 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
            {mode === 'bfs' ? 'queue (front → back)' : 'stack (top on left)'}
          </div>
          <div className="mono" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-2)', minHeight: 20, marginBottom: 16 }}>
            [{step.frontier.join(', ')}]
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>visit order</div>
          <div className="mono" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-2)', minHeight: 20 }}>
            {order.length ? order.join(' → ') : '—'}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        Same traversal skeleton, different frontier: BFS pulls from a queue (FIFO) so it explores level by level — shortest path in an unweighted graph. DFS pulls from a stack (LIFO) and dives depth-first before backtracking. Both are O(V+E).
      </p>
    </div>
  )
}
