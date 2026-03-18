// app/admin/page.js
// ─────────────────────────────────────────────────────────
// Admin Dashboard
// - Manage Members (Add / Edit / Promote / Delete)
// - View Join Requests live (from Join page submissions)
// - Approve request → auto-adds to members list
// ─────────────────────────────────────────────────────────
'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import Footer from '../../components/Footer'

// ── Initial members ──
const INITIAL_MEMBERS = [
  { id:1, name:'0xAlex',     email:'alex@db.com',   role:'admin',    exp:'Advanced',     skills:['WEB','PWN','CRYPTO'],   joined:'2023-01-15' },
  { id:2, name:'DarkRaven',  email:'raven@db.com',  role:'player',   exp:'Intermediate', skills:['FORENSICS','OSINT'],    joined:'2023-03-20' },
  { id:3, name:'ZeroPulse',  email:'zero@db.com',   role:'player',   exp:'Advanced',     skills:['REV','PWN'],            joined:'2023-05-10' },
  { id:4, name:'NullX',      email:'null@db.com',   role:'beginner', exp:'Beginner',     skills:['WEB','CRYPTO'],         joined:'2024-01-05' },
  { id:5, name:'ByteStorm',  email:'byte@db.com',   role:'admin',    exp:'Advanced',     skills:['PWN','REV','WEB'],      joined:'2023-02-28' },
  { id:6, name:'GhostShell', email:'ghost@db.com',  role:'beginner', exp:'Beginner',     skills:['OSINT'],                joined:'2024-06-12' },
]

const SKILLS      = ['WEB', 'CRYPTO', 'FORENSICS', 'REV', 'PWN', 'OSINT']
const ROLE_COLORS = { admin: '#ff2040', player: '#00ff6e', beginner: '#00d4ff' }
const AVATAR_BG   = [
  'linear-gradient(135deg,#00cc55,#006622)',
  'linear-gradient(135deg,#0066aa,#003366)',
  'linear-gradient(135deg,#aa0020,#660010)',
  'linear-gradient(135deg,#aa6600,#664400)',
  'linear-gradient(135deg,#6600aa,#330066)',
  'linear-gradient(135deg,#005566,#002233)',
]
const EMPTY_FORM = { name:'', email:'', role:'beginner', exp:'Beginner', skills:[] }

// ─────────────────────────────────────
// Get or create shared window store
// ─────────────────────────────────────
function getStore() {
  if (typeof window === 'undefined') return null
  if (!window.__DB_STORE__) {
    window.__DB_STORE__ = {
      members:  [...INITIAL_MEMBERS],
      requests: [],
      nextId:   100,
    }
  }
  return window.__DB_STORE__
}

