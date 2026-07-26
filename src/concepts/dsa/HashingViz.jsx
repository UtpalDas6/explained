import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const ARRAY = [2, 7, 11, 15]
const TARGET = 9

function computeSteps(arr, target) {
  const map = {}
  const steps = [{ i: -1, map: {}, action: null }]
  for (let i = 0; i < arr.length; i++) {
    const complement = target - arr[i]
    if (map[complement] !== undefined) {
      steps.push({ i, map: { ...map }, action: 'found', j: map[complement] })
      break
    }
    map[arr[i]] = i
    steps.push({ i, map: { ...map }, action: 'insert' })
  }
  return steps
}

export default function HashingViz() {
  const steps = useMemo(() => computeSteps(ARRAY, TARGET), [])
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

      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>nums = [{ARRAY.join(', ')}], target = {TARGET}</p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {ARRAY.map((v, i) => {
          const isCurrent = i === step.i
          const isMatch = step.action === 'found' && (i === step.i || i === step.j)
          return (
            <div
              key={i}
              className="mono"
              style={{
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 15,
                background: isMatch ? 'rgba(74,222,128,0.15)' : isCurrent ? 'rgba(110,231,255,0.12)' : 'var(--panel-2)',
                border: `2px solid ${isMatch ? 'var(--good)' : isCurrent ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {v}
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>hash map (value → index)</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 40 }}>
        <AnimatePresence>
          {Object.entries(step.map).map(([k, v]) => (
            <motion.div
              key={k}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="mono"
              style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--panel-2)', border: '1px solid var(--border)', fontSize: 13 }}
            >
              {k} → {v}
            </motion.div>
          ))}
        </AnimatePresence>
        {!Object.keys(step.map).length && <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>empty</span>}
      </div>

      <p style={{ color: step.action === 'found' ? 'var(--good)' : 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        {step.action === null && 'Nothing seen yet.'}
        {step.action === 'insert' && `${ARRAY[step.i]} isn't in the map yet — no partner found, so record it: ${ARRAY[step.i]} → ${step.i}.`}
        {step.action === 'found' && `${TARGET - ARRAY[step.i]} is already in the map at index ${step.j} → indices [${step.j}, ${step.i}] sum to ${TARGET}.`}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        One pass instead of two nested loops: for each number, check whether its complement was already seen (O(1) hash lookup) before inserting itself. O(n) time, O(n) space — trading memory for the second loop you'd otherwise need.
      </p>
    </div>
  )
}
