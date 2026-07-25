import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const TTL_MS = 8000
const DOMAIN = 'example.com'

const POS = {
  browser: { x: 50, y: 150 },
  resolver: { x: 300, y: 150 },
  root: { x: 560, y: 50 },
  tld: { x: 560, y: 150 },
  auth: { x: 560, y: 250 },
}

export default function DnsResolution() {
  const [cacheEntry, setCacheEntry] = useState(null)
  const [status, setStatus] = useState('idle')
  const [running, setRunning] = useState(false)
  const [, forceTick] = useState(0)
  const dotRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const moveTo = (tl, key, duration = 0.4) => {
    tl.to(dotRef.current, { attr: { cx: POS[key].x, cy: POS[key].y }, duration, ease: 'power1.inOut' })
  }

  const lookup = () => {
    if (running) return
    setRunning(true)
    gsap.set(dotRef.current, { attr: { cx: POS.browser.x, cy: POS.browser.y }, opacity: 1, fill: '#6ee7ff' })

    const now = Date.now()
    if (cacheEntry && cacheEntry.domain === DOMAIN && now < cacheEntry.expiresAt) {
      setStatus(`Resolver cache HIT — ${DOMAIN} → ${cacheEntry.ip} (TTL ${Math.ceil((cacheEntry.expiresAt - now) / 1000)}s left). No round trip to root/TLD/authoritative needed.`)
      const tl = gsap.timeline({ onComplete: () => setRunning(false) })
      moveTo(tl, 'resolver', 0.35)
      moveTo(tl, 'browser', 0.35)
      return
    }

    const ip = `93.184.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
    const tl = gsap.timeline({
      onComplete: () => {
        setCacheEntry({ domain: DOMAIN, ip, expiresAt: Date.now() + TTL_MS })
        setStatus(`Resolved ${DOMAIN} → ${ip} via full recursive lookup. Resolver caches it for ${TTL_MS / 1000}s.`)
        setRunning(false)
      },
    })
    tl.call(() => setStatus(`Browser asks the resolver for ${DOMAIN}…`))
    moveTo(tl, 'resolver')
    tl.call(() => setStatus('Resolver asks a root server…'))
    moveTo(tl, 'root')
    tl.call(() => setStatus('Root server: "ask the .com TLD server"'))
    moveTo(tl, 'resolver')
    tl.call(() => setStatus('Resolver asks the TLD server…'))
    moveTo(tl, 'tld')
    tl.call(() => setStatus(`TLD server: "ask ${DOMAIN}'s authoritative server"`))
    moveTo(tl, 'resolver')
    tl.call(() => setStatus('Resolver asks the authoritative server…'))
    moveTo(tl, 'auth')
    tl.call(() => setStatus(`Authoritative server: "${DOMAIN} is at ${ip}"`))
    moveTo(tl, 'resolver')
    moveTo(tl, 'browser')
  }

  const ttlLeft = cacheEntry ? Math.max(0, Math.ceil((cacheEntry.expiresAt - Date.now()) / 1000)) : 0

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={lookup} disabled={running}>
          Look up {DOMAIN}
        </button>
        {cacheEntry && ttlLeft > 0 && (
          <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            cached: {cacheEntry.ip} (TTL {ttlLeft}s)
          </span>
        )}
      </div>

      <svg width="100%" height="300" viewBox="0 0 650 300">
        <line x1={POS.browser.x + 25} y1={POS.browser.y} x2={POS.resolver.x - 25} y2={POS.resolver.y} stroke="var(--border)" strokeWidth="2" />
        <line x1={POS.resolver.x + 25} y1={POS.resolver.y} x2={POS.root.x - 20} y2={POS.root.y + 8} stroke="var(--border)" strokeWidth="1.5" opacity="0.5" />
        <line x1={POS.resolver.x + 25} y1={POS.resolver.y} x2={POS.tld.x - 25} y2={POS.tld.y} stroke="var(--border)" strokeWidth="1.5" opacity="0.5" />
        <line x1={POS.resolver.x + 25} y1={POS.resolver.y} x2={POS.auth.x - 20} y2={POS.auth.y - 8} stroke="var(--border)" strokeWidth="1.5" opacity="0.5" />

        {Object.entries({ browser: 'browser', resolver: 'resolver (cache)', root: 'root', tld: '.com TLD', auth: 'authoritative' }).map(([key, label]) => (
          <g key={key} transform={`translate(${POS[key].x - 22}, ${POS[key].y - 18})`}>
            <rect width="44" height="36" rx="8" fill="var(--panel-2)" stroke="var(--border)" />
            <text x="22" y="52" textAnchor="middle" fontSize="11" fill="var(--text-dim)">{label}</text>
          </g>
        ))}

        <circle ref={dotRef} r="6" fill="#6ee7ff" opacity="0" />
      </svg>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        The resolver — not the browser — does every round trip: root points to the TLD server, the TLD server points to the authoritative server, which finally answers with an IP. The resolver caches that answer until its TTL expires.
      </p>
    </div>
  )
}
