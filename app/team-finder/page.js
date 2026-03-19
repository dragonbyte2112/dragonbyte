// app/team-finder/page.js
// Reads from global store — admin controls team finder on/off
'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getStore, addRequest } from '../../lib/store'
import Footer from '../../components/Footer'

const SKILL_OPTIONS = ['WEB','CRYPTO','FORENSICS','REV','PWN','OSINT']
const AVATAR_BG = ['linear-gradient(135deg,#00cc55,#006622)','linear-gradient(135deg,#0066aa,#003366)','linear-gradient(135deg,#aa0020,#660010)','linear-gradient(135deg,#aa6600,#664400)','linear-gradient(135deg,#6600aa,#330066)']

export default function TeamFinderPage() {
  const [tf,       setTF]       = useState({ enabled:false, name:'', description:'', slots:0, requirements:[], teamMembers:[] })
  const [showForm, setShowForm] = useState(false)
  const [name,     setName]     = useState('')
  const [exp,      setExp]      = useState('')
  const [contact,  setContact]  = useState('')
  const [skills,   setSkills]   = useState([])
  const [posts,    setPosts]    = useState([])

  useEffect(() => {
    const load = () => {
      const s = getStore()
      setTF({ ...s.teamFinder, requirements:[...s.teamFinder.requirements], teamMembers:[...s.teamFinder.teamMembers] })
    }
    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [])

  const toggleSkill = s => setSkills(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s])

  const handleSubmit = () => {
    if (!name || !exp || !contact) { toast.error('Fill all required fields!'); return }
    setPosts(p => [{ id: Date.now(), name, exp, contact, skills, status:'open' }, ...p])
    setName(''); setExp(''); setContact(''); setSkills([])
    setShowForm(false)
    toast.success('✓ POST SUBMITTED')
  }

  return (
    <div className="page-enter">
      <div style={{ padding:'3rem 2rem 1rem', maxWidth:900, margin:'0 auto' }}>
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:900, color:'#00ff6e', marginBottom:'0.5rem' }}>TEAM FINDER</h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'1.5rem' }}>&gt; FIND YOUR CREW</p>

        {/* Admin team card */}
        {tf.enabled ? (
          <div className="db-card" style={{ padding:0, overflow:'hidden', marginBottom:'2rem' }}>
            <div style={{ padding:'1.25rem 1.5rem', background:'#00ff6e06', borderBottom:'1px solid #0f3020', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.1rem', fontWeight:700, color:'#00ff6e', letterSpacing:'2px', marginBottom:6 }}>{tf.name}</div>
                <div style={{ fontSize:'0.88rem', color:'#3a7a50', lineHeight:1.6, maxWidth:500 }}>{tf.description}</div>
              </div>
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', padding:'6px 14px', borderRadius:4, whiteSpace:'nowrap', background:tf.slots>0?'#00ff6e08':'#ff204008', border:`1px solid ${tf.slots>0?'#00cc5544':'#ff204044'}`, color:tf.slots>0?'#00ff6e':'#ff2040' }}>
                {tf.slots} SLOT{tf.slots!==1?'S':''} {tf.slots>0?'OPEN':'FULL'}
              </span>
            </div>
            <div style={{ padding:'1.25rem 1.5rem' }}>
              {tf.requirements.length > 0 && (
                <div style={{ marginBottom:'1.25rem' }}>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:8 }}>LOOKING FOR</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {tf.requirements.map((r,i)=><span key={i} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', padding:'4px 12px', background:'#00d4ff10', border:'1px solid #00d4ff25', borderRadius:2, color:'#00d4ff', letterSpacing:'1px' }}>{r}</span>)}
                  </div>
                </div>
              )}
              {tf.teamMembers.length > 0 && (
                <div>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:8 }}>CURRENT MEMBERS</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8 }}>
                    {tf.teamMembers.map((m,i)=>(
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#0a2010', border:'1px solid #0f3020', borderRadius:4 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:AVATAR_BG[i%AVATAR_BG.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'0.65rem', fontWeight:700, color:'#020c06', flexShrink:0 }}>{(m.name[0]||'?').toUpperCase()}</div>
                        <div>
                          <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#b0ffcc' }}>{m.name}</div>
                          <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#3a7a50', marginTop:1 }}>{m.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:6, padding:'2rem', textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>🔒</div>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#ff2040', letterSpacing:'2px', marginBottom:'0.5rem' }}>TEAM FINDER OFFLINE</div>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#3a7a50', letterSpacing:'1px' }}>Admin has closed team recruitment. Check back soon!</div>
          </div>
        )}

        {/* Post LFT form */}
        <button className="btn-primary" style={{ marginBottom:'1.5rem' }} onClick={()=>setShowForm(!showForm)}>
          {showForm ? 'CANCEL' : '+ POST LOOKING FOR TEAM'}
        </button>

        {showForm && (
          <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00cc55', borderRadius:6, padding:'1.5rem', marginBottom:'1.5rem' }}>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.75rem', color:'#00ff6e', letterSpacing:'2px', marginBottom:'1rem' }}>POST — LOOKING FOR TEAM</div>
            <div style={{ marginBottom:'1rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:6 }}>YOUR HANDLE *</label><input className="db-input" placeholder="0xYourName" value={name} onChange={e=>setName(e.target.value)} /></div>
            <div style={{ marginBottom:'1rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:6 }}>EXPERIENCE LEVEL *</label><select className="db-select" value={exp} onChange={e=>setExp(e.target.value)}><option value="">Select...</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
            <div style={{ marginBottom:'1rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:8 }}>SKILLS</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {SKILL_OPTIONS.map(s=><label key={s} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:skills.includes(s)?'#00ff6e':'#3a7a50', cursor:'pointer' }}><input type="checkbox" checked={skills.includes(s)} onChange={()=>toggleSkill(s)} style={{ accentColor:'#00ff6e' }} /> {s}</label>)}
              </div>
            </div>
            <div style={{ marginBottom:'1rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:6 }}>CONTACT (DISCORD / EMAIL) *</label><input className="db-input" placeholder="discord#1234" value={contact} onChange={e=>setContact(e.target.value)} /></div>
            <button className="btn-primary" onClick={handleSubmit}>SUBMIT POST</button>
          </div>
        )}
      </div>

      {/* Community posts */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 2rem 4rem' }}>
        {posts.length > 0 && (
          <>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'1rem' }}>// COMMUNITY POSTS</div>
            {posts.map((p,i) => (
              <div key={p.id} className="db-card" style={{ padding:'1.5rem', marginBottom:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:AVATAR_BG[i%AVATAR_BG.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'0.85rem', fontWeight:700, color:'#020c06', flexShrink:0 }}>{p.name.slice(0,2).toUpperCase()}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#b0ffcc', letterSpacing:'1px' }}>{p.name}</div>
                    <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50', letterSpacing:'1px', marginTop:2 }}>// {p.exp.toUpperCase()}</div>
                  </div>
                  <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'3px 10px', borderRadius:2, letterSpacing:'1px', background:'#00ff6e15', color:'#00ff6e', border:'1px solid #00cc55' }}>OPEN</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'0.75rem' }}>{p.skills.map(s=><span key={s} className="tag-skill">{s}</span>)}</div>
                <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#00d4ff', letterSpacing:'1px' }}>📡 {p.contact}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
