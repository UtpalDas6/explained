import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playTick } from '../../lib/sound.js'

const OBSERVERS = ['EmailNotifier', 'AnalyticsLogger', 'CacheInvalidator']

export default function Observer() {
  const [price, setPrice] = useState(100)
  const [notified, setNotified] = useState([])

  const changePrice = () => {
    const next = price + (Math.random() > 0.5 ? 5 : -5)
    setPrice(next)
    playClick()
    setNotified([])
    OBSERVERS.forEach((o, i) => {
      setTimeout(() => {
        setNotified((n) => [...n, o])
        playTick()
      }, (i + 1) * 250)
    })
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={changePrice}>product.setPrice(...)</button>
      </div>
      <Stage>
        <Box active color="var(--accent)">Product — ${price}</Box>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <AnimatePresence>
            {OBSERVERS.map((o) => (
              <Box key={o} active={notified.includes(o)} color={notified.includes(o) ? 'var(--good)' : undefined} style={{ fontSize: 12 }}>
                {o}{notified.includes(o) ? ' ✓ update()' : ''}
              </Box>
            ))}
          </AnimatePresence>
        </div>
      </Stage>
      <Note>
        The product doesn't know or care what an EmailNotifier or CacheInvalidator does — it just
        calls `update()` on every subscriber whenever its own state changes. Observers can be added or
        removed at runtime without the subject's code changing at all.
      </Note>
    </div>
  )
}
