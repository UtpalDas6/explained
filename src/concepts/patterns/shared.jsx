import { motion } from 'framer-motion'

// Shared presentational primitives for the pattern visualizations — every
// pattern component is its own small state machine, but they all draw boxes
// on a dashed stage and end with a dim explainer line, so that shell is
// factored out once instead of copy-pasted 23 times.

export function Box({ children, active, dim, color, style, ...props }) {
  return (
    <motion.div
      layout
      className="mono"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: dim ? 0.4 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{
        padding: '10px 16px',
        borderRadius: 10,
        background: 'var(--panel-2)',
        border: `2px solid ${active ? color ?? 'var(--accent)' : 'var(--border)'}`,
        color: active ? color ?? 'var(--accent)' : 'var(--text)',
        fontSize: 13,
        textAlign: 'center',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function Arrow({ active, label, vertical }) {
  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 4, color: active ? 'var(--accent)' : 'var(--text-dim)', fontSize: 16, transition: 'color 0.2s' }}>
      {label && <span style={{ fontSize: 10 }}>{label}</span>}
      <span>{vertical ? '↓' : '→'}</span>
    </div>
  )
}

export function Stage({ children, row = false }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: row ? 'row' : 'column',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        minHeight: 200,
        border: '1px dashed var(--border)',
        borderRadius: 12,
        padding: 20,
      }}
    >
      {children}
    </div>
  )
}

export function Note({ children }) {
  return <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>{children}</p>
}
