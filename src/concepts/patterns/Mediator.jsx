import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playSuccess } from '../../lib/sound.js'

const USERS = ['Alice', 'Bob', 'Cara']

export default function Mediator() {
  const [sender, setSender] = useState(null)
  const [delivered, setDelivered] = useState([])

  const send = (from) => {
    setSender(from)
    playClick()
    setTimeout(() => {
      setDelivered(USERS.filter((u) => u !== from))
      playSuccess()
    }, 500)
    setTimeout(() => {
      setSender(null)
      setDelivered([])
    }, 1400)
  }

  return (
    <div className="panel">
      <div className="controls">
        {USERS.map((u) => (
          <button key={u} className="btn" onClick={() => send(u)} disabled={!!sender}>{u}.send("hi")</button>
        ))}
      </div>
      <Stage row>
        {USERS.map((u) => (
          <Box key={u} active={u === sender || delivered.includes(u)} color={u === sender ? 'var(--accent)' : delivered.includes(u) ? 'var(--good)' : undefined}>
            {u}
          </Box>
        ))}
      </Stage>
      <div style={{ textAlign: 'center', marginTop: -4 }}>
        <AnimatePresence>
          {sender && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              ChatRoomMediator ↔ routing {sender}'s message to everyone else
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Note>
        No user object holds a reference to any other user — every send goes through the mediator,
        which knows the full member list. Adding a fourth user means teaching the mediator about them,
        not rewiring three existing users' direct connections.
      </Note>
    </div>
  )
}
