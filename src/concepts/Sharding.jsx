import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import Packet from './Packet.jsx'
import { hashString } from '../lib/hash.js'

const SHARD_COUNT = 5
const RADIUS = 3.2

function hashKey(key) {
  return hashString(key) % SHARD_COUNT
}

function shardPosition(i) {
  const angle = (i / SHARD_COUNT) * Math.PI * 2
  return new THREE.Vector3(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS)
}

function ShardNode({ index, count }) {
  const pos = shardPosition(index)
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#191d27" />
      </mesh>
      <Text position={[0, 0.85, 0]} fontSize={0.24} color="#8a90a2">
        {`shard ${index}`}
      </Text>
      <Text position={[0, -0.85, 0]} fontSize={0.22} color="#6ee7ff">
        {`${count} keys`}
      </Text>
    </group>
  )
}

function Scene({ counts, packets, onArrive }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={60} />
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.4} />
      </mesh>
      {counts.map((count, i) => (
        <ShardNode key={i} index={i} count={count} />
      ))}
      {packets.map((p) => (
        <Packet key={p.id} from={p.from} to={p.to} onArrive={() => onArrive(p)} />
      ))}
      <OrbitControls enablePan={false} minDistance={4} maxDistance={12} />
    </>
  )
}

export default function Sharding() {
  const [counts, setCounts] = useState(() => Array(SHARD_COUNT).fill(0))
  const [packets, setPackets] = useState([])
  const [key, setKey] = useState('')
  const [lastRoute, setLastRoute] = useState(null)
  const nextId = useRef(0)

  const insert = useCallback((k) => {
    if (!k) return
    const idx = hashKey(k)
    const id = nextId.current++
    setLastRoute({ key: k, idx })
    setPackets((p) => [...p, { id, from: new THREE.Vector3(0, 0, 0), to: shardPosition(idx), idx }])
  }, [])

  const onArrive = useCallback((packet) => {
    setCounts((c) => {
      const next = [...c]
      next[packet.idx] += 1
      return next
    })
    setPackets((p) => p.filter((x) => x.id !== packet.id))
  }, [])

  const insertRandom = () => insert('key-' + Math.random().toString(36).slice(2, 7))

  const submit = () => {
    insert(key)
    setKey('')
  }

  return (
    <div className="panel">
      <div className="controls">
        <input
          className="mono"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }}
          placeholder="key name…"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="btn primary" onClick={submit}>Insert key</button>
        <button className="btn" onClick={insertRandom}>Insert random</button>
        {lastRoute && (
          <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            hash("{lastRoute.key}") → shard {lastRoute.idx}
          </span>
        )}
      </div>
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Canvas camera={{ position: [0, 3.2, 11.5], fov: 45 }}>
          <Scene counts={counts} packets={packets} onArrive={onArrive} />
        </Canvas>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        shard = hash(key) % {SHARD_COUNT}. Drag to orbit.
      </p>
    </div>
  )
}
