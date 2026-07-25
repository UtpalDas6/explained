import { useState } from 'react'
import { playSuccess, playTick } from '../lib/sound.js'

const CLIENTS = ['client A', 'client B', 'client C']

export default function DistributedLock() {
  const [holder, setHolder] = useState(null)
  const [waiting, setWaiting] = useState([])
  const [log, setLog] = useState([])

  const pushLog = (text, tone = 'info') => {
    if (tone === 'good') playSuccess()
    else if (tone === 'info') playTick()
    setLog((l) => [text, ...l].slice(0, 6))
  }

  const tryAcquire = (client, holderNow, waitingNow) => {
    if (holderNow === null) {
      pushLog(`${client} acquired the lock`, 'good')
      return { holder: client, waiting: waitingNow.filter((c) => c !== client) }
    }
    if (holderNow === client) return { holder: holderNow, waiting: waitingNow }
    if (waitingNow.includes(client)) return { holder: holderNow, waiting: waitingNow }
    pushLog(`${client} blocked — waiting for ${holderNow} to release`, 'wait')
    return { holder: holderNow, waiting: [...waitingNow, client] }
  }

  const acquire = (client) => {
    const result = tryAcquire(client, holder, waiting)
    setHolder(result.holder)
    setWaiting(result.waiting)
  }

  const release = (client) => {
    if (holder !== client) return
    if (waiting.length > 0) {
      const [next, ...rest] = waiting
      setHolder(next)
      setWaiting(rest)
      pushLog(`${client} released — lock handed to ${next}`, 'good')
    } else {
      setHolder(null)
      pushLog(`${client} released the lock`, 'good')
    }
  }

  const raceAll = () => {
    const order = [...CLIENTS].sort(() => Math.random() - 0.5)
    let h = holder
    let w = waiting
    pushLog(`all clients race to acquire (order: ${order.join(', ')})`)
    for (const c of order) {
      const result = tryAcquire(c, h, w)
      h = result.holder
      w = result.waiting
    }
    setHolder(h)
    setWaiting(w)
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={raceAll}>All 3 race to acquire</button>
      </div>

      <div style={{ display: 'flex', gap: 16, margin: '20px 0', flexWrap: 'wrap' }}>
        {CLIENTS.map((c) => {
          const holds = holder === c
          const pos = waiting.indexOf(c)
          return (
            <div
              key={c}
              style={{
                flex: 1,
                minWidth: 160,
                padding: 16,
                borderRadius: 10,
                border: `1px solid ${holds ? 'var(--good)' : pos >= 0 ? 'var(--accent-2)' : 'var(--border)'}`,
                background: 'var(--panel-2)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{c}</div>
              <div style={{ fontSize: 12, color: holds ? 'var(--good)' : pos >= 0 ? 'var(--accent-2)' : 'var(--text-dim)', marginBottom: 10 }}>
                {holds ? 'holds the lock' : pos >= 0 ? `waiting (position ${pos + 1})` : 'idle'}
              </div>
              <div className="controls" style={{ margin: 0 }}>
                <button className="btn" onClick={() => acquire(c)} disabled={holds}>Try acquire</button>
                <button className="btn" onClick={() => release(c)} disabled={!holds}>Release</button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {log.map((text, i) => (
          <div key={i} className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{text}</div>
        ))}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        Only one client can hold the lock on the shared resource at a time. Others block until it's released, then the next waiter in line gets it — this is how distributed systems serialize access to something that can't be safely modified concurrently.
      </p>
    </div>
  )
}
