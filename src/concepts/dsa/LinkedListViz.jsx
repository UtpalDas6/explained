import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const VALUES = [1, 2, 3, 4, 5]

// One entry per iteration of the in-place reversal loop: after `flippedCount`
// nodes have been processed, those nodes' `next` pointers face backward.
function computeSteps(values) {
  const steps = [{ prev: null, curr: 0, flippedCount: 0 }]
  for (let i = 0; i < values.length; i++) {
    steps.push({ prev: i, curr: i + 1 < values.length ? i + 1 : null, flippedCount: i + 1 })
  }
  return steps
}

export default function LinkedListViz() {
  const steps = useMemo(() => computeSteps(VALUES), [])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]
  const atEnd = stepIdx >= steps.length - 1

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    if (stepIdx + 1 === steps.length - 1) playSuccess()
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

      <div style={{ display: 'flex', gap: 28, justifyContent: 'center', margin: '24px 0', flexWrap: 'wrap' }}>
        {VALUES.map((v, i) => {
          const flipped = i < step.flippedCount
          const target = flipped ? (i - 1 >= 0 ? VALUES[i - 1] : null) : i + 1 < VALUES.length ? VALUES[i + 1] : null
          const isPrev = i === step.prev
          const isCurr = i === step.curr
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div className="mono" style={{ fontSize: 11, color: isCurr ? 'var(--accent)' : isPrev ? 'var(--accent-2)' : 'transparent', height: 14 }}>
                {isCurr ? 'curr' : isPrev ? 'prev' : '·'}
              </div>
              <div
                className="mono"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  background: 'var(--panel-2)',
                  border: `2px solid ${isCurr ? 'var(--accent)' : isPrev ? 'var(--accent-2)' : 'var(--border)'}`,
                }}
              >
                {v}
              </div>
              <div className="mono" style={{ fontSize: 11, color: flipped ? 'var(--good)' : 'var(--text-dim)' }}>
                next: {target === null ? '∅' : flipped ? `← ${target}` : `${target} →`}
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        {atEnd
          ? `Reversed. New head is ${VALUES[VALUES.length - 1]}.`
          : `prev=${step.prev === null ? 'null' : VALUES[step.prev]}, curr=${step.curr === null ? 'null' : VALUES[step.curr]} — rewiring curr.next to point back at prev.`}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Reversal is O(n) time, O(1) extra space: walk the list once, flipping each node's pointer to face backward instead of building a new list.
      </p>
    </div>
  )
}
