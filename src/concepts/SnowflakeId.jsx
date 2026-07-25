import { useRef, useState } from 'react'
import { playPop } from '../lib/sound.js'

const EPOCH = new Date('2020-01-01T00:00:00Z').getTime()
const MACHINE_BITS = 10
const SEQ_BITS = 12
const MAX_SEQ = (1 << SEQ_BITS) - 1

function toBinary(value, bits) {
  return value.toString(2).padStart(bits, '0')
}

export default function SnowflakeId() {
  const [machineId, setMachineId] = useState(() => Math.floor(Math.random() * (1 << MACHINE_BITS)))
  const [history, setHistory] = useState([])
  const lastTs = useRef(-1)
  const seq = useRef(0)

  const generate = () => {
    playPop()
    let ts = Date.now() - EPOCH
    if (ts === lastTs.current) {
      seq.current = (seq.current + 1) & MAX_SEQ
      if (seq.current === 0) {
        while (Date.now() - EPOCH === ts) {
          /* spin until the next millisecond ticks over */
        }
        ts = Date.now() - EPOCH
      }
    } else {
      seq.current = 0
    }
    lastTs.current = ts

    const id = (BigInt(ts) << BigInt(MACHINE_BITS + SEQ_BITS)) | (BigInt(machineId) << BigInt(SEQ_BITS)) | BigInt(seq.current)

    setHistory((h) => [{ id: id.toString(), ts, machineId, sequence: seq.current, key: h.length }, ...h].slice(0, 6))
  }

  const latest = history[0]

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={generate}>Generate ID</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: 13 }}>
          machine id
          <input
            type="number"
            min={0}
            max={(1 << MACHINE_BITS) - 1}
            value={machineId}
            onChange={(e) => setMachineId(Math.max(0, Math.min((1 << MACHINE_BITS) - 1, Number(e.target.value) || 0)))}
            className="mono"
            style={{ width: 80, background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text)' }}
          />
        </label>
      </div>

      {latest && (
        <div style={{ margin: '20px 0' }}>
          <div className="mono" style={{ fontSize: 22, color: 'var(--text)', marginBottom: 12 }}>{latest.id}</div>
          <div style={{ display: 'flex', gap: 4, height: 48 }}>
            <div style={{ flex: 41, background: 'rgba(110,231,255,0.15)', border: '1px solid var(--accent)', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--accent)' }}>
              timestamp (41 bits)
            </div>
            <div style={{ flex: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid var(--accent-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--accent-2)' }}>
              machine (10)
            </div>
            <div style={{ flex: 12, background: 'rgba(74,222,128,0.15)', border: '1px solid var(--good)', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--good)' }}>
              sequence (12)
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text-dim)' }} className="mono">
            <div>ts: {toBinary(latest.ts, 41)} = {latest.ts}ms since epoch</div>
            <div>machine: {toBinary(latest.machineId, MACHINE_BITS)} = {latest.machineId}</div>
            <div>seq: {toBinary(latest.sequence, SEQ_BITS)} = {latest.sequence}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {history.slice(1).map((h) => (
          <div key={h.key} className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            {h.id} — machine {h.machineId}, seq {h.sequence}
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        Generate several IDs quickly: same millisecond → sequence increments. Different machine id → different ID space, so multiple machines can generate IDs concurrently with no coordination and no collisions.
      </p>
    </div>
  )
}
