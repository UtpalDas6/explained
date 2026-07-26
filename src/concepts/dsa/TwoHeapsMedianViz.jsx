import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const STREAM = [5, 15, 1, 3, 8, 7, 9, 2]

// Displayed as sorted arrays (max-heap shown descending, min-heap ascending) —
// the real implementation uses actual heaps for O(log n) insert, this just
// needs to show the correct split and median at each step.
function computeSteps(stream) {
  let lower = [] // max-heap: largest of the small half sits at lower[0]
  let upper = [] // min-heap: smallest of the large half sits at upper[0]
  const steps = [{ i: -1, lower: [], upper: [], median: null }]
  for (let i = 0; i < stream.length; i++) {
    const num = stream[i]
    if (!lower.length || num <= lower[0]) {
      lower.push(num)
      lower.sort((a, b) => b - a)
    } else {
      upper.push(num)
      upper.sort((a, b) => a - b)
    }
    if (lower.length > upper.length + 1) {
      upper.unshift(lower.shift())
      upper.sort((a, b) => a - b)
    } else if (upper.length > lower.length) {
      lower.push(upper.shift())
      lower.sort((a, b) => b - a)
    }
    const median = lower.length > upper.length ? lower[0] : (lower[0] + upper[0]) / 2
    steps.push({ i, lower: [...lower], upper: [...upper], median })
  }
  return steps
}

function HeapRow({ values, label, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, minHeight: 40 }}>
        <AnimatePresence>
          {values.map((v, i) => (
            <motion.div
              key={v}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="mono"
              style={{
                width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13,
                background: i === 0 ? `${color}22` : 'var(--panel-2)',
                border: `2px solid ${i === 0 ? color : 'var(--border)'}`,
              }}
            >
              {v}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function TwoHeapsMedianViz() {
  const steps = useMemo(() => computeSteps(STREAM), [])
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
        <button className="btn primary" onClick={next} disabled={atEnd}>
          {atEnd ? 'Done' : `Insert ${STREAM[stepIdx]}`}
        </button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>stream = [{STREAM.join(', ')}]</p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <HeapRow values={step.lower} label="lower half (max-heap, largest first)" color="var(--accent-2)" />
        <HeapRow values={step.upper} label="upper half (min-heap, smallest first)" color="var(--accent)" />
      </div>

      <p style={{ color: 'var(--good)', fontSize: 14, marginTop: 20 }}>
        median = {step.median ?? '—'}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Keep the smaller half in a max-heap and the larger half in a min-heap, rebalancing sizes after every insert so they're equal (or the lower half has exactly one more). The median is then just the top of one heap, or the average of both tops — O(log n) per insert, O(1) per query, instead of re-sorting the whole stream each time.
      </p>
    </div>
  )
}
