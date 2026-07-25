import { useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function CapTheorem() {
  const [partitioned, setPartitioned] = useState(false)
  const [mode, setMode] = useState(null) // 'CP' | 'AP' | null
  const [valueA, setValueA] = useState(0)
  const [valueB, setValueB] = useState(0)
  const [status, setStatus] = useState('Nodes connected and in sync.')
  const boxARef = useRef(null)
  const boxBRef = useRef(null)

  const flash = (ref) => gsap.fromTo(ref.current, { scale: 1 }, { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1, transformOrigin: '50% 50%' })

  const togglePartition = () => {
    if (partitioned) {
      setPartitioned(false)
      if (valueA !== valueB) {
        setStatus(`Partition healed — CONFLICT: A=${valueA}, B=${valueB} need reconciling.`)
      } else {
        setStatus('Partition healed. Nodes back in sync.')
      }
      setMode(null)
    } else {
      setPartitioned(true)
      setMode(null)
      setStatus('Network partition! Choose how to handle writes: CP or AP.')
    }
  }

  const write = (node) => {
    const v = Math.floor(Math.random() * 90) + 10
    if (!partitioned) {
      setValueA(v)
      setValueB(v)
      flash(boxARef)
      flash(boxBRef)
      setStatus(`Wrote x=${v} to both nodes (in sync).`)
      return
    }
    if (mode === 'CP') {
      setStatus(`Write to ${node} REJECTED — no quorum during partition. Consistency preserved, availability sacrificed.`)
      return
    }
    if (mode === 'AP') {
      if (node === 'A') setValueA(v)
      else setValueB(v)
      flash(node === 'A' ? boxARef : boxBRef)
      setStatus(`Write x=${v} accepted on ${node} only — nodes may now disagree. Availability preserved, consistency sacrificed.`)
      return
    }
    setStatus('Choose CP or AP first to decide how writes behave during the partition.')
  }

  const diverged = partitioned && mode === 'AP' && valueA !== valueB

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={togglePartition}>
          {partitioned ? 'Heal partition' : 'Trigger network partition'}
        </button>
        <button className="btn" onClick={() => write('A')}>Write to A</button>
        <button className="btn" onClick={() => write('B')}>Write to B</button>
        {partitioned && (
          <>
            <button className={`btn ${mode === 'CP' ? 'primary' : ''}`} onClick={() => setMode('CP')}>Choose CP</button>
            <button className={`btn ${mode === 'AP' ? 'primary' : ''}`} onClick={() => setMode('AP')}>Choose AP</button>
          </>
        )}
      </div>

      <svg width="100%" height="220" viewBox="0 0 500 220">
        <line
          x1="150" y1="110" x2="350" y2="110"
          stroke={partitioned ? 'var(--bad)' : 'var(--good)'}
          strokeWidth="3"
          strokeDasharray={partitioned ? '8 6' : '0'}
        />
        <g ref={boxARef} transform="translate(70,60)" style={{ transformOrigin: 'center' }}>
          <rect width="100" height="100" rx="14" fill="var(--panel-2)" stroke={diverged ? 'var(--bad)' : 'var(--border)'} strokeWidth="2" />
          <text x="50" y="45" textAnchor="middle" fontSize="14" fill="var(--text-dim)">Node A</text>
          <text x="50" y="70" textAnchor="middle" fontSize="20" fill="var(--accent)" className="mono">x={valueA}</text>
        </g>
        <g ref={boxBRef} transform="translate(330,60)" style={{ transformOrigin: 'center' }}>
          <rect width="100" height="100" rx="14" fill="var(--panel-2)" stroke={diverged ? 'var(--bad)' : 'var(--border)'} strokeWidth="2" />
          <text x="50" y="45" textAnchor="middle" fontSize="14" fill="var(--text-dim)">Node B</text>
          <text x="50" y="70" textAnchor="middle" fontSize="20" fill="var(--accent)" className="mono">x={valueB}</text>
        </g>
        {partitioned && (
          <text x="250" y="100" textAnchor="middle" fontSize="22" fill="var(--bad)">✕</text>
        )}
      </svg>

      <p style={{ color: diverged ? 'var(--bad)' : 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
        During a network partition you can only pick two of Consistency, Availability, Partition tolerance — partition tolerance isn't optional in a distributed system, so it's really a choice between CP and AP.
      </p>
    </div>
  )
}
