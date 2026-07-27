import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stage, Note } from './shared.jsx'
import { playClick, playPop } from '../../lib/sound.js'

const SPECIES = [
  { id: 'oak', color: 'var(--good)' },
  { id: 'pine', color: 'var(--accent)' },
]

export default function Flyweight() {
  const [trees, setTrees] = useState([])

  const plant = (speciesId) => {
    setTrees((t) => [...t, { id: Date.now() + Math.random(), speciesId, x: 10 + Math.random() * 80, y: 10 + Math.random() * 70 }])
    playClick()
  }

  const clear = () => {
    setTrees([])
    playPop()
  }

  const poolCount = new Set(trees.map((t) => t.speciesId)).size

  return (
    <div className="panel">
      <div className="controls">
        {SPECIES.map((s) => (
          <button key={s.id} className="btn" onClick={() => plant(s.id)}>plant {s.id}</button>
        ))}
        <button className="btn" onClick={clear} disabled={!trees.length}>clear forest</button>
      </div>
      <Stage>
        <div style={{ position: 'relative', width: '100%', height: 160, border: '1px dashed var(--border)', borderRadius: 10 }}>
          <AnimatePresence>
            {trees.map((t) => {
              const species = SPECIES.find((s) => s.id === t.speciesId)
              return (
                <motion.span
                  key={t.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  style={{ position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, color: species.color, fontSize: 16 }}
                >
                  🌳
                </motion.span>
              )
            })}
          </AnimatePresence>
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {trees.length} trees planted, but only {poolCount} shared TreeType object{poolCount === 1 ? '' : 's'} in memory
        </div>
      </Stage>
      <Note>
        Each tree's species (mesh, texture, color) is intrinsic state shared from a small pool; only
        its position is extrinsic and unique per instance. A forest of 100,000 trees can reuse 2 species
        objects instead of allocating a full object per tree.
      </Note>
    </div>
  )
}
