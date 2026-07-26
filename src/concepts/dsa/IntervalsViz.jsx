import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const INTERVALS = [[1, 3], [2, 6], [8, 10], [9, 12], [15, 18]]

function computeSteps(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const merged = []
  const steps = [{ i: -1, merged: [], action: null }]
  for (let i = 0; i < sorted.length; i++) {
    const [s, e] = sorted[i]
    if (merged.length && s <= merged[merged.length - 1][1]) {
      merged[merged.length - 1] = [merged[merged.length - 1][0], Math.max(merged[merged.length - 1][1], e)]
      steps.push({ i, merged: merged.map((m) => [...m]), action: 'merge' })
    } else {
      merged.push([s, e])
      steps.push({ i, merged: merged.map((m) => [...m]), action: 'new' })
    }
  }
  return { sorted, steps }
}

const MIN = 0
const MAX = 20
const WIDTH = 480

function scale(v) {
  return ((v - MIN) / (MAX - MIN)) * WIDTH
}

function Bar({ start, end, color, label }) {
  return (
    <div style={{ position: 'relative', height: 28 }}>
      <div
        className="mono"
        style={{
          position: 'absolute',
          left: scale(start),
          width: Math.max(scale(end) - scale(start), 4),
          height: 24,
          borderRadius: 6,
          background: `${color}22`,
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: 'var(--text)',
          whiteSpace: 'nowrap',
        }}
      >
        {label ?? `${start}-${end}`}
      </div>
    </div>
  )
}

export default function IntervalsViz() {
  const { sorted, steps } = useMemo(() => computeSteps(INTERVALS), [])
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

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>sorted by start: {sorted.map(([s, e]) => `[${s},${e}]`).join(' ')}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: WIDTH, margin: '16px auto' }}>
        {sorted.map(([s, e], i) => (
          <Bar key={i} start={s} end={e} color={i === step.i ? 'var(--accent)' : i < step.i ? 'var(--text-dim)' : 'var(--border)'} />
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', margin: '16px 0 6px' }}>merged result</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: WIDTH, margin: '0 auto' }}>
        {step.merged.map(([s, e], i) => (
          <Bar key={i} start={s} end={e} color={i === step.merged.length - 1 && step.action ? 'var(--good)' : 'var(--good)'} />
        ))}
        {!step.merged.length && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.action === null && 'Intervals sorted by start — now sweep left to right.'}
        {step.action === 'new' && `[${sorted[step.i][0]},${sorted[step.i][1]}] starts after the last merged interval ends — it's a new group.`}
        {step.action === 'merge' && `[${sorted[step.i][0]},${sorted[step.i][1]}] overlaps the last group — extend its end instead of starting a new one.`}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Sorting first is what makes a single linear sweep sufficient — once sorted by start, an interval can only possibly overlap the most recently merged one, never an earlier one. O(n log n) total, dominated by the sort.
      </p>
    </div>
  )
}
