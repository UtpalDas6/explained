import { useState } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import { Chip, TableBox, chipStyle } from './ChipTable.jsx'

const CORE_COLS = ['id', 'name', 'email']
const PROFILE_COLS = ['bio', 'last_login', 'avatar_url', 'preferences']
const WIDE_COLS = [...CORE_COLS, ...PROFILE_COLS]

export default function VerticalPartitioning() {
  const [split, setSplit] = useState(false)

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={() => setSplit((s) => !s)}>
          {split ? 'Merge back' : 'Split table'}
        </button>
      </div>

      <LayoutGroup>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', padding: '20px 0', flexWrap: 'wrap' }}>
          {!split && (
            <TableBox title="users (wide table)" color="var(--accent-2)">
              {WIDE_COLS.map((c) => <Chip key={c} id={c} />)}
            </TableBox>
          )}
          {split && (
            <>
              <TableBox title="users_core" color="var(--accent)">
                {CORE_COLS.map((c) => <Chip key={c} id={c} />)}
              </TableBox>
              <TableBox title="users_profile" color="var(--good)">
                <motion.div
                  key="user_id"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{ ...chipStyle, border: '1px dashed var(--good)', color: 'var(--good)' }}
                >
                  user_id (FK)
                </motion.div>
                {PROFILE_COLS.map((c) => <Chip key={c} id={c} />)}
              </TableBox>
            </>
          )}
        </div>
      </LayoutGroup>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
        Rarely-used or heavy columns (bio, avatar, preferences) move into their own table, joined back by a foreign key —
        the hot columns (id, name, email) stay small and cache-friendly.
      </p>
    </div>
  )
}
