import { useMemo, useState } from 'react'
import ArrayRow from './ArrayRow.jsx'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const ARRAY = [10, 9, 2, 5, 3, 7, 101, 18]

function computeSteps(arr) {
  const n = arr.length
  const dp = Array(n).fill(1)
  const steps = [{ i: 0, j: -1, dp: [...dp], updated: false }]
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const beat = arr[j] < arr[i] && dp[j] + 1 > dp[i]
      if (beat) dp[i] = dp[j] + 1
      steps.push({ i, j, dp: [...dp], updated: beat })
    }
  }
  return steps
}

export default function LisViz() {
  const steps = useMemo(() => computeSteps(ARRAY), [])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]
  const atEnd = stepIdx >= steps.length - 1
  const best = Math.max(...step.dp)

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

      <ArrayRow
        values={ARRAY}
        pointers={step.j >= 0 ? [{ index: step.i, label: 'i', color: 'var(--accent)' }, { index: step.j, label: 'j', color: 'var(--accent-2)' }] : [{ index: step.i, label: 'i', color: 'var(--accent)' }]}
      />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        {step.dp.map((v, i) => (
          <div
            key={i}
            className="mono"
            style={{
              width: 44,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              fontSize: 13,
              background: i === step.i && step.updated ? 'rgba(74,222,128,0.15)' : 'var(--panel-2)',
              border: `2px solid ${i === step.i && step.updated ? 'var(--good)' : 'var(--border)'}`,
              color: 'var(--text-dim)',
            }}
          >
            {v}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 4 }}>dp[k] = length of the longest increasing run ending at index k</p>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.j < 0
          ? `dp[${step.i}] starts at 1 — every single element is an increasing run of length 1.`
          : step.updated
          ? `arr[${step.j}]=${ARRAY[step.j]} < arr[${step.i}]=${ARRAY[step.i]} and extends a longer run → dp[${step.i}] = dp[${step.j}] + 1 = ${step.dp[step.i]}`
          : `arr[${step.j}]=${ARRAY[step.j]} doesn't beat dp[${step.i}]'s current best — no update.`}
      </p>
      {atEnd && (
        <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 4 }}>Longest increasing subsequence length = {best}</p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        This O(n²) version checks every earlier index j for each i. A patience-sorting / binary-search variant gets it down to O(n log n) by keeping the smallest possible tail for each subsequence length.
      </p>
    </div>
  )
}
