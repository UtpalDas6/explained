import { useState } from 'react'
import { Box, Arrow, Stage, Note } from '../patterns/shared.jsx'
import { playClick } from '../../lib/sound.js'

const GATEWAYS = {
  stripe: 'StripeGateway',
  paypal: 'PayPalGateway',
  mock: 'MockGateway (tests)',
}

export default function DependencyInversion() {
  const [key, setKey] = useState('stripe')

  const pick = (k) => {
    setKey(k)
    playClick()
  }

  return (
    <div className="panel">
      <div className="controls">
        {Object.entries(GATEWAYS).map(([k, label]) => (
          <button key={k} className={`btn ${key === k ? 'primary' : ''}`} onClick={() => pick(k)}>{label}</button>
        ))}
      </div>
      <Stage row>
        <Box active>PaymentService<br /><span style={{ fontSize: 10 }}>(high-level)</span></Box>
        <Arrow active label="depends on" />
        <Box active color="var(--accent-2)">PaymentGateway<br /><span style={{ fontSize: 10 }}>(abstraction)</span></Box>
        <Arrow active label="implemented by" />
        <Box active color="var(--good)">{GATEWAYS[key]}<br /><span style={{ fontSize: 10 }}>(low-level)</span></Box>
      </Stage>
      <Note>
        PaymentService never imports Stripe, PayPal, or a mock directly — it only calls gateway.charge()
        on the abstraction. Swapping which concrete gateway is wired in (including a mock for tests)
        never touches PaymentService's own code.
      </Note>
    </div>
  )
}
