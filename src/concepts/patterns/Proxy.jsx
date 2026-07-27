import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick, playSuccess, playTick } from '../../lib/sound.js'

export default function Proxy() {
  const [loading, setLoading] = useState(false)
  const [cached, setCached] = useState(false)
  const [hits, setHits] = useState(0)

  const load = () => {
    setHits((h) => h + 1)
    if (cached) {
      playClick()
      return
    }
    setLoading(true)
    playTick()
    setTimeout(() => {
      setLoading(false)
      setCached(true)
      playSuccess()
    }, 700)
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={load} disabled={loading}>image.render()</button>
      </div>
      <Stage row>
        <Box active>Client</Box>
        <Arrow active label="render()" />
        <Box active color="var(--accent-2)">ImageProxy {cached && '(cached)'}</Box>
        <Arrow active={loading || cached} label={cached ? 'skip →' : loading ? 'loading…' : ''} />
        <Box active={cached} dim={loading} color={cached ? 'var(--good)' : undefined}>
          {loading ? 'fetching RealImage…' : cached ? 'RealImage ✓' : 'RealImage (not loaded)'}
        </Box>
      </Stage>
      <Note>
        {hits > 0 && `${hits} render() call${hits === 1 ? '' : 's'} — `}
        the proxy shares the exact same interface as the real image, so the client can't tell the
        difference, but it only does the expensive load once and serves every call after that straight
        from cache.
      </Note>
    </div>
  )
}
