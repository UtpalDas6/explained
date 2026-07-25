import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const MODES = ['weak', 'eventual', 'strong']

export default function ConsistencyPatterns() {
  const [mode, setMode] = useState('eventual')
  const [primaryValue, setPrimaryValue] = useState(0)
  const [replicaValue, setReplicaValue] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState('idle')
  const replicaRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const flash = () => gsap.fromTo(replicaRef.current, { scale: 1 }, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, transformOrigin: '50% 50%' })

  const write = () => {
    const v = Math.floor(Math.random() * 90) + 10
    setPrimaryValue(v)
    clearTimeout(timeoutRef.current)

    if (mode === 'strong') {
      setReplicaValue(v)
      flash()
      setStatus(`Wrote x=${v}. Strong consistency: the write isn't acknowledged until the replica has it too — a read right now is guaranteed to see ${v}.`)
      return
    }
    if (mode === 'eventual') {
      setSyncing(true)
      setStatus(`Wrote x=${v}. Acknowledged immediately — the replica is stale for a moment and will catch up shortly.`)
      timeoutRef.current = setTimeout(() => {
        setReplicaValue(v)
        setSyncing(false)
        flash()
        setStatus(`Replica caught up to x=${v}.`)
      }, 1500)
      return
    }
    // weak
    setStatus(`Wrote x=${v}. Acknowledged immediately — there's no guarantee the replica ever sees this without an explicit resync. Good for things like a live voice/video stream where stale/dropped state isn't worth retrying.`)
  }

  const forceResync = () => {
    clearTimeout(timeoutRef.current)
    setSyncing(false)
    setReplicaValue(primaryValue)
    flash()
    setStatus(`Manually resynced — replica now shows x=${primaryValue}.`)
  }

  const inSync = replicaValue === primaryValue

  return (
    <div className="panel">
      <div className="controls">
        {MODES.map((m) => (
          <button key={m} className={`btn ${mode === m ? 'primary' : ''}`} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
        <button className="btn primary" onClick={write}>Write to primary</button>
        {mode === 'weak' && (
          <button className="btn" onClick={forceResync}>Force resync</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 32, margin: '24px 0', justifyContent: 'center' }}>
        <div style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--panel-2)', minWidth: 140, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>primary</div>
          <div className="mono" style={{ fontSize: 24, color: 'var(--accent-2)' }}>x={primaryValue}</div>
        </div>
        <div
          ref={replicaRef}
          style={{
            padding: 20,
            borderRadius: 10,
            border: `1px solid ${inSync ? 'var(--border)' : 'var(--bad)'}`,
            background: 'var(--panel-2)',
            minWidth: 140,
            textAlign: 'center',
            transformOrigin: '50% 50%',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>replica (read here)</div>
          <div className="mono" style={{ fontSize: 24, color: inSync ? 'var(--good)' : 'var(--bad)' }}>x={replicaValue}</div>
          <div style={{ fontSize: 11, color: inSync ? 'var(--good)' : 'var(--bad)', marginTop: 6 }}>
            {syncing ? 'syncing…' : inSync ? 'in sync' : 'STALE'}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Strong: reads always see the latest write, at the cost of write latency. Eventual: writes are fast, replicas catch up shortly after. Weak: no guarantee at all — the fastest option, used when a stale or dropped read is acceptable.
      </p>
    </div>
  )
}
