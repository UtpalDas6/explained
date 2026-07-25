import { useState } from 'react'
import { playClick, playPop } from '../lib/sound.js'

const MODELS = ['key-value', 'document', 'wide-column', 'graph']

const cellStyle = {
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--panel-2)',
  fontSize: 12,
  fontFamily: 'ui-monospace, monospace',
}

function KeyValuePanel({ extra }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>the store only sees an opaque blob under one key</div>
      <div style={cellStyle}>
        "user:1" → "{`{"name":"Ada","email":"ada@x.com"${extra ? ',"phone":"555-0100"' : ''}}`}"
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 10 }}>
        Fastest possible lookups (it's just a hash map), but the database can't query or index inside the value — your app has to know the shape.
      </p>
    </div>
  )
}

function DocumentPanel({ extra }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>fields are visible to the database — it can index or query into them</div>
      <pre style={{ ...cellStyle, whiteSpace: 'pre-wrap', margin: 0 }}>
{`{
  "_id": "user:1",
  "name": "Ada",
  "email": "ada@x.com",
  "tags": ["admin", "verified"]${extra ? ',\n  "phone": "555-0100"' : ''}
}`}
      </pre>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 10 }}>
        Great fit for nested, self-contained records (a user profile, a blog post) that don't need much cross-record joining.
      </p>
    </div>
  )
}

function WideColumnPanel({ extra }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>each row can have a different set of columns in the same table</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={cellStyle}>user:1 → name=Ada, email=ada@x.com{extra ? ', phone=555-0100' : ''}</div>
        <div style={cellStyle}>user:2 → name=Bob, signup_date=2024-01-02</div>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 10 }}>
        Built for huge, sparse tables (billions of rows) where most rows only populate a handful of the possible columns.
      </p>
    </div>
  )
}

function GraphPanel({ extra }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>the relationships between records are first-class, not foreign keys</div>
      <svg width="100%" height="140" viewBox="0 0 400 140">
        <circle cx="70" cy="70" r="26" fill="var(--panel-2)" stroke="var(--accent)" strokeWidth="2" />
        <text x="70" y="75" textAnchor="middle" fontSize="12" fill="var(--accent)">Ada</text>
        <circle cx="240" cy="30" r="26" fill="var(--panel-2)" stroke="var(--accent-2)" strokeWidth="2" />
        <text x="240" y="35" textAnchor="middle" fontSize="12" fill="var(--accent-2)">Bob</text>
        <circle cx="240" cy="110" r="26" fill="var(--panel-2)" stroke="var(--good)" strokeWidth="2" />
        <text x="240" y="115" textAnchor="middle" fontSize="11" fill="var(--good)">Post 123</text>
        <line x1="94" y1="60" x2="216" y2="35" stroke="var(--border)" strokeWidth="1.5" />
        <text x="150" y="35" fontSize="10" fill="var(--text-dim)">FOLLOWS</text>
        <line x1="94" y1="80" x2="216" y2="105" stroke="var(--border)" strokeWidth="1.5" />
        <text x="140" y="105" fontSize="10" fill="var(--text-dim)">LIKES</text>
        {extra && (
          <>
            <circle cx="360" cy="70" r="20" fill="var(--panel-2)" stroke="var(--bad)" strokeWidth="2" />
            <text x="360" y="75" textAnchor="middle" fontSize="10" fill="var(--bad)">555-0100</text>
            <line x1="94" y1="70" x2="340" y2="70" stroke="var(--bad)" strokeWidth="1.5" strokeDasharray="4 3" />
          </>
        )}
      </svg>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 10 }}>
        Ideal when the query you actually run is "find things connected to this thing" — recommendations, social graphs, fraud rings.
      </p>
    </div>
  )
}

const PANELS = { 'key-value': KeyValuePanel, document: DocumentPanel, 'wide-column': WideColumnPanel, graph: GraphPanel }

export default function NoSqlDataModels() {
  const [model, setModel] = useState('document')
  const [extra, setExtra] = useState(false)
  const Panel = PANELS[model]

  return (
    <div className="panel">
      <div className="controls">
        {MODELS.map((m) => (
          <button key={m} className={`btn ${model === m ? 'primary' : ''}`} onClick={() => { playClick(); setModel(m); setExtra(false) }}>
            {m}
          </button>
        ))}
        <button className="btn" onClick={() => { playPop(); setExtra((e) => !e) }}>
          {extra ? 'Remove phone field' : 'Add phone field'}
        </button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <Panel extra={extra} />
      </div>
    </div>
  )
}
