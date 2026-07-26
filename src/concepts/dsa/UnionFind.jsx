import { useState } from 'react'
import { motion } from 'framer-motion'
import { playClick, playPop, playWhoosh } from '../../lib/sound.js'

const N = 8
const UNIONS = [[0, 1], [2, 3], [4, 5], [6, 7], [1, 3], [5, 7], [3, 7]]
const POS = Array.from({ length: N }, (_, i) => ({
  x: 60 + (i % 4) * 90,
  y: i < 4 ? 50 : 170,
}))

function find(parent, x) {
  while (parent[x] !== x) x = parent[x]
  return x
}

export default function UnionFind() {
  const [parent, setParent] = useState(() => Array.from({ length: N }, (_, i) => i))
  const [size, setSize] = useState(() => Array(N).fill(1))
  const [unionIdx, setUnionIdx] = useState(0)
  const [queryVal, setQueryVal] = useState(null)
  const atEnd = unionIdx >= UNIONS.length

  const union = () => {
    if (atEnd) return
    const [a, b] = UNIONS[unionIdx]
    const ra = find(parent, a)
    const rb = find(parent, b)
    setUnionIdx((i) => i + 1)
    if (ra === rb) {
      playClick()
      return
    }
    const next = [...parent]
    const nextSize = [...size]
    // union by size, then compress every node on both paths straight to the new root
    const [big, small] = nextSize[ra] >= nextSize[rb] ? [ra, rb] : [rb, ra]
    nextSize[big] += nextSize[small]
    for (let i = 0; i < N; i++) {
      if (find(parent, i) === small) next[i] = big
    }
    next[small] = big
    setParent(next)
    setSize(nextSize)
    playPop()
  }
  const reset = () => {
    setParent(Array.from({ length: N }, (_, i) => i))
    setSize(Array(N).fill(1))
    setUnionIdx(0)
    setQueryVal(null)
    playWhoosh()
  }

  const root = queryVal !== null ? find(parent, queryVal) : null

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={union} disabled={atEnd}>
          {atEnd ? 'All unions applied' : `Union(${UNIONS[unionIdx][0]}, ${UNIONS[unionIdx][1]})`}
        </button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <svg width="100%" height="240" viewBox="0 0 420 240">
        {Array.from({ length: N }, (_, i) => {
          if (parent[i] === i) return null
          const p = POS[i]
          const q = POS[parent[i]]
          return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--border)" strokeWidth="2" />
        })}
        {POS.map((p, i) => {
          const isRoot = parent[i] === i
          const isQueried = queryVal === i
          const isRootHit = root !== null && i === root
          return (
            <motion.g key={i} layout transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
              <circle
                cx={p.x}
                cy={p.y}
                r="20"
                fill={isRootHit ? 'rgba(74,222,128,0.2)' : isQueried ? 'rgba(110,231,255,0.2)' : isRoot ? 'rgba(167,139,250,0.12)' : 'var(--panel-2)'}
                stroke={isRootHit ? 'var(--good)' : isQueried ? 'var(--accent)' : isRoot ? 'var(--accent-2)' : 'var(--border)'}
                strokeWidth="2"
              />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="14" className="mono" fill="var(--text)">{i}</text>
            </motion.g>
          )
        })}
      </svg>

      <div className="controls" style={{ marginTop: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>find(x):</span>
        {Array.from({ length: N }, (_, i) => (
          <button key={i} className={`btn ${queryVal === i ? 'primary' : ''}`} style={{ padding: '4px 12px' }} onClick={() => { setQueryVal(i); playClick() }}>{i}</button>
        ))}
      </div>
      {root !== null && (
        <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 8 }}>find({queryVal}) = {root} (component root)</p>
      )}

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        Union by size keeps the tree shallow; path compression (every node found is rewired straight to the root) flattens it further. Together they make find/union amortized nearly O(1) — technically O(α(n)), the inverse Ackermann function.
      </p>
    </div>
  )
}
