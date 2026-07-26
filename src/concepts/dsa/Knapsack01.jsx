import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const ITEMS = [
  { w: 2, v: 3 },
  { w: 3, v: 4 },
  { w: 4, v: 5 },
  { w: 5, v: 6 },
]
const CAPACITY = 8

function computeSteps(items, capacity) {
  const n = items.length
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))
  const steps = [{ i: 0, w: 0, included: false, table: dp.map((r) => [...r]) }]
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      const { w: itemW, v: itemV } = items[i - 1]
      let included = false
      if (itemW <= w && dp[i - 1][w - itemW] + itemV > dp[i - 1][w]) {
        dp[i][w] = dp[i - 1][w - itemW] + itemV
        included = true
      } else {
        dp[i][w] = dp[i - 1][w]
      }
      steps.push({ i, w, included, table: dp.map((r) => [...r]) })
    }
  }
  return steps
}

function backtrack(table, items, capacity) {
  let w = capacity
  const chosen = []
  for (let i = items.length; i > 0; i--) {
    if (table[i][w] !== table[i - 1][w]) {
      chosen.push(i - 1)
      w -= items[i - 1].w
    }
  }
  return chosen.reverse()
}

const cellStyle = { width: 34, height: 34, textAlign: 'center', border: '2px solid var(--border)', fontSize: 12 }
const headStyle = { ...cellStyle, border: 'none', color: 'var(--accent-2)', fontWeight: 600, fontSize: 11 }

export default function Knapsack01() {
  const steps = useMemo(() => computeSteps(ITEMS, CAPACITY), [])
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

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
        items (weight/value): {ITEMS.map((it, i) => `#${i + 1}=${it.w}/${it.v}`).join('  ')} — capacity {CAPACITY}
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="mono" style={{ borderCollapse: 'collapse', margin: '0 auto 16px' }}>
          <tbody>
            <tr>
              <td></td>
              {Array.from({ length: CAPACITY + 1 }, (_, w) => (
                <td key={w} style={headStyle}>{w}</td>
              ))}
            </tr>
            {Array.from({ length: ITEMS.length + 1 }, (_, i) => (
              <tr key={i}>
                <td style={headStyle}>{i === 0 ? '∅' : `#${i}`}</td>
                {Array.from({ length: CAPACITY + 1 }, (_, w) => {
                  const isCurrent = i === step.i && w === step.w
                  return (
                    <td
                      key={w}
                      style={{
                        ...cellStyle,
                        background: isCurrent ? (step.included ? 'rgba(74,222,128,0.2)' : 'rgba(110,231,255,0.15)') : 'var(--panel-2)',
                        borderColor: isCurrent ? (step.included ? 'var(--good)' : 'var(--accent)') : 'var(--border)',
                      }}
                    >
                      {step.table[i][w]}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        {step.i === 0
          ? 'dp[0][w] = 0 for every capacity — no items considered yet means no value yet.'
          : `Item #${step.i} (w=${ITEMS[step.i - 1].w}, v=${ITEMS[step.i - 1].v}) at capacity ${step.w}: ${step.included ? 'worth including' : 'skipped — either too heavy or not worth it'}.`}
      </p>
      {atEnd && (
        <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 4 }}>
          Best value = {step.table[ITEMS.length][CAPACITY]}, using items {backtrack(step.table, ITEMS, CAPACITY).map((i) => `#${i + 1}`).join(', ')}
        </p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Each cell answers "best value using the first i items at capacity w" by reusing the row above — either skip item i (same value at this capacity) or take it (its value plus the best answer for the remaining capacity). O(n·W) time and space, where W is capacity, not the item count.
      </p>
    </div>
  )
}
