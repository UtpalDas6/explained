import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick, playTick, playSuccess } from '../../lib/sound.js'

const CHAIN = [
  { role: 'Manager', limit: 100 },
  { role: 'Director', limit: 1000 },
  { role: 'VP', limit: 10000 },
]

const AMOUNTS = [50, 500, 5000]

export default function ChainOfResponsibility() {
  const [amount, setAmount] = useState(null)
  const [checking, setChecking] = useState(-1)
  const [approver, setApprover] = useState(null)

  const submit = (amt) => {
    setAmount(amt)
    setApprover(null)
    setChecking(-1)
    playClick()
    CHAIN.forEach((h, i) => {
      setTimeout(() => {
        setChecking(i)
        if (amt <= h.limit) {
          setApprover(h.role)
          playSuccess()
        } else if (i < CHAIN.length) {
          playTick()
        }
      }, (i + 1) * 500)
    })
  }

  return (
    <div className="panel">
      <div className="controls">
        {AMOUNTS.map((a) => (
          <button key={a} className="btn" onClick={() => submit(a)}>request(${a})</button>
        ))}
      </div>
      <Stage row>
        {CHAIN.map((h, i) => {
          const isChecking = checking === i && !approver
          const isApprover = approver === h.role
          const passed = checking > i || (checking === i && amount > h.limit)
          return (
            <div key={h.role} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Box active={isChecking || isApprover || passed} color={isApprover ? 'var(--good)' : passed ? 'var(--text-dim)' : undefined}>
                {h.role}<br /><span style={{ fontSize: 10 }}>≤ ${h.limit}</span>
              </Box>
              {i < CHAIN.length - 1 && <Arrow active={passed} label="next" />}
            </div>
          )
        })}
      </Stage>
      <Note>
        {amount != null && `Requesting $${amount}. `}
        Each handler only checks "can I approve this?" — if not, it passes the same request to the next
        link without the caller ever knowing how many handlers exist or which one finally deals with it.
      </Note>
    </div>
  )
}
