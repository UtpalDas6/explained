import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import Packet from './Packet.jsx'

const SLOTS = 8
const PRODUCER_POS = new THREE.Vector3(-5.5, 0, 0)
const CONSUMER_POS = new THREE.Vector3(5.5, 0, 0)

function slotPosition(i) {
  return new THREE.Vector3(-2.8 + i * (5.6 / (SLOTS - 1)), 0, 0)
}

export default function MessageQueue() {
  const [depth, setDepth] = useState(0)
  const [produced, setProduced] = useState(0)
  const [consumed, setConsumed] = useState(0)
  const [packets, setPackets] = useState([])
  const nextId = useRef(0)
  const depthRef = useRef(0)
  depthRef.current = depth

  const produce = useCallback(() => {
    const targetIdx = Math.min(depthRef.current, SLOTS - 1)
    const id = nextId.current++
    setProduced((n) => n + 1)
    setPackets((p) => [
      ...p,
      { id, from: PRODUCER_POS, to: slotPosition(targetIdx), color: '#6ee7ff', phase: 'enqueue' },
    ])
  }, [])

  const consume = useCallback(() => {
    if (depthRef.current === 0) return
    const id = nextId.current++
    setPackets((p) => [
      ...p,
      { id, from: slotPosition(0), to: CONSUMER_POS, color: '#4ade80', phase: 'dequeue' },
    ])
    setDepth((d) => Math.max(0, d - 1))
    setConsumed((n) => n + 1)
  }, [])

  const onArrive = useCallback((packet) => {
    setPackets((p) => p.filter((x) => x.id !== packet.id))
    if (packet.phase === 'enqueue') setDepth((d) => d + 1)
  }, [])

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={produce}>Produce message</button>
        <button className="btn" onClick={consume} disabled={depth === 0}>Consume message</button>
      </div>
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Canvas camera={{ position: [0, 3.2, 11], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={60} />

          <group position={PRODUCER_POS}>
            <mesh>
              <boxGeometry args={[1, 0.9, 1]} />
              <meshStandardMaterial color="#191d27" />
            </mesh>
            <Text position={[0, 0.75, 0]} fontSize={0.22} color="#a78bfa">producer</Text>
          </group>

          <group position={CONSUMER_POS}>
            <mesh>
              <boxGeometry args={[1, 0.9, 1]} />
              <meshStandardMaterial color="#191d27" />
            </mesh>
            <Text position={[0, 0.75, 0]} fontSize={0.22} color="#f472b6">consumer</Text>
          </group>

          <Text position={[0, -0.9, 0]} fontSize={0.2} color="#8a90a2">
            {depth > SLOTS ? `queue (+${depth - SLOTS} more)` : 'queue'}
          </Text>
          {Array.from({ length: Math.min(depth, SLOTS) }).map((_, i) => (
            <mesh key={i} position={slotPosition(i)}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#191d27" emissive="#6ee7ff" emissiveIntensity={0.35} />
            </mesh>
          ))}

          {packets.map((p) => (
            <Packet key={p.id} from={p.from} to={p.to} color={p.color} duration={700} arcHeight={0.8} onArrive={() => onArrive(p)} />
          ))}
          <OrbitControls enablePan={false} minDistance={5} maxDistance={16} />
        </Canvas>
      </div>
      <div className="stat-row">
        <div><b>{produced}</b>produced</div>
        <div><b>{consumed}</b>consumed</div>
        <div><b>{depth}</b>queue depth</div>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        First in, first out: the consumer always takes the oldest message first. A growing gap between produce and consume rate is a backlog.
      </p>
    </div>
  )
}
