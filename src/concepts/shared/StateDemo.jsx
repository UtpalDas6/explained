import { useState } from 'react'
import { Box, Arrow, Stage, Note } from '../patterns/shared.jsx'
import { playClick } from '../../lib/sound.js'

// Generic before/after visualizer, shared across sections. A git command,
// an API design fix, anything reducible to "labeled boxes in one state,
// then another" reuses this instead of a bespoke animation each — the
// `demo()` factories in the data files just supply the box arrays.
export default function StateDemo({ command, before, after, note }) {
  const [ran, setRan] = useState(false)
  const state = ran ? after : before

  const run = () => {
    setRan((r) => !r)
    playClick()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={run}>
          <span className="mono">{ran ? '↺ undo' : command}</span>
        </button>
      </div>
      <Stage row>
        {state.map((b, i) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box active={!b.dim} color={b.color}>
              {b.label}
              {b.sub && (
                <>
                  <br />
                  <span style={{ fontSize: 10 }}>{b.sub}</span>
                </>
              )}
            </Box>
            {i < state.length - 1 && <Arrow active={!b.dim} label={b.arrowLabel} />}
          </div>
        ))}
      </Stage>
      <Note>{ran ? note.after : note.before}</Note>
    </div>
  )
}
