import { useState } from 'react'
import { playPop, playWhoosh } from '../lib/sound.js'

// 0-indexed; ORDER_TOTALS[1] is "order #2" (its displayed id is index+1) everywhere below.
const ORDER_TOTALS = [20, 45, 12, 99]
const QUERY_INDEX = 1

const rowStyle = (flashed) => ({
  padding: '8px 12px',
  borderRadius: 6,
  border: `1px solid ${flashed ? 'var(--accent)' : 'var(--border)'}`,
  background: flashed ? 'rgba(110,231,255,0.1)' : 'var(--panel-2)',
  fontSize: 12,
  fontFamily: 'ui-monospace, monospace',
  transition: 'background 0.3s, border-color 0.3s',
})

export default function Denormalization() {
  const [denormalized, setDenormalized] = useState(false)
  const [emailVersion, setEmailVersion] = useState(0)
  const [flashedOrders, setFlashedOrders] = useState([])
  const [flashedUser, setFlashedUser] = useState(false)
  const [status, setStatus] = useState('idle')

  const email = `ada${emailVersion || ''}@example.com`

  const flashOrders = (indices, ms = 700) => {
    setFlashedOrders(indices)
    setTimeout(() => setFlashedOrders([]), ms)
  }
  const flashUser = (ms = 700) => {
    setFlashedUser(true)
    setTimeout(() => setFlashedUser(false), ms)
  }

  const query = () => {
    const total = ORDER_TOTALS[QUERY_INDEX]
    if (denormalized) {
      flashOrders([QUERY_INDEX])
      playPop()
      setStatus(`1 lookup, no join: order #${QUERY_INDEX + 1} → total=${total}, user=Ada <${email}>`)
    } else {
      flashOrders([QUERY_INDEX], 500)
      playPop()
      setTimeout(() => {
        flashUser(500)
        playPop()
      }, 550)
      setStatus(`2 lookups, 1 join: fetch order #${QUERY_INDEX + 1}, then join to users on user_id → total=${total}, user=Ada <${email}>`)
    }
  }

  const updateEmail = () => {
    setEmailVersion((v) => v + 1)
    if (denormalized) {
      flashOrders(ORDER_TOTALS.map((_, i) => i), 800)
      playWhoosh()
      setStatus(`Denormalized: had to update all ${ORDER_TOTALS.length} order rows — 1 logical change became ${ORDER_TOTALS.length} writes.`)
    } else {
      flashUser(800)
      playPop()
      setStatus('Normalized: updated the single users row. All orders join to it, so they all see the new email automatically.')
    }
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${!denormalized ? 'primary' : ''}`} onClick={() => setDenormalized(false)}>Normalized</button>
        <button className={`btn ${denormalized ? 'primary' : ''}`} onClick={() => setDenormalized(true)}>Denormalized</button>
        <button className="btn primary" onClick={query}>Get order #{QUERY_INDEX + 1} + user info</button>
        <button className="btn" onClick={updateEmail}>Update user's email</button>
      </div>

      {!denormalized ? (
        <div style={{ display: 'flex', gap: 24, margin: '20px 0', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>users</div>
            <div style={rowStyle(flashedUser)}>id=1 name=Ada email={email}</div>
          </div>
          <div style={{ minWidth: 260 }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>orders (user_id → users.id)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ORDER_TOTALS.map((total, i) => (
                <div key={i} style={rowStyle(flashedOrders.includes(i))}>
                  id={i + 1} user_id=1 total={total}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ margin: '20px 0', minWidth: 320 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>orders (denormalized — user data copied onto every row)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ORDER_TOTALS.map((total, i) => (
              <div key={i} style={rowStyle(flashedOrders.includes(i))}>
                id={i + 1} total={total} user_name=Ada user_email={email}
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Denormalizing trades write cost and redundancy for read speed — no join needed, but every copy of the duplicated data has to be kept in sync by hand.
      </p>
    </div>
  )
}
