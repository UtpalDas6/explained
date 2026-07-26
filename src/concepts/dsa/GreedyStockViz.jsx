import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const PRICES = [7, 1, 5, 3, 6, 4]

function computeSteps(prices) {
  let minPrice = Infinity
  let minIdx = -1
  let maxProfit = 0
  let buyDay = -1
  let sellDay = -1
  const steps = [{ i: -1, minPrice: Infinity, minIdx: -1, maxProfit: 0, buyDay: -1, sellDay: -1, improved: false }]
  for (let i = 0; i < prices.length; i++) {
    let improved = false
    if (prices[i] < minPrice) {
      minPrice = prices[i]
      minIdx = i
    }
    const profit = prices[i] - minPrice
    if (profit > maxProfit) {
      maxProfit = profit
      buyDay = minIdx
      sellDay = i
      improved = true
    }
    steps.push({ i, minPrice, minIdx, maxProfit, buyDay, sellDay, improved })
  }
  return steps
}

const BAR_W = 46
const GAP = 12
const SCALE = 22

export default function GreedyStockViz() {
  const steps = useMemo(() => computeSteps(PRICES), [])
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

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>prices = [{PRICES.join(', ')}]</p>

      <div style={{ position: 'relative', height: 200, width: PRICES.length * (BAR_W + GAP), margin: '0 auto 8px' }}>
        {PRICES.map((price, i) => {
          const isToday = i === step.i
          const isMin = i === step.minIdx && step.i >= 0
          const isBuy = i === step.buyDay && step.buyDay >= 0
          const isSell = i === step.sellDay && step.sellDay >= 0
          const color = isSell ? 'var(--good)' : isBuy ? 'var(--accent)' : isMin ? 'var(--accent-2)' : 'var(--border)'
          return (
            <motion.div
              key={i}
              layout
              className="mono"
              style={{
                position: 'absolute', left: i * (BAR_W + GAP), bottom: 0, width: BAR_W, height: price * SCALE,
                borderRadius: '6px 6px 2px 2px',
                background: isToday ? `${color}33` : 'var(--panel-2)',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4, fontSize: 13, color: 'var(--text)',
              }}
            >
              {price}
            </motion.div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: BAR_W + GAP - BAR_W, justifyContent: 'center' }}>
        {PRICES.map((_, i) => (
          <div key={i} className="mono" style={{ width: BAR_W, textAlign: 'center', fontSize: 10, color: 'var(--text-dim)' }}>day {i}</div>
        ))}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.i < 0
          ? 'No days seen yet — minPrice starts at ∞, maxProfit at 0.'
          : `day ${step.i}: price ${PRICES[step.i]}, lowest price so far = ${step.minPrice} (day ${step.minIdx}) → selling today would profit ${PRICES[step.i] - step.minPrice}${step.improved ? ', a new best' : ''}.`}
      </p>
      {atEnd && (
        <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 4 }}>
          Best: buy day {step.buyDay} at {PRICES[step.buyDay]}, sell day {step.sellDay} at {PRICES[step.sellDay]} → profit {step.maxProfit}
        </p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Greedy works here because the only thing that matters for a future sale is the lowest price seen so far — no need to track every possible buy day. One linear pass, O(n) time, O(1) space.
      </p>
    </div>
  )
}
