import { useState } from 'react'
import { motion } from 'framer-motion'
import { concepts } from './data/concepts.js'
import './App.css'

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code.snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="info-section">
      <div className="info-section-header">
        <h3>Code</h3>
        <div className="code-meta">
          <span className="lang-tag">{code.lang}</span>
          <button className="btn" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      </div>
      <pre className="code-block">
        <code>{code.snippet}</code>
      </pre>
    </div>
  )
}

function Home({ onSelect }) {
  return (
    <div>
      <div className="concept-header">
        <h2>System design, visualized</h2>
        <p>Pick a concept to see it move.</p>
      </div>
      <div className="home-grid">
        {concepts.map((c, i) => (
          <motion.button
            key={c.id}
            className="concept-card"
            onClick={() => onSelect(c.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -4, borderColor: 'var(--accent)' }}
          >
            <h3>{c.title}</h3>
            <p>{c.blurb}</p>
            <span className="tag">{c.tag}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [activeId, setActiveId] = useState(null)
  const [query, setQuery] = useState('')
  const active = concepts.find((c) => c.id === activeId)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? concepts.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.blurb.toLowerCase().includes(q) ||
          c.tag.toLowerCase().includes(q)
      )
    : concepts

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="brand">
          <span>Explained</span> /systems
        </div>
        <input
          className="sidebar-search"
          type="text"
          placeholder="Search concepts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className={`nav-item ${!activeId ? 'active' : ''}`}
          onClick={() => setActiveId(null)}
        >
          Home
        </button>
        {filtered.map((c) => (
          <button
            key={c.id}
            className={`nav-item ${activeId === c.id ? 'active' : ''}`}
            onClick={() => setActiveId(c.id)}
          >
            {c.title}
          </button>
        ))}
        {q && filtered.length === 0 && <div className="sidebar-empty">No matches</div>}
      </nav>
      <main className="main">
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="concept-header">
              <h2>{active.title}</h2>
              <p>{active.blurb}</p>
            </div>
            <active.Component />
            {active.code && <CodeBlock code={active.code} />}
            {active.realWorld && (
              <div className="info-section">
                <h3>Where this shows up</h3>
                <p>{active.realWorld}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <Home onSelect={setActiveId} />
        )}
      </main>
    </div>
  )
}

export default App
