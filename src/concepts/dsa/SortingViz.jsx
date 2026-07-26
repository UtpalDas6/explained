import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { playClick, playSuccess, playTick } from '../../lib/sound.js'

const BASE = [8, 3, 9, 1, 6, 4, 7, 2, 5]

function recordQuickSort(arr) {
  const a = [...arr]
  const frames = [{ array: [...a], compare: [], sorted: [] }]
  const sortedSet = new Set()

  function partition(lo, hi) {
    const pivot = a[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      frames.push({ array: [...a], compare: [j, hi], sorted: [...sortedSet] })
      if (a[j] < pivot) {
        ;[a[i], a[j]] = [a[j], a[i]]
        frames.push({ array: [...a], compare: [i, j], sorted: [...sortedSet] })
        i++
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    sortedSet.add(i)
    frames.push({ array: [...a], compare: [], sorted: [...sortedSet] })
    return i
  }

  function quickSort(lo, hi) {
    if (lo > hi) return
    if (lo === hi) {
      sortedSet.add(lo)
      return
    }
    const p = partition(lo, hi)
    quickSort(lo, p - 1)
    quickSort(p + 1, hi)
  }

  quickSort(0, a.length - 1)
  for (let i = 0; i < a.length; i++) sortedSet.add(i)
  frames.push({ array: [...a], compare: [], sorted: [...sortedSet] })
  return frames
}

function recordMergeSort(arr) {
  const a = [...arr]
  const frames = [{ array: [...a], compare: [], sorted: [] }]

  function merge(lo, mid, hi) {
    const left = a.slice(lo, mid + 1)
    const right = a.slice(mid + 1, hi + 1)
    let i = 0
    let j = 0
    let k = lo
    while (i < left.length && j < right.length) {
      frames.push({ array: [...a], compare: [lo + i, mid + 1 + j], sorted: [] })
      a[k] = left[i] <= right[j] ? left[i++] : right[j++]
      k++
      frames.push({ array: [...a], compare: [], sorted: [] })
    }
    while (i < left.length) a[k++] = left[i++]
    while (j < right.length) a[k++] = right[j++]
    frames.push({ array: [...a], compare: [], sorted: [] })
  }

  function mergeSort(lo, hi) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    mergeSort(lo, mid)
    mergeSort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  mergeSort(0, a.length - 1)
  frames.push({ array: [...a], compare: [], sorted: a.map((_, i) => i) })
  return frames
}

const BAR_W = 40
const GAP = 10
const SCALE = 22

export default function SortingViz() {
  const [algo, setAlgo] = useState('quick')
  const frames = useMemo(() => (algo === 'quick' ? recordQuickSort(BASE) : recordMergeSort(BASE)), [algo])
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const atEnd = stepIdx >= frames.length - 1
  const frame = frames[Math.min(stepIdx, frames.length - 1)]

  useEffect(() => {
    if (!playing || atEnd) {
      if (atEnd) setPlaying(false)
      return
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 280)
    return () => clearTimeout(t)
  }, [playing, stepIdx, atEnd])

  useEffect(() => {
    if (frame.compare.length) playTick()
    else if (atEnd) playSuccess()
  }, [stepIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchAlgo = (a) => {
    setAlgo(a)
    setStepIdx(0)
    setPlaying(false)
  }
  const step = () => {
    if (atEnd) return
    setStepIdx((i) => i + 1)
    playClick()
  }
  const reset = () => {
    setStepIdx(0)
    setPlaying(false)
  }

  return (
    <div className="panel">
      <div className="controls">
        <button className={`btn ${algo === 'quick' ? 'primary' : ''}`} onClick={() => switchAlgo('quick')}>Quick sort</button>
        <button className={`btn ${algo === 'merge' ? 'primary' : ''}`} onClick={() => switchAlgo('merge')}>Merge sort</button>
        <button className="btn primary" onClick={() => setPlaying((p) => !p)} disabled={atEnd}>{playing ? 'Pause' : 'Play'}</button>
        <button className="btn" onClick={step} disabled={atEnd}>Step</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <div style={{ position: 'relative', height: 240, width: BASE.length * (BAR_W + GAP), margin: '20px auto' }}>
        {frame.array.map((val, i) => {
          const isCompare = frame.compare.includes(i)
          const isSorted = frame.sorted.includes(i)
          return (
            <motion.div
              key={val}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="mono"
              style={{
                position: 'absolute',
                left: i * (BAR_W + GAP),
                bottom: 0,
                width: BAR_W,
                height: val * SCALE,
                borderRadius: '6px 6px 2px 2px',
                background: isSorted ? 'rgba(74,222,128,0.25)' : isCompare ? 'rgba(110,231,255,0.3)' : 'var(--panel-2)',
                border: `2px solid ${isSorted ? 'var(--good)' : isCompare ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: 4,
                fontSize: 13,
                color: 'var(--text)',
              }}
            >
              {val}
            </motion.div>
          )
        })}
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
        {algo === 'quick'
          ? 'Quick sort picks a pivot, partitions everything smaller to its left and larger to its right, then recurses on each side. Average O(n log n), worst case O(n²) on an already-sorted, badly-pivoted input.'
          : 'Merge sort splits the array in half recursively down to single elements, then merges sorted halves back together. Always O(n log n), and stable — but needs O(n) extra space for the merge buffers.'}
      </p>
    </div>
  )
}
