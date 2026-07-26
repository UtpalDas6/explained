import { useMemo, useState } from 'react'
import { playClick, playSuccess, playError, playWhoosh } from '../../lib/sound.js'

const N = 4

function isSafe(cols, row, col) {
  for (let r = 0; r < row; r++) {
    const c = cols[r]
    if (c === col || Math.abs(c - col) === Math.abs(r - row)) return false
  }
  return true
}

function solveSteps() {
  const steps = []
  const cols = Array(N).fill(-1)
  let solved = false

  function place(row) {
    if (solved) return
    if (row === N) {
      steps.push({ cols: [...cols], action: 'solved', row: null, col: null })
      solved = true
      return
    }
    for (let col = 0; col < N; col++) {
      if (isSafe(cols, row, col)) {
        cols[row] = col
        steps.push({ cols: [...cols], action: 'place', row, col })
        place(row + 1)
        if (solved) return
        cols[row] = -1
        steps.push({ cols: [...cols], action: 'backtrack', row, col })
      } else {
        steps.push({ cols: [...cols], action: 'conflict', row, col })
      }
    }
  }
  place(0)
  return steps
}

const ACTION_COLOR = { place: 'var(--accent)', conflict: 'var(--bad)', backtrack: 'var(--text-dim)', solved: 'var(--good)' }
const ACTION_TEXT = {
  place: (r, c) => `Row ${r}: queen fits at column ${c}.`,
  conflict: (r, c) => `Row ${r}: column ${c} is attacked (same column or diagonal) — try the next column.`,
  backtrack: (r, c) => `Row ${r}: no column works from here — undo column ${c} and back up to the previous row.`,
  solved: () => 'All 4 queens placed with no conflicts.',
}

export default function BacktrackingViz() {
  const steps = useMemo(solveSteps, [])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]
  const atEnd = stepIdx >= steps.length - 1

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    const n = steps[stepIdx + 1]
    if (n.action === 'solved') playSuccess()
    else if (n.action === 'conflict') playError()
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

      <div
        className="mono"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${N}, 48px)`,
          gridTemplateRows: `repeat(${N}, 48px)`,
          gap: 3,
          margin: '16px auto',
          width: 'fit-content',
        }}
      >
        {Array.from({ length: N }, (_, row) =>
          Array.from({ length: N }, (_, col) => {
            const hasQueen = step.cols[row] === col
            const isActiveCell = step.row === row && step.col === col && step.action !== 'solved'
            return (
              <div
                key={`${row}-${col}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  borderRadius: 6,
                  background: isActiveCell ? `${ACTION_COLOR[step.action]}22` : (row + col) % 2 === 0 ? 'var(--panel-2)' : 'var(--panel)',
                  border: `2px solid ${isActiveCell ? ACTION_COLOR[step.action] : 'var(--border)'}`,
                  color: step.action === 'solved' ? 'var(--good)' : 'var(--text)',
                }}
              >
                {hasQueen ? '♛' : ''}
              </div>
            )
          })
        )}
      </div>

      <p style={{ color: ACTION_COLOR[step.action], fontSize: 13 }}>
        {ACTION_TEXT[step.action](step.row, step.col)}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Try a choice, recurse; if a later row has no valid column, undo (backtrack) and try the next option at the row above. Exploring one column at a time and pruning as soon as a conflict shows up is what keeps this from checking all N^N placements.
      </p>
    </div>
  )
}
