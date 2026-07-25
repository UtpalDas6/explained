import { useRef, useState } from 'react'
import { gsap } from 'gsap'

const CLIENT_Y = 24
const SERVER_Y = 256
const CX = 75

const LANES = [
  {
    id: 'polling',
    title: 'Polling',
    persistent: false,
    events: [
      { t: 0.0, from: 'client', color: '#8a90a2' },
      { t: 0.3, from: 'server', color: '#8a90a2' },
      { t: 1.2, from: 'client', color: '#8a90a2' },
      { t: 1.5, from: 'server', color: '#8a90a2' },
      { t: 2.4, from: 'client', color: '#8a90a2' },
      { t: 2.7, from: 'server', color: '#4ade80' },
      { t: 3.6, from: 'client', color: '#8a90a2' },
      { t: 3.9, from: 'server', color: '#8a90a2' },
      { t: 4.8, from: 'client', color: '#8a90a2' },
      { t: 5.1, from: 'server', color: '#8a90a2' },
    ],
  },
  {
    id: 'sse',
    title: 'SSE',
    persistent: true,
    events: [
      { t: 1.0, from: 'server', color: '#4ade80' },
      { t: 3.0, from: 'server', color: '#4ade80' },
      { t: 4.4, from: 'server', color: '#4ade80' },
    ],
  },
  {
    id: 'ws',
    title: 'WebSocket',
    persistent: true,
    events: [
      { t: 0.5, from: 'client', color: '#6ee7ff' },
      { t: 1.5, from: 'server', color: '#4ade80' },
      { t: 3.2, from: 'client', color: '#6ee7ff' },
      { t: 3.6, from: 'server', color: '#4ade80' },
      { t: 5.0, from: 'server', color: '#4ade80' },
    ],
  },
]

function Lane({ lane, dotRefs }) {
  return (
    <div style={{ flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, textAlign: 'center' }}>{lane.title}</div>
      <svg width="100%" height="300" viewBox="0 0 150 300">
        <line
          x1={CX} y1={CLIENT_Y + 10} x2={CX} y2={SERVER_Y - 10}
          stroke={lane.persistent ? 'var(--accent)' : 'var(--border)'}
          strokeWidth={lane.persistent ? 2 : 1.5}
          strokeDasharray={lane.persistent ? '0' : '4 4'}
          opacity={lane.persistent ? 0.6 : 0.4}
        />
        <g transform={`translate(${CX - 30}, ${CLIENT_Y - 10})`}>
          <rect width="60" height="24" rx="6" fill="var(--panel-2)" stroke="var(--border)" />
          <text x="30" y="16" textAnchor="middle" fontSize="11" fill="var(--text-dim)">client</text>
        </g>
        <g transform={`translate(${CX - 30}, ${SERVER_Y - 10})`}>
          <rect width="60" height="24" rx="6" fill="var(--panel-2)" stroke="var(--border)" />
          <text x="30" y="16" textAnchor="middle" fontSize="11" fill="var(--text-dim)">server</text>
        </g>
        {lane.events.map((e, i) => (
          <circle key={i} ref={(el) => (dotRefs.current[`${lane.id}-${i}`] = el)} cx={CX} cy={CLIENT_Y} r="5" fill={e.color} opacity="0" />
        ))}
      </svg>
    </div>
  )
}

export default function WebSocketVsPollingVsSse() {
  const [running, setRunning] = useState(false)
  const dotRefs = useRef({})

  const run = () => {
    if (running) return
    setRunning(true)
    const tl = gsap.timeline({ onComplete: () => setRunning(false) })

    LANES.forEach((lane) => {
      lane.events.forEach((e, i) => {
        const el = dotRefs.current[`${lane.id}-${i}`]
        const fromY = e.from === 'client' ? CLIENT_Y : SERVER_Y
        const toY = e.from === 'client' ? SERVER_Y : CLIENT_Y
        tl.set(el, { attr: { cy: fromY }, opacity: 1 }, e.t)
        tl.to(el, { attr: { cy: toY }, duration: 0.55, ease: 'power1.inOut' }, e.t)
        tl.to(el, { opacity: 0, duration: 0.15 }, e.t + 0.55)
      })
    })
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={run} disabled={running}>Run simulation</button>
        <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
          same ~6 second window for all three
        </span>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
        {LANES.map((lane) => (
          <Lane key={lane.id} lane={lane} dotRefs={dotRefs} />
        ))}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        Polling opens a new round trip on a fixed schedule whether or not anything changed (mostly gray "nothing new" replies). SSE keeps one connection open and the server only pushes when there's actually new data — one-way only. WebSocket keeps one connection open in both directions, so either side can send at any time.
      </p>
    </div>
  )
}
