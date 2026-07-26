import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const ARRAY = [3, 4, 7, 2, -3, 1, 4, 2]
const K = 7

function computeSteps(arr, k) {
  let sum = 0
  const map = { 0: 1 }
  let count = 0
  const steps = [{ i: -1, sum: 0, map: { 0: 1 }, count: 0, action: null, need: null }]
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
    const need = sum - k
    let found = false
    if (map[need]) {
      count += map[need]
      found = true
    }
    map[sum] = (map[sum] || 0) + 1
    steps.push({ i, sum, map: { ...map }, count, action: found ? 'match' : 'none', need })
  }
  return steps
}

export default function PrefixSumViz() {
  const steps = useMemo(() => computeSteps(ARRAY, K), [])
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

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>nums = [{ARRAY.join(', ')}], k = {K}</p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {ARRAY.map((v, i) => (
            <div
              key={i}
              className="mono"
              style={{
                width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13,
                background: i === step.i ? (step.action === 'match' ? 'rgba(74,222,128,0.15)' : 'rgba(110,231,255,0.1)') : 'var(--panel-2)',
                border: `2px solid ${i === step.i ? (step.action === 'match' ? 'var(--good)' : 'var(--accent)') : 'var(--border)'}`,
              }}
            >
              {v}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ARRAY.map((_, i) => (
            <div key={i} className="mono" style={{ width: 40, textAlign: 'center', fontSize: 10, color: 'var(--text-dim)' }}>
              {i <= step.i ? `Σ=${steps.find((s) => s.i === i)?.sum}` : ''}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', margin: '16px 0 6px' }}>prefix-sum counts seen so far</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 32 }}>
        {Object.entries(step.map).map(([sum, cnt]) => (
          <div
            key={sum}
            className="mono"
            style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 12,
              background: Number(sum) === step.need && step.action === 'match' ? 'rgba(74,222,128,0.15)' : 'var(--panel-2)',
              border: `1px solid ${Number(sum) === step.need && step.action === 'match' ? 'var(--good)' : 'var(--border)'}`,
            }}
          >
            {sum}: {cnt}
          </div>
        ))}
      </div>

      <p style={{ color: step.action === 'match' ? 'var(--good)' : 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.action === null && 'prefixSum[-1] = 0 counts as "seen once" — a subarray from index 0 can equal k exactly.'}
        {step.action === 'none' && `running sum = ${step.sum}; need a prior prefix sum of ${step.need} — not seen yet.`}
        {step.action === 'match' && `running sum = ${step.sum}; prefix sum ${step.need} was seen before — that gap is a subarray summing to ${K}. Running count = ${step.count}.`}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Any subarray sum is (prefix sum up to the end) minus (prefix sum up to just before the start). Instead of recomputing that subtraction for every pair of endpoints, a hash map counts how many times each prefix sum has occurred — O(n) instead of O(n²).
      </p>
    </div>
  )
}
