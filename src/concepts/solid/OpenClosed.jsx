import { useState } from 'react'
import { Box, Arrow, Stage, Note } from '../patterns/shared.jsx'
import { playClick, playError, playSuccess } from '../../lib/sound.js'

export default function OpenClosed() {
  const [polymorphic, setPolymorphic] = useState(false)
  const [shapes, setShapes] = useState(['Circle', 'Square'])
  const [modified, setModified] = useState(false)

  const toggle = (v) => {
    setPolymorphic(v)
    setShapes(['Circle', 'Square'])
    setModified(false)
    playClick()
  }

  const addTriangle = () => {
    if (shapes.includes('Triangle')) return
    setShapes((s) => [...s, 'Triangle'])
    if (polymorphic) {
      setModified(false)
      playSuccess()
    } else {
      setModified(true)
      playError()
    }
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${!polymorphic ? 'primary' : ''}`} onClick={() => toggle(false)}>switch(shape.type)</button>
        <button className={`btn ${polymorphic ? 'primary' : ''}`} onClick={() => toggle(true)}>polymorphic .area()</button>
        <button className="btn" onClick={addTriangle}>Add Triangle</button>
      </div>
      <Stage row>
        {shapes.map((s) => (
          <Box key={s} active color={s === 'Triangle' ? 'var(--accent-2)' : undefined}>{s}</Box>
        ))}
        <Arrow active label="area()" />
        <Box active color={modified ? 'var(--bad)' : 'var(--good)'}>
          AreaCalculator{modified ? ' — modified!' : ''}
        </Box>
      </Stage>
      <Note>
        {polymorphic
          ? 'AreaCalculator just calls shape.area() — adding Triangle never touched it.'
          : modified
            ? "AreaCalculator's switch statement had to be edited to add a Triangle case before it could sum a shape it didn't already know about."
            : 'This calculator branches on shape.type internally — adding a new shape means editing its switch statement next.'}
      </Note>
    </div>
  )
}
