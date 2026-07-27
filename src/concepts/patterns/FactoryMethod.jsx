import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick } from '../../lib/sound.js'

const SHAPES = [
  { id: 'circle', label: 'Circle', glyph: '●', color: 'var(--accent)' },
  { id: 'square', label: 'Square', glyph: '■', color: 'var(--accent-2)' },
  { id: 'triangle', label: 'Triangle', glyph: '▲', color: 'var(--good)' },
]

export default function FactoryMethod() {
  const [made, setMade] = useState(null)

  const create = (shape) => {
    setMade(shape)
    playClick()
  }

  return (
    <div className="panel">
      <div className="controls">
        {SHAPES.map((s) => (
          <button key={s.id} className="btn" onClick={() => create(s)}>ShapeFactory.create('{s.id}')</button>
        ))}
      </div>
      <Stage row>
        <Box active>ShapeFactory</Box>
        <Arrow active={!!made} label="create()" />
        <AnimatePresence mode="wait">
          {made ? (
            <Box key={made.id} active color={made.color} style={{ fontSize: 28 }}>
              {made.glyph}
            </Box>
          ) : (
            <Box dim>?</Box>
          )}
        </AnimatePresence>
      </Stage>
      <Note>
        Callers only ever say "make me a shape" — the factory method decides which concrete class to
        instantiate. Add a new shape by adding a new subclass of the factory, no caller code changes.
      </Note>
    </div>
  )
}
