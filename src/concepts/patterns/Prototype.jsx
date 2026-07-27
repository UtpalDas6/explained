import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick, playPop } from '../../lib/sound.js'

export default function Prototype() {
  const [original] = useState({ hp: 80, armor: 12, weapon: 'sword' })
  const [clone, setClone] = useState(null)

  const cloneIt = () => {
    setClone({ ...original })
    playClick()
  }

  const mutateClone = () => {
    setClone((c) => (c ? { ...c, weapon: 'axe', armor: c.armor + 4 } : c))
    playPop()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={cloneIt}>orc.clone()</button>
        <button className="btn" onClick={mutateClone} disabled={!clone}>mutate clone</button>
      </div>
      <Stage row>
        <Box active style={{ textAlign: 'left', fontSize: 12 }}>
          orc (prototype)
          <div style={{ color: 'var(--text-dim)', marginTop: 6 }}>
            hp: {original.hp}<br />armor: {original.armor}<br />weapon: {original.weapon}
          </div>
        </Box>
        <Arrow active={!!clone} label="clone()" />
        {clone ? (
          <Box active color="var(--good)" style={{ textAlign: 'left', fontSize: 12 }}>
            clone
            <div style={{ color: 'var(--text-dim)', marginTop: 6 }}>
              hp: {clone.hp}<br />armor: {clone.armor}<br />weapon: {clone.weapon}
            </div>
          </Box>
        ) : (
          <Box dim>no clone yet</Box>
        )}
      </Stage>
      <Note>
        Cloning copies the prototype's already-set-up state instead of re-running an expensive
        constructor from scratch — mutating the clone (new weapon, more armor) never touches the
        original. Game engines spawning hundreds of near-identical enemies from one template lean on
        exactly this.
      </Note>
    </div>
  )
}
