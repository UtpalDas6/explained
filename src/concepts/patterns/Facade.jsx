import { useState } from 'react'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playTick, playSuccess } from '../../lib/sound.js'

const STEPS = ['amp.on()', 'projector.on()', 'lights.dim(20)', 'dvd.play()']

export default function Facade() {
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)

  const start = () => {
    if (running) return
    setRunning(true)
    setStep(-1)
    playClick()
    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setStep(i)
        if (i === STEPS.length - 1) {
          playSuccess()
          setRunning(false)
        } else {
          playTick()
        }
      }, (i + 1) * 450)
    })
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={start} disabled={running}>homeTheater.watchMovie()</button>
      </div>
      <Stage>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STEPS.map((s, i) => (
            <Box key={s} active={i <= step} color={i <= step ? 'var(--good)' : undefined} style={{ fontSize: 12 }}>
              {s}
            </Box>
          ))}
        </div>
      </Stage>
      <Note>
        One call on the facade fans out into four subsystem calls in the right order — callers get a
        single simple method instead of needing to know the amp, projector, lights, and DVD player all
        have to be told separately, and in that sequence.
      </Note>
    </div>
  )
}
