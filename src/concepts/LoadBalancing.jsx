import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import Packet from './Packet.jsx'

const SERVER_COUNT = 4
const CLIENT_POS = new THREE.Vector3(0, 0, -5)
const LB_POS = new THREE.Vector3(0, 0, -1.8)
const ALGORITHMS = ['round-robin', 'random', 'least-connections']

function serverPosition(i) {
  return new THREE.Vector3((i - (SERVER_COUNT - 1) / 2) * 2.6, 0, 2.6)
}

function pickServer(algo, loads, rrCursor) {
  if (algo === 'random') return Math.floor(Math.random() * SERVER_COUNT)
  if (algo === 'least-connections') {
    let best = 0
    for (let i = 1; i < SERVER_COUNT; i++) if (loads[i] < loads[best]) best = i
    return best
  }
  const idx = rrCursor.current % SERVER_COUNT
  rrCursor.current += 1
  return idx
}

function ServerNode({ index, load }) {
  const pos = serverPosition(index)
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[1.1, 0.9, 1]} />
        <meshStandardMaterial color="#191d27" />
      </mesh>
      <Text position={[0, 0.75, 0]} fontSize={0.22} color="#6ee7ff">{`server ${index}`}</Text>
      <Text position={[0, -0.75, 0]} fontSize={0.22} color={load > 0 ? '#fbbf24' : '#4ade80'}>
        {`load ${load}`}
      </Text>
    </group>
  )
}

function Scene({ loads, packets, onArrive }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={60} />
      <group position={CLIENT_POS}>
        <mesh>
          <boxGeometry args={[1, 0.9, 1]} />
          <meshStandardMaterial color="#191d27" />
        </mesh>
        <Text position={[0, 0.75, 0]} fontSize={0.22} color="#a78bfa">client</Text>
      </group>
      <group position={LB_POS}>
        <mesh>
          <boxGeometry args={[1, 0.9, 1]} />
          <meshStandardMaterial color="#191d27" />
        </mesh>
        <Text position={[0, 0.75, 0]} fontSize={0.22} color="#f472b6">load balancer</Text>
      </group>
      {loads.map((load, i) => (
        <ServerNode key={i} index={i} load={load} />
      ))}
      {packets.map((p) => (
        <Packet key={p.id} from={p.from} to={p.to} color={p.color} duration={p.duration} onArrive={() => onArrive(p)} />
      ))}
      <OrbitControls enablePan={false} minDistance={4} maxDistance={16} />
    </>
  )
}

export default function LoadBalancing() {
  const [algo, setAlgo] = useState('round-robin')
  const [loads, setLoads] = useState(() => Array(SERVER_COUNT).fill(0))
  const [packets, setPackets] = useState([])
  const [lastPick, setLastPick] = useState(null)
  const nextId = useRef(0)
  const rrCursor = useRef(0)
  const loadsRef = useRef(loads)
  loadsRef.current = loads

  const sendRequest = useCallback(() => {
    const id = nextId.current++
    setPackets((p) => [...p, { id, from: CLIENT_POS, to: LB_POS, color: '#6ee7ff', duration: 500, phase: 'toLB' }])
  }, [])

  const onArrive = useCallback(
    (packet) => {
      setPackets((p) => p.filter((x) => x.id !== packet.id))
      if (packet.phase === 'toLB') {
        const idx = pickServer(algo, loadsRef.current, rrCursor)
        setLastPick(idx)
        const id = nextId.current++
        setPackets((p) => [
          ...p,
          { id, from: LB_POS, to: serverPosition(idx), color: '#f472b6', duration: 700, phase: 'toServer', idx },
        ])
      } else {
        const idx = packet.idx
        setLoads((l) => {
          const next = [...l]
          next[idx] += 1
          return next
        })
        const holdMs = 1200 + Math.random() * 1500
        setTimeout(() => {
          setLoads((l) => {
            const next = [...l]
            next[idx] = Math.max(0, next[idx] - 1)
            return next
          })
        }, holdMs)
      }
    },
    [algo]
  )

  return (
    <div className="panel">
      <div className="controls">
        {ALGORITHMS.map((a) => (
          <button key={a} className={`btn ${algo === a ? 'primary' : ''}`} onClick={() => setAlgo(a)}>
            {a}
          </button>
        ))}
        <button className="btn primary" onClick={sendRequest}>Send request</button>
        {lastPick != null && (
          <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            routed to server {lastPick}
          </span>
        )}
      </div>
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Canvas camera={{ position: [0, 3.5, 12.5], fov: 45 }}>
          <Scene loads={loads} packets={packets} onArrive={onArrive} />
        </Canvas>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        Round-robin cycles servers in order. Random picks any server. Least-connections routes to whichever server currently has the fewest active requests.
      </p>
    </div>
  )
}
