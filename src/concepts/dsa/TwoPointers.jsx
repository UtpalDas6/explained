import { useMemo, useState } from 'react'
import ArrayRow from './ArrayRow.jsx'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const ARRAY = [2, 7, 11, 15, 20, 24]

function computeSteps(arr, target) {
  const steps = []
  let l = 0
  let r = arr.length - 1
  while (l < r) {
    const sum = arr[l] + arr[r]
    if (sum === target) {
      steps.push({ l, r, sum, action: 'found' })
      break
    }
    steps.push({ l, r, sum, action: sum < target ? 'moveLeft' : 'moveRight' })
    if (sum < target) l++
    else r--
  }
  if (!steps.length || steps[steps.length - 1].action !== 'found') {
    steps.push({ l, r, sum: null, action: 'notfound' })
  }
  return steps
}

export default function TwoPointers() {
  const [target, setTarget] = useState(26)
  const [stepIdx, setStepIdx] = useState(0)
  const steps = useMemo(() => computeSteps(ARRAY, target), [target])
  const step = steps[Math.min(stepIdx, steps.length - 1)]
  const atEnd = stepIdx >= steps.length - 1

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    if (steps[stepIdx + 1].action === 'found') playSuccess()
    else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  return (
    <div className="panel">
      <div className="controls">
        <input
          type="number"
          className="mono"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', width: 100 }}
          value={target}
          onChange={(e) => {
            setTarget(Number(e.target.value))
            setStepIdx(0)
          }}
        />
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <ArrayRow
        values={ARRAY}
        pointers={[
          { index: step.l, label: 'L', color: 'var(--accent)' },
          { index: step.r, label: 'R', color: 'var(--accent-2)' },
        ]}
        highlight={step.action === 'found' ? [step.l, step.r] : []}
      />

      <p style={{ color: step.action === 'found' ? 'var(--good)' : 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.action === 'found' && `Found! ${ARRAY[step.l]} + ${ARRAY[step.r]} = ${target}`}
        {step.action === 'moveLeft' && `${ARRAY[step.l]} + ${ARRAY[step.r]} = ${step.sum} < ${target} → move L right`}
        {step.action === 'moveRight' && `${ARRAY[step.l]} + ${ARRAY[step.r]} = ${step.sum} > ${target} → move R left`}
        {step.action === 'notfound' && 'Pointers crossed — no pair sums to target.'}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        On a sorted array, converging pointers turn an O(n²) pair search into O(n): each comparison rules out one end for good, so nothing is ever rechecked.
      </p>
    </div>
  )
}
