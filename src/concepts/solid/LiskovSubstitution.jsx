import { useState } from 'react'
import { Box, Arrow, Stage, Note } from '../patterns/shared.jsx'
import { playClick, playError, playSuccess } from '../../lib/sound.js'

// resize() sets width=5, height=4 and expects area === 20 — the contract any Shape passed in must honor
function resize(shape) {
  if (shape.kind === 'square-as-rectangle') {
    shape.width = 5 // a Square's setWidth also silently changes height
    shape.height = 5
    shape.width = shape.height = 4 // then setHeight(4) changes width too
    return shape.width * shape.height
  }
  return 5 * 4
}

export default function LiskovSubstitution() {
  const [squareExtendsRect, setSquareExtendsRect] = useState(true)
  const [result, setResult] = useState(null)

  const run = () => {
    const area = squareExtendsRect ? resize({ kind: 'square-as-rectangle' }) : 20
    setResult(area)
    area === 20 ? playSuccess() : playError()
  }

  const toggle = (v) => {
    setSquareExtendsRect(v)
    setResult(null)
    playClick()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${squareExtendsRect ? 'primary' : ''}`} onClick={() => toggle(true)}>Square extends Rectangle</button>
        <button className={`btn ${!squareExtendsRect ? 'primary' : ''}`} onClick={() => toggle(false)}>Square is its own Shape</button>
        <button className="btn" onClick={run}>resize(shape) → setWidth(5).setHeight(4)</button>
      </div>
      <Stage row>
        <Box active>Client</Box>
        <Arrow active label="resize(shape)" />
        <Box active color={squareExtendsRect ? 'var(--bad)' : 'var(--good)'}>
          {squareExtendsRect ? 'Square (as Rectangle)' : 'Square'}
        </Box>
        <Arrow active label="area()" />
        <Box active color={result == null ? undefined : result === 20 ? 'var(--good)' : 'var(--bad)'}>
          {result == null ? 'area = ?' : `area = ${result}`}
        </Box>
      </Stage>
      <Note>
        {squareExtendsRect
          ? "The client expects any Rectangle it resizes to end up 5×4 = 20. A Square forced to be a Rectangle can't honor that — setting height also silently changes width, so the client gets 16, not 20."
          : 'Square no longer pretends to be a Rectangle, so the client never gets a surprising result — every Shape passed in honors the same contract.'}
      </Note>
    </div>
  )
}
