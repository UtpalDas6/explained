import { useMemo, useState } from 'react'
import { playClick, playSuccess, playError, playWhoosh } from '../../lib/sound.js'

const INSERT_ORDER = [8, 3, 10, 1, 6, 14, 4, 7, 13]

function insert(root, val) {
  if (!root) return { val, left: null, right: null }
  if (val < root.val) return { ...root, left: insert(root.left, val) }
  if (val > root.val) return { ...root, right: insert(root.right, val) }
  return root
}

function buildStages(order) {
  const stages = [null]
  let root = null
  for (const v of order) {
    root = insert(root, v)
    stages.push(root)
  }
  return stages
}

// x by in-order position (keeps a BST's left-less-than-right shape readable),
// y by depth.
function layout(root) {
  let counter = 0
  function place(node, depth) {
    if (!node) return
    place(node.left, depth + 1)
    node.x = counter++
    node.y = depth
    place(node.right, depth + 1)
  }
  place(root, 0)
  const flat = []
  const edgeList = []
  function collect(node) {
    if (!node) return
    flat.push({ val: node.val, x: node.x, y: node.y })
    if (node.left) edgeList.push({ x1: node.x, y1: node.y, x2: node.left.x, y2: node.left.y })
    if (node.right) edgeList.push({ x1: node.x, y1: node.y, x2: node.right.x, y2: node.right.y })
    collect(node.left)
    collect(node.right)
  }
  collect(root)
  return { nodes: flat, edges: edgeList }
}

function searchPath(root, target) {
  const path = []
  let node = root
  while (node) {
    path.push(node.val)
    if (target === node.val) return { path, found: true }
    node = target < node.val ? node.left : node.right
  }
  return { path, found: false }
}

const STEP_X = 64
const STEP_Y = 70

function Tree({ nodes, edges, activeVals = [], targetVal }) {
  if (!nodes.length) return <p style={{ color: 'var(--text-dim)', fontSize: 13, padding: 20 }}>empty tree</p>
  const width = nodes.length * STEP_X + 40
  const height = (Math.max(...nodes.map((n) => n.y)) + 1) * STEP_Y + 40
  const px = (x) => x * STEP_X + 40
  const py = (y) => y * STEP_Y + 30
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {edges.map((e, i) => (
        <line key={i} x1={px(e.x1)} y1={py(e.y1)} x2={px(e.x2)} y2={py(e.y2)} stroke="var(--border)" strokeWidth="2" />
      ))}
      {nodes.map((n) => {
        const active = activeVals.includes(n.val)
        const isTarget = n.val === targetVal
        return (
          <g key={n.val} transform={`translate(${px(n.x)},${py(n.y)})`}>
            <circle
              r="18"
              fill={isTarget ? 'rgba(74,222,128,0.15)' : active ? 'rgba(110,231,255,0.15)' : 'var(--panel-2)'}
              stroke={isTarget ? 'var(--good)' : active ? 'var(--accent)' : 'var(--border)'}
              strokeWidth="2"
            />
            <text textAnchor="middle" dy="5" fontSize="13" className="mono" fill="var(--text)">
              {n.val}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function InsertDemo() {
  const stages = useMemo(() => buildStages(INSERT_ORDER), [])
  const [stepIdx, setStepIdx] = useState(0)
  const atEnd = stepIdx >= stages.length - 1
  const { nodes, edges } = useMemo(() => layout(stages[stepIdx]), [stages, stepIdx])

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
          {atEnd ? 'Done' : `Insert ${INSERT_ORDER[stepIdx]}`}
        </button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
      <Tree nodes={nodes} edges={edges} activeVals={stepIdx > 0 ? [INSERT_ORDER[stepIdx - 1]] : []} />
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Each insert compares against the root and recurses left or right — O(h) where h is tree height. A balanced tree keeps h at O(log n); an adversarial insert order can degrade it to O(n) (a linked list), which is why AVL/red-black trees rebalance.
      </p>
    </div>
  )
}

function SearchDemo() {
  const fullTree = useMemo(() => {
    let root = null
    for (const v of INSERT_ORDER) root = insert(root, v)
    return root
  }, [])
  const { nodes, edges } = useMemo(() => layout(fullTree), [fullTree])
  const [target, setTarget] = useState(7)
  const [stepIdx, setStepIdx] = useState(0)
  const result = useMemo(() => searchPath(fullTree, target), [fullTree, target])
  const atEnd = stepIdx >= result.path.length - 1

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    if (stepIdx + 1 === result.path.length - 1) {
      if (result.found) playSuccess()
      else playError()
    } else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  const visited = result.path.slice(0, stepIdx + 1)

  return (
    <div>
      <div className="controls">
        <input
          type="number"
          className="mono"
          style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', width: 100 }}
          value={target}
          onChange={(e) => {
            setTarget(Number(e.target.value))
            setStepIdx(0)
          }}
        />
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
      <Tree nodes={nodes} edges={edges} activeVals={visited} targetVal={stepIdx === result.path.length - 1 && result.found ? target : undefined} />
      <p style={{ color: atEnd ? (result.found ? 'var(--good)' : 'var(--bad)') : 'var(--text-dim)', fontSize: 13, marginTop: 8 }}>
        {atEnd
          ? result.found
            ? `Found ${target} after ${result.path.length} comparisons.`
            : `${target} not in tree — reached a null child after ${result.path.length} comparisons.`
          : `Comparing against ${visited[visited.length - 1]}…`}
      </p>
    </div>
  )
}

export default function BstViz() {
  const [tab, setTab] = useState('insert')
  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${tab === 'insert' ? 'primary' : ''}`} onClick={() => setTab('insert')}>Insert</button>
        <button className={`btn ${tab === 'search' ? 'primary' : ''}`} onClick={() => setTab('search')}>Search</button>
      </div>
      {tab === 'insert' ? <InsertDemo /> : <SearchDemo />}
    </div>
  )
}
