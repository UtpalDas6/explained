import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick, playSuccess } from '../../lib/sound.js'

const STATES = ['Pending', 'Shipped', 'Delivered']

export default function StatePattern() {
  const [index, setIndex] = useState(0)

  const advance = () => {
    if (index >= STATES.length - 1) return
    setIndex((i) => i + 1)
    if (index === STATES.length - 2) playSuccess()
    else playClick()
  }

  const reset = () => {
    setIndex(0)
    playClick()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={advance} disabled={index >= STATES.length - 1}>order.next()</button>
        <button className="btn" onClick={reset} disabled={index === 0}>new order</button>
      </div>
      <Stage row>
        {STATES.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box active={i === index} color={i < index ? 'var(--text-dim)' : i === index ? 'var(--accent)' : undefined} dim={i > index}>
              {s}
            </Box>
            {i < STATES.length - 1 && <Arrow active={i < index} />}
          </div>
        ))}
      </Stage>
      <Note>
        `order.next()` behaves differently depending on the order's current state object — Pending's
        `next()` moves to Shipped, Shipped's moves to Delivered, Delivered's does nothing — instead of
        one method with a switch over every possible status.
      </Note>
    </div>
  )
}
