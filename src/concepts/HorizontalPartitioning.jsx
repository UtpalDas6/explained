import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import Packet from './Packet.jsx'
import { playClick } from '../lib/sound.js'

const RANGES = [
  { label: '0–999', min: 0, max: 999 },
  { label: '1000–1999', min: 1000, max: 1999 },
  { label: '2000–2999', min: 2000, max: 2999 },
]
const SOURCE_POS = new THREE.Vector3(0, 0, -3.6)

function partitionPosition(i) {
  return new THREE.Vector3((i - (RANGES.length - 1) / 2) * 3.4, 0, 3.2)
}

function partitionIndex(id) {
  return Math.min(RANGES.length - 1, Math.floor(id / 1000))
}

function PartitionNode({ index, count }) {
  const pos = partitionPosition(index)
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[1.6, 0.9, 1]} />
        <meshStandardMaterial color="#191d27" />
      </mesh>
      <Text position={[0, 0.75, 0]} fontSize={0.24} color="#6ee7ff">{`partition ${index}`}</Text>
      <Text position={[0, 0.42, 0]} fontSize={0.18} color="#8a90a2">{`id ${RANGES[index].label}`}</Text>
      <Text position={[0, -0.75, 0]} fontSize={0.22} color="#4ade80">{`${count} rows`}</Text>
    </group>
  )
}

function Scene({ counts, packets, onArrive }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={60} />
      <group position={SOURCE_POS}>
        <mesh>
          <boxGeometry args={[1.4, 0.9, 1]} />
          <meshStandardMaterial color="#191d27" />
        </mesh>
        <Text position={[0, 0.75, 0]} fontSize={0.22} color="#a78bfa">users table</Text>
      </group>
      {RANGES.map((_, i) => (
        <PartitionNode key={i} index={i} count={counts[i]} />
      ))}
      {packets.map((p) => (
        <Packet key={p.id} from={p.from} to={p.to} onArrive={() => onArrive(p)} />
      ))}
      <OrbitControls enablePan={false} minDistance={4} maxDistance={14} />
    </>
  )
}

export default function HorizontalPartitioning() {
  const [counts, setCounts] = useState(() => Array(RANGES.length).fill(0))
  const [packets, setPackets] = useState([])
  const [idInput, setIdInput] = useState('')
  const [lastRoute, setLastRoute] = useState(null)
  const nextId = useRef(0)

  const insert = useCallback((id) => {
    if (id == null || Number.isNaN(id) || id < 0) return
    playClick()
    const idx = partitionIndex(id)
    const pid = nextId.current++
    setLastRoute({ id, idx })
    setPackets((p) => [...p, { id: pid, from: SOURCE_POS, to: partitionPosition(idx), idx }])
  }, [])

  const onArrive = useCallback((packet) => {
    setCounts((c) => {
      const next = [...c]
      next[packet.idx] += 1
      return next
    })
    setPackets((p) => p.filter((x) => x.id !== packet.id))
  }, [])

  const insertRandom = () => insert(Math.floor(Math.random() * 3000))
  const submit = () => {
    insert(Number(idInput))
    setIdInput('')
  }

  return (
    <div className="panel">
      <div className="controls">
        <input
          className="mono"
          type="number"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', width: 140 }}
          placeholder="row id…"
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="btn primary" onClick={submit}>Insert row</button>
        <button className="btn" onClick={insertRandom}>Insert random</button>
        {lastRoute && (
          <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            id {lastRoute.id} falls in {RANGES[lastRoute.idx].label} → partition {lastRoute.idx}
          </span>
        )}
      </div>
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Canvas camera={{ position: [0, 3.4, 12.5], fov: 45 }}>
          <Scene counts={counts} packets={packets} onArrive={onArrive} />
        </Canvas>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        Same table schema, split by a row-id range into ordered, contiguous partitions — unlike hash sharding, neighboring ids land next to each other.
      </p>
    </div>
  )
}
