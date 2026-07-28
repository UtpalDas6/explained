import { useState } from 'react'
import { Box, Arrow, Stage, Note } from '../patterns/shared.jsx'
import { playClick, playError } from '../../lib/sound.js'

const REASONS = [
  { key: 'format', label: 'change formatting', owner: 'ReportGenerator' },
  { key: 'storage', label: 'switch storage', owner: 'ReportSaver' },
  { key: 'email', label: 'swap email provider', owner: 'ReportEmailer' },
]

export default function SingleResponsibility() {
  const [split, setSplit] = useState(false)
  const [hit, setHit] = useState([])

  const trigger = (reason) => {
    setHit(split ? [reason.owner] : ['ReportGenerator', 'ReportSaver', 'ReportEmailer'])
    split ? playClick() : playError()
  }

  const toggle = (v) => {
    setSplit(v)
    setHit([])
    playClick()
  }

  const boxes = split ? ['ReportGenerator', 'ReportSaver', 'ReportEmailer'] : ['ReportManager']

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${!split ? 'primary' : ''}`} onClick={() => toggle(false)}>One class (God object)</button>
        <button className={`btn ${split ? 'primary' : ''}`} onClick={() => toggle(true)}>Three classes (SRP)</button>
      </div>
      <div className="controls">
        {REASONS.map((r) => (
          <button key={r.key} className="btn" onClick={() => trigger(r)}>{r.label}</button>
        ))}
      </div>
      <Stage row>
        {boxes.map((b) => (
          <Box key={b} active={hit.includes(b)} color={hit.includes(b) ? (split ? 'var(--good)' : 'var(--bad)') : undefined}>
            {b}
          </Box>
        ))}
      </Stage>
      <Note>
        {split
          ? 'Each reason to change touches exactly one class — the other two never need to be re-tested or redeployed.'
          : 'Every reason to change lands on the same ReportManager — formatting, storage, and email are now coupled, so a change to any one risks breaking the other two.'}
      </Note>
    </div>
  )
}
