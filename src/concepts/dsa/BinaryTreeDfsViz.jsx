import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const TREE = {
  id: 'a', val: 1,
  left: {
    id: 'b', val: 2,
    left: { id: 'd', val: 4, left: null, right: null },
    right: { id: 'e', val: 5, left: null, right: null },
  },
  right: {
    id: 'c', val: 3,
    left: null,
    right: { id: 'f', val: 6, left: null, right: null },
  },
}

// Post-order DFS: a node's height depends on both children's heights, so
// children must be fully visited (and their steps recorded) before the parent.
function computeSteps(root) {
  const steps = []
  let bestDiameter = 0

  function walk(node) {
    if (!node) return 0
    const leftHeight = walk(node.left)
    const rightHeight = walk(node.right)
    const diameterHere = leftHeight + rightHeight
    bestDiameter = Math.max(bestDiameter, diameterHere)
    const height = Math.max(leftHeight, rightHeight) + 1
    steps.push({ id: node.id, val: node.val, leftHeight, rightHeight, diameterHere, height, bestSoFar: bestDiameter })
    return height
  }
  walk(root)
  return steps
}

function layout(root) {
  let counter = 0
  const pos = {}
  function place(node, depth) {
    if (!node) return
    place(node.left, depth + 1)
    pos[node.id] = { x: counter++, y: depth }
    place(node.right, depth + 1)
  }
  place(root, 0)
  const nodes = []
  const edges = []
  function collect(node) {
    if (!node) return
    nodes.push({ id: node.id, val: node.val, ...pos[node.id] })
    if (node.left) edges.push({ x1: pos[node.id].x, y1: pos[node.id].y, x2: pos[node.left.id].x, y2: pos[node.left.id].y })
    if (node.right) edges.push({ x1: pos[node.id].x, y1: pos[node.id].y, x2: pos[node.right.id].x, y2: pos[node.right.id].y })
    collect(node.left)
    collect(node.right)
  }
  collect(root)
  return { nodes, edges }
}

const STEP_X = 64
const STEP_Y = 70

export default function BinaryTreeDfsViz() {
  const steps = useMemo(() => computeSteps(TREE), [])
  const { nodes, edges } = useMemo(() => layout(TREE), [])
  const [stepIdx, setStepIdx] = useState(0)
  const atEnd = stepIdx >= steps.length - 1
  const visited = steps.slice(0, stepIdx + 1)
  const visitedIds = new Set(visited.map((s) => s.id))
  const current = steps[stepIdx]

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    if (stepIdx + 2 === steps.length) playSuccess()
    else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }

  const width = (Math.max(...nodes.map((n) => n.x)) + 1) * STEP_X + 40
  const height = (Math.max(...nodes.map((n) => n.y)) + 1) * STEP_Y + 40
  const px = (x) => x * STEP_X + 30
  const py = (y) => y * STEP_Y + 24

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {edges.map((e, i) => (
          <line key={i} x1={px(e.x1)} y1={py(e.y1)} x2={px(e.x2)} y2={py(e.y2)} stroke="var(--border)" strokeWidth="2" />
        ))}
        {nodes.map((n) => {
          const isCurrent = n.id === current.id
          const isVisited = visitedIds.has(n.id)
          return (
            <g key={n.id} transform={`translate(${px(n.x)},${py(n.y)})`}>
              <circle r="18" fill={isCurrent ? 'rgba(74,222,128,0.2)' : isVisited ? 'rgba(110,231,255,0.15)' : 'var(--panel-2)'} stroke={isCurrent ? 'var(--good)' : isVisited ? 'var(--accent)' : 'var(--border)'} strokeWidth="2" />
              <text textAnchor="middle" dy="5" fontSize="13" className="mono" fill="var(--text)">{n.val}</text>
            </g>
          )
        })}
      </svg>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 8 }}>
        node {current.val}: height(left)={current.leftHeight}, height(right)={current.rightHeight} → diameter through here = {current.diameterHere}, best so far = {current.bestSoFar}. Returns height {current.height} to its parent.
      </p>
      {atEnd && <p style={{ color: 'var(--good)', fontSize: 13, marginTop: 4 }}>Diameter of the tree = {current.bestSoFar} edges</p>}
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Post-order DFS: a node can't know its own height until both children report theirs, so children are fully processed first. The longest path through any node is free once you have both subtree heights — no need for a separate O(n) pass per node.
      </p>
    </div>
  )
}
