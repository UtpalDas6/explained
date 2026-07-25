import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import Packet from './Packet.jsx'
import { playError, playSuccess } from '../lib/sound.js'

const CAPACITY = 8
const WORKER_COUNT = 3
const PRODUCER_POS = new THREE.Vector3(-6.5, 0, 0)

function slotPosition(i) {
  return new THREE.Vector3(-3.6 + i * (6.4 / (CAPACITY - 1)), 0, 0)
}
function workerPosition(i) {
  return new THREE.Vector3(5.2, (i - (WORKER_COUNT - 1) / 2) * 2.4, 0)
}

function Scene({ depth, workers, packets, onArrive }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={60} />
      <group position={PRODUCER_POS}>
        <mesh>
          <boxGeometry args={[1, 0.9, 1]} />
          <meshStandardMaterial color="#191d27" />
        </mesh>
        <Text position={[0, 0.75, 0]} fontSize={0.22} color="#a78bfa">producer</Text>
      </group>

      <Text position={[-0.6, -0.9, 0]} fontSize={0.2} color="#8a90a2">{`queue ${depth}/${CAPACITY}`}</Text>
      {Array.from({ length: depth }).map((_, i) => (
        <mesh key={i} position={slotPosition(i)}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#191d27" emissive="#6ee7ff" emissiveIntensity={0.35} />
        </mesh>
      ))}

      {workers.map((busy, i) => (
        <group key={i} position={workerPosition(i)}>
          <mesh>
            <boxGeometry args={[1.1, 0.9, 1]} />
            <meshStandardMaterial color="#191d27" emissive={busy ? '#fbbf24' : '#4ade80'} emissiveIntensity={0.3} />
          </mesh>
          <Text position={[0, 0.75, 0]} fontSize={0.2} color="#6ee7ff">{`worker ${i}`}</Text>
          <Text position={[0, -0.75, 0]} fontSize={0.2} color={busy ? '#fbbf24' : '#4ade80'}>
            {busy ? 'processing…' : 'idle'}
          </Text>
        </group>
      ))}

      {packets.map((p) => (
        <Packet key={p.id} from={p.from} to={p.to} color={p.color} onArrive={() => onArrive(p)} />
      ))}
      <OrbitControls enablePan={false} minDistance={5} maxDistance={18} />
    </>
  )
}

export default function TaskQueueBackPressure() {
  const [depth, setDepth] = useState(0)
  const [workers, setWorkers] = useState(() => Array(WORKER_COUNT).fill(false))
  const [packets, setPackets] = useState([])
  const [submitted, setSubmitted] = useState(0)
  const [rejected, setRejected] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [status, setStatus] = useState('idle')

  const depthRef = useRef(0)
  const workersRef = useRef(Array(WORKER_COUNT).fill(false))
  const nextId = useRef(0)

  const tryDispatch = useCallback(() => {
    const freeIdx = workersRef.current.findIndex((b) => !b)
    if (freeIdx === -1 || depthRef.current <= 0) return
    workersRef.current[freeIdx] = true
    setWorkers([...workersRef.current])
    depthRef.current -= 1
    setDepth(depthRef.current)
    const id = nextId.current++
    setPackets((p) => [
      ...p,
      { id, from: slotPosition(0), to: workerPosition(freeIdx), color: '#fbbf24', workerIdx: freeIdx, phase: 'dispatch' },
    ])
  }, [])

  const onArrive = useCallback(
    (packet) => {
      setPackets((p) => p.filter((x) => x.id !== packet.id))
      if (packet.phase === 'enqueue') {
        setStatus(`Task queued (${depthRef.current}/${CAPACITY}).`)
        tryDispatch()
      } else {
        const idx = packet.workerIdx
        const duration = 1200 + Math.random() * 1300
        setTimeout(() => {
          workersRef.current[idx] = false
          setWorkers([...workersRef.current])
          setCompleted((c) => c + 1)
          playSuccess()
          setStatus(`Worker ${idx} finished a task.`)
          tryDispatch()
        }, duration)
      }
    },
    [tryDispatch]
  )

  const submitTask = () => {
    if (depthRef.current >= CAPACITY) {
      setRejected((r) => r + 1)
      playError()
      setStatus(`Queue full (${CAPACITY}/${CAPACITY}) — task REJECTED. This is back pressure protecting the workers from an unbounded backlog.`)
      return
    }
    const slotIdx = depthRef.current
    depthRef.current += 1
    setDepth(depthRef.current)
    setSubmitted((s) => s + 1)
    const id = nextId.current++
    setPackets((p) => [...p, { id, from: PRODUCER_POS, to: slotPosition(slotIdx), color: '#6ee7ff', phase: 'enqueue' }])
  }

  const submitBurst = () => {
    for (let i = 0; i < 6; i++) submitTask()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={submitTask}>Submit task</button>
        <button className="btn" onClick={submitBurst}>Submit burst of 6</button>
      </div>
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Canvas camera={{ position: [0, 3.4, 13], fov: 45 }}>
          <Scene depth={depth} workers={workers} packets={packets} onArrive={onArrive} />
        </Canvas>
      </div>
      <div className="stat-row">
        <div><b>{submitted}</b>submitted</div>
        <div><b>{rejected}</b>rejected</div>
        <div><b>{completed}</b>completed</div>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>
        {WORKER_COUNT} workers pull tasks off the queue in parallel. Once the queue hits capacity, new submissions are rejected outright rather than growing the backlog forever — that rejection is the back pressure signal telling producers to slow down.
      </p>
    </div>
  )
}
