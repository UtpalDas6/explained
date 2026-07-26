import { useMemo, useState } from 'react'
import { playClick, playSuccess, playError, playWhoosh } from '../../lib/sound.js'

const COINS = [1, 4, 5]
const AMOUNT = 8
const INF = Infinity

function computeSteps(coins, amount) {
  const dp = Array(amount + 1).fill(INF)
  dp[0] = 0
  const steps = [{ a: 0, coin: null, dp: [...dp], improved: false }]
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) {
        dp[a] = dp[a - coin] + 1
        steps.push({ a, coin, dp: [...dp], improved: true })
      } else {
        steps.push({ a, coin, dp: [...dp], improved: false })
      }
    }
  }
  return steps
}

export default function CoinChangeViz() {
  const steps = useMemo(() => computeSteps(COINS, AMOUNT), [])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]
  const atEnd = stepIdx >= steps.length - 1

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    if (stepIdx + 2 === steps.length) {
      if (step.dp[AMOUNT] === INF) playError()
      else playSuccess()
    } else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  const depIdx = step.coin !== null ? step.a - step.coin : -1

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>coins = [{COINS.join(', ')}], target amount = {AMOUNT}</p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {step.dp.map((v, i) => {
            const isCurrent = i === step.a
            const isDep = i === depIdx
            return (
              <div
                key={i}
                className="mono"
                style={{
                  width: 42,
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  fontSize: 13,
                  background: isCurrent ? (step.improved ? 'rgba(74,222,128,0.15)' : 'rgba(110,231,255,0.1)') : isDep ? 'rgba(167,139,250,0.12)' : 'var(--panel-2)',
                  border: `2px solid ${isCurrent ? (step.improved ? 'var(--good)' : 'var(--accent)') : isDep ? 'var(--accent-2)' : 'var(--border)'}`,
                }}
              >
                {v === INF ? '∞' : v}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {step.dp.map((_, i) => (
            <div key={i} className="mono" style={{ width: 42, textAlign: 'center', fontSize: 11, color: 'var(--text-dim)' }}>{i}</div>
          ))}
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.coin === null
          ? 'dp[0] = 0 — zero coins needed to make amount 0.'
          : `trying coin ${step.coin} for amount ${step.a}: dp[${step.a - step.coin}] + 1 ${step.improved ? `= ${step.dp[step.a]}, a new best` : "doesn't beat the current best"}`}
      </p>
      {atEnd && (
        <p style={{ color: step.dp[AMOUNT] === INF ? 'var(--bad)' : 'var(--good)', fontSize: 13, marginTop: 4 }}>
          {step.dp[AMOUNT] === INF ? `Amount ${AMOUNT} is unreachable with these coins.` : `Minimum coins for ${AMOUNT} = ${step.dp[AMOUNT]}`}
        </p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        A greedy "always take the biggest coin" fails on coin sets like [1,4,5] for amount 8 (greedy: 5+1+1+1 = 4 coins; optimal: 4+4 = 2). DP checks every coin at every amount, so it's correct for any coin set — O(amount × coins).
      </p>
    </div>
  )
}
