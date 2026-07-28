import { useState } from 'react'
import { motion } from 'framer-motion'
import { concepts } from './data/concepts.js'
import { dsaConcepts } from './data/dsaConcepts.js'
import { patternsConcepts } from './data/patternsConcepts.js'
import { solidConcepts } from './data/solidConcepts.js'
import { gitConcepts } from './data/gitConcepts.js'
import { apiConcepts } from './data/apiConcepts.js'
import { dbConcepts } from './data/dbConcepts.js'
import { aiConcepts } from './data/aiConcepts.js'
import { isSoundEnabled, setSoundEnabled } from './lib/sound.js'
import './App.css'

const allConcepts = [...concepts.map((c) => ({ ...c, section: c.section ?? 'systems' })), ...dsaConcepts, ...patternsConcepts, ...solidConcepts, ...gitConcepts, ...apiConcepts, ...dbConcepts, ...aiConcepts]

const MODES = {
  systems: { label: 'Systems', brand: '/systems', heading: 'System design, visualized', sub: 'Pick a concept to see it move.' },
  dsa: { label: 'DS & Algo', brand: '/ds_algo', heading: 'Data structures & algorithms, visualized', sub: 'Pick a concept, step through it, then go solve it on LeetCode.' },
  patterns: { label: 'Patterns', brand: '/patterns', heading: 'Design patterns, visualized', sub: 'Pick a pattern to see it move, then see where it shows up in real code.' },
  solid: { label: 'SOLID', brand: '/solid', heading: 'SOLID principles, visualized', sub: 'Pick a principle to see the violation, then see it fixed.' },
  git: { label: 'Git Commands', brand: '/git', heading: 'Git commands, visualized', sub: 'Pick a command to see what it does to the repo before and after.' },
  api: { label: 'API Design', brand: '/api', heading: 'API design principles, visualized', sub: 'Pick a principle to see the bad practice, then see the fix.' },
  db: { label: 'Databases', brand: '/db', heading: 'SQL & NoSQL, visualized', sub: 'Pick a topic to see it compared, then see why it matters.' },
  ai: { label: 'AI Integration', brand: '/ai', heading: 'AI integration, visualized', sub: 'From LLMs and RAG to agents and the frontier — pick a topic to see it compared.' },
}

// A single code entry ({ lang, snippet }) renders one block as before; an
// array of entries (the dsa concepts have python + js) renders language tabs.
function CodeBlock({ code }) {
  const snippets = Array.isArray(code) ? code : [code]
  const [tab, setTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const active = snippets[Math.min(tab, snippets.length - 1)]

  const copy = () => {
    navigator.clipboard.writeText(active.snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="info-section">
      <div className="info-section-header">
        <h3>Code</h3>
        <div className="code-meta">
          {snippets.length > 1 ? (
            <div style={{ display: 'flex', gap: 6 }}>
              {snippets.map((s, i) => (
                <button key={s.lang} className={`btn ${i === tab ? 'primary' : ''}`} style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => setTab(i)}>
                  {s.lang}
                </button>
              ))}
            </div>
          ) : (
            <span className="lang-tag">{active.lang}</span>
          )}
          <button className="btn" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      </div>
      <pre className="code-block">
        <code>{active.snippet}</code>
      </pre>
    </div>
  )
}

const DIFFICULTY_COLOR = { Easy: 'var(--good)', Medium: 'var(--accent)', Hard: 'var(--bad)' }

function LeetCodeList({ problems }) {
  return (
    <div className="info-section">
      <h3>Practice on LeetCode</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {problems.map((p) => (
          <a
            key={p.url}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', color: 'var(--text)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8, background: 'var(--panel-2)', border: '1px solid var(--border)' }}
          >
            <span style={{ fontSize: 13 }}>{p.title}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {p.companies?.map((c) => (
                <span key={c} className="company-tag">{c}</span>
              ))}
              <span style={{ fontSize: 11, color: DIFFICULTY_COLOR[p.difficulty] ?? 'var(--text-dim)' }}>{p.difficulty}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

function Home({ mode, onSelect }) {
  const list = allConcepts.filter((c) => c.section === mode)
  return (
    <div>
      <div className="concept-header">
        <h2>{MODES[mode].heading}</h2>
        <p>{MODES[mode].sub}</p>
      </div>
      <div className="home-grid">
        {list.map((c, i) => (
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

const MOBILE_BREAKPOINT = 768

function App() {
  const [mode, setMode] = useState('systems')
  const [activeId, setActiveId] = useState(null)
  const [query, setQuery] = useState('')
  const [soundOn, setSoundOn] = useState(isSoundEnabled)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth > MOBILE_BREAKPOINT
  )
  const active = allConcepts.find((c) => c.id === activeId)

  const toggleSound = () => {
    setSoundEnabled(!soundOn)
    setSoundOn(!soundOn)
  }

  const switchMode = (m) => {
    setMode(m)
    setActiveId(null)
    setQuery('')
  }

  // On mobile the sidebar is a drawer over the content, so picking a concept
  // should close it; on desktop it's a permanent column, so leave it open.
  const selectConcept = (id) => {
    setActiveId(id)
    if (window.innerWidth <= MOBILE_BREAKPOINT) setSidebarOpen(false)
  }

  const q = query.trim().toLowerCase()
  const inMode = allConcepts.filter((c) => c.section === mode)
  const filtered = q
    ? inMode.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.blurb.toLowerCase().includes(q) ||
          c.tag.toLowerCase().includes(q)
      )
    : inMode

  return (
    <div className="app">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="brand">
          <span>Explained</span> {MODES[mode].brand}
          <div className="brand-actions">
            <button
              className="icon-btn"
              onClick={toggleSound}
              title={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
              aria-label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
            >
              {soundOn ? '🔊' : '🔇'}
            </button>
            <button
              className="icon-btn"
              onClick={() => setSidebarOpen(false)}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              ‹
            </button>
          </div>
        </div>
        <select className="mode-select" value={mode} onChange={(e) => switchMode(e.target.value)}>
          {Object.entries(MODES).map(([key, m]) => (
            <option key={key} value={key}>{m.label}</option>
          ))}
        </select>
        <input
          className="sidebar-search"
          type="text"
          placeholder="Search concepts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className={`nav-item ${!activeId ? 'active' : ''}`}
          onClick={() => selectConcept(null)}
        >
          Home
        </button>
        {filtered.map((c) => (
          <button
            key={c.id}
            className={`nav-item ${activeId === c.id ? 'active' : ''}`}
            onClick={() => selectConcept(c.id)}
          >
            {c.title}
          </button>
        ))}
        {q && filtered.length === 0 && <div className="sidebar-empty">No matches</div>}
      </nav>
      <main className="main">
        {!sidebarOpen && (
          <button
            className="sidebar-open-btn"
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}
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
            {active.leetcode && <LeetCodeList problems={active.leetcode} />}
            {active.realWorld && (
              <div className="info-section">
                <h3>Where this shows up</h3>
                <p>{active.realWorld}</p>
              </div>
            )}
            {active.pitfall && (
              <div className="info-section">
                <h3>Watch out for</h3>
                <p>{active.pitfall}</p>
              </div>
            )}
            {active.fix && (
              <div className="info-section">
                <h3>How to fix it</h3>
                <p>{active.fix}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <Home mode={mode} onSelect={setActiveId} />
        )}
      </main>
    </div>
  )
}

export default App
