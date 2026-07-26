import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playClick, playPop, playError, playWhoosh } from '../../lib/sound.js'

const CAPACITY = 3
const OPS = [
  ['put', 1, 1],
  ['put', 2, 2],
  ['get', 1],
  ['put', 3, 3],
  ['get', 2],
  ['put', 4, 4],
  ['get', 1],
  ['get', 3],
  ['get', 4],
]

// order[0] = most recently used, order[last] = least recently used (next to evict)
function computeSteps(ops, capacity) {
  let order = []
  const values = {}
  const steps = [{ order: [], op: null, result: null, evicted: null }]
  for (const op of ops) {
    let result = null
    let evicted = null
    if (op[0] === 'get') {
      const [, key] = op
      if (values[key] === undefined) {
        result = -1
      } else {
        result = values[key]
        order = [key, ...order.filter((k) => k !== key)]
      }
    } else {
      const [, key, val] = op
      values[key] = val
      order = [key, ...order.filter((k) => k !== key)]
      if (order.length > capacity) {
        evicted = order.pop()
        delete values[evicted]
      }
    }
    steps.push({ order: [...order], op, result, evicted })
  }
  return steps
}

export default function LruCacheViz() {
  const steps = useMemo(() => computeSteps(OPS, CAPACITY), [])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]
  const atEnd = stepIdx >= steps.length - 1

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    const n = steps[stepIdx + 1]
    if (n.op[0] === 'get' && n.result === -1) playError()
    else if (n.evicted !== null) playPop()
    else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={atEnd}>
          {atEnd ? 'Done' : `${steps[stepIdx + 1].op[0]}(${steps[stepIdx + 1].op.slice(1).join(', ')})`}
        </button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>capacity = {CAPACITY}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 60 }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>MRU</span>
        <AnimatePresence>
          {step.order.map((key) => (
            <motion.div
              key={key}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="mono"
              style={{
                width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 14,
                background: key === (step.op && step.op[1]) ? 'rgba(110,231,255,0.15)' : 'var(--panel-2)',
                border: `2px solid ${key === (step.op && step.op[1]) ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {key}
            </motion.div>
          ))}
        </AnimatePresence>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>LRU</span>
      </div>

      <p style={{ color: step.evicted !== null ? 'var(--bad)' : step.op && step.op[0] === 'get' && step.result === -1 ? 'var(--bad)' : 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.op === null && 'Empty cache.'}
        {step.op && step.op[0] === 'put' && step.evicted === null && `put(${step.op[1]}, ${step.op[2]}) — inserted at the front (most recently used).`}
        {step.op && step.op[0] === 'put' && step.evicted !== null && `put(${step.op[1]}, ${step.op[2]}) pushed the cache over capacity — evicted key ${step.evicted} (least recently used).`}
        {step.op && step.op[0] === 'get' && step.result !== -1 && `get(${step.op[1]}) = ${step.result} — hit, and it's now moved to the front.`}
        {step.op && step.op[0] === 'get' && step.result === -1 && `get(${step.op[1]}) = -1 — miss, not in cache.`}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        A hash map gives O(1) lookup by key; a doubly linked list gives O(1) reordering to the front and O(1) eviction from the back. Neither alone gets you both — an array would need O(n) to move an element, a plain map has no notion of "least recently used" ordering.
      </p>
    </div>
  )
}
