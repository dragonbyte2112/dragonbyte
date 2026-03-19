// app/join/page.js — saves to Firebase Firestore
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addJoinRequest } from '../../lib/db'
import Footer from '../../components/Footer'

const SKILLS = ['WEB','CRYPTO','FORENSICS','REV','PWN','OSINT']

export default function JoinPage() {
  const router = useRouter()
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [exp,       setExp]       = useState('')
  const [why,       setWhy]       = useState('')
  const [skills,    setSkills]    = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const toggleSkill = s => setSkills(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s])

  const handleSubmit = async () => {
    setError('')
    if(!name.trim())  { setError('Please enter your name or handle.'); return }
    if(!email.trim()) { setError('Please enter your email address.'); return }
    if(!exp)          { setError('Please select your experience level.'); return }
    setSaving(true)
    try {
      await addJoinRequest({ name:name.trim(), email:email.trim(), exp, why:why.trim(), skills })
      setSubmitted(true)
    } catch(e) { setError('Failed to submit. Please try again.') }
    setSaving(false)
  }

  if(submitted) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00cc55', borderRadius:8, padding:'3rem', maxWidth:480, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🐉</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.1rem', color:'#00ff6e', letterSpacing:'3px', marginBottom:'1rem' }}>APPLICATION SENT!</div>
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'1px', lineHeight:1.8, marginBottom:'0.75rem' }}>
          Your request has been saved to Firebase.<br/>
          The admin will see it in the dashboard and approve you!
        </div>
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#00cc55', letterSpacing:'1px', marginBottom:'2rem' }}>✅ SAVED TO FIREBASE DATABASE</div>
        <button onClick={()=>router.push('/')} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'12px 28px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>← BACK TO HOME</button>
      </div>
    </div>
  )

  return (
    <div className="page-enter">
      <div style={{ padding:'3rem 2rem 1rem', maxWidth:900, margin:'0 auto', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:900, color:'#00ff6e', marginBottom:'0.5rem' }}>JOIN US</h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'2rem' }}>&gt; BECOME PART OF THE CREW</p>
      </div>
      <div style={{ maxWidth:580, margin:'0 auto', padding:'0 2rem 4rem' }}>
        <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00cc55', borderRadius:8, padding:'2rem' }}>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', color:'#00ff6e', letterSpacing:'3px', marginBottom:'1.5rem' }}>// COMMUNITY APPLICATION — SAVES TO FIREBASE</div>
          {error&&<div style={{ background:'#ff204015', border:'1px solid #cc0020', borderRadius:4, padding:'0.75rem 1rem', marginBottom:'1rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#ff2040', letterSpacing:'1px' }}>✖ {error}</div>}

          <div style={{ marginBottom:'1.25rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:6 }}>FULL NAME / HANDLE *</label><input className="db-input" type="text" placeholder="0xYourName" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div style={{ marginBottom:'1.25rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:6 }}>EMAIL ADDRESS *</label><input className="db-input" type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div style={{ marginBottom:'1.25rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:6 }}>EXPERIENCE LEVEL *</label>
            <select className="db-select" value={exp} onChange={e=>setExp(e.target.value)}><option value="">Select...</option><option>Complete Beginner</option><option>Some CTF Experience</option><option>Intermediate</option><option>Advanced</option></select>
          </div>
          <div style={{ marginBottom:'1.25rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:8 }}>SKILLS</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {SKILLS.map(s=><label key={s} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:skills.includes(s)?'#00ff6e':'#3a7a50', cursor:'pointer' }}><input type="checkbox" checked={skills.includes(s)} onChange={()=>toggleSkill(s)} style={{ accentColor:'#00ff6e' }} />{s}</label>)}
            </div>
          </div>
          <div style={{ marginBottom:'1.5rem' }}><label style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:6 }}>WHY DO YOU WANT TO JOIN?</label><textarea className="db-textarea" style={{ height:90 }} placeholder="Tell us about yourself..." value={why} onChange={e=>setWhy(e.target.value)} /></div>
          <button onClick={handleSubmit} disabled={saving} style={{ width:'100%', fontFamily:'Orbitron,monospace', fontSize:'0.8rem', fontWeight:700, color:'#020c06', background:saving?'#009944':'#00ff6e', padding:13, border:'none', borderRadius:4, cursor:saving?'not-allowed':'pointer', letterSpacing:'3px', opacity:saving?0.8:1 }}>
            {saving?'💾 SAVING TO FIREBASE...':'SUBMIT APPLICATION'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
