import { useMemo, useState } from 'react'
import ArrayRow from './ArrayRow.jsx'
import { playClick, playWhoosh } from '../../lib/sound.js'

const ARRAY = [4, 2, 1, 7, 8, 1, 2, 8, 1, 0]

function computeSteps(arr, k) {
  const steps = []
  let sum = 0
  let best = -Infinity
  let bestStart = 0
  for (let end = 0; end < arr.length; end++) {
    sum += arr[end]
    const start = end - k + 1
    if (start >= 0) {
      if (sum > best) {
        best = sum
        bestStart = start
      }
      steps.push({ start, end, sum, best, bestStart })
      sum -= arr[start]
    }
  }
  return steps
}

export default function SlidingWindow() {
  const [k, setK] = useState(3)
  const [stepIdx, setStepIdx] = useState(0)
  const steps = useMemo(() => computeSteps(ARRAY, k), [k])
  const step = steps[Math.min(stepIdx, steps.length - 1)]
  const atEnd = stepIdx >= steps.length - 1
  const isBest = step.start === step.bestStart

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }
  const setWindow = (v) => {
    setK(Math.max(1, Math.min(ARRAY.length, v)))
    setStepIdx(0)
  }

  const windowIndices = Array.from({ length: step.end - step.start + 1 }, (_, i) => step.start + i)

  return (
    <div className="panel">
      <div className="controls">
        <label className="mono" style={{ fontSize: 13, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 8 }}>
          window size k
          <input
            type="number"
            className="mono"
            style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', width: 70 }}
            value={k}
            onChange={(e) => setWindow(Number(e.target.value))}
          />
        </label>
        <button className="btn primary" onClick={next} disabled={atEnd}>Slide</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <ArrayRow values={ARRAY} highlight={windowIndices} />

      <p style={{ color: 'var(--text)', fontSize: 13, marginTop: 16 }}>
        window [{step.start}..{step.end}] sum = <b className="mono">{step.sum}</b>
        {isBest && <span style={{ color: 'var(--good)' }}> ← best so far</span>}
      </p>
      {atEnd && (
        <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 4 }}>
          Max sum of any {k}-length window: {step.best}
        </p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Instead of resumming every window from scratch (O(n·k)), the window slides by adding one element and dropping one — O(n) total. Same idea powers "longest substring without repeating characters".
      </p>
    </div>
  )
}
