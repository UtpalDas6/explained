import { useState } from 'react'
import { hashString } from '../lib/hash.js'
import { playClick, playSuccess, playError } from '../lib/sound.js'

const BITS = 32
const K = 3

function bitPositions(item) {
  return Array.from({ length: K }, (_, i) => hashString(`${item}::${i}`) % BITS)
}

export default function BloomFilter() {
  const [bits, setBits] = useState(() => Array(BITS).fill(false))
  const [added, setAdded] = useState([])
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [highlight, setHighlight] = useState([])

  const add = () => {
    const item = input.trim()
    if (!item || added.includes(item)) return
    playClick()
    const positions = bitPositions(item)
    setBits((b) => {
      const next = [...b]
      positions.forEach((p) => (next[p] = true))
      return next
    })
    setAdded((a) => [...a, item])
    setHighlight(positions)
    setResult(null)
    setInput('')
  }

  const check = () => {
    const item = input.trim()
    if (!item) return
    const positions = bitPositions(item)
    setHighlight(positions)
    const maybePresent = positions.every((p) => bits[p])
    const actuallyAdded = added.includes(item)
    if (!maybePresent) {
      setResult({ item, verdict: 'definitely NOT present', tone: 'good' })
      playSuccess()
    } else if (actuallyAdded) {
      setResult({ item, verdict: 'present (added earlier)', tone: 'good' })
      playSuccess()
    } else {
      setResult({ item, verdict: 'maybe present — false positive! never added, but all its bits were set by other items', tone: 'bad' })
      playError()
    }
    setInput('')
  }

  const reset = () => {
    setBits(Array(BITS).fill(false))
    setAdded([])
    setResult(null)
    setHighlight([])
  }

  return (
    <div className="panel">
      <div className="controls">
        <input
          className="mono"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }}
          placeholder="item name…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn primary" onClick={add}>Add</button>
        <button className="btn" onClick={check}>Check</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, maxWidth: 360, margin: '20px 0' }}>
        {bits.map((set, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1',
              borderRadius: 6,
              border: `1px solid ${highlight.includes(i) ? 'var(--accent)' : 'var(--border)'}`,
              background: set ? 'rgba(74,222,128,0.25)' : 'var(--panel-2)',
              color: set ? 'var(--good)' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              boxShadow: highlight.includes(i) ? '0 0 0 2px rgba(110,231,255,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {set ? 1 : 0}
          </div>
        ))}
      </div>

      {result && (
        <p style={{ color: result.tone === 'good' ? 'var(--good)' : 'var(--bad)', fontSize: 13, marginBottom: 8 }}>
          "{result.item}": {result.verdict}
        </p>
      )}

      <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>
        added so far: {added.length ? added.join(', ') : 'none'}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
        Each item sets {K} bits via {K} hash functions. Checking an item that was never added can still say "maybe present" if other items happened to set all the same bits — that's the only kind of error a Bloom filter can make; it never has false negatives.
      </p>
    </div>
  )
}
