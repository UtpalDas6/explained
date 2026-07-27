import { useState } from 'react'
import { Box, Arrow, Stage, Note } from './shared.jsx'
import { playClick, playSuccess } from '../../lib/sound.js'

const EXPRESSIONS = [
  { text: '3 + 4', left: 3, op: '+', right: 4, result: 7 },
  { text: '10 - 6', left: 10, op: '-', right: 6, result: 4 },
  { text: '2 + 9', left: 2, op: '+', right: 9, result: 11 },
]

export default function Interpreter() {
  const [expr, setExpr] = useState(null)

  const interpret = (e) => {
    setExpr(e)
    playClick()
    setTimeout(playSuccess, 500)
  }

  return (
    <div className="panel">
      <div className="controls">
        {EXPRESSIONS.map((e) => (
          <button key={e.text} className="btn" onClick={() => interpret(e)}>parse("{e.text}")</button>
        ))}
      </div>
      <Stage row>
        {expr ? (
          <>
            <Box active>NumberExpr({expr.left})</Box>
            <Box active color="var(--accent-2)">'{expr.op}'</Box>
            <Box active>NumberExpr({expr.right})</Box>
            <Arrow active label="interpret()" />
            <Box active color="var(--good)">{expr.result}</Box>
          </>
        ) : (
          <Box dim>pick an expression to parse</Box>
        )}
      </Stage>
      <Note>
        Each piece of the grammar — a number, an operator — is its own tiny class that knows how to
        `interpret()` itself; the full expression is a small tree of those objects, and evaluating the
        whole thing just means asking the root node to interpret and letting it recurse down.
      </Note>
    </div>
  )
}
