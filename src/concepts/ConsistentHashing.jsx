import { useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { hashString } from '../lib/hash.js'
import { playClick, playSuccess } from '../lib/sound.js'

const CX = 250
const CY = 210
const R = 160
const COLORS = ['#6ee7ff', '#a78bfa', '#4ade80', '#fbbf24', '#f472b6', '#60a5fa']

function hash360(str) {
  return hashString(str) % 360
}

function toXY(angle) {
  const rad = (angle * Math.PI) / 180
  return { x: CX + R * Math.sin(rad), y: CY - R * Math.cos(rad) }
}

// index of the node whose angle is the smallest clockwise step from `angle` (the successor)
function ownerIndex(angle, nodes) {
  if (nodes.length === 0) return -1
  let best = 0
  let bestDiff = Infinity
  nodes.forEach((n, i) => {
    let diff = n.angle - angle
    if (diff < 0) diff += 360
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  })
  return best
}

export default function ConsistentHashing() {
  const [nodes, setNodes] = useState(() =>
    ['node-a', 'node-b', 'node-c'].map((name, i) => ({
      id: name,
      name,
      angle: hash360(name),
      color: COLORS[i % COLORS.length],
    }))
  )
  const [keys, setKeys] = useState([])
  const [status, setStatus] = useState('idle')
  const [running, setRunning] = useState(false)
  const [keyName, setKeyName] = useState('')
  const sweepRef = useRef(null)
  const nextNodeId = useRef(3)
  const nextKeyId = useRef(0)
  const colorCursor = useRef(3)

  const recomputeOwners = useCallback((nodeList, keyList) => {
    let changed = 0
    const next = keyList.map((k) => {
      const idx = ownerIndex(k.angle, nodeList)
      const owner = nodeList[idx]
      if (!owner || owner.id !== k.ownerId) changed++
      return owner ? { ...k, ownerId: owner.id, color: owner.color } : k
    })
    return { next, changed }
  }, [])

  const addNode = () => {
    playClick()
    const name = `node-${String.fromCharCode(97 + (nextNodeId.current++ % 26))}${nextNodeId.current > 26 ? nextNodeId.current : ''}`
    const color = COLORS[colorCursor.current++ % COLORS.length]
    const newNode = { id: name, name, angle: hash360(name), color }
    const nextNodes = [...nodes, newNode]
    setNodes(nextNodes)
    const { next, changed } = recomputeOwners(nextNodes, keys)
    setKeys(next)
    setStatus(`added ${name} — ${changed} key${changed === 1 ? '' : 's'} remapped`)
  }

  const removeNode = (id) => {
    if (nodes.length <= 1) return
    playClick()
    const nextNodes = nodes.filter((n) => n.id !== id)
    setNodes(nextNodes)
    const { next, changed } = recomputeOwners(nextNodes, keys)
    setKeys(next)
    setStatus(`removed ${id} — ${changed} key${changed === 1 ? '' : 's'} remapped`)
  }

  const insertKey = (name) => {
    if (!name || running || nodes.length === 0) return
    playClick()
    setRunning(true)
    const angle = hash360(name)
    const idx = ownerIndex(angle, nodes)
    const owner = nodes[idx]
    let target = owner.angle
    if (target < angle) target += 360
    const dist = target - angle
    const duration = Math.min(1.4, Math.max(0.35, (dist / 360) * 1.4))

    const start = toXY(angle)
    gsap.set(sweepRef.current, { attr: { cx: start.x, cy: start.y }, opacity: 1 })

    const proxy = { a: angle }
    gsap.to(proxy, {
      a: target,
      duration,
      ease: 'power1.inOut',
      onUpdate: () => {
        const p = toXY(proxy.a % 360)
        gsap.set(sweepRef.current, { attr: { cx: p.x, cy: p.y } })
      },
      onComplete: () => {
        gsap.set(sweepRef.current, { opacity: 0 })
        playSuccess()
        setKeys((k) => [
          ...k,
          { id: nextKeyId.current++, name, angle, ownerId: owner.id, color: owner.color },
        ])
        setStatus(`"${name}" → ${owner.name}`)
        setRunning(false)
      },
    })
  }

  const submit = () => {
    insertKey(keyName)
    setKeyName('')
  }
  const insertRandom = () => insertKey('key-' + Math.random().toString(36).slice(2, 7))

  const reset = () => {
    setKeys([])
    setStatus('idle')
  }

  return (
    <div className="panel">
      <div className="controls">
        <input
          className="mono"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }}
          placeholder="key name…"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="btn primary" onClick={submit} disabled={running}>Insert key</button>
        <button className="btn" onClick={insertRandom} disabled={running}>Insert random</button>
        <button className="btn" onClick={addNode} disabled={running}>Add node</button>
        <button className="btn" onClick={reset} disabled={running}>Clear keys</button>
      </div>

      <svg width="100%" height="420" viewBox="0 0 500 420">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth="2" />

        {keys.map((k) => {
          const p = toXY(k.angle)
          return <circle key={k.id} cx={p.x} cy={p.y} r="4" fill={k.color} style={{ transition: 'fill 0.3s' }} />
        })}

        {nodes.map((n) => {
          const p = toXY(n.angle)
          const labelOut = 22
          const rad = (n.angle * Math.PI) / 180
          const lx = CX + (R + labelOut) * Math.sin(rad)
          const ly = CY - (R + labelOut) * Math.cos(rad)
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r="9" fill={n.color} stroke="#0b0d12" strokeWidth="2" />
              <text x={lx} y={ly} textAnchor="middle" fontSize="12" fill={n.color}>{n.name}</text>
            </g>
          )
        })}

        <circle ref={sweepRef} r="6" fill="#fff" opacity="0" />
      </svg>

      <div className="controls" style={{ marginTop: 4 }}>
        {nodes.map((n) => (
          <button
            key={n.id}
            className="btn"
            style={{ borderColor: n.color, color: n.color }}
            onClick={() => removeNode(n.id)}
            disabled={running || nodes.length <= 1}
          >
            remove {n.name} ({keys.filter((k) => k.ownerId === n.id).length})
          </button>
        ))}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 8 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
        Each key walks clockwise to the first node it meets. Adding/removing a node only remaps the keys between it and its neighbor — not the whole ring.
      </p>
    </div>
  )
}
