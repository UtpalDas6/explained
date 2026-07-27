import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick } from '../../lib/sound.js'

const CART = [40, 15, 25]
const STRATEGIES = {
  card: { label: 'CreditCardStrategy', fee: (t) => (t * 0.029 + 0.3).toFixed(2) },
  paypal: { label: 'PayPalStrategy', fee: (t) => (t * 0.034).toFixed(2) },
  crypto: { label: 'CryptoStrategy', fee: () => '0.00' },
}

export default function Strategy() {
  const [key, setKey] = useState('card')
  const subtotal = CART.reduce((a, b) => a + b, 0)
  const strategy = STRATEGIES[key]

  const pick = (k) => {
    setKey(k)
    playClick()
  }

  return (
    <div className="panel">
      <div className="controls">
        {Object.entries(STRATEGIES).map(([k, s]) => (
          <button key={k} className={`btn ${key === k ? 'primary' : ''}`} onClick={() => pick(k)}>{s.label}</button>
        ))}
      </div>
      <Stage row>
        <Box active>Checkout — ${subtotal}</Box>
        <Arrow active label="pay(strategy)" />
        <Box active color="var(--accent-2)">{strategy.label}</Box>
        <Arrow active />
        <Box active color="var(--good)">fee ${strategy.fee(subtotal)}</Box>
      </Stage>
      <Note>
        Checkout always calls the same `strategy.fee(total)` — swapping which strategy object is
        plugged in changes the fee calculation entirely without touching a single line of Checkout's
        own code, unlike an `if/else` chain over payment types living inside it.
      </Note>
    </div>
  )
}
