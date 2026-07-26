import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const DIMS = [10, 30, 5, 60] // 3 matrices: 10x30, 30x5, 5x60

function computeSteps(dims) {
  const n = dims.length - 1
  const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  const steps = [{ i: 0, j: 0, k: null, table: dp.map((r) => [...r]) }]
  for (let len = 2; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1
      dp[i][j] = Infinity
      let bestK = null
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
        if (cost < dp[i][j]) {
          dp[i][j] = cost
          bestK = k
        }
      }
      steps.push({ i, j, k: bestK, table: dp.map((r) => [...r]) })
    }
  }
  return steps
}

const cellStyle = { width: 46, height: 36, textAlign: 'center', border: '2px solid var(--border)', fontSize: 12 }
const headStyle = { ...cellStyle, border: 'none', color: 'var(--accent-2)', fontWeight: 600, fontSize: 11 }

export default function MatrixChainViz() {
  const n = DIMS.length - 1
  const steps = useMemo(() => computeSteps(DIMS), [])
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

  const dep1 = step.k !== null ? [step.i, step.k] : null
  const dep2 = step.k !== null ? [step.k + 1, step.j] : null

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
        matrices: {Array.from({ length: n }, (_, i) => `A${i + 1}(${DIMS[i]}×${DIMS[i + 1]})`).join(' · ')}
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="mono" style={{ borderCollapse: 'collapse', margin: '0 auto 16px' }}>
          <tbody>
            <tr>
              <td></td>
              {Array.from({ length: n }, (_, j) => (
                <td key={j} style={headStyle}>j={j + 1}</td>
              ))}
            </tr>
            {Array.from({ length: n }, (_, iIdx) => {
              const i = iIdx + 1
              return (
                <tr key={i}>
                  <td style={headStyle}>i={i}</td>
                  {Array.from({ length: n }, (_, jIdx) => {
                    const j = jIdx + 1
                    if (j < i) return <td key={j} style={{ ...cellStyle, border: 'none' }}></td>
                    const isCurrent = i === step.i && j === step.j
                    const isDep = (dep1 && dep1[0] === i && dep1[1] === j) || (dep2 && dep2[0] === i && dep2[1] === j)
                    return (
                      <td
                        key={j}
                        style={{
                          ...cellStyle,
                          background: isCurrent ? 'rgba(74,222,128,0.2)' : isDep ? 'rgba(110,231,255,0.15)' : 'var(--panel-2)',
                          borderColor: isCurrent ? 'var(--good)' : isDep ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        {step.table[i][j] === 0 && i !== j ? '' : step.table[i][j]}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        {step.i === 0
          ? 'dp[i][i] = 0 — multiplying a single matrix costs nothing to "chain".'
          : `dp[${step.i}][${step.j}]: cheapest split is after A${step.k} → dp[${step.i}][${step.k}] + dp[${step.k + 1}][${step.j}] + ${DIMS[step.i - 1]}·${DIMS[step.k]}·${DIMS[step.j]} = ${step.table[step.i][step.j]}`}
      </p>
      {atEnd && (
        <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 4 }}>
          Minimum scalar multiplications for the full chain = {step.table[1][n]}
        </p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Matrix multiplication is associative but not free — where you put the parentheses changes the total work. dp[i][j] tries every split point k between i and j and keeps the cheapest, reusing already-solved sub-chains. O(n³) time, O(n²) space.
      </p>
    </div>
  )
}
