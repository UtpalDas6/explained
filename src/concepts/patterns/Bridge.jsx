import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick } from '../../lib/sound.js'

const SHAPES = ['Circle', 'Square']
const RENDERERS = ['Vector', 'Raster']

export default function Bridge() {
  const [shape, setShape] = useState('Circle')
  const [renderer, setRenderer] = useState('Vector')

  const pick = (setter, val) => {
    setter(val)
    playClick()
  }

  return (
    <div className="panel">
      <div className="controls">
        {SHAPES.map((s) => (
          <button key={s} className={`btn ${shape === s ? 'primary' : ''}`} onClick={() => pick(setShape, s)}>{s}</button>
        ))}
        {RENDERERS.map((r) => (
          <button key={r} className={`btn ${renderer === r ? 'primary' : ''}`} onClick={() => pick(setRenderer, r)}>{r}Renderer</button>
        ))}
      </div>
      <Stage row>
        <Box active color="var(--accent)">{shape}</Box>
        <Arrow active label="drawWith(renderer)" />
        <Box active color="var(--accent-2)">{renderer}Renderer</Box>
        <Arrow active label="=" />
        <Box active color="var(--good)">{shape} drawn as {renderer.toLowerCase()}</Box>
      </Stage>
      <Note>
        Shape and Renderer are two independent hierarchies bridged by composition — any shape can pair
        with any renderer, 2×2 combinations from 2+2 classes instead of a combinatorial explosion of
        `CircleVector`, `CircleRaster`, `SquareVector`, `SquareRaster` subclasses.
      </Note>
    </div>
  )
}
