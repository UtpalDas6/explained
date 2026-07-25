import { useRef, useState } from 'react'
import { gsap } from 'gsap'

function ProxyDiagram({ title, boxLabel, leftLabels, rightLabels, hiddenNote }) {
  const dotRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('idle')

  const leftY = (i, n) => 30 + (i * 120) / Math.max(1, n - 1 || 1)
  const rightY = (i, n) => 30 + (i * 120) / Math.max(1, n - 1 || 1)

  const send = () => {
    if (running) return
    setRunning(true)
    const li = Math.floor(Math.random() * leftLabels.length)
    const ri = Math.floor(Math.random() * rightLabels.length)
    const ly = leftLabels.length > 1 ? leftY(li, leftLabels.length) : 90
    const ry = rightLabels.length > 1 ? rightY(ri, rightLabels.length) : 90
    setStatus(`${leftLabels[li]} → ${boxLabel} → ${rightLabels[ri]}`)

    gsap.set(dotRef.current, { attr: { cx: 45, cy: ly, fill: '#6ee7ff' } })
    const tl = gsap.timeline({ onComplete: () => setRunning(false) })
    tl.to(dotRef.current, { attr: { cx: 155, cy: 90 }, duration: 0.5, ease: 'power1.inOut' })
    tl.to(dotRef.current, { attr: { cx: 265, cy: ry }, duration: 0.5, ease: 'power1.inOut' })
  }

  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <svg width="100%" height="200" viewBox="0 0 300 180">
        {leftLabels.map((l, i) => (
          <g key={l} transform={`translate(10, ${leftY(i, leftLabels.length) - 15})`}>
            <rect width="70" height="30" rx="6" fill="var(--panel-2)" stroke="var(--border)" />
            <text x="35" y="19" textAnchor="middle" fontSize="11" fill="var(--text-dim)">{l}</text>
          </g>
        ))}
        <g transform="translate(120, 60)">
          <rect width="80" height="60" rx="10" fill="var(--panel-2)" stroke="var(--accent)" strokeWidth="2" />
          <text x="40" y="35" textAnchor="middle" fontSize="12" fill="var(--accent)">{boxLabel}</text>
        </g>
        {rightLabels.map((l, i) => (
          <g key={l} transform={`translate(220, ${rightY(i, rightLabels.length) - 15})`}>
            <rect width="70" height="30" rx="6" fill="var(--panel-2)" stroke="var(--border)" />
            <text x="35" y="19" textAnchor="middle" fontSize="11" fill="var(--text-dim)">{l}</text>
          </g>
        ))}
        <circle ref={dotRef} r="6" fill="#6ee7ff" opacity="0.95" />
      </svg>
      <div className="controls" style={{ marginTop: 4 }}>
        <button className="btn primary" onClick={send} disabled={running}>Send request</button>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 6, minHeight: 32 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>{hiddenNote}</p>
    </div>
  )
}

export default function ProxyVsReverseProxy() {
  return (
    <div className="panel">
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <ProxyDiagram
          title="Forward Proxy"
          boxLabel="proxy"
          leftLabels={['client A', 'client B', 'client C']}
          rightLabels={['site X', 'site Y', 'site Z']}
          hiddenNote="Sits in front of clients. The destination site sees the proxy's identity, not the real client's — used for anonymity, filtering, or bypassing restrictions."
        />
        <ProxyDiagram
          title="Reverse Proxy"
          boxLabel="reverse proxy"
          leftLabels={['clients (internet)']}
          rightLabels={['server 1', 'server 2', 'server 3']}
          hiddenNote="Sits in front of servers. The client only ever talks to the reverse proxy — it never knows which internal server actually handled the request. Also does TLS termination, caching, load balancing."
        />
      </div>
    </div>
  )
}
