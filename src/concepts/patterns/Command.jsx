import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playPop, playSuccess } from '../../lib/sound.js'

const COMMANDS = ['MoveUp', 'MoveRight', 'Rotate']

export default function Command() {
  const [queue, setQueue] = useState([])
  const [log, setLog] = useState([])

  const enqueue = (cmd) => {
    setQueue((q) => [...q, cmd])
    playClick()
  }

  const executeAll = () => {
    if (!queue.length) return
    setLog((l) => [...l, ...queue])
    setQueue([])
    playSuccess()
  }

  const undo = () => {
    if (!log.length) return
    setLog((l) => l.slice(0, -1))
    playPop()
  }

  return (
    <div className="panel">
      <div className="controls">
        {COMMANDS.map((c) => (
          <button key={c} className="btn" onClick={() => enqueue(c)}>queue.add({c})</button>
        ))}
        <button className="btn primary" onClick={executeAll} disabled={!queue.length}>invoker.executeAll()</button>
        <button className="btn" onClick={undo} disabled={!log.length}>undo</button>
      </div>
      <Stage row>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>queue</span>
          <AnimatePresence>
            {queue.map((c, i) => <Box key={`${c}-${i}`}>{c}</Box>)}
          </AnimatePresence>
          {!queue.length && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>empty</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>executed (undo stack)</span>
          <AnimatePresence>
            {log.map((c, i) => <Box key={`${c}-${i}-log`} active color="var(--good)">{c}</Box>)}
          </AnimatePresence>
          {!log.length && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>empty</span>}
        </div>
      </Stage>
      <Note>
        Each button press packages an action as an object instead of calling it directly — the invoker
        can queue commands, execute them later in a batch, log them, or pop them back off to undo,
        none of which is possible with a bare function call.
      </Note>
    </div>
  )
}
