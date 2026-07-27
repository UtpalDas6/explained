import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playPop } from '../../lib/sound.js'

export default function Singleton() {
  const [requests, setRequests] = useState(0)
  const [pulse, setPulse] = useState(0)

  const getInstance = () => {
    setRequests((n) => n + 1)
    setPulse((p) => p + 1)
    playClick()
  }

  const reset = () => {
    setRequests(0)
    playPop()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={getInstance}>Config.getInstance()</button>
        <button className="btn" onClick={reset} disabled={!requests}>Reset app</button>
      </div>
      <Stage>
        <Box active style={{ position: 'relative' }}>
          the one Config instance
          <AnimatePresence>
            {pulse > 0 && (
              <motion.span
                key={pulse}
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'absolute', inset: -2, borderRadius: 10, border: '2px solid var(--accent)', pointerEvents: 'none' }}
              />
            )}
          </AnimatePresence>
        </Box>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {requests} call{requests === 1 ? '' : 's'} to <code className="mono">getInstance()</code> — still 1 object
        </div>
      </Stage>
      <Note>
        Every caller asks for "the" instance; the class hands back the same object every time instead of
        constructing a new one, lazily creating it only on the first call. Reset simulates a fresh process,
        which is the only way this instance ever goes away.
      </Note>
    </div>
  )
}
