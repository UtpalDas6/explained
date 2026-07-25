import { useState } from 'react'
import { LayoutGroup } from 'framer-motion'
import { Chip, TableBox } from './ChipTable.jsx'
import { playWhoosh } from '../lib/sound.js'

const GROUPS = [
  { title: 'users_db', color: 'var(--accent)', tables: ['users', 'sessions'] },
  { title: 'products_db', color: 'var(--good)', tables: ['products', 'reviews'] },
  { title: 'orders_db', color: 'var(--accent-2)', tables: ['orders', 'payments'] },
]
const ALL_TABLES = GROUPS.flatMap((g) => g.tables)

export default function Federation() {
  const [split, setSplit] = useState(false)

  return (
    <div className="panel">
      <div className="controls">
        <button
          className="btn primary"
          onClick={() => {
            playWhoosh()
            setSplit((s) => !s)
          }}
        >
          {split ? 'Merge back into one database' : 'Federate by function'}
        </button>
      </div>

      <LayoutGroup>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', padding: '20px 0', flexWrap: 'wrap' }}>
          {!split && (
            <TableBox title="app_db (monolithic)" color="var(--accent-2)">
              {ALL_TABLES.map((t) => <Chip key={t} id={t} />)}
            </TableBox>
          )}
          {split &&
            GROUPS.map((g) => (
              <TableBox key={g.title} title={g.title} color={g.color}>
                {g.tables.map((t) => <Chip key={t} id={t} />)}
              </TableBox>
            ))}
        </div>
      </LayoutGroup>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
        Each database now fits on its own box and can scale independently — but a query that used to join <code>users</code> and <code>orders</code> in one SQL statement now has to fetch from two databases and join at the application layer instead.
      </p>
    </div>
  )
}
