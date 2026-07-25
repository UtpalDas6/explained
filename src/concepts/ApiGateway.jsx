import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import Packet from './Packet.jsx'

const CLIENT_POS = new THREE.Vector3(0, 0, -5)
const GATEWAY_POS = new THREE.Vector3(0, 0, -1.6)
const SERVICES = [
  { id: 'auth', path: '/auth/login', name: 'auth service' },
  { id: 'orders', path: '/orders/123', name: 'orders service' },
  { id: 'inventory', path: '/inventory/456', name: 'inventory service' },
]

function servicePosition(i) {
  return new THREE.Vector3((i - (SERVICES.length - 1) / 2) * 3, 0, 2.6)
}

function Scene({ packets, onArrive, blockedFlash }) {
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
      <group position={GATEWAY_POS}>
        <mesh>
          <boxGeometry args={[1.3, 1, 1]} />
          <meshStandardMaterial color="#191d27" emissive={blockedFlash ? '#f87171' : '#000000'} emissiveIntensity={blockedFlash ? 0.6 : 0} />
        </mesh>
        <Text position={[0, 0.8, 0]} fontSize={0.2} color="#f472b6">API gateway</Text>
        <Text position={[0, -0.75, 0]} fontSize={0.15} color="#8a90a2">auth · rate limit · routing</Text>
      </group>
      {SERVICES.map((s, i) => (
        <group key={s.id} position={servicePosition(i)}>
          <mesh>
            <boxGeometry args={[1.2, 0.9, 1]} />
            <meshStandardMaterial color="#191d27" />
          </mesh>
          <Text position={[0, 0.75, 0]} fontSize={0.19} color="#6ee7ff">{s.name}</Text>
        </group>
      ))}
      {packets.map((p) => (
        <Packet key={p.id} from={p.from} to={p.to} color={p.color} duration={p.duration} onArrive={() => onArrive(p)} />
      ))}
      <OrbitControls enablePan={false} minDistance={4} maxDistance={16} />
    </>
  )
}

export default function ApiGateway() {
  const [authValid, setAuthValid] = useState(true)
  const [rateLimited, setRateLimited] = useState(false)
  const [packets, setPackets] = useState([])
  const [status, setStatus] = useState('idle')
  const [blockedFlash, setBlockedFlash] = useState(false)
  const nextId = useRef(0)

  const sendRequest = useCallback(
    (service) => {
      const id = nextId.current++
      setPackets((p) => [
        ...p,
        { id, from: CLIENT_POS, to: GATEWAY_POS, color: '#6ee7ff', duration: 500, phase: 'toGateway', service },
      ])
    },
    []
  )

  const onArrive = useCallback(
    (packet) => {
      setPackets((p) => p.filter((x) => x.id !== packet.id))
      if (packet.phase === 'toGateway') {
        if (!authValid) {
          setStatus(`401 Unauthorized — blocked at gateway, ${packet.service.name} never contacted`)
          setBlockedFlash(true)
          setTimeout(() => setBlockedFlash(false), 400)
          return
        }
        if (rateLimited) {
          setStatus(`429 Too Many Requests — blocked at gateway, ${packet.service.name} never contacted`)
          setBlockedFlash(true)
          setTimeout(() => setBlockedFlash(false), 400)
          return
        }
        setStatus(`routing ${packet.service.path} → ${packet.service.name}`)
        const idx = SERVICES.findIndex((s) => s.id === packet.service.id)
        const id = nextId.current++
        setPackets((p) => [
          ...p,
          { id, from: GATEWAY_POS, to: servicePosition(idx), color: '#f472b6', duration: 700, phase: 'toService', service: packet.service },
        ])
      } else {
        setStatus(`200 OK from ${packet.service.name}`)
      }
    },
    [authValid, rateLimited]
  )

  return (
    <div className="panel">
      <div className="controls">
        {SERVICES.map((s) => (
          <button key={s.id} className="btn primary" onClick={() => sendRequest(s)}>
            Request {s.path}
          </button>
        ))}
      </div>
      <div className="controls">
        <button className={`btn ${authValid ? '' : 'primary'}`} onClick={() => setAuthValid((v) => !v)}>
          {authValid ? 'Auth: valid' : 'Auth: INVALID (click to fix)'}
        </button>
        <button className={`btn ${rateLimited ? 'primary' : ''}`} onClick={() => setRateLimited((v) => !v)}>
          {rateLimited ? 'Rate limit: EXCEEDED (click to clear)' : 'Rate limit: ok'}
        </button>
      </div>
      <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Canvas camera={{ position: [0, 3.5, 12.5], fov: 45 }}>
          <Scene packets={packets} onArrive={onArrive} blockedFlash={blockedFlash} />
        </Canvas>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>
        Unlike a load balancer routing identical replicas, the gateway routes by path to different services, and enforces auth/rate-limiting once, centrally, before anything reaches a backend.
      </p>
    </div>
  )
}
