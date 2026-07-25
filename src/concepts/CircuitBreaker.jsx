import { useEffect, useRef, useState } from 'react'
import { playSuccess, playError, playTick } from '../lib/sound.js'

const FAILURE_THRESHOLD = 3
const OPEN_TIMEOUT_MS = 3000

const STATES = [
  { id: 'closed', label: 'Closed' },
  { id: 'open', label: 'Open' },
  { id: 'half-open', label: 'Half-Open' },
]

export default function CircuitBreaker() {
  const [state, setState] = useState('closed')
  const [failCount, setFailCount] = useState(0)
  const [log, setLog] = useState([])
  const timeoutRef = useRef(null)
  const nextLogId = useRef(0)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const pushLog = (text, tone) => {
    if (tone === 'good') playSuccess()
    else if (tone === 'bad') playError()
    else playTick()
    setLog((l) => [{ id: nextLogId.current++, text, tone }, ...l].slice(0, 8))
  }

  const scheduleHalfOpen = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setState('half-open')
      pushLog('timeout elapsed — trying a single trial request', 'info')
    }, OPEN_TIMEOUT_MS)
  }

  const send = (willSucceed) => {
    if (state === 'open') {
      pushLog('short-circuited — request never reached the service', 'bad')
      return
    }
    if (willSucceed) {
      pushLog('request succeeded', 'good')
      setFailCount(0)
      if (state === 'half-open') {
        setState('closed')
        pushLog('trial succeeded — breaker closed', 'good')
      }
      return
    }
    // failing request
    if (state === 'half-open') {
      setState('open')
      pushLog('trial failed — breaker re-opened', 'bad')
      scheduleHalfOpen()
      return
    }
    const next = failCount + 1
    pushLog(`request failed (${next}/${FAILURE_THRESHOLD})`, 'bad')
    if (next >= FAILURE_THRESHOLD) {
      setFailCount(0)
      setState('open')
      pushLog(`threshold reached — breaker OPEN for ${OPEN_TIMEOUT_MS / 1000}s`, 'bad')
      scheduleHalfOpen()
    } else {
      setFailCount(next)
    }
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={() => send(true)}>Send request (succeeds)</button>
        <button className="btn" onClick={() => send(false)}>Send request (fails)</button>
      </div>

      <div style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
        {STATES.map((s) => (
          <div
            key={s.id}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '14px 8px',
              borderRadius: 10,
              border: `1px solid ${state === s.id ? 'var(--accent)' : 'var(--border)'}`,
              background: state === s.id ? 'rgba(110,231,255,0.08)' : 'var(--panel-2)',
              color: state === s.id ? 'var(--accent)' : 'var(--text-dim)',
              fontWeight: state === s.id ? 700 : 400,
              transition: 'all 0.2s',
            }}
          >
            {s.label}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
        consecutive failures: <b className="mono" style={{ color: 'var(--text)' }}>{failCount}</b> / {FAILURE_THRESHOLD}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {log.map((entry) => (
          <div
            key={entry.id}
            style={{
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              color: entry.tone === 'good' ? 'var(--good)' : entry.tone === 'bad' ? 'var(--bad)' : 'var(--text-dim)',
            }}
          >
            {entry.text}
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        After {FAILURE_THRESHOLD} failures in a row the breaker trips Open and fails fast without calling the service, protecting it from pile-up. After a timeout it goes Half-Open and lets one trial request through to decide whether to close again.
      </p>
    </div>
  )
}
