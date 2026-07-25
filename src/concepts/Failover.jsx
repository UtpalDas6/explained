import { useEffect, useRef, useState } from 'react'

const FAILOVER_DELAY_MS = 2000
const TICK_MS = 400

export default function Failover() {
  const [mode, setMode] = useState('passive') // 'passive' | 'active'
  const [primaryAlive, setPrimaryAlive] = useState(true)
  const [failoverPending, setFailoverPending] = useState(false)
  const [aliveA, setAliveA] = useState(true)
  const [aliveB, setAliveB] = useState(true)
  const [ticks, setTicks] = useState([])

  const stateRef = useRef({})
  stateRef.current = { mode, primaryAlive, failoverPending, aliveA, aliveB }
  const rrCursor = useRef(0)
  const failoverTimeout = useRef(null)

  useEffect(() => () => clearTimeout(failoverTimeout.current), [])

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      let ok
      let label
      if (s.mode === 'passive') {
        if (s.primaryAlive) {
          ok = true
          label = 'primary'
        } else if (s.failoverPending) {
          ok = false
          label = 'no node ready'
        } else {
          ok = true
          label = 'standby (promoted)'
        }
      } else {
        const nodes = [s.aliveA && 'A', s.aliveB && 'B'].filter(Boolean)
        if (nodes.length === 0) {
          ok = false
          label = 'no node alive'
        } else {
          rrCursor.current = (rrCursor.current + 1) % nodes.length
          ok = true
          label = `node ${nodes[rrCursor.current % nodes.length]}`
        }
      }
      setTicks((t) => [...t, { ok, label }].slice(-24))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  const killPrimary = () => {
    setPrimaryAlive(false)
    setFailoverPending(true)
    clearTimeout(failoverTimeout.current)
    failoverTimeout.current = setTimeout(() => setFailoverPending(false), FAILOVER_DELAY_MS)
  }

  const resetPassive = () => {
    clearTimeout(failoverTimeout.current)
    setPrimaryAlive(true)
    setFailoverPending(false)
  }

  const resetActive = () => {
    setAliveA(true)
    setAliveB(true)
  }

  const failCount = ticks.filter((t) => !t.ok).length

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${mode === 'passive' ? 'primary' : ''}`} onClick={() => setMode('passive')}>Active-Passive</button>
        <button className={`btn ${mode === 'active' ? 'primary' : ''}`} onClick={() => setMode('active')}>Active-Active</button>
        {mode === 'passive' ? (
          <>
            <button className="btn" onClick={killPrimary} disabled={!primaryAlive}>Kill primary</button>
            <button className="btn" onClick={resetPassive}>Reset</button>
          </>
        ) : (
          <>
            <button className="btn" onClick={() => setAliveA(false)} disabled={!aliveA}>Kill node A</button>
            <button className="btn" onClick={() => setAliveB(false)} disabled={!aliveB}>Kill node B</button>
            <button className="btn" onClick={resetActive}>Reset</button>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, margin: '20px 0' }}>
        {mode === 'passive' ? (
          <>
            <div style={{ flex: 1, padding: 16, borderRadius: 10, border: `1px solid ${primaryAlive ? 'var(--good)' : 'var(--bad)'}`, background: 'var(--panel-2)', textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>Primary</div>
              <div style={{ fontSize: 12, color: primaryAlive ? 'var(--good)' : 'var(--bad)', marginTop: 6 }}>{primaryAlive ? 'serving traffic' : 'DOWN'}</div>
            </div>
            <div style={{ flex: 1, padding: 16, borderRadius: 10, border: `1px solid ${!primaryAlive && !failoverPending ? 'var(--good)' : 'var(--border)'}`, background: 'var(--panel-2)', textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>Standby</div>
              <div style={{ fontSize: 12, color: !primaryAlive && !failoverPending ? 'var(--good)' : 'var(--text-dim)', marginTop: 6 }}>
                {!primaryAlive && !failoverPending ? 'promoted — serving traffic' : !primaryAlive ? 'promoting…' : 'idle'}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1, padding: 16, borderRadius: 10, border: `1px solid ${aliveA ? 'var(--good)' : 'var(--bad)'}`, background: 'var(--panel-2)', textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>Node A</div>
              <div style={{ fontSize: 12, color: aliveA ? 'var(--good)' : 'var(--bad)', marginTop: 6 }}>{aliveA ? 'serving traffic' : 'DOWN'}</div>
            </div>
            <div style={{ flex: 1, padding: 16, borderRadius: 10, border: `1px solid ${aliveB ? 'var(--good)' : 'var(--bad)'}`, background: 'var(--panel-2)', textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>Node B</div>
              <div style={{ fontSize: 12, color: aliveB ? 'var(--good)' : 'var(--bad)', marginTop: 6 }}>{aliveB ? 'serving traffic' : 'DOWN'}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>traffic, one dot per {TICK_MS}ms tick (newest on the right)</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {ticks.map((t, i) => (
          <div
            key={i}
            title={t.label}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: t.ok ? 'var(--good)' : 'var(--bad)',
              opacity: t.ok ? 0.7 : 1,
            }}
          />
        ))}
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        failed requests so far: {failCount}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>
        Active-passive has a real outage window while the standby detects the failure and promotes itself. Active-active has no failover gap at all — the surviving node was already serving traffic, so the others just get more of it.
      </p>
    </div>
  )
}
