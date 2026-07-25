import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import Packet from './Packet.jsx'
import { playClick, playSuccess } from '../lib/sound.js'

const REPLICA_COUNT = 3
const PRIMARY_POS = new THREE.Vector3(-3.2, 0, 0)

function replicaPosition(i) {
  const spread = (i - (REPLICA_COUNT - 1) / 2) * 2.3
  return new THREE.Vector3(2.6, spread, 0)
}

function randomLag() {
  return 150 + Math.random() * 750
}

function Node({ position, label, sub, color }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#191d27" />
      </mesh>
      <Text position={[0, 0.9, 0]} fontSize={0.26} color={color}>{label}</Text>
      <Text position={[0, -0.9, 0]} fontSize={0.2} color="#8a90a2">{sub}</Text>
    </group>
  )
}

function Scene({ replicas, packets, onArrive }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={60} />
      <Node position={PRIMARY_POS} label="primary" sub="writes land here" color="#a78bfa" />
      {replicas.map((r, i) => (
        <Node
          key={i}
          position={replicaPosition(i)}
          label={`replica ${i}`}
          sub={r.applying ? 'applying…' : `v${r.version} · lag ${r.lastLag ?? 0}ms`}
          color={r.applying ? '#f87171' : '#4ade80'}
        />
      ))}
      {packets.map((p) => (
        <Packet key={p.id} from={p.from} to={p.to} duration={p.duration} onArrive={() => onArrive(p)} />
      ))}
      <OrbitControls enablePan={false} minDistance={5} maxDistance={14} />
    </>
  )
}

export default function Replication() {
  const [mode, setMode] = useState('async') // 'sync' | 'async'
  const [replicas, setReplicas] = useState(() =>
    Array.from({ length: REPLICA_COUNT }, () => ({ version: 0, applying: false, lastLag: null }))
  )
  const [packets, setPackets] = useState([])
  const [status, setStatus] = useState('idle')
  const [commitMs, setCommitMs] = useState(null)
  const nextId = useRef(0)
  const version = useRef(0)
  const pendingAcks = useRef(0)
  const writeStart = useRef(0)

  const write = useCallback(() => {
    playClick()
    version.current += 1
    const v = version.current
    writeStart.current = performance.now()
    pendingAcks.current = REPLICA_COUNT

    setReplicas((rs) => rs.map((r) => ({ ...r, applying: true })))
    setStatus(mode === 'sync' ? 'committing (waiting for replicas)…' : 'committed on primary')
    setCommitMs(null)

    const lags = Array.from({ length: REPLICA_COUNT }, randomLag)
    const packetsToAdd = lags.map((lag, i) => ({
      id: nextId.current++,
      from: PRIMARY_POS,
      to: replicaPosition(i),
      duration: lag,
      idx: i,
      lag: Math.round(lag),
      v,
    }))
    setPackets((p) => [...p, ...packetsToAdd])

    if (mode === 'async') {
      // primary doesn't wait; replicas will individually catch up.
    }
  }, [mode])

  const onArrive = useCallback((packet) => {
    setReplicas((rs) => {
      const next = [...rs]
      next[packet.idx] = { version: packet.v, applying: false, lastLag: packet.lag }
      return next
    })
    setPackets((p) => p.filter((x) => x.id !== packet.id))

    if (mode === 'sync') {
      pendingAcks.current -= 1
      if (pendingAcks.current === 0) {
        setCommitMs(Math.round(performance.now() - writeStart.current))
        setStatus('committed (all replicas acked)')
        playSuccess()
      }
    }
  }, [mode])

  return (
    <div className="panel">
      <div className="controls">
        <button
          className={`btn ${mode === 'async' ? 'primary' : ''}`}
          onClick={() => setMode('async')}
        >
          Async replication
        </button>
        <button
          className={`btn ${mode === 'sync' ? 'primary' : ''}`}
          onClick={() => setMode('sync')}
        >
          Sync replication
        </button>
        <button className="btn primary" onClick={write}>Write to primary</button>
        <span style={{ alignSelf: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
          {status}{commitMs != null ? ` · ${commitMs}ms` : ''}
        </span>
      </div>
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Canvas camera={{ position: [0, 2.2, 10.5], fov: 50 }}>
          <Scene replicas={replicas} packets={packets} onArrive={onArrive} />
        </Canvas>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        Async: primary confirms instantly, replicas catch up with visible lag (can serve stale reads).
        Sync: primary waits for every replica to ack before confirming (higher latency, no staleness).
      </p>
    </div>
  )
}
