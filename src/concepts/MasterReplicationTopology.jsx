import { useEffect, useRef, useState } from 'react'
import { playClick, playError, playSuccess, playPop } from '../lib/sound.js'

const PROPAGATION_MS = 1000

export default function MasterReplicationTopology() {
  const [mode, setMode] = useState('slave') // 'slave' | 'master'
  const [valueA, setValueA] = useState(0)
  const [valueB, setValueB] = useState(0)
  const [conflict, setConflict] = useState(false)
  const [status, setStatus] = useState('idle')

  const pendingRef = useRef(null)
  const lastWriteAt = useRef({ A: 0, B: 0 })

  useEffect(() => () => pendingRef.current && clearTimeout(pendingRef.current.timeoutId), [])

  const randomValue = () => Math.floor(Math.random() * 90) + 10

  const writeSlaveMode = (node) => {
    if (node === 'B') {
      setStatus('Rejected — B is a read-only slave. Writes must go to the master.')
      playError()
      return
    }
    const v = randomValue()
    setValueA(v)
    playClick()
    setStatus(`Wrote x=${v} to master A, replicating to slave B…`)
    setTimeout(() => {
      setValueB(v)
      playPop()
      setStatus(`Slave B caught up to x=${v}.`)
    }, 600)
  }

  const writeMasterMode = (node) => {
    const v = randomValue()
    lastWriteAt.current[node] = Date.now()
    const other = node === 'A' ? 'B' : 'A'

    if (pendingRef.current && pendingRef.current.from === other) {
      clearTimeout(pendingRef.current.timeoutId)
      pendingRef.current = null
      if (node === 'A') setValueA(v)
      else setValueB(v)
      setConflict(true)
      playError()
      setStatus(`CONFLICT — ${node} was written to while ${other}'s write was still replicating. Both nodes now disagree and need reconciling.`)
      return
    }

    if (node === 'A') setValueA(v)
    else setValueB(v)
    setConflict(false)
    playClick()
    setStatus(`Wrote x=${v} to ${node}, replicating to ${other}…`)
    const timeoutId = setTimeout(() => {
      if (node === 'A') setValueB(v)
      else setValueA(v)
      pendingRef.current = null
      playPop()
      setStatus(`Replicated ${node}'s write to ${other}. Both nodes agree again.`)
    }, PROPAGATION_MS)
    pendingRef.current = { from: node, value: v, timeoutId }
  }

  const resolveConflict = () => {
    const winner = lastWriteAt.current.A >= lastWriteAt.current.B ? 'A' : 'B'
    const v = winner === 'A' ? valueA : valueB
    setValueA(v)
    setValueB(v)
    setConflict(false)
    playSuccess()
    setStatus(`Resolved via last-write-wins — node ${winner} won, both now show x=${v}.`)
  }

  const write = mode === 'slave' ? writeSlaveMode : writeMasterMode

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${mode === 'slave' ? 'primary' : ''}`} onClick={() => setMode('slave')}>Master-Slave</button>
        <button className={`btn ${mode === 'master' ? 'primary' : ''}`} onClick={() => setMode('master')}>Master-Master</button>
        <button className="btn" onClick={() => write('A')}>Write to A</button>
        <button className="btn" onClick={() => write('B')}>Write to B</button>
        {conflict && <button className="btn primary" onClick={resolveConflict}>Resolve (last write wins)</button>}
      </div>

      <div style={{ display: 'flex', gap: 24, margin: '20px 0', justifyContent: 'center' }}>
        <div style={{ padding: 20, borderRadius: 10, border: `1px solid ${conflict ? 'var(--bad)' : 'var(--border)'}`, background: 'var(--panel-2)', minWidth: 150, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>
            Node A {mode === 'slave' && <span style={{ color: 'var(--accent)' }}>(master)</span>}
          </div>
          <div className="mono" style={{ fontSize: 22 }}>x={valueA}</div>
        </div>
        <div style={{ padding: 20, borderRadius: 10, border: `1px solid ${conflict ? 'var(--bad)' : 'var(--border)'}`, background: 'var(--panel-2)', minWidth: 150, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>
            Node B {mode === 'slave' ? <span style={{ color: 'var(--text-dim)' }}>(read-only slave)</span> : <span style={{ color: 'var(--accent)' }}>(master)</span>}
          </div>
          <div className="mono" style={{ fontSize: 22 }}>x={valueB}</div>
        </div>
      </div>

      <p style={{ color: conflict ? 'var(--bad)' : 'var(--text-dim)', fontSize: 13 }}>{status}</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Master-slave has one writer, so there's never a conflict — just replication lag. Master-master lets both sides accept writes independently, which scales writes but means two concurrent writes to the same data can conflict before they've synced.
      </p>
    </div>
  )
}
