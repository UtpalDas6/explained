import { useState } from 'react'
import { Box, Arrow, Stage, Note } from '../patterns/shared.jsx'
import { playClick } from '../../lib/sound.js'

// Generic before/after visualizer shared by every git command — a command
// is fundamentally a state transition (working dir / staging / repo / remote
// / stash all reduce to "labeled boxes with a color"), so one component with
// data-driven `before`/`after` box arrays covers all of them instead of a
// bespoke animation per command.
export default function GitDemo({ command, before, after, note }) {
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
          <span className="mono">{ran ? '↺ reset' : `$ ${command}`}</span>
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
