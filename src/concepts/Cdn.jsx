import { useState, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import Packet from './Packet.jsx'
import { playSuccess, playError } from '../lib/sound.js'

const ORIGIN_POS = new THREE.Vector3(0, 1.6, -7)
const EDGES = [
  { id: 0, name: 'edge (US)', pos: new THREE.Vector3(-3.6, 0, 2.4) },
  { id: 1, name: 'edge (EU)', pos: new THREE.Vector3(0, 0, 3.2) },
  { id: 2, name: 'edge (Asia)', pos: new THREE.Vector3(3.6, 0, 2.4) },
]

function Pulse({ position, color, active }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const s = active ? 1 + Math.sin(clock.elapsedTime * 6) * 0.08 : 1
    ref.current.scale.setScalar(s)
  })
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1.1, 0.9, 1]} />
      <meshStandardMaterial color="#191d27" emissive={color} emissiveIntensity={active ? 0.5 : 0} />
    </mesh>
  )
}

function Scene({ edgeStates, packets, onArrive }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 6, 5]} intensity={70} />
      <group position={ORIGIN_POS}>
        <mesh>
          <boxGeometry args={[1.3, 1, 1.2]} />
          <meshStandardMaterial color="#191d27" />
        </mesh>
        <Text position={[0, 0.85, 0]} fontSize={0.24} color="#a78bfa">origin server</Text>
      </group>
      {EDGES.map((e) => {
        const st = edgeStates[e.id]
        return (
          <group key={e.id} position={e.pos}>
            <Pulse position={[0, 0, 0]} color={st.cached ? '#4ade80' : '#6ee7ff'} active={st.active} />
            <Text position={[0, 0.75, 0]} fontSize={0.2} color="#6ee7ff">{e.name}</Text>
            <Text position={[0, -0.75, 0]} fontSize={0.2} color={st.cached ? '#4ade80' : '#8a90a2'}>
              {st.cached ? 'cached' : 'empty'}
            </Text>
          </group>
        )
      })}
      {packets.map((p) => (
        <Packet key={p.id} from={p.from} to={p.to} color={p.color} duration={p.duration} onArrive={() => onArrive(p)} />
      ))}
      <OrbitControls enablePan={false} minDistance={5} maxDistance={18} />
    </>
  )
}

export default function Cdn() {
  const [edgeStates, setEdgeStates] = useState(() =>
    EDGES.map(() => ({ cached: false, active: false }))
  )
  const [packets, setPackets] = useState([])
  const [status, setStatus] = useState('idle')
  const nextId = useRef(0)
  const edgeStatesRef = useRef(edgeStates)
  edgeStatesRef.current = edgeStates

  const setActive = (id, active) =>
    setEdgeStates((s) => s.map((st, i) => (i === id ? { ...st, active } : st)))

  const request = useCallback((edgeId) => {
    const edge = EDGES[edgeId]
    if (edgeStatesRef.current[edgeId].cached) {
      setStatus(`${edge.name}: HIT — served locally, origin not contacted`)
      playSuccess()
      setActive(edgeId, true)
      setTimeout(() => setActive(edgeId, false), 500)
      return
    }
    setStatus(`${edge.name}: MISS — fetching from origin…`)
    playError()
    const id = nextId.current++
    setPackets((p) => [
      ...p,
      { id, from: edge.pos, to: ORIGIN_POS, color: '#f472b6', duration: 900, phase: 'toOrigin', edgeId },
    ])
  }, [])

  const onArrive = useCallback((packet) => {
    setPackets((p) => p.filter((x) => x.id !== packet.id))
    if (packet.phase === 'toOrigin') {
      const id = nextId.current++
      setPackets((p) => [
        ...p,
        { id, from: ORIGIN_POS, to: EDGES[packet.edgeId].pos, color: '#6ee7ff', duration: 900, phase: 'toEdge', edgeId: packet.edgeId },
      ])
    } else {
      const edge = EDGES[packet.edgeId]
      setEdgeStates((s) => s.map((st, i) => (i === packet.edgeId ? { ...st, cached: true } : st)))
      setStatus(`${edge.name}: cached now — future requests will be a HIT`)
    }
  }, [])

  return (
    <div className="panel">
      <div className="controls">
        {EDGES.map((e) => (
          <button key={e.id} className="btn primary" onClick={() => request(e.id)}>
            Request via {e.name}
          </button>
        ))}
      </div>
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Canvas camera={{ position: [0, 3.6, 13.5], fov: 45 }}>
          <Scene edgeStates={edgeStates} packets={packets} onArrive={onArrive} />
        </Canvas>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>
        First request per edge is a slow round trip to origin; every request after that is served from the edge, close to the user.
      </p>
    </div>
  )
}
