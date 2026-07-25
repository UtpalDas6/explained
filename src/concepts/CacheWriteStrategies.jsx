import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const CLIENT_X = 60
const CACHE_X = 340
const DB_X = 620
const BOX_H = 90
const MODES = ['cache-aside', 'write-through', 'write-behind', 'refresh-ahead']

function WriteFlowDemo({ mode }) {
  const dotRef = useRef(null)
  const cacheBoxRef = useRef(null)
  const dbBoxRef = useRef(null)
  const [cacheValue, setCacheValue] = useState(0)
  const [dbValue, setDbValue] = useState(0)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('idle')

  const pulse = (ref) => gsap.fromTo(ref.current, { scale: 1 }, { scale: 1.08, duration: 0.2, yoyo: true, repeat: 1, transformOrigin: '50% 50%' })

  const write = () => {
    if (running) return
    setRunning(true)
    const v = Math.floor(Math.random() * 90) + 10
    gsap.set(dotRef.current, { attr: { cx: CLIENT_X, fill: '#6ee7ff' } })
    const tl = gsap.timeline({ onComplete: () => setRunning(false) })

    if (mode === 'cache-aside') {
      setStatus('cache-aside: write goes straight to the DB; the cache entry is invalidated, not updated.')
      tl.to(dotRef.current, { attr: { cx: CACHE_X }, duration: 0.5, ease: 'power1.inOut' })
      tl.call(() => {
        setCacheValue(null)
        pulse(cacheBoxRef)
      })
      tl.to(dotRef.current, { attr: { cx: DB_X }, duration: 0.5, ease: 'power1.inOut' })
      tl.call(() => {
        setDbValue(v)
        pulse(dbBoxRef)
        setStatus(`DB updated to ${v}. Cache is now empty — the next read will miss and repopulate it.`)
      })
    } else if (mode === 'write-through') {
      setStatus('write-through: write lands in the cache, which synchronously writes through to the DB before acking.')
      tl.to(dotRef.current, { attr: { cx: CACHE_X }, duration: 0.5, ease: 'power1.inOut' })
      tl.call(() => {
        setCacheValue(v)
        pulse(cacheBoxRef)
      })
      tl.to(dotRef.current, { attr: { cx: DB_X }, duration: 0.6, ease: 'power1.inOut' })
      tl.call(() => {
        setDbValue(v)
        pulse(dbBoxRef)
        setStatus(`Cache and DB both hold ${v}. Acknowledged only after the DB confirmed — slower write, never inconsistent.`)
      })
    } else {
      // write-behind
      setStatus('write-behind: write lands in the cache and is acknowledged immediately; the DB catches up later.')
      tl.to(dotRef.current, { attr: { cx: CACHE_X }, duration: 0.5, ease: 'power1.inOut' })
      tl.call(() => {
        setCacheValue(v)
        pulse(cacheBoxRef)
        setStatus(`Cache holds ${v} and acked instantly. DB is still ${dbValue} — flushing in the background…`)
      })
      tl.call(() => {
        setTimeout(() => {
          setDbValue(v)
          pulse(dbBoxRef)
          setStatus(`Background flush complete — DB now holds ${v} too. If the cache had crashed before this flush, that write would be lost.`)
        }, 1200)
      })
    }
  }

  return (
    <div>
      <div className="controls">
        <button className="btn primary" onClick={write} disabled={running}>Write</button>
        <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>{status}</span>
      </div>
      <svg width="100%" height="200" viewBox="0 0 680 200">
        <line x1={CLIENT_X + 20} y1={100} x2={CACHE_X - 20} y2={100} stroke="var(--border)" strokeWidth="2" />
        <line x1={CACHE_X + 20} y1={100} x2={DB_X - 20} y2={100} stroke="var(--border)" strokeWidth="2" />
        <g transform={`translate(${CLIENT_X - 20}, ${100 - BOX_H / 2})`}>
          <rect width="40" height={BOX_H} rx="10" fill="var(--panel-2)" stroke="var(--border)" />
          <text x="20" y={BOX_H + 20} textAnchor="middle" fill="var(--text-dim)" fontSize="12">Client</text>
        </g>
        <g transform={`translate(${CACHE_X - 30}, ${100 - BOX_H / 2})`}>
          <g ref={cacheBoxRef}>
            <rect width="60" height={BOX_H} rx="10" fill="var(--panel-2)" stroke="var(--accent)" />
          </g>
          <text x="30" y={BOX_H + 20} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
            Cache: {cacheValue === null ? 'empty' : cacheValue}
          </text>
        </g>
        <g transform={`translate(${DB_X - 30}, ${100 - BOX_H / 2})`}>
          <g ref={dbBoxRef}>
            <rect width="60" height={BOX_H} rx="10" fill="var(--panel-2)" stroke="var(--border)" />
          </g>
          <text x="30" y={BOX_H + 20} textAnchor="middle" fill="var(--text-dim)" fontSize="12">DB: {dbValue}</text>
        </g>
        <circle ref={dotRef} cx={CLIENT_X} cy="100" r="8" fill="#6ee7ff" />
      </svg>
    </div>
  )
}

