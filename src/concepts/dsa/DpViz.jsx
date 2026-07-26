import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const S1 = 'ABCBD'
const S2 = 'BDCAB'

function computeSteps(s1, s2) {
  const n = s1.length
  const m = s2.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  const steps = [{ i: 0, j: 0, from: null, table: dp.map((r) => [...r]) }]
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      let from
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        from = 'diag'
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        dp[i][j] = dp[i - 1][j]
        from = 'up'
      } else {
        dp[i][j] = dp[i][j - 1]
        from = 'left'
      }
      steps.push({ i, j, from, table: dp.map((r) => [...r]) })
    }
  }
  return steps
}

function backtrack(table, s1, s2) {
  let i = s1.length
  let j = s2.length
  let result = ''
  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      result = s1[i - 1] + result
      i--
      j--
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      i--
    } else {
      j--
    }
  }
  return result
}

const cellStyle = { width: 34, height: 34, textAlign: 'center', border: '2px solid var(--border)', fontSize: 13 }
const cellHeaderStyle = { ...cellStyle, border: 'none', color: 'var(--accent-2)', fontWeight: 600 }

export default function DpViz() {
  const steps = useMemo(() => computeSteps(S1, S2), [])
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

  const dep = step.from === 'diag' ? [step.i - 1, step.j - 1] : step.from === 'up' ? [step.i - 1, step.j] : step.from === 'left' ? [step.i, step.j - 1] : null

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="mono" style={{ borderCollapse: 'collapse', margin: '16px auto' }}>
          <tbody>
            <tr>
              <td></td>
              <td></td>
              {S2.split('').map((c, j) => (
                <td key={j} style={cellHeaderStyle}>{c}</td>
              ))}
            </tr>
            {Array.from({ length: S1.length + 1 }).map((_, i) => (
              <tr key={i}>
                <td style={cellHeaderStyle}>{i === 0 ? '' : S1[i - 1]}</td>
                {Array.from({ length: S2.length + 1 }).map((_, j) => {
                  const isCurrent = i === step.i && j === step.j
                  const isDep = dep && dep[0] === i && dep[1] === j
                  return (
                    <td
                      key={j}
                      style={{
                        ...cellStyle,
                        background: isCurrent ? 'rgba(74,222,128,0.2)' : isDep ? 'rgba(110,231,255,0.2)' : 'var(--panel-2)',
                        borderColor: isCurrent ? 'var(--good)' : isDep ? 'var(--accent)' : 'var(--border)',
                      }}
                    >
                      {step.table[i][j]}
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
          ? 'dp[0][j] = dp[i][0] = 0 — base case, an empty prefix shares nothing with anything.'
          : step.from === 'diag'
          ? `'${S1[step.i - 1]}' matches '${S2[step.j - 1]}' → dp[${step.i}][${step.j}] = dp[${step.i - 1}][${step.j - 1}] + 1`
          : `'${S1[step.i - 1]}' ≠ '${S2[step.j - 1]}' → dp[${step.i}][${step.j}] = max(dp[${step.i - 1}][${step.j}], dp[${step.i}][${step.j - 1}])`}
      </p>
      {atEnd && (
        <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 4 }}>
          LCS length = {step.table[S1.length][S2.length]}, subsequence = "{backtrack(step.table, S1, S2)}"
        </p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Each cell reuses two already-solved subproblems instead of recomputing them from scratch — that memoization turns an exponential brute force (try every subsequence) into O(n·m) time and space.
      </p>
    </div>
  )
}
