import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const CAPACITY = 10
const REFILL_MS = 700

export default function RateLimiting() {
  const [tokens, setTokens] = useState(CAPACITY)
  const [log, setLog] = useState([])
  const fillRef = useRef(null)
  const nextLogId = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      setTokens((t) => Math.min(CAPACITY, t + 1))
    }, REFILL_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!fillRef.current) return
    gsap.to(fillRef.current, { attr: { height: (tokens / CAPACITY) * 140, y: 160 - (tokens / CAPACITY) * 140 }, duration: 0.3, ease: 'power1.out' })
  }, [tokens])

  const pushLog = (allowed) => {
    setLog((l) => [{ id: nextLogId.current++, allowed }, ...l].slice(0, 20))
  }

  const tokensRef = useRef(tokens)
  tokensRef.current = tokens

  const sendRequest = () => {
    // Mutate the ref synchronously (not just state) so a tight burst loop
    // sees each call's decrement immediately, instead of every iteration
    // reading the same pre-burst token count.
    if (tokensRef.current >= 1) {
      tokensRef.current -= 1
      setTokens(tokensRef.current)
      pushLog(true)
    } else {
      pushLog(false)
    }
  }

  const burst = () => {
    for (let i = 0; i < 5; i++) sendRequest()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={sendRequest}>Send request</button>
        <button className="btn" onClick={burst}>Burst 5 requests</button>
        <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
          refills 1 token / {REFILL_MS}ms, capacity {CAPACITY}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginTop: 8 }}>
        <svg width="120" height="180" viewBox="0 0 120 180">
          <rect x="0" y="20" width="120" height="140" rx="10" fill="var(--panel-2)" stroke="var(--border)" strokeWidth="2" />
          <rect ref={fillRef} x="2" y="20" width="116" height="140" rx="8" fill="var(--accent)" opacity="0.5" />
          <text x="60" y="10" textAnchor="middle" fontSize="13" fill="var(--text-dim)">bucket</text>
          <text x="60" y="95" textAnchor="middle" fontSize="26" fill="var(--text)" fontWeight="700">{tokens}</text>
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>request log (newest first)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 400 }}>
            {log.map((entry) => (
              <div
                key={entry.id}
                title={entry.allowed ? '200 OK' : '429 Too Many Requests'}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: entry.allowed ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                  border: `1px solid ${entry.allowed ? 'var(--good)' : 'var(--bad)'}`,
                  color: entry.allowed ? 'var(--good)' : 'var(--bad)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {entry.allowed ? 'OK' : '×'}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        Each request costs one token. Tokens refill steadily, so short bursts are absorbed by whatever is saved up, but sustained traffic above the refill rate gets rejected with 429.
      </p>
    </div>
  )
}
