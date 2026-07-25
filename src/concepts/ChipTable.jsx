import { motion } from 'framer-motion'

export const chipStyle = {
  background: 'var(--panel-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontFamily: 'ui-monospace, monospace',
  color: 'var(--text)',
  whiteSpace: 'nowrap',
}

// A chip that shares a layoutId across renders, so moving it between different
// TableBox parents animates as a single element sliding over rather than a fade.
export function Chip({ id, children }) {
  return (
    <motion.div
      layoutId={`chip-${id}`}
      layout
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      style={chipStyle}
    >
      {children ?? id}
    </motion.div>
  )
}

export function TableBox({ title, color, children }) {
  return (
    <motion.div layout className="panel" style={{ padding: 16, minWidth: 220 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </motion.div>
  )
}
