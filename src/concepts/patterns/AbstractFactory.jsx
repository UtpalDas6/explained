import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick } from '../../lib/sound.js'

const FAMILIES = {
  light: { label: 'Light UI Kit', color: 'var(--accent)', button: '☀ Button', checkbox: '☐ Checkbox' },
  dark: { label: 'Dark UI Kit', color: 'var(--accent-2)', button: '☾ Button', checkbox: '☑ Checkbox' },
}

export default function AbstractFactory() {
  const [family, setFamily] = useState(null)

  const pick = (key) => {
    setFamily(key)
    playClick()
  }

  const f = family ? FAMILIES[family] : null

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${family === 'light' ? 'primary' : ''}`} onClick={() => pick('light')}>LightFactory</button>
        <button className={`btn ${family === 'dark' ? 'primary' : ''}`} onClick={() => pick('dark')}>DarkFactory</button>
      </div>
      <Stage row>
        <Box active={!!f} color={f?.color}>{f ? f.label : 'pick a factory'}</Box>
        <Arrow active={!!f} label="createUI()" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Box active={!!f} color={f?.color}>{f ? f.button : 'Button'}</Box>
          <Box active={!!f} color={f?.color}>{f ? f.checkbox : 'Checkbox'}</Box>
        </div>
      </Stage>
      <Note>
        One factory call produces a whole matching family of products (button + checkbox) so they can
        never end up mismatched — swap `LightFactory` for `DarkFactory` and every widget it produces
        changes together, without an `if (theme === 'dark')` scattered through the UI code.
      </Note>
    </div>
  )
}
