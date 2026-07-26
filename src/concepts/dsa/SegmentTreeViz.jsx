import { useMemo, useState } from 'react'
import { playClick, playSuccess, playWhoosh } from '../../lib/sound.js'

const ARRAY = [2, 4, 5, 7, 8, 9, 1, 3]

function buildTree(arr, lo, hi, nodes, depth, counter) {
  const id = `${lo}:${hi}`
  if (lo === hi) {
    const x = counter.n++
    const node = { id, lo, hi, x, y: depth, sum: arr[lo], leaf: true }
    nodes.push(node)
    return node
  }
  const mid = (lo + hi) >> 1
  const left = buildTree(arr, lo, mid, nodes, depth + 1, counter)
  const right = buildTree(arr, mid + 1, hi, nodes, depth + 1, counter)
  const node = { id, lo, hi, x: (left.x + right.x) / 2, y: depth, sum: left.sum + right.sum, leaf: false, leftId: left.id, rightId: right.id }
  nodes.push(node)
  return node
}

function queryPath(nodesMap, rootId, ql, qr) {
  const path = []
  function walk(id) {
    const node = nodesMap[id]
    path.push(id)
    if (qr < node.lo || node.hi < ql) return 0
    if (ql <= node.lo && node.hi <= qr) return node.sum
    return walk(node.leftId) + walk(node.rightId)
  }
  const total = walk(rootId)
  return { path, total }
}

const STEP_X = 44
const STEP_Y = 64

export default function SegmentTreeViz() {
  const { nodes, nodesMap, rootId } = useMemo(() => {
    const nodeList = []
    const root = buildTree(ARRAY, 0, ARRAY.length - 1, nodeList, 0, { n: 0 })
    const map = Object.fromEntries(nodeList.map((n) => [n.id, n]))
    return { nodes: nodeList, nodesMap: map, rootId: root.id }
  }, [])

  const [ql, setQl] = useState(2)
  const [qr, setQr] = useState(5)
  const result = useMemo(() => queryPath(nodesMap, rootId, ql, qr), [nodesMap, rootId, ql, qr])
  const [stepIdx, setStepIdx] = useState(0)
  const atEnd = stepIdx >= result.path.length - 1
  const visited = result.path.slice(0, stepIdx + 1)

  const next = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    if (stepIdx + 2 === result.path.length) playSuccess()
    else playClick()
  }
  const reset = () => {
    setStepIdx(0)
    playWhoosh()
  }
  const setRange = (a, b) => {
    setQl(a)
    setQr(b)
    setStepIdx(0)
  }

  const width = (Math.max(...nodes.map((n) => n.x)) + 1) * STEP_X + 40
  const height = (Math.max(...nodes.map((n) => n.y)) + 1) * STEP_Y + 40
  const px = (x) => x * STEP_X + 30
  const py = (y) => y * STEP_Y + 24

  return (
    <div className="panel">
      <div className="controls">
        <span style={{ fontSize: 13, color: 'var(--text-dim)', alignSelf: 'center' }}>range sum query [{ql}..{qr}]:</span>
        {[[0, 2], [2, 5], [1, 6], [0, 7]].map(([a, b]) => (
          <button key={`${a}-${b}`} className={`btn ${ql === a && qr === b ? 'primary' : ''}`} onClick={() => setRange(a, b)}>[{a}..{b}]</button>
        ))}
        <button className="btn primary" onClick={next} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '8px 0 16px' }}>
        {ARRAY.map((v, i) => (
          <div
            key={i}
            className="mono"
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: 13,
              background: i >= ql && i <= qr ? 'rgba(74,222,128,0.12)' : 'var(--panel-2)',
              border: `2px solid ${i >= ql && i <= qr ? 'var(--good)' : 'var(--border)'}`,
            }}
          >
            {v}
          </div>
        ))}
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {nodes.map((n) => {
          if (n.leaf) return null
          const left = nodesMap[n.leftId]
          const right = nodesMap[n.rightId]
          return (
            <g key={`${n.id}-edges`}>
              <line x1={px(n.x)} y1={py(n.y)} x2={px(left.x)} y2={py(left.y)} stroke="var(--border)" strokeWidth="2" />
              <line x1={px(n.x)} y1={py(n.y)} x2={px(right.x)} y2={py(right.y)} stroke="var(--border)" strokeWidth="2" />
            </g>
          )
        })}
        {nodes.map((n) => {
          const active = visited.includes(n.id)
          return (
            <g key={n.id} transform={`translate(${px(n.x)},${py(n.y)})`}>
              <rect x={-20} y={-14} width="40" height="28" rx="6" fill={active ? 'rgba(110,231,255,0.15)' : 'var(--panel-2)'} stroke={active ? 'var(--accent)' : 'var(--border)'} strokeWidth="2" />
              <text textAnchor="middle" dy="-1" fontSize="11" className="mono" fill="var(--text)">{n.sum}</text>
              <text textAnchor="middle" dy="11" fontSize="8" className="mono" fill="var(--text-dim)">{n.lo}-{n.hi}</text>
            </g>
          )
        })}
      </svg>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 8 }}>
        {atEnd
          ? `sum(${ql}..${qr}) = ${result.total}, touching only ${result.path.length} of ${nodes.length} nodes.`
          : `visiting node [${nodesMap[visited[visited.length - 1]].lo}-${nodesMap[visited[visited.length - 1]].hi}]…`}
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        Each node caches the sum of its range, so a query only descends into nodes that partially overlap the query range and returns cached sums for nodes fully inside it — O(log n) instead of summing the array directly. A point update walks the same O(log n) path back up, refreshing cached sums.
      </p>
    </div>
  )
}
