import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playClick, playPop, playError } from '../../lib/sound.js'

const boxStyle = {
  width: 52,
  height: 52,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--panel-2)',
  border: '2px solid var(--border)',
  fontSize: 16,
}

function Item({ value, highlight }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="mono"
      style={{ ...boxStyle, borderColor: highlight ? 'var(--accent)' : 'var(--border)' }}
    >
      {value}
    </motion.div>
  )
}

function StackDemo() {
  const [items, setItems] = useState([12, 45, 7])
  const nextVal = useRef(90)

  const push = () => {
    setItems((s) => [...s, nextVal.current])
    nextVal.current += 3
    playClick()
  }
  const pop = () => {
    if (!items.length) {
      playError()
      return
    }
    setItems((s) => s.slice(0, -1))
    playPop()
  }

  return (
    <div>
      <div className="controls">
        <button className="btn primary" onClick={push}>Push</button>
        <button className="btn" onClick={pop} disabled={!items.length}>Pop</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 8, alignItems: 'center', minHeight: 280, justifyContent: 'flex-start', border: '1px dashed var(--border)', borderRadius: 12, padding: 16 }}>
        <AnimatePresence>
          {items.map((v, i) => (
            <Item key={`${v}-${i}`} value={v} highlight={i === items.length - 1} />
          ))}
        </AnimatePresence>
        {!items.length && <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>empty stack</span>}
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        LIFO — last in, first out. Push and pop both touch only the top, so both are O(1). Backs function call stacks, undo history, and DFS traversal.
      </p>
    </div>
  )
}

function QueueDemo() {
  const [items, setItems] = useState([12, 45, 7])
  const nextVal = useRef(90)

  const enqueue = () => {
    setItems((s) => [...s, nextVal.current])
    nextVal.current += 3
    playClick()
  }
  const dequeue = () => {
    if (!items.length) {
      playError()
      return
    }
    setItems((s) => s.slice(1))
    playPop()
  }

  return (
    <div>
      <div className="controls">
        <button className="btn primary" onClick={enqueue}>Enqueue</button>
        <button className="btn" onClick={dequeue} disabled={!items.length}>Dequeue</button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 84, border: '1px dashed var(--border)', borderRadius: 12, padding: 16 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>front</span>
        <AnimatePresence>
          {items.map((v, i) => (
            <Item key={`${v}-${i}`} value={v} highlight={i === 0} />
          ))}
        </AnimatePresence>
        {!items.length && <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>empty queue</span>}
        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>back</span>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
        FIFO — first in, first out. Enqueue at the back, dequeue from the front, both O(1) with a proper ring buffer or linked list. Backs task queues and BFS traversal.
      </p>
    </div>
  )
}

export default function StackQueue() {
  const [tab, setTab] = useState('stack')
  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${tab === 'stack' ? 'primary' : ''}`} onClick={() => setTab('stack')}>Stack</button>
        <button className={`btn ${tab === 'queue' ? 'primary' : ''}`} onClick={() => setTab('queue')}>Queue</button>
      </div>
      {tab === 'stack' ? <StackDemo /> : <QueueDemo />}
    </div>
  )
}
