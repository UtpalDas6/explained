import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { animate } from 'animejs'
import { playClick, playSuccess, playError, playPop } from '../lib/sound.js'

const CLIENT_X = 60
const CACHE_X = 340
const DB_X = 620
const BOX_H = 90

export default function Caching() {
  const dotRef = useRef(null)
  const cacheBoxRef = useRef(null)
  const dbBoxRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [running, setRunning] = useState(false)
  const cachedRef = useRef(false)

  const run = () => {
    if (running) return
    playClick()
    setRunning(true)
    const hit = cachedRef.current
    setStatus('checking cache…')
    gsap.set(dotRef.current, { attr: { cx: CLIENT_X, fill: '#6ee7ff' } })

    const tl = gsap.timeline({
      onComplete: () => {
        setRunning(false)
        cachedRef.current = true
      },
    })

    tl.to(dotRef.current, { attr: { cx: CACHE_X }, duration: 0.6, ease: 'power2.inOut' })

    if (hit) {
      tl.call(() => {
        setStatus('cache hit')
        playSuccess()
        setHits((h) => h + 1)
        animate(cacheBoxRef.current, {
          scale: [1, 1.08, 1],
          duration: 500,
          ease: 'outElastic(1, .6)',
        })
      })
      tl.to(dotRef.current, { attr: { fill: '#4ade80' }, duration: 0.15 })
      tl.to(dotRef.current, { attr: { cx: CLIENT_X }, duration: 0.6, ease: 'power2.inOut', delay: 0.2 })
      tl.call(() => setStatus('idle'))
    } else {
      tl.call(() => {
        setStatus('cache miss')
        playError()
        setMisses((m) => m + 1)
        animate(cacheBoxRef.current, {
          translateX: [0, -6, 6, -4, 4, 0],
          duration: 400,
        })
      })
      tl.to(dotRef.current, { attr: { fill: '#f87171' }, duration: 0.15 })
      tl.to(dotRef.current, { attr: { cx: DB_X }, duration: 0.6, ease: 'power2.inOut', delay: 0.15 })
      tl.call(() => {
        setStatus('reading from database…')
        playPop()
        animate(dbBoxRef.current, { scale: [1, 1.06, 1], duration: 400 })
      })
      tl.to(dotRef.current, { attr: { fill: '#6ee7ff' }, duration: 0.15, delay: 0.2 })
      tl.call(() => setStatus('populating cache…'))
      tl.to(dotRef.current, { attr: { cx: CACHE_X }, duration: 0.6, ease: 'power2.inOut' })
      tl.call(() => {
        animate(cacheBoxRef.current, {
          boxShadow: [
            '0 0 0 0 rgba(110,231,255,0.6)',
            '0 0 0 12px rgba(110,231,255,0)',
          ],
          duration: 600,
        })
      })
      tl.to(dotRef.current, { attr: { cx: CLIENT_X }, duration: 0.6, ease: 'power2.inOut', delay: 0.3 })
      tl.call(() => setStatus('idle'))
    }
  }

  const reset = () => {
    playClick()
    cachedRef.current = false
    setHits(0)
    setMisses(0)
    setStatus('idle')
    gsap.set(dotRef.current, { attr: { cx: CLIENT_X, fill: '#6ee7ff' } })
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={run} disabled={running}>
          Simulate request
        </button>
        <button className="btn" onClick={reset} disabled={running}>
          Evict cache
        </button>
        <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
          {status}
        </span>
      </div>

      <svg width="100%" height="200" viewBox="0 0 680 200">
        <line x1={CLIENT_X + 20} y1={100} x2={CACHE_X - 20} y2={100} stroke="var(--border)" strokeWidth="2" />
        <line x1={CACHE_X + 20} y1={100} x2={DB_X - 20} y2={100} stroke="var(--border)" strokeWidth="2" />

        <g transform={`translate(${CLIENT_X - 20}, ${100 - BOX_H / 2})`}>
          <rect width="40" height={BOX_H} rx="10" fill="var(--panel-2)" stroke="var(--border)" />
          <text x="20" y={BOX_H + 20} textAnchor="middle" fill="var(--text-dim)" fontSize="12">Client</text>
        </g>

        <g transform={`translate(${CACHE_X - 20}, ${100 - BOX_H / 2})`}>
          <g ref={cacheBoxRef}>
            <rect width="40" height={BOX_H} rx="10" fill="var(--panel-2)" stroke="var(--accent)" />
          </g>
          <text x="20" y={BOX_H + 20} textAnchor="middle" fill="var(--text-dim)" fontSize="12">Cache</text>
        </g>

        <g transform={`translate(${DB_X - 20}, ${100 - BOX_H / 2})`}>
          <g ref={dbBoxRef}>
            <rect width="40" height={BOX_H} rx="10" fill="var(--panel-2)" stroke="var(--border)" />
          </g>
          <text x="20" y={BOX_H + 20} textAnchor="middle" fill="var(--text-dim)" fontSize="12">Database</text>
        </g>

        <circle ref={dotRef} cx={CLIENT_X} cy="100" r="8" fill="#6ee7ff" />
      </svg>

      <div className="stat-row">
        <div><b>{hits}</b>hits</div>
        <div><b>{misses}</b>misses</div>
        <div><b>{cachedRef.current ? 'warm' : 'cold'}</b>cache state</div>
      </div>
    </div>
  )
}
