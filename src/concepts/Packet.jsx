import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// A small glowing sphere that arcs from `from` to `to` over `duration` ms, then calls onArrive.
export default function Packet({ from, to, duration = 800, color = '#6ee7ff', arcHeight = 1.2, onArrive }) {
  const ref = useRef()
  const start = useRef(performance.now())
  const arrived = useRef(false)

  useFrame(() => {
    const t = Math.min((performance.now() - start.current) / duration, 1)
    const pos = new THREE.Vector3().lerpVectors(from, to, easeInOut(t))
    pos.y += Math.sin(t * Math.PI) * arcHeight
    ref.current.position.copy(pos)
    // useFrame keeps ticking every rendered frame even after t hits 1, until the
    // state update that removes this packet actually unmounts it — guard so
    // onArrive (often a counter increment) fires exactly once per packet.
    if (t >= 1 && !arrived.current) {
      arrived.current = true
      onArrive()
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
    </mesh>
  )
}
