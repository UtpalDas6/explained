import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playError, playSuccess } from '../../lib/sound.js'

export default function Adapter() {
  const [status, setStatus] = useState(null) // null | 'fail' | 'ok'

  const plugDirect = () => {
    setStatus('fail')
    playError()
  }

  const plugAdapted = () => {
    setStatus('ok')
    playSuccess()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn" onClick={plugDirect}>Plug EU plug directly</button>
        <button className="btn primary" onClick={plugAdapted}>Plug via Adapter</button>
      </div>
      <Stage row>
        <Box active color="var(--accent-2)">EU plug (round pins)</Box>
        {status === 'ok' ? (
          <>
            <Arrow active label="fits" />
            <Box active color="var(--good)">Adapter</Box>
            <Arrow active label="fits" />
          </>
        ) : (
          <Arrow active={status === 'fail'} label={status === 'fail' ? 'jams ✕' : ''} />
        )}
        <Box active={status === 'ok'} color={status === 'ok' ? 'var(--good)' : status === 'fail' ? 'var(--bad)' : undefined}>
          US socket (flat pins)
        </Box>
      </Stage>
      <Note>
        The plug's interface never changes — the adapter sits between it and the socket, translating
        one shape into the other. In code this is the wrapper class that implements the interface a
        client expects while delegating calls to an incompatible legacy API underneath.
      </Note>
    </div>
  )
}
