import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { playClick, playPop, playError } from '../../lib/sound.js'

function siftUp(arr) {
  const a = [...arr]
  let i = a.length - 1
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2)
    if (a[parent].val <= a[i].val) break
    ;[a[parent], a[i]] = [a[i], a[parent]]
    i = parent
  }
  return a
}

function siftDown(arr) {
  const a = [...arr]
  let i = 0
  const n = a.length
  for (;;) {
    let smallest = i
    const l = 2 * i + 1
    const r = 2 * i + 2
    if (l < n && a[l].val < a[smallest].val) smallest = l
    if (r < n && a[r].val < a[smallest].val) smallest = r
    if (smallest === i) break
    ;[a[i], a[smallest]] = [a[smallest], a[i]]
    i = smallest
  }
  return a
}

const WIDTH = 440
const STEP_Y = 72

function nodePos(i) {
  const depth = Math.floor(Math.log2(i + 1))
  const pos = i - (2 ** depth - 1)
  const levelWidth = 2 ** depth
  const x = ((pos + 0.5) / levelWidth) * WIDTH
  const y = depth * STEP_Y + 30
  return { x, y }
}

export default function HeapViz() {
  const nextId = useRef(6)
  const [heap, setHeap] = useState(() => [12, 18, 15, 28, 33, 20].map((val, id) => ({ id, val })))

  const insert = () => {
    const val = Math.floor(Math.random() * 90) + 10
    setHeap((h) => siftUp([...h, { id: nextId.current++, val }]))
    playClick()
  }
  const extractMin = () => {
    if (!heap.length) {
      playError()
      return
    }
    setHeap((h) => {
      const rest = [...h]
      const last = rest.pop()
      if (!rest.length) return []
      rest[0] = last
      return siftDown(rest)
    })
    playPop()
  }

  const n = heap.length
  const height = n ? (Math.floor(Math.log2(n)) + 1) * STEP_Y + 50 : 80
  const edges = []
  for (let i = 0; i < n; i++) {
    const p = nodePos(i)
    const l = 2 * i + 1
    const r = 2 * i + 2
    if (l < n) {
      const cp = nodePos(l)
      edges.push({ x1: p.x, y1: p.y, x2: cp.x, y2: cp.y, key: `${i}-${l}` })
    }
    if (r < n) {
      const cp = nodePos(r)
      edges.push({ x1: p.x, y1: p.y, x2: cp.x, y2: cp.y, key: `${i}-${r}` })
    }
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={insert}>Insert</button>
        <button className="btn" onClick={extractMin} disabled={!heap.length}>Extract min</button>
      </div>
      <div style={{ position: 'relative', width: '100%', maxWidth: WIDTH + 40, height, margin: '0 auto' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${WIDTH + 40} ${height}`} style={{ position: 'absolute', inset: 0 }}>
          {edges.map((e) => (
            <line key={e.key} x1={e.x1 + 20} y1={e.y1 + 20} x2={e.x2 + 20} y2={e.y2 + 20} stroke="var(--border)" strokeWidth="2" />
          ))}
        </svg>
        {heap.map((node, i) => {
          const p = nodePos(i)
          return (
            <motion.div
              key={node.id}
              layout
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="mono"
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: i === 0 ? 'rgba(74,222,128,0.15)' : 'var(--panel-2)',
                border: `2px solid ${i === 0 ? 'var(--good)' : 'var(--border)'}`,
                fontSize: 14,
              }}
            >
              {node.val}
            </motion.div>
          )
        })}
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        Stored as a flat array — the child of index i lives at 2i+1 and 2i+2, no pointers needed. Insert bubbles the new value up while it's smaller than its parent; extract-min swaps in the last element and sifts it down. Both are O(log n).
      </p>
    </div>
  )
}
