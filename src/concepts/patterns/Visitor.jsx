import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick } from '../../lib/sound.js'

const SHAPES = [
  { id: 'circle', label: 'Circle', area: 78.5, price: 12 },
  { id: 'square', label: 'Square', area: 64, price: 8 },
]

const VISITORS = {
  area: { label: 'AreaVisitor', pick: (s) => `${s.area} cm²` },
  price: { label: 'PriceVisitor', pick: (s) => `$${s.price}` },
}

export default function Visitor() {
  const [visitor, setVisitor] = useState(null)

  const run = (key) => {
    setVisitor(key)
    playClick()
  }

  return (
    <div className="panel">
      <div className="controls">
        {Object.entries(VISITORS).map(([k, v]) => (
          <button key={k} className={`btn ${visitor === k ? 'primary' : ''}`} onClick={() => run(k)}>shape.accept({v.label})</button>
        ))}
      </div>
      <Stage row>
        {SHAPES.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box active>{s.label}</Box>
            {visitor && (
              <>
                <Arrow active label="visitCircle/visitSquare" />
                <Box active color="var(--good)">{VISITORS[visitor].pick(s)}</Box>
              </>
            )}
          </div>
        ))}
      </Stage>
      <Note>
        Neither Circle nor Square has an `area()` or `price()` method — each only knows `accept(visitor)`,
        which calls back into the visitor with its own type. New operations (a new visitor) can be added
        without ever touching the shape classes again.
      </Note>
    </div>
  )
}
