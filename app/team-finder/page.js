// app/team-finder/page.js
'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Footer from '../../components/Footer'

const SKILL_OPTIONS = ['WEB','CRYPTO','FORENSICS','REV','PWN','OSINT']
const avatarColors  = [
  'linear-gradient(135deg,#00cc55,#006622)',
  'linear-gradient(135deg,#0066aa,#003366)',
  'linear-gradient(135deg,#aa0020,#660010)',
  'linear-gradient(135deg,#aa6600,#664400)',
  'linear-gradient(135deg,#6600aa,#330066)',
]

const INITIAL_POSTS = [
  { id:1, name:'PhantomBit', exp:'Intermediate', skills:['CRYPTO','REV'],      contact:'phantom#1337',  status:'open'   },
  { id:2, name:'ByteStorm',  exp:'Advanced',     skills:['PWN','WEB','REV'],   contact:'bytestorm@dc',  status:'open'   },
  { id:3, name:'NeonHex',    exp:'Beginner',     skills:['WEB'],              contact:'neonhex#0000',  status:'closed' },
]

export default function TeamFinderPage() {
  const [posts, setPosts]         = useState(INITIAL_POSTS)
  const [showForm, setShowForm]   = useState(false)
  const [name, setName]           = useState('')
  const [exp, setExp]             = useState('')
  const [contact, setContact]     = useState('')
  const [skills, setSkills]       = useState([])

  const toggleSkill = (s) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSubmit = () => {
    if (!name || !exp || !contact) { toast.error('Fill all required fields!'); return }
    const newPost = { id: Date.now(), name, exp, contact, skills, status:'open' }
    setPosts([newPost, ...posts])
    setName(''); setExp(''); setContact(''); setSkills([])
    setShowForm(false)
    toast.success('✓ POST SUBMITTED')
  }

  return (
    <div className="page-enter">
      <div style={{ padding: '3rem 2rem 1rem', maxWidth: 900, margin: '0 auto' }}>
        <h1 className="glitch" style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: '#00ff6e', marginBottom: '0.5rem' }}>
          TEAM FINDER
        </h1>
        <p style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.78rem', color: '#3a7a50', letterSpacing: '3px', marginBottom: '1.5rem' }}>
          &gt; FIND YOUR CREW
        </p>

        <button className="btn-primary" style={{ marginBottom: '1.5rem' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'CANCEL' : '+ POST LOOKING FOR TEAM'}
        </button>

        {/* Post form */}
        {showForm && (
          <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderTop: '3px solid #00cc55', borderRadius: 6, padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.75rem', color: '#00ff6e', letterSpacing: '2px', marginBottom: '1rem' }}>POST — LOOKING FOR TEAM</div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 6 }}>YOUR HANDLE *</label>
              <input className="db-input" placeholder="0xYourName" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 6 }}>EXPERIENCE LEVEL *</label>
              <select className="db-select" value={exp} onChange={e => setExp(e.target.value)}>
                <option value="">Select...</option>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 8 }}>SKILLS</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {SKILL_OPTIONS.map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Share Tech Mono",monospace', fontSize: '0.7rem', color: skills.includes(s) ? '#00ff6e' : '#3a7a50', cursor: 'pointer' }}>
                    <input type="checkbox" checked={skills.includes(s)} onChange={() => toggleSkill(s)} style={{ accentColor: '#00ff6e' }} /> {s}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 6 }}>CONTACT (DISCORD / EMAIL) *</label>
              <input className="db-input" placeholder="discord#1234" value={contact} onChange={e => setContact(e.target.value)} />
            </div>

            <button className="btn-primary" onClick={handleSubmit}>SUBMIT POST</button>
          </div>
        )}
      </div>

      {/* Posts */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {posts.map((p, i) => (
          <div key={p.id} className="db-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron,monospace', fontSize: '0.85rem', fontWeight: 700, color: '#020c06', flexShrink: 0 }}>
                {p.name.slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.82rem', color: '#b0ffcc', letterSpacing: '1px' }}>{p.name}</div>
                <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', color: '#3a7a50', letterSpacing: '1px', marginTop: 2 }}>// {p.exp.toUpperCase()}</div>
              </div>
              <span style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.6rem', padding: '3px 10px', borderRadius: 2, letterSpacing: '1px', background: p.status === 'open' ? '#00ff6e15' : '#ff204015', color: p.status === 'open' ? '#00ff6e' : '#ff2040', border: `1px solid ${p.status === 'open' ? '#00cc55' : '#cc0020'}` }}>
                {p.status.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.75rem' }}>
              {p.skills.map(s => <span key={s} className="tag-skill">{s}</span>)}
            </div>
            <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.72rem', color: '#00d4ff', letterSpacing: '1px' }}>📡 {p.contact}</div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}
