import { useMemo, useState } from 'react'
import ArrayRow from './ArrayRow.jsx'
import { playClick, playSuccess, playError, playWhoosh } from '../../lib/sound.js'

const ARRAY = [1, 3, 4, 6, 8, 9, 11, 14, 17, 19, 22, 25]

function computeSteps(arr, target) {
  const steps = []
  let lo = 0
  let hi = arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (arr[mid] === target) {
      steps.push({ lo, hi, mid, action: 'found' })
      return steps
    }
    steps.push({ lo, hi, mid, action: arr[mid] < target ? 'goRight' : 'goLeft' })
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  steps.push({ lo, hi, mid: -1, action: 'notfound' })
  return steps
}

export default function BinarySearch() {
  const [target, setTarget] = useState(14)
  const [stepIdx, setStepIdx] = useState(0)
  const steps = useMemo(() => computeSteps(ARRAY, target), [target])
  const step = steps[Math.min(stepIdx, steps.length - 1)]
  const atEnd = stepIdx >= steps.length - 1

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    const n = steps[stepIdx + 1]
    if (n.action === 'found') playSuccess()
    else if (n.action === 'notfound') playError()
    else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  const dimmed = ARRAY.map((_, i) => i).filter((i) => i < step.lo || i > step.hi)

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
        pointers={
          step.mid >= 0
            ? [
                { index: step.lo, label: 'lo', color: 'var(--accent-2)' },
                { index: step.mid, label: 'mid', color: 'var(--accent)' },
                { index: step.hi, label: 'hi', color: 'var(--accent-2)' },
              ]
            : []
        }
        dimmed={dimmed}
        highlight={step.action === 'found' ? [step.mid] : []}
      />

      <p style={{ color: step.action === 'found' ? 'var(--good)' : step.action === 'notfound' ? 'var(--bad)' : 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.action === 'found' && `Found ${target} at index ${step.mid}.`}
        {step.action === 'goRight' && `arr[${step.mid}]=${ARRAY[step.mid]} < ${target} → search right half`}
        {step.action === 'goLeft' && `arr[${step.mid}]=${ARRAY[step.mid]} > ${target} → search left half`}
        {step.action === 'notfound' && `${target} is not in the array.`}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Each comparison halves the remaining range, so a sorted array of n elements resolves in O(log n) steps instead of an O(n) linear scan.
      </p>
    </div>
  )
}
