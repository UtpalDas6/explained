import { useState } from 'react'
import { Box, Arrow, Stage, Note } from '../patterns/shared.jsx'
import { playClick, playError, playSuccess } from '../../lib/sound.js'

export default function InterfaceSegregation() {
  const [fat, setFat] = useState(true)
  const [status, setStatus] = useState(null)

  const toggle = (v) => {
    setFat(v)
    setStatus(null)
    playClick()
  }

  const feedRobot = () => {
    if (fat) {
      setStatus('error')
      playError()
    } else {
      setStatus('skipped')
      playSuccess()
    }
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${fat ? 'primary' : ''}`} onClick={() => toggle(true)}>Worker { '{ work(), eat() }' }</button>
        <button className={`btn ${!fat ? 'primary' : ''}`} onClick={() => toggle(false)}>Workable + Feedable</button>
        <button className="btn" onClick={feedRobot}>robot.eat()</button>
      </div>
      <Stage row>
        <Box active color="var(--good)">Human — implements {fat ? 'work() + eat()' : 'Workable + Feedable'}</Box>
        <Box
          active
          color={status === 'error' ? 'var(--bad)' : status === 'skipped' ? 'var(--good)' : undefined}
        >
          Robot — implements {fat ? 'work() + eat()' : 'Workable only'}
          {status === 'error' && <><br /><span style={{ fontSize: 10 }}>throw new Error('not implemented')</span></>}
          {status === 'skipped' && <><br /><span style={{ fontSize: 10 }}>no eat() to call</span></>}
        </Box>
      </Stage>
      <Note>
        {fat
          ? "Every Worker must implement eat(), so Robot is stuck with a method that makes no sense for it — either a dead stub or a runtime error the moment something calls it."
          : 'Robot only implements Workable — there is no eat() to call, and nothing forces it to fake one just to satisfy an interface it never needed.'}
      </Note>
    </div>
  )
}
