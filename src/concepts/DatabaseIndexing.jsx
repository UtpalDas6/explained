import { useState } from 'react'

const ROOT_KEYS = [30, 60]
const CHILDREN = [
  { keys: [10, 20] },
  { keys: [30, 40, 50] },
  { keys: [60, 70, 80] },
]

function childIndex(key) {
  if (key < 30) return 0
  if (key < 60) return 1
  return 2
}

function BTreeDemo() {
  const [input, setInput] = useState('')
  const [path, setPath] = useState(null) // { child, found }

  const search = () => {
    const key = Number(input)
    if (Number.isNaN(key)) return
    const child = childIndex(key)
    const found = CHILDREN[child].keys.includes(key)
    setPath({ child, found, key })
  }

  return (
    <div>
      <div className="controls">
        <input
          type="number"
          className="mono"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', width: 120 }}
          placeholder="search key…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
        />
        <button className="btn primary" onClick={search}>Search</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, margin: '24px 0' }}>
        <div
          className="mono"
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: `2px solid ${path ? 'var(--accent)' : 'var(--border)'}`,
            background: 'var(--panel-2)',
          }}
        >
          root: [{ROOT_KEYS.join(', ')}]
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {CHILDREN.map((c, i) => (
            <div
              key={i}
              className="mono"
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: `2px solid ${path?.child === i ? 'var(--accent)' : 'var(--border)'}`,
                background: path?.child === i ? 'rgba(110,231,255,0.08)' : 'var(--panel-2)',
              }}
            >
              [{c.keys.map((k) => (path?.child === i && k === path.key ? <b key={k} style={{ color: 'var(--good)' }}>{k}</b> : k)).reduce((acc, el, idx) => idx === 0 ? [el] : [...acc, ', ', el], [])}]
            </div>
          ))}
        </div>
      </div>

      {path && (
        <p style={{ fontSize: 13, color: path.found ? 'var(--good)' : 'var(--text-dim)' }}>
          key {path.key}: {path.found ? 'found' : 'not present'} — 2 comparisons to reach the leaf (root, then leaf {path.child}), not a full scan.
        </p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Reads are fast and predictable: every lookup walks the same O(log n) path. Writes update the tree in place, which means random disk I/O.
      </p>
    </div>
  )
}

function LsmTreeDemo() {
  const [memtable, setMemtable] = useState([])
  const [sstables, setSstables] = useState([])
  const [input, setInput] = useState('')

  const write = () => {
    const key = input.trim()
    if (!key) return
    const next = [...memtable, key]
    if (next.length >= 3) {
      setSstables((s) => [[...next].sort(), ...s])
      setMemtable([])
    } else {
      setMemtable(next)
    }
    setInput('')
  }

  const compact = () => {
    if (sstables.length <= 1) return
    const merged = [...new Set(sstables.flat())].sort()
    setSstables([merged])
  }

  return (
    <div>
      <div className="controls">
        <input
          className="mono"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }}
          placeholder="write key…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && write()}
        />
        <button className="btn primary" onClick={write}>Write</button>
        <button className="btn" onClick={compact} disabled={sstables.length <= 1}>Compact</button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>memtable (in memory)</div>
        <div className="mono" style={{ padding: '10px 16px', borderRadius: 8, border: '2px solid var(--accent)', background: 'rgba(110,231,255,0.06)', minHeight: 20 }}>
          [{memtable.join(', ')}] {memtable.length >= 2 && <span style={{ color: 'var(--text-dim)' }}>(flushes at 3)</span>}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>SSTables on disk (newest on top)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sstables.length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>none yet</div>}
          {sstables.map((s, i) => (
            <div key={i} className="mono" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-2)', fontSize: 13 }}>
              [{s.join(', ')}]
            </div>
          ))}
        </div>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        Writes only ever append — to the memtable, then to a new SSTable on flush — so they're sequential and fast. Reads may have to check several SSTables, which is why compaction periodically merges them back down.
      </p>
    </div>
  )
}

export default function DatabaseIndexing() {
  const [tab, setTab] = useState('btree')
  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${tab === 'btree' ? 'primary' : ''}`} onClick={() => setTab('btree')}>B-Tree (search path)</button>
        <button className={`btn ${tab === 'lsm' ? 'primary' : ''}`} onClick={() => setTab('lsm')}>LSM-Tree (write path)</button>
      </div>
      {tab === 'btree' ? <BTreeDemo /> : <LsmTreeDemo />}
    </div>
  )
}
