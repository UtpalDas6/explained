import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const ARRAY = [4, 1, 2, 1, 2]
const BITS = 4

function toBits(n) {
  return n.toString(2).padStart(BITS, '0').split('')
}

function computeSteps(arr) {
  let acc = 0
  const steps = [{ i: -1, acc: 0 }]
  for (let i = 0; i < arr.length; i++) {
    acc ^= arr[i]
    steps.push({ i, acc })
  }
  return steps
}

function BitRow({ bits, highlight = [], label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {label && <span style={{ fontSize: 11, color: 'var(--text-dim)', width: 70 }}>{label}</span>}
      <div style={{ display: 'flex', gap: 4 }}>
        {bits.map((b, i) => (
          <div
            key={i}
            className="mono"
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: 13,
              background: highlight.includes(i) ? 'rgba(74,222,128,0.15)' : 'var(--panel-2)',
              border: `2px solid ${highlight.includes(i) ? 'var(--good)' : 'var(--border)'}`,
            }}
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BitManipulationViz() {
  const steps = useMemo(() => computeSteps(ARRAY), [])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]
  const atEnd = stepIdx >= steps.length - 1
  const prevAcc = stepIdx > 0 ? steps[stepIdx - 1].acc : 0

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

  const accBits = toBits(step.acc)
  const flipped = step.i >= 0 ? toBits(ARRAY[step.i]).flatMap((b, i) => (b === '1' ? [i] : [])) : []

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>nums = [{ARRAY.join(', ')}] — every value appears twice except one</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.i >= 0 && <BitRow bits={toBits(ARRAY[step.i])} label={`nums[${step.i}] = ${ARRAY[step.i]}`} highlight={flipped} />}
        <BitRow bits={accBits} label="acc (XOR)" highlight={[]} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
        {ARRAY.map((v, i) => (
          <div
            key={i}
            className="mono"
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13,
              background: i === step.i ? 'rgba(110,231,255,0.12)' : 'var(--panel-2)',
              border: `2px solid ${i === step.i ? 'var(--accent)' : i < step.i ? 'var(--text-dim)' : 'var(--border)'}`,
              opacity: i <= step.i ? 1 : 0.4,
            }}
          >
            {v}
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.i < 0 ? 'acc starts at 0 — XOR-ing anything with 0 leaves it unchanged.' : `acc = ${prevAcc} XOR ${ARRAY[step.i]} = ${step.acc}`}
      </p>
      {atEnd && <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 4 }}>The number that appears once = {step.acc}</p>}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        x XOR x = 0 and x XOR 0 = x, so every pair cancels itself out of the running XOR regardless of order — whatever is left over is the unpaired value. O(n) time, O(1) space, no hash map needed.
      </p>
    </div>
  )
}
