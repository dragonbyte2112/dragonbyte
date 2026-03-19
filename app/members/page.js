// app/members/page.js
// Reads from global store — reflects admin changes instantly
'use client'
import { useState, useEffect } from 'react'
import { getStore } from '../../lib/store'
import Footer from '../../components/Footer'

const AVATAR_BG = [
  'linear-gradient(135deg,#00cc55,#006622)',
  'linear-gradient(135deg,#0066aa,#003366)',
  'linear-gradient(135deg,#aa0020,#660010)',
  'linear-gradient(135deg,#aa6600,#664400)',
  'linear-gradient(135deg,#6600aa,#330066)',
  'linear-gradient(135deg,#005566,#002233)',
]
const ROLE_COLOR = { admin:'#ff2040', player:'#00ff6e', beginner:'#00d4ff' }

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  // Load from store + refresh every 2 seconds for admin changes
  useEffect(() => {
    const load = () => setMembers([...getStore().members])
    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [])

  const filtered = members.filter(m => {
    const matchRole  = filter === 'all' || m.role === filter
    const q          = search.toLowerCase()
    const matchSearch = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.skills||[]).some(s => s.toLowerCase().includes(q))
    return matchRole && matchSearch
  })

  return (
    <div className="page-enter">
      <div style={{ padding:'3rem 2rem 1rem', maxWidth:1100, margin:'0 auto' }}>
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:900, color:'#00ff6e', marginBottom:'0.5rem' }}>MEMBERS</h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'1.5rem' }}>&gt; OUR COMMUNITY ({members.length} members)</p>

        {/* Search + Filter */}
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center', marginBottom:'1.5rem' }}>
          <input className="db-input" style={{ flex:1, minWidth:200 }} type="text" placeholder="Search members or skills..." value={search} onChange={e => setSearch(e.target.value)} />
          {['all','admin','player','beginner'].map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{
              fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', padding:'8px 16px', borderRadius:4,
              cursor:'pointer', letterSpacing:'1px', transition:'all 0.2s',
              border: filter===r ? '1px solid #00cc55' : '1px solid #0f3020',
              background: filter===r ? '#00ff6e10' : 'transparent',
              color: filter===r ? '#00ff6e' : '#3a7a50',
            }}>{r.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Members grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1.25rem', padding:'0 2rem 4rem', maxWidth:1100, margin:'0 auto' }}>
        {filtered.map((m, i) => (
          <div key={m.id} className="db-card" style={{ padding:'1.5rem', textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:AVATAR_BG[m.id % AVATAR_BG.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'1.1rem', fontWeight:900, color:'#020c06', margin:'0 auto 1rem', border:'2px solid #0f3020' }}>
              {m.name.slice(0,2).toUpperCase()}
            </div>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.78rem', color:'#b0ffcc', letterSpacing:'1px', marginBottom:4 }}>{m.name}</div>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:ROLE_COLOR[m.role], letterSpacing:'1px', marginBottom:'0.75rem' }}>// {m.role.toUpperCase()}</div>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'1px', marginBottom:'0.5rem' }}>{m.email}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, justifyContent:'center' }}>
              {(m.skills||[]).map(s => <span key={s} className="tag-skill">{s}</span>)}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1', padding:'4rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'1rem', opacity:0.4 }}>🔍</div>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.8rem', color:'#3a7a50', letterSpacing:'2px' }}>NO MEMBERS FOUND</div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
