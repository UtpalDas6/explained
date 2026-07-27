import { useState } from 'react'
import { Box, Stage, Note } from './shared.jsx'
import { playTick, playError } from '../../lib/sound.js'

const COLLECTION = ['A', 'B', 'C', 'D', 'E']

export default function Iterator() {
  const [cursor, setCursor] = useState(-1)

  const next = () => {
    if (cursor >= COLLECTION.length - 1) {
      playError()
      return
    }
    setCursor((c) => c + 1)
    playTick()
  }

  const reset = () => {
    setCursor(-1)
    playTick()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={cursor >= COLLECTION.length - 1}>iterator.next()</button>
        <button className="btn" onClick={reset} disabled={cursor === -1}>iterator.reset()</button>
      </div>
      <Stage row>
        {COLLECTION.map((v, i) => (
          <Box key={v} active={i === cursor} color={i === cursor ? 'var(--accent)' : i < cursor ? 'var(--text-dim)' : undefined}>
            {v}
          </Box>
        ))}
      </Stage>
      <Note>
        {cursor === -1
          ? 'hasNext() is true, current position is before the first element.'
          : cursor >= COLLECTION.length - 1
            ? 'hasNext() is now false — the underlying structure was never exposed, only next()/hasNext().'
            : `Currently at index ${cursor} ("${COLLECTION[cursor]}").`}
        {' '}The same `next()`/`hasNext()` calls would walk a linked list or a tree identically — the
        client never needs to know which.
      </Note>
    </div>
  )
}
