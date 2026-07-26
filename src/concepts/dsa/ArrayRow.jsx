import { motion } from 'framer-motion'

// Shared array visualization: a row of numbered boxes with labeled pointers
// underneath and optional dimming for indices that are out of consideration
// (e.g. the eliminated half in binary search). Used by TwoPointers,
// SlidingWindow and BinarySearch so those three don't each reinvent it.
export default function ArrayRow({ values, pointers = [], dimmed = [], highlight = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {values.map((v, i) => {
          const p = pointers.find((p) => p.index === i)
          const isDim = dimmed.includes(i)
          const isHi = highlight.includes(i)
          return (
            <motion.div
              key={i}
              layout
              className="mono"
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                fontSize: 15,
                background: isHi ? 'rgba(74,222,128,0.12)' : p ? 'rgba(110,231,255,0.1)' : 'var(--panel-2)',
                border: `2px solid ${isHi ? 'var(--good)' : p ? p.color || 'var(--accent)' : 'var(--border)'}`,
                color: isDim ? 'var(--text-dim)' : 'var(--text)',
                opacity: isDim ? 0.35 : 1,
                transition: 'background 0.15s, border-color 0.15s, opacity 0.15s',
              }}
            >
              {v}
            </motion.div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {values.map((_, i) => {
          const labels = pointers.filter((p) => p.index === i).map((p) => p.label)
          return (
            <div key={i} className="mono" style={{ width: 44, textAlign: 'center', fontSize: 11, color: 'var(--accent)' }}>
              {labels.join('/')}
            </div>
          )
        })}
      </div>
    </div>
  )
}