function RefreshAheadDemo() {
  // ttl and cacheValue must change together atomically on refresh, which a free-running
  // setInterval can't guarantee via ref-mirrored reads (ticks can race ahead of renders) —
  // so they live in one state object updated by a single functional setState.
  const [cache, setCache] = useState({ ttl: 100, value: 50, justRefreshed: false })
  const [dbValue, setDbValue] = useState(50)
  const [refreshAhead, setRefreshAhead] = useState(true)
  const [status, setStatus] = useState('idle')

  const dbValueRef = useRef(dbValue)
  const refreshAheadRef = useRef(refreshAhead)
  dbValueRef.current = dbValue
  refreshAheadRef.current = refreshAhead

  useEffect(() => {
    const id = setInterval(() => {
      setCache((c) => {
        const next = Math.max(0, c.ttl - 5)
        if (refreshAheadRef.current && next <= 30 && next > 0 && c.value !== dbValueRef.current) {
          return { ttl: 100, value: dbValueRef.current, justRefreshed: true }
        }
        return { ...c, ttl: next }
      })
    }, 400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (cache.justRefreshed) {
      setStatus('Refreshed ahead of expiry — cache updated in the background before TTL hit zero, so reads never missed.')
      setCache((c) => ({ ...c, justRefreshed: false }))
    }
  }, [cache.justRefreshed])

  const simulateDbChange = () => {
    const v = Math.floor(Math.random() * 90) + 10
    setDbValue(v)
    setStatus(`DB changed to ${v} underneath the cache (e.g. another service wrote it directly).`)
  }

  const readCache = () => {
    // Direct click handler, so `cache` from this render is already current —
    // no need for the functional-updater form (and thus no temptation to call
    // setStatus from inside one).
    if (cache.ttl <= 0) {
      setStatus(`Cache had fully expired — this read missed, refetched ${dbValueRef.current} from the DB, and reset the TTL.`)
      setCache({ ttl: 100, value: dbValueRef.current, justRefreshed: false })
    } else {
      const stale = cache.value !== dbValueRef.current
      setStatus(`Read ${cache.value} from cache${stale ? ' — STALE, DB has moved on' : ' (fresh)'}. TTL at ${cache.ttl}%.`)
    }
  }

  return (
    <div>
      <div className="controls">
        <button className={`btn ${refreshAhead ? 'primary' : ''}`} onClick={() => setRefreshAhead((v) => !v)}>
          refresh-ahead: {refreshAhead ? 'ON' : 'OFF'}
        </button>
        <button className="btn" onClick={simulateDbChange}>Simulate DB updated externally</button>
        <button className="btn primary" onClick={readCache}>Read from cache</button>
      </div>

      <div style={{ display: 'flex', gap: 24, margin: '20px 0' }}>
        <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--panel-2)', minWidth: 160 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>cache</div>
          <div className="mono" style={{ fontSize: 22 }}>{cache.value}</div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: `${cache.ttl}%`, height: '100%', background: cache.ttl > 30 ? 'var(--good)' : 'var(--bad)', transition: 'width 0.35s linear' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>TTL {cache.ttl}%</div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--panel-2)', minWidth: 160 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>DB</div>
          <div className="mono" style={{ fontSize: 22 }}>{dbValue}</div>
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{status}</p>
    </div>
  )
}

export default function CacheWriteStrategies() {
  const [mode, setMode] = useState('cache-aside')

  return (
    <div className="panel">
      <div className="controls">
        {MODES.map((m) => (
          <button key={m} className={`btn ${mode === m ? 'primary' : ''}`} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      {mode === 'refresh-ahead' ? <RefreshAheadDemo /> : <WriteFlowDemo key={mode} mode={mode} />}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        Cache-aside and write-through never leave cache and DB out of sync but pay for it in write latency or an extra invalidation step. Write-behind is the fastest write path but risks losing unflushed data. Refresh-ahead is the odd one out — it isn't about writes at all, it keeps hot reads fresh by refetching before expiry instead of waiting for a miss.
      </p>
    </div>
  )
}