// ─────────────────────────────────────
// Reusable label + input
// ─────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.63rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ─────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@dragonbyte.com')
  const [pass,  setPass]  = useState('admin123')
  const [err,   setErr]   = useState(false)

  const handle = () => {
    if (email === 'admin@dragonbyte.com' && pass === 'admin123') {
      onLogin()
    } else {
      setErr(true)
      setTimeout(() => setErr(false), 3000)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem' }}>
      <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderTop: '3px solid #ff2040', borderRadius: 8, padding: '2.5rem', width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🐉</div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.1rem', color: '#00ff6e', letterSpacing: '3px' }}>DRAGONBYTE</div>
          <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.65rem', color: '#ff2040', letterSpacing: '2px', marginTop: 4 }}>// ADMIN ACCESS ONLY</div>
        </div>

        <Field label="EMAIL">
          <input className="db-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@dragonbyte.com" />
        </Field>
        <Field label="PASSWORD">
          <input className="db-input" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} placeholder="••••••••" />
        </Field>

        {err && (
          <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.7rem', color: '#ff2040', textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '1px' }}>
            ✖ INVALID CREDENTIALS
          </div>
        )}

        <button onClick={handle} style={{ width: '100%', fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: '#ff2040', padding: 12, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '3px', transition: 'all 0.2s' }}>
          AUTHENTICATE →
        </button>
        <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.6rem', color: '#3a7a50', textAlign: 'center', marginTop: '1rem', letterSpacing: '1px' }}>
          demo: admin@dragonbyte.com / admin123
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────
// MEMBER MODAL (Add / Edit)
// ─────────────────────────────────────
function MemberModal({ form, setForm, onSave, onClose, isEdit }) {
  const toggle = (s) => setForm(f => ({
    ...f,
    skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderTop: '3px solid #00cc55', borderRadius: 8, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #0f3020' }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.82rem', color: '#00ff6e', letterSpacing: '2px' }}>
            {isEdit ? 'EDIT MEMBER' : 'ADD NEW MEMBER'}
          </div>
          <button onClick={onClose} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.7rem', color: '#3a7a50', background: 'transparent', border: '1px solid #0f3020', padding: '4px 10px', borderRadius: 3, cursor: 'pointer' }}>✕ CLOSE</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <Field label="NAME / HANDLE *">
            <input className="db-input" placeholder="0xHacker" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="EMAIL *">
            <input className="db-input" type="email" placeholder="user@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </Field>

          {/* Row: Role + Experience */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="ROLE *">
              <select className="db-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="beginner">Beginner</option>
                <option value="player">Player</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field label="EXPERIENCE">
              <select className="db-select" value={form.exp} onChange={e => setForm(f => ({ ...f, exp: e.target.value }))}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </Field>
          </div>

          {/* Skills */}
          <Field label="SKILLS">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {SKILLS.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.7rem', color: form.skills.includes(s) ? '#00ff6e' : '#3a7a50', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.skills.includes(s)} onChange={() => toggle(s)} style={{ accentColor: '#00ff6e' }} />
                  {s}
                </label>
              ))}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.68rem', color: '#3a7a50', background: 'transparent', border: '1px solid #0f3020', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', letterSpacing: '1px' }}>CANCEL</button>
          <button onClick={onSave} style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', fontWeight: 700, color: '#020c06', background: '#00ff6e', padding: '10px 24px', border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '2px' }}>
            {isEdit ? 'UPDATE' : 'ADD MEMBER'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────
function DeleteModal({ targetName, onConfirm, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderTop: '3px solid #ff2040', borderRadius: 8, padding: '2rem', width: '100%', maxWidth: 420 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.82rem', color: '#ff2040', letterSpacing: '2px', marginBottom: '1.25rem' }}>CONFIRM DELETE</div>
        <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.78rem', color: '#b0ffcc', lineHeight: 1.6, marginBottom: '0.5rem' }}>You are about to permanently delete:</div>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.9rem', color: '#ff2040', letterSpacing: '1px', margin: '0.5rem 0 0.5rem' }}>{targetName}</div>
        <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.65rem', color: '#3a7a50', letterSpacing: '1px', marginBottom: '1.5rem' }}>// THIS ACTION CANNOT BE UNDONE</div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.68rem', color: '#3a7a50', background: 'transparent', border: '1px solid #0f3020', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', letterSpacing: '1px' }}>CANCEL</button>
          <button onClick={onConfirm} style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', fontWeight: 700, color: '#fff', background: '#ff2040', padding: '10px 24px', border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '2px' }}>DELETE</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────
function Dashboard({ onLogout }) {
  const [tab,          setTab]          = useState('members')
  const [members,      setMembers]      = useState([])
  const [requests,     setRequests]     = useState([])
  const [mSearch,      setMSearch]      = useState('')
  const [rSearch,      setRSearch]      = useState('')
  const [mFilter,      setMFilter]      = useState('all')
  const [rFilter,      setRFilter]      = useState('all')
  const [modal,        setModal]        = useState(null)  // 'add'|'edit'|'delete-member'|'delete-request'
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [nextId,       setNextId]       = useState(100)

  // Load from shared store on mount + every time tab changes
  const loadFromStore = useCallback(() => {
    const store = getStore()
    if (store) {
      setMembers([...store.members])
      setRequests([...store.requests])
      setNextId(store.nextId)
    }
  }, [])

  useEffect(() => {
    loadFromStore()
  }, [loadFromStore, tab])

  // Also poll every 2 seconds for new join requests
  useEffect(() => {
    const interval = setInterval(() => {
      const store = getStore()
      if (store) {
        setRequests([...store.requests])
        setNextId(store.nextId)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Save members back to store
  const saveToStore = (newMembers) => {
    const store = getStore()
    if (store) store.members = newMembers
    setMembers(newMembers)
  }

  const saveRequestsToStore = (newRequests) => {
    const store = getStore()
    if (store) store.requests = newRequests
    setRequests(newRequests)
  }

  // ── Stats ──
  const pendingCount = requests.filter(r => r.status === 'pending').length

  // ── Filtered members ──
  const filteredMembers = members.filter(m => {
    const matchRole = mFilter === 'all' || m.role === mFilter
    const q = mSearch.toLowerCase()
    const matchQ = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.skills || []).some(s => s.toLowerCase().includes(q))
    return matchRole && matchQ
  })

  // ── Filtered requests ──
  const filteredRequests = requests.filter(r => {
    const matchStatus = rFilter === 'all' || r.status === rFilter
    const q = rSearch.toLowerCase()
    const matchQ = r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    return matchStatus && matchQ
  })

  // ── Member CRUD ──
  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setModal('add')
  }

  const openEdit = (m) => {
    setForm({ name: m.name, email: m.email, role: m.role, exp: m.exp || 'Beginner', skills: [...(m.skills || [])] })
    setEditTarget(m.id)
    setModal('edit')
  }

  const saveMember = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error('Fill all required fields!'); return }
    const store = getStore()
    let newMembers
    if (modal === 'edit') {
      newMembers = members.map(m => m.id === editTarget ? { ...m, ...form } : m)
      toast.success('✓ MEMBER UPDATED')
    } else {
      const newId = store ? store.nextId++ : nextId
      newMembers = [{ id: newId, ...form, joined: new Date().toISOString().slice(0, 10) }, ...members]
      toast.success('✓ MEMBER ADDED')
    }
    saveToStore(newMembers)
    setModal(null)
  }

  const promoteRole = (m) => {
    const order = { beginner: 'player', player: 'admin', admin: 'player' }
    const newRole = order[m.role]
    const newMembers = members.map(x => x.id === m.id ? { ...x, role: newRole } : x)
    saveToStore(newMembers)
    toast.success(`${m.role === 'admin' ? '⬇ DEMOTED' : '⬆ PROMOTED'} TO ${newRole.toUpperCase()}`)
  }

  const openDeleteMember = (m) => {
    setDeleteTarget(m)
    setModal('delete-member')
  }

  const confirmDeleteMember = () => {
    const newMembers = members.filter(m => m.id !== deleteTarget.id)
    saveToStore(newMembers)
    toast.error('MEMBER DELETED')
    setModal(null)
  }

  // ── Request actions ──
  const approveRequest = (r) => {
    // Update status
    const newRequests = requests.map(x => x.id === r.id ? { ...x, status: 'approved' } : x)
    saveRequestsToStore(newRequests)

    // Auto-add to members if not already there
    const exists = members.some(m => m.email === r.email)
    if (!exists) {
      const store = getStore()
      const newId = store ? store.nextId++ : nextId
      const newMembers = [{
        id: newId,
        name:   r.name,
        email:  r.email,
        role:   'beginner',
        exp:    r.exp || 'Beginner',
        skills: r.skills || [],
        joined: new Date().toISOString().slice(0, 10),
      }, ...members]
      saveToStore(newMembers)
      toast.success('✓ APPROVED & ADDED TO MEMBERS')
    } else {
      toast.success('✓ REQUEST APPROVED')
    }
  }

  const rejectRequest = (r) => {
    const newRequests = requests.map(x => x.id === r.id ? { ...x, status: 'rejected' } : x)
    saveRequestsToStore(newRequests)
    toast.error('REQUEST REJECTED')
  }

  const openDeleteRequest = (r) => {
    setDeleteTarget(r)
    setModal('delete-request')
  }

  const confirmDeleteRequest = () => {
    const newRequests = requests.filter(r => r.id !== deleteTarget.id)
    saveRequestsToStore(newRequests)
    toast.error('REQUEST REMOVED')
    setModal(null)
  }

  // ── Shared styles ──
  const pillStyle = (active) => ({
    fontFamily: '"Share Tech Mono", monospace', fontSize: '0.62rem', padding: '6px 14px',
    borderRadius: 2, cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s',
    border: active ? '1px solid #00cc55' : '1px solid #0f3020',
    background: active ? '#00ff6e10' : 'transparent',
    color: active ? '#00ff6e' : '#3a7a50',
  })

  const abtn = (color, borderColor) => ({
    fontFamily: '"Share Tech Mono", monospace', fontSize: '0.58rem', padding: '4px 10px',
    borderRadius: 3, cursor: 'pointer', letterSpacing: '1px',
    color, border: `1px solid ${borderColor}`, background: 'transparent', transition: 'all 0.15s',
  })

  return (
    <div>
      {/* ── TOP BAR ── */}
      <div style={{ background: '#030f08', borderBottom: '1px solid #0f3020', padding: '0 1.5rem', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.9rem', fontWeight: 900 }}>
          <span style={{ color: '#00ff6e' }}>DRAGON</span><span style={{ color: '#00d4ff' }}>BYTE</span>
          <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.62rem', color: '#3a7a50', letterSpacing: '2px', marginLeft: '1rem' }}>// ADMIN</span>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Members tab */}
          <button onClick={() => setTab('members')} style={{ ...pillStyle(tab === 'members'), padding: '7px 18px' }}>
            MEMBERS ({members.length})
          </button>

          {/* Requests tab with pending badge */}
          <button onClick={() => setTab('requests')} style={{ ...pillStyle(tab === 'requests'), padding: '7px 18px', position: 'relative' }}>
            JOIN REQUESTS
            {pendingCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#ff2040', color: '#fff', fontSize: '0.5rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, monospace', fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <button onClick={onLogout} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.62rem', color: '#ff2040', background: 'transparent', border: '1px solid #cc0020', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', letterSpacing: '1px' }}>LOGOUT</button>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: 1150, margin: '0 auto' }}>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { num: members.length,                                   label: 'TOTAL MEMBERS', color: '#00ff6e', accent: '#00cc55' },
            { num: members.filter(m => m.role === 'admin').length,   label: 'ADMINS',        color: '#ff2040', accent: '#cc0020' },
            { num: members.filter(m => m.role === 'player').length,  label: 'PLAYERS',       color: '#00d4ff', accent: '#0099cc' },
            { num: pendingCount,                                      label: 'PENDING',       color: '#ffcc00', accent: '#cc9900' },
          ].map(({ num, label, color, accent }) => (
            <div key={label} style={{ background: '#071a0e', border: '1px solid #0f3020', borderBottom: `2px solid ${accent}`, borderRadius: 6, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.6rem', color: '#3a7a50', letterSpacing: '2px', marginTop: 5 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════
            MEMBERS PANEL
        ══════════════════════════════════ */}
        {tab === 'members' && (
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  style={{ background: '#071a0e', border: '1px solid #0f3020', borderRadius: 4, padding: '8px 12px', color: '#b0ffcc', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.75rem', outline: 'none', width: 200 }}
                  type="text" placeholder="Search members..."
                  value={mSearch} onChange={e => setMSearch(e.target.value)}
                />
                {['all', 'admin', 'player', 'beginner'].map(f => (
                  <button key={f} onClick={() => setMFilter(f)} style={pillStyle(mFilter === f)}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <button onClick={openAdd} style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.62rem', fontWeight: 700, color: '#020c06', background: '#00ff6e', padding: '9px 20px', border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '2px' }}>
                + ADD MEMBER
              </button>
            </div>

            {/* Members table */}
            <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#030f08', borderBottom: '1px solid #0f3020' }}>
                    {['MEMBER', 'ROLE', 'SKILLS', 'EMAIL', 'JOINED', 'ACTIONS'].map(h => (
                      <th key={h} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.58rem', color: '#3a7a50', letterSpacing: '2px', padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #0a1f10' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#00ff6e06'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Name + avatar */}
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: AVATAR_BG[m.id % AVATAR_BG.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', fontWeight: 700, color: '#020c06', flexShrink: 0 }}>
                            {m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', color: '#b0ffcc', letterSpacing: '1px' }}>{m.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#3a7a50', marginTop: 2 }}>{m.exp || '—'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td style={{ padding: '11px 12px' }}>
                        <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.58rem', padding: '3px 9px', borderRadius: 2, letterSpacing: '1px', background: `${ROLE_COLORS[m.role]}15`, color: ROLE_COLORS[m.role], border: `1px solid ${ROLE_COLORS[m.role]}80` }}>
                          {m.role.toUpperCase()}
                        </span>
                      </td>

                      {/* Skills */}
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {(m.skills || []).map(s => (
                            <span key={s} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.55rem', padding: '2px 7px', borderRadius: 2, background: '#00ff6e10', color: '#00cc55', border: '1px solid #00ff6e25' }}>{s}</span>
                          ))}
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '11px 12px', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.68rem', color: '#3a7a50' }}>{m.email}</td>

                      {/* Joined */}
                      <td style={{ padding: '11px 12px', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.65rem', color: '#3a7a50', whiteSpace: 'nowrap' }}>{m.joined || '—'}</td>

                      {/* Actions */}
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button onClick={() => openEdit(m)} style={abtn('#00d4ff', '#0099cc')}>EDIT</button>
                          <button onClick={() => promoteRole(m)} style={abtn('#ffcc00', '#cc9900')}>{m.role === 'admin' ? 'DEMOTE' : 'PROMOTE'}</button>
                          <button onClick={() => openDeleteMember(m)} style={abtn('#ff2040', '#cc0020')}>DELETE</button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredMembers.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.75rem', color: '#3a7a50', letterSpacing: '2px' }}>NO MEMBERS FOUND</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            JOIN REQUESTS PANEL
        ══════════════════════════════════ */}
        {tab === 'requests' && (
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                style={{ background: '#071a0e', border: '1px solid #0f3020', borderRadius: 4, padding: '8px 12px', color: '#b0ffcc', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.75rem', outline: 'none', width: 200 }}
                type="text" placeholder="Search requests..."
                value={rSearch} onChange={e => setRSearch(e.target.value)}
              />
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button key={f} onClick={() => setRFilter(f)} style={pillStyle(rFilter === f)}>
                  {f.toUpperCase()}
                  {f === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
                </button>
              ))}
              <button onClick={loadFromStore} style={{ ...pillStyle(false), color: '#00d4ff', borderColor: '#0099cc' }}>↻ REFRESH</button>
            </div>

            {/* Requests table */}
            <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#030f08', borderBottom: '1px solid #0f3020' }}>
                    {['APPLICANT', 'EMAIL', 'LEVEL', 'SKILLS', 'MESSAGE', 'SUBMITTED', 'STATUS', 'ACTIONS'].map(h => (
                      <th key={h} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.58rem', color: '#3a7a50', letterSpacing: '2px', padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #0a1f10' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#00ff6e06'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Name */}
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: AVATAR_BG[i % AVATAR_BG.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', fontWeight: 700, color: '#020c06', flexShrink: 0 }}>
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', color: '#b0ffcc', letterSpacing: '1px' }}>{r.name}</div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '11px 12px', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.68rem', color: '#3a7a50' }}>{r.email}</td>

                      {/* Level */}
                      <td style={{ padding: '11px 12px', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.68rem', color: '#b0ffcc', whiteSpace: 'nowrap' }}>{r.exp || '—'}</td>

                      {/* Skills */}
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {(r.skills || []).length > 0
                            ? r.skills.map(s => <span key={s} style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.55rem', padding: '2px 7px', borderRadius: 2, background: '#00ff6e10', color: '#00cc55', border: '1px solid #00ff6e25' }}>{s}</span>)
                            : <span style={{ fontSize: '0.7rem', color: '#3a7a50' }}>—</span>
                          }
                        </div>
                      </td>

                      {/* Why */}
                      <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#3a7a50', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.why}>
                        {r.why || '—'}
                      </td>

                      {/* Submitted at */}
                      <td style={{ padding: '11px 12px', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.62rem', color: '#3a7a50', whiteSpace: 'nowrap' }}>{r.submittedAt || '—'}</td>

                      {/* Status badge */}
                      <td style={{ padding: '11px 12px' }}>
                        <span style={{
                          fontFamily: '"Share Tech Mono", monospace', fontSize: '0.58rem', padding: '3px 9px', borderRadius: 2, letterSpacing: '1px',
                          background: r.status === 'approved' ? '#00ff6e15' : r.status === 'pending' ? '#ff204015' : '#3a3a3a22',
                          color:      r.status === 'approved' ? '#00ff6e'   : r.status === 'pending' ? '#ff2040'   : '#557755',
                          border:     `1px solid ${r.status === 'approved' ? '#00cc55' : r.status === 'pending' ? '#cc0020' : '#1a3020'}`,
                        }}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {r.status === 'pending' && <>
                            <button onClick={() => approveRequest(r)} style={abtn('#00ff6e', '#00cc55')}>APPROVE</button>
                            <button onClick={() => rejectRequest(r)}  style={abtn('#3a7a50', '#0f3020')}>REJECT</button>
                          </>}
                          {r.status === 'rejected' && (
                            <button onClick={() => approveRequest(r)} style={abtn('#00ff6e', '#00cc55')}>RE-APPROVE</button>
                          )}
                          <button onClick={() => openDeleteRequest(r)} style={abtn('#ff2040', '#cc0020')}>REMOVE</button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredRequests.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.75rem', color: '#3a7a50', letterSpacing: '2px' }}>
                      {rFilter === 'pending' ? 'NO PENDING REQUESTS' : 'NO REQUESTS FOUND'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {(modal === 'add' || modal === 'edit') && (
        <MemberModal form={form} setForm={setForm} onSave={saveMember} onClose={() => setModal(null)} isEdit={modal === 'edit'} />
      )}
      {modal === 'delete-member' && (
        <DeleteModal targetName={deleteTarget?.name} onConfirm={confirmDeleteMember} onClose={() => setModal(null)} />
      )}
      {modal === 'delete-request' && (
        <DeleteModal targetName={`${deleteTarget?.name} (request)`} onConfirm={confirmDeleteRequest} onClose={() => setModal(null)} />
      )}

      <Footer />
    </div>
  )
}

// ─────────────────────────────────────
// EXPORT — handles login gate
// ─────────────────────────────────────
export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />
  return <Dashboard onLogout={() => setLoggedIn(false)} />
}
