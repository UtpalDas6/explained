import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Box, Stage, Note } from './shared.jsx'
import { playClick, playPop } from '../../lib/sound.js'

let nextId = 1

function makeFile() {
  return { id: nextId++, size: 1 + Math.floor(Math.random() * 9) }
}

function totalSize(files) {
  return files.reduce((sum, f) => sum + f.size, 0)
}

export default function Composite() {
  const [folderA, setFolderA] = useState([makeFile(), makeFile()])
  const [folderB, setFolderB] = useState([makeFile()])

  const addTo = (setter) => {
    setter((files) => [...files, makeFile()])
    playClick()
  }

  const clear = () => {
    setFolderA([])
    setFolderB([])
    playPop()
  }

  const grandTotal = totalSize(folderA) + totalSize(folderB)

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn" onClick={() => addTo(setFolderA)}>+ file in Folder A</button>
        <button className="btn" onClick={() => addTo(setFolderB)}>+ file in Folder B</button>
        <button className="btn" onClick={clear}>Empty root</button>
      </div>
      <Stage row>
        {[{ label: 'Folder A', files: folderA }, { label: 'Folder B', files: folderB }].map(({ label, files }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <Box active color="var(--accent-2)">{label} ({totalSize(files)}kb)</Box>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', minWidth: 80 }}>
              <AnimatePresence>
                {files.map((f) => (
                  <Box key={f.id} style={{ fontSize: 11, padding: '4px 8px' }}>{f.size}kb</Box>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
        <Box active color="var(--good)">root.getSize() = {grandTotal}kb</Box>
      </Stage>
      <Note>
        A folder and a file both answer `getSize()` — a folder just sums its children's answers,
        recursively, so client code can call the same method on a single file or an entire tree without
        caring which one it's holding.
      </Note>
    </div>
  )
}
