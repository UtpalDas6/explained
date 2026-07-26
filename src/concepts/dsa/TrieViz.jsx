import { useMemo, useState } from 'react'
import { playClick, playSuccess, playError, playWhoosh } from '../../lib/sound.js'

const WORDS = ['cat', 'car', 'cart', 'dog', 'do']

function cloneNode(node) {
  return {
    path: node.path,
    isEnd: node.isEnd,
    children: Object.fromEntries(Object.entries(node.children).map(([k, v]) => [k, cloneNode(v)])),
  }
}

function insert(root, word) {
  const newRoot = cloneNode(root)
  let node = newRoot
  let path = ''
  for (const ch of word) {
    path += ch
    if (!node.children[ch]) node.children[ch] = { path, isEnd: false, children: {} }
    node = node.children[ch]
  }
  node.isEnd = true
  return newRoot
}

function buildStages(words) {
  let root = { path: '', isEnd: false, children: {} }
  const stages = [root]
  for (const w of words) {
    root = insert(root, w)
    stages.push(root)
  }
  return stages
}

function layout(root) {
  const posX = new Map()
  let counter = 0
  function computeX(node) {
    const keys = Object.keys(node.children).sort()
    if (!keys.length) {
      posX.set(node.path, counter)
      counter += 1
      return posX.get(node.path)
    }
    const xs = keys.map((k) => computeX(node.children[k]))
    const x = xs.reduce((a, b) => a + b, 0) / xs.length
    posX.set(node.path, x)
    return x
  }
  computeX(root)
  const nodes = []
  const edges = []
  function collect(node, depth, label) {
    nodes.push({ path: node.path, label, x: posX.get(node.path), y: depth, isEnd: node.isEnd })
    for (const k of Object.keys(node.children).sort()) {
      const child = node.children[k]
      edges.push({ x1: posX.get(node.path), y1: depth, x2: posX.get(child.path), y2: depth + 1, char: k })
      collect(child, depth + 1, k)
    }
  }
  collect(root, 0, '•')
  return { nodes, edges }
}

const STEP_X = 56
const STEP_Y = 64

function Tree({ nodes, edges, activePaths = [] }) {
  const width = (Math.max(...nodes.map((n) => n.x)) + 1) * STEP_X + 40
  const height = (Math.max(...nodes.map((n) => n.y)) + 1) * STEP_Y + 40
  const px = (x) => x * STEP_X + 30
  const py = (y) => y * STEP_Y + 30
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {edges.map((e) => (
        <g key={`${e.x1}-${e.y1}-${e.char}`}>
          <line x1={px(e.x1)} y1={py(e.y1)} x2={px(e.x2)} y2={py(e.y2)} stroke="var(--border)" strokeWidth="2" />
          <text x={(px(e.x1) + px(e.x2)) / 2} y={(py(e.y1) + py(e.y2)) / 2 - 4} textAnchor="middle" fontSize="11" className="mono" fill="var(--accent-2)">{e.char}</text>
        </g>
      ))}
      {nodes.map((n) => {
        const active = activePaths.includes(n.path)
        return (
          <g key={n.path || 'root'} transform={`translate(${px(n.x)},${py(n.y)})`}>
            <circle
              r="14"
              fill={active ? (n.isEnd ? 'rgba(74,222,128,0.2)' : 'rgba(110,231,255,0.15)') : n.isEnd ? 'rgba(167,139,250,0.12)' : 'var(--panel-2)'}
              stroke={active ? (n.isEnd ? 'var(--good)' : 'var(--accent)') : n.isEnd ? 'var(--accent-2)' : 'var(--border)'}
              strokeWidth="2"
            />
            <text textAnchor="middle" dy="4" fontSize="11" className="mono" fill="var(--text)">{n.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function InsertDemo() {
  const stages = useMemo(() => buildStages(WORDS), [])
  const [stepIdx, setStepIdx] = useState(0)
  const atEnd = stepIdx >= stages.length - 1
  const { nodes, edges } = useMemo(() => layout(stages[stepIdx]), [stages, stepIdx])
  const activePaths = useMemo(() => {
    if (stepIdx === 0) return []
    const word = WORDS[stepIdx - 1]
    const paths = ['']
    let p = ''
    for (const ch of word) {
      p += ch
      paths.push(p)
    }
    return paths
  }, [stepIdx])

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  return (
    <div>
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={atEnd}>
          {atEnd ? 'Done' : `Insert "${WORDS[stepIdx]}"`}
        </button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
      <Tree nodes={nodes} edges={edges} activePaths={activePaths} />
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Each word walks down from the root one character at a time, creating nodes only where the path doesn't already exist. Shared prefixes ("cat"/"car"/"cart", "dog"/"do") reuse the same nodes — that sharing is the whole point of a trie.
      </p>
    </div>
  )
}

function SearchDemo() {
  const fullTrie = useMemo(() => {
    let root = { path: '', isEnd: false, children: {} }
    for (const w of WORDS) root = insert(root, w)
    return root
  }, [])
  const { nodes, edges } = useMemo(() => layout(fullTrie), [fullTrie])
  const [query, setQuery] = useState('cart')
  const [stepIdx, setStepIdx] = useState(0)

  const result = useMemo(() => {
    const paths = ['']
    let node = fullTrie
    let p = ''
    let matched = true
    for (const ch of query) {
      if (!node.children[ch]) {
        matched = false
        break
      }
      node = node.children[ch]
      p += ch
      paths.push(p)
    }
    return { paths, matched, isWord: matched && node.isEnd }
  }, [fullTrie, query])

  const atEnd = stepIdx >= result.paths.length - 1
  const visited = result.paths.slice(0, stepIdx + 1)

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    if (stepIdx + 2 === result.paths.length) {
      if (result.matched) playSuccess()
      else playError()
    } else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  return (
    <div>
      <div className="controls">
        <input
          className="mono"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', width: 120 }}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toLowerCase())
            setStepIdx(0)
          }}
        />
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
      <Tree nodes={nodes} edges={edges} activePaths={visited} />
      <p style={{ color: atEnd ? (result.matched ? (result.isWord ? 'var(--good)' : 'var(--accent)') : 'var(--bad)') : 'var(--text-dim)', fontSize: 13, marginTop: 8 }}>
        {atEnd
          ? result.matched
            ? result.isWord
              ? `"${query}" is a complete word in the trie.`
              : `"${query}" is a valid prefix, but not itself an inserted word.`
            : `"${query}" isn't a prefix of anything in the trie — path breaks at "${visited[visited.length - 1]}".`
          : `walking to "${visited[visited.length - 1]}"…`}
      </p>
    </div>
  )
}

export default function TrieViz() {
  const [tab, setTab] = useState('insert')
  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${tab === 'insert' ? 'primary' : ''}`} onClick={() => setTab('insert')}>Insert</button>
        <button className={`btn ${tab === 'search' ? 'primary' : ''}`} onClick={() => setTab('search')}>Search / Prefix</button>
      </div>
      {tab === 'insert' ? <InsertDemo /> : <SearchDemo />}
    </div>
  )
}
