import { useState } from 'react'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playTick, playSuccess } from '../../lib/sound.js'

const RECIPES = {
  tea: ['boilWater()', 'steep(tea bag)', 'pourInCup()', 'addLemon()'],
  coffee: ['boilWater()', 'brew(grounds)', 'pourInCup()', 'addSugarAndMilk()'],
}

export default function TemplateMethod() {
  const [drink, setDrink] = useState(null)
  const [step, setStep] = useState(-1)

  const brew = (d) => {
    setDrink(d)
    setStep(-1)
    playClick()
    RECIPES[d].forEach((_, i) => {
      setTimeout(() => {
        setStep(i)
        if (i === RECIPES[d].length - 1) playSuccess()
        else playTick()
      }, (i + 1) * 400)
    })
  }

  const steps = drink ? RECIPES[drink] : RECIPES.tea

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn" onClick={() => brew('tea')}>new Tea().prepare()</button>
        <button className="btn" onClick={() => brew('coffee')}>new Coffee().prepare()</button>
      </div>
      <Stage>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((s, i) => {
            const isHook = i === 1 || i === 3
            const active = drink && i <= step
            return (
              <Box key={s} active={active} color={active ? (isHook ? 'var(--accent-2)' : 'var(--good)') : undefined} style={{ fontSize: 12 }}>
                {s} {isHook && <span style={{ fontSize: 10, color: 'var(--text-dim)' }}> (overridden per subclass)</span>}
              </Box>
            )
          })}
        </div>
      </Stage>
      <Note>
        `prepare()` is defined once, on the base class, and always runs these four steps in this order
        — but two of the steps are hooks each subclass fills in differently. The skeleton never changes;
        only the customizable steps do.
      </Note>
    </div>
  )
}
