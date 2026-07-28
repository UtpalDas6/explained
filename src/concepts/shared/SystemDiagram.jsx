import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { playClick, playTick, playSuccess } from '../../lib/sound.js'

// Draw.io-style block diagram: nodes grouped into layers (rows, top to
// bottom), connected by measured, clipped SVG lines with arrowheads. A
// "trace the request" control steps through an ordered path, highlighting
// each node and the edge leading into it, with a caption per step — the
// same sequential-reveal interaction ChainOfResponsibility.jsx uses, applied
// to a full multi-node graph instead of a single row.

function clipToBoxEdge(fromCenter, towardCenter, boxSize) {
  const dx = towardCenter.x - fromCenter.x
  const dy = towardCenter.y - fromCenter.y
  if (dx === 0 && dy === 0) return fromCenter
  const halfW = boxSize.width / 2
  const halfH = boxSize.height / 2
  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity
  const scale = Math.min(scaleX, scaleY)
  return { x: fromCenter.x + dx * scale, y: fromCenter.y + dy * scale }
}

export default function SystemDiagram({ nodes, edges, steps, captions, traceLabel, intro }) {
  const containerRef = useRef(null)
  const boxRefs = useRef({})
  const [lines, setLines] = useState([])
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [stepIndex, setStepIndex] = useState(-1)
  const [running, setRunning] = useState(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    function measure() {
      const containerRect = container.getBoundingClientRect()
      const centers = {}
      const sizes = {}
      for (const node of nodes) {
        const el = boxRefs.current[node.id]
        if (!el) continue
        const r = el.getBoundingClientRect()
        centers[node.id] = { x: r.left + r.width / 2 - containerRect.left, y: r.top + r.height / 2 - containerRect.top }
        sizes[node.id] = { width: r.width, height: r.height }
      }
      const measured = edges
        .map((edge) => {
          const c1 = centers[edge.from]
          const c2 = centers[edge.to]
          if (!c1 || !c2) return null
          const p1 = clipToBoxEdge(c1, c2, sizes[edge.from])
          const p2 = clipToBoxEdge(c2, c1, sizes[edge.to])
          return { from: edge.from, to: edge.to, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
        })
        .filter(Boolean)
      setLines(measured)
      setSize({ width: containerRect.width, height: containerRect.height })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [nodes, edges])

  const runTrace = () => {
    if (running) return
    setRunning(true)
    setStepIndex(-1)
    playClick()
    steps.forEach((_, i) => {
      setTimeout(() => {
        setStepIndex(i)
        if (i === steps.length - 1) {
          playSuccess()
          setRunning(false)
        } else {
          playTick()
        }
      }, (i + 1) * 650)
    })
  }

  const reset = () => {
    setStepIndex(-1)
    setRunning(false)
  }

  const visited = new Set(stepIndex >= 0 ? steps.slice(0, stepIndex + 1) : [])
  const currentNode = stepIndex >= 0 ? steps[stepIndex] : null
  const layerNumbers = [...new Set(nodes.map((n) => n.layer))].sort((a, b) => a - b)

  return (
    <div className="panel">
      <div className="controls">
        <button className="btn primary" onClick={runTrace} disabled={running}>
          {traceLabel ?? 'Trace the request'}
        </button>
        {stepIndex >= 0 && !running && (
          <button className="btn" onClick={reset}>Reset</button>
        )}
      </div>
      <div ref={containerRef} className="diagram-canvas">
        <svg className="diagram-lines" width={size.width} height={size.height}>
          <defs>
            <marker id="diagram-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--border)" />
            </marker>
            <marker id="diagram-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--good)" />
            </marker>
          </defs>
          {lines.map((line) => {
            const stepFrom = steps.indexOf(line.from)
            const stepTo = steps.indexOf(line.to)
            const onPath = stepFrom !== -1 && stepTo !== -1
            const traveled = onPath && stepIndex >= Math.max(stepFrom, stepTo)
            return (
              <line
                key={`${line.from}-${line.to}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={traveled ? 'var(--good)' : 'var(--border)'}
                strokeWidth={traveled ? 2.5 : 1.5}
                markerEnd={traveled ? 'url(#diagram-arrow-active)' : 'url(#diagram-arrow)'}
              />
            )
          })}
        </svg>
        {layerNumbers.map((layerNum) => (
          <div key={layerNum} className="diagram-layer">
            {nodes
              .filter((n) => n.layer === layerNum)
              .map((node) => (
                <motion.div
                  key={node.id}
                  ref={(el) => { boxRefs.current[node.id] = el }}
                  className="diagram-node"
                  animate={{
                    borderColor: currentNode === node.id ? 'var(--accent)' : visited.has(node.id) ? 'var(--good)' : 'var(--border)',
                    opacity: stepIndex >= 0 && !visited.has(node.id) ? 0.4 : 1,
                    scale: currentNode === node.id ? 1.04 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <div className="diagram-node-label">{node.label}</div>
                  {node.sub && <div className="diagram-node-sub">{node.sub}</div>}
                </motion.div>
              ))}
          </div>
        ))}
      </div>
      <p className="diagram-caption">
        {stepIndex >= 0 ? captions[stepIndex] : intro ?? 'Click to trace how a request flows through the system.'}
      </p>
    </div>
  )
}
