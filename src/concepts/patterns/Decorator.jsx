import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playPop } from '../../lib/sound.js'

const ADDONS = [
  { id: 'milk', label: 'Milk', cost: 0.5 },
  { id: 'sugar', label: 'Sugar', cost: 0.2 },
  { id: 'whip', label: 'Whip', cost: 0.7 },
]

export default function Decorator() {
  const [layers, setLayers] = useState([])

  const add = (addon) => {
    setLayers((l) => [...l, addon])
    playClick()
  }

  const reset = () => {
    setLayers([])
    playPop()
  }

  const total = 2 + layers.reduce((s, l) => s + l.cost, 0)

  return (
    <div className="panel">
      <div className="controls">
        {ADDONS.map((a) => (
          <button key={a.id} className="btn" onClick={() => add(a)}>+ {a.label} (${a.cost.toFixed(2)})</button>
        ))}
        <button className="btn" onClick={reset} disabled={!layers.length}>New coffee</button>
      </div>
      <Stage>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <Box active>Coffee — $2.00</Box>
          <AnimatePresence>
            {layers.map((l, i) => (
              <Box key={`${l.id}-${i}`} style={{ fontSize: 12, padding: '6px 12px' }}>
                wrapped in {l.label}Decorator (+${l.cost.toFixed(2)})
              </Box>
            ))}
          </AnimatePresence>
        </div>
        <Box active color="var(--good)">order.cost() = ${total.toFixed(2)}</Box>
      </Stage>
      <Note>
        Each add-on wraps the previous object in a new one implementing the same `cost()`/`describe()`
        interface, stacking behavior at runtime — the alternative would be a subclass for every
        combination of milk, sugar, and whip.
      </Note>
    </div>
  )
}
