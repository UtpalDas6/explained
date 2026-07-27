import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playSuccess, playPop } from '../../lib/sound.js'

const PARTS = ['Bun', 'Patty', 'Cheese', 'Lettuce']

export default function Builder() {
  const [parts, setParts] = useState([])
  const [built, setBuilt] = useState(false)

  const add = (part) => {
    setParts((p) => [...p, part])
    setBuilt(false)
    playClick()
  }

  const build = () => {
    if (!parts.length) return
    setBuilt(true)
    playSuccess()
  }

  const reset = () => {
    setParts([])
    setBuilt(false)
    playPop()
  }

  return (
    <div className="panel">
      <div className="controls">
        {PARTS.map((p) => (
          <button key={p} className="btn" onClick={() => add(p)} disabled={built}>+ {p}</button>
        ))}
        <button className="btn primary" onClick={build} disabled={!parts.length || built}>burger.build()</button>
        <button className="btn" onClick={reset} disabled={!parts.length}>New order</button>
      </div>
      <Stage>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 6, minHeight: 60 }}>
          <AnimatePresence>
            {parts.map((p, i) => (
              <Box key={`${p}-${i}`} active={built} color={built ? 'var(--good)' : undefined}>{p}</Box>
            ))}
          </AnimatePresence>
        </div>
        {!parts.length && <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>BurgerBuilder is empty</span>}
        {built && <span style={{ color: 'var(--good)', fontSize: 13 }}>✓ Burger built — ready to serve</span>}
      </Stage>
      <Note>
        The same builder assembles a burger one part at a time, and the same sequence of calls could
        produce a totally different burger with different parts — construction is decoupled from what
        the finished object actually contains, which matters most once a constructor would otherwise
        need a dozen optional parameters.
      </Note>
    </div>
  )
}
