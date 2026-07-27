import { useState } from 'react'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playPop, playSuccess } from '../../lib/sound.js'

const WORDS = [' world', '!', ' — draft']

export default function Memento() {
  const [text, setText] = useState('Hello')
  const [history, setHistory] = useState([])

  const type = () => {
    const addition = WORDS[history.length % WORDS.length]
    setHistory((h) => [...h, text])
    setText((t) => t + addition)
    playClick()
  }

  const save = () => {
    setHistory((h) => [...h, text])
    playSuccess()
  }

  const undo = () => {
    if (!history.length) return
    setText(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    playPop()
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn" onClick={type}>editor.type()</button>
        <button className="btn" onClick={save}>history.save(editor.snapshot())</button>
        <button className="btn primary" onClick={undo} disabled={!history.length}>history.undo()</button>
      </div>
      <Stage>
        <Box active style={{ minWidth: 220 }}>"{text}"</Box>
        <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
          {history.length} snapshot{history.length === 1 ? '' : 's'} saved in the caretaker's history stack
        </div>
      </Stage>
      <Note>
        A memento is an opaque snapshot of the editor's internal state — the history/caretaker stores
        it without ever reading or understanding it, and only the editor itself knows how to restore
        from one. That's what keeps undo from leaking the editor's internals into the history stack.
      </Note>
    </div>
  )
}
