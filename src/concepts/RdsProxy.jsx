import { useRef, useState } from 'react'
import { playClick, playError, playSuccess } from '../lib/sound.js'

const DB_MAX_CONN = 6 // Postgres' own max_connections, shared by both modes
const POOL_SIZE = 3 // fixed pool RDS Proxy keeps open to the real DB
const BURST_SIZE = 10
const FAILOVER_MS = 2200
const STATUS_COLOR = { active: 'var(--good)', queued: 'var(--accent-2)', rejected: 'var(--bad)', error: 'var(--bad)' }
const STATUS_LABEL = { active: 'connected', queued: 'queued', rejected: 'rejected', error: 'dropped' }

export default function RdsProxy() {
  const [mode, setMode] = useState('direct') // 'direct' | 'proxy'
  const [items, setItems] = useState([]) // app-side connection attempts
  const [directSlots, setDirectSlots] = useState(Array(DB_MAX_CONN).fill(null))
  const [poolSlots, setPoolSlots] = useState(Array(POOL_SIZE).fill(null))
  const [queueLen, setQueueLen] = useState(0)
  const [failingOver, setFailingOver] = useState(false)
  const [stats, setStats] = useState({ spawned: 0, rejected: 0, completed: 0 })

  const directRef = useRef(Array(DB_MAX_CONN).fill(null))
  const directTimeoutRef = useRef(Array(DB_MAX_CONN).fill(null))
  const poolRef = useRef(Array(POOL_SIZE).fill(null))
  const poolTimeoutRef = useRef(Array(POOL_SIZE).fill(null))
  const queueRef = useRef([])
  const failingOverRef = useRef(false)
  const nextId = useRef(0)

  const setItemStatus = (id, status) => setItems((list) => list.map((it) => (it.id === id ? { ...it, status } : it)))
  const dropItem = (id) => setTimeout(() => setItems((list) => list.filter((it) => it.id !== id)), 900)

  const finishDirect = (id, slotIdx) => {
    directRef.current[slotIdx] = null
    setDirectSlots([...directRef.current])
    setStats((s) => ({ ...s, completed: s.completed + 1 }))
    setItemStatus(id, 'done')
    dropItem(id)
  }

  const connectDirect = (id) => {
    if (failingOverRef.current) {
      playError()
      setStats((s) => ({ ...s, rejected: s.rejected + 1 }))
      setItemStatus(id, 'error')
      dropItem(id)
      return
    }
    const slotIdx = directRef.current.findIndex((v) => v === null)
    if (slotIdx === -1) {
      playError()
      setStats((s) => ({ ...s, rejected: s.rejected + 1 }))
      setItemStatus(id, 'rejected')
      dropItem(id)
      return
    }
    directRef.current[slotIdx] = id
    setDirectSlots([...directRef.current])
    setItemStatus(id, 'active')
    directTimeoutRef.current[slotIdx] = setTimeout(() => finishDirect(id, slotIdx), 900 + Math.random() * 700)
  }

  const drainPool = () => {
    while (queueRef.current.length > 0 && !failingOverRef.current) {
      const slotIdx = poolRef.current.findIndex((v) => v === null)
      if (slotIdx === -1) break
      const id = queueRef.current.shift()
      setQueueLen(queueRef.current.length)
      poolRef.current[slotIdx] = id
      setPoolSlots([...poolRef.current])
      setItemStatus(id, 'active')
      poolTimeoutRef.current[slotIdx] = setTimeout(() => {
        poolRef.current[slotIdx] = null
        setPoolSlots([...poolRef.current])
        setStats((s) => ({ ...s, completed: s.completed + 1 }))
        setItemStatus(id, 'done')
        dropItem(id)
        drainPool()
      }, 900 + Math.random() * 700)
    }
  }

  const connectProxy = (id) => {
    setItemStatus(id, 'queued')
    queueRef.current.push(id)
    setQueueLen(queueRef.current.length)
    drainPool()
  }

  const spawn = () => {
    const id = nextId.current++
    setItems((list) => [...list, { id, status: 'connecting' }])
    setStats((s) => ({ ...s, spawned: s.spawned + 1 }))
    if (mode === 'direct') connectDirect(id)
    else connectProxy(id)
  }

  const spawnBurst = () => {
    playClick()
    for (let i = 0; i < BURST_SIZE; i++) setTimeout(spawn, i * 90)
  }

  const killPrimary = () => {
    playError()
    failingOverRef.current = true
    setFailingOver(true)
    if (mode === 'direct') {
      directRef.current.forEach((id, i) => {
        if (id !== null) setItemStatus(id, 'error')
        clearTimeout(directTimeoutRef.current[i])
        directTimeoutRef.current[i] = null
        directRef.current[i] = null
      })
      setDirectSlots([...directRef.current])
    } else {
      // proxy-side app connections stay open — only the DB-side pool drops,
      // so queued/active work goes back to "queued" instead of erroring out.
      // Cancel each slot's pending completion timeout or it'll fire later
      // against a slot the pool has since reassigned to someone else.
      poolRef.current.forEach((id, i) => {
        if (id !== null) {
          setItemStatus(id, 'queued')
          queueRef.current.unshift(id)
        }
        clearTimeout(poolTimeoutRef.current[i])
        poolTimeoutRef.current[i] = null
        poolRef.current[i] = null
      })
      setPoolSlots([...poolRef.current])
      setQueueLen(queueRef.current.length)
    }
    setTimeout(() => {
      failingOverRef.current = false
      setFailingOver(false)
      playSuccess()
      if (mode === 'proxy') drainPool()
    }, FAILOVER_MS)
  }

  const dbConnCount = mode === 'direct' ? directSlots.filter((v) => v !== null).length : poolSlots.filter((v) => v !== null).length

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${mode === 'direct' ? 'primary' : ''}`} onClick={() => setMode('direct')} disabled={items.length > 0}>Direct to DB</button>
        <button className={`btn ${mode === 'proxy' ? 'primary' : ''}`} onClick={() => setMode('proxy')} disabled={items.length > 0}>Via RDS Proxy</button>
        <button className="btn" onClick={spawnBurst}>Spawn burst of {BURST_SIZE} lambdas</button>
        <button className="btn" onClick={killPrimary} disabled={failingOver}>Kill primary (failover)</button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
        app-side connections ({mode === 'direct' ? 'one real DB connection each' : 'multiplexed through the proxy'})
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 32, marginBottom: 20 }}>
        {items.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>none yet — spawn a burst</span>}
        {items.map((it) => (
          <div
            key={it.id}
            title={STATUS_LABEL[it.status] || it.status}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              border: `1px solid ${STATUS_COLOR[it.status] || 'var(--border)'}`,
              color: STATUS_COLOR[it.status] || 'var(--text-dim)',
              background: 'var(--panel-2)',
            }}
          >
            λ{it.id}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
        real Postgres connections — {dbConnCount}/{mode === 'direct' ? DB_MAX_CONN : POOL_SIZE} used
        {mode === 'proxy' && queueLen > 0 ? `, ${queueLen} queued behind the pool` : ''}
        {failingOver ? ' — FAILING OVER' : ''}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {(mode === 'direct' ? directSlots : poolSlots).map((id, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 8,
              border: `1px solid ${failingOver ? 'var(--bad)' : id !== null ? 'var(--good)' : 'var(--border)'}`,
              background: 'var(--panel-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: failingOver ? 'var(--bad)' : id !== null ? 'var(--good)' : 'var(--text-dim)',
            }}
          >
            {failingOver ? 'down' : id !== null ? `λ${id}` : 'idle'}
          </div>
        ))}
      </div>

      <div className="stat-row">
        <div><b>{stats.spawned}</b>spawned</div>
        <div><b>{stats.rejected}</b>rejected (too many connections)</div>
        <div><b>{stats.completed}</b>completed</div>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        Direct mode gives every Lambda invocation its own Postgres connection — a burst past {DB_MAX_CONN} concurrent
        callers gets flat-out rejected, and killing the primary drops every open connection at once. RDS Proxy holds
        just {POOL_SIZE} real connections to the database and multiplexes many more app-side connections through them,
        queuing instead of rejecting under a burst. On failover it reconnects that small pool to the new primary
        itself, so app connections just wait a moment instead of erroring out.
      </p>
    </div>
  )
}
