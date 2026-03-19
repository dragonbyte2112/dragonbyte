// app/page.js — Home Page
// Reads members + events from global store
// Admin changes reflect here instantly
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStore } from '../lib/store'
import Footer from '../components/Footer'

// ── Animated counter ──
function useCounter(target) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 20)
    return () => clearInterval(timer)
  }, [target])
  return count
}

const AVATAR_BG = [
  'linear-gradient(135deg,#00cc55,#006622)',
  'linear-gradient(135deg,#0066aa,#003366)',
  'linear-gradient(135deg,#aa0020,#660010)',
  'linear-gradient(135deg,#aa6600,#664400)',
  'linear-gradient(135deg,#6600aa,#330066)',
  'linear-gradient(135deg,#005566,#002233)',
]
const ROLE_COLOR = { admin: '#ff2040', player: '#00ff6e', beginner: '#00d4ff' }
const TAG_STYLE  = {
  CTF:      { background:'#00ff6e15', color:'#00ff6e', border:'1px solid #00cc55' },
  WORKSHOP: { background:'#00d4ff15', color:'#00d4ff', border:'1px solid #00d4ff' },
  TALK:     { background:'#ff204015', color:'#ff2040', border:'1px solid #ff2040' },
}

export default function HomePage() {
  const [members,  setMembers]  = useState([])
  const [events,   setEvents]   = useState([])
  const [stats,    setStats]    = useState({ totalMembers: 0, totalEvents: 0 })

  // Load from global store
  useEffect(() => {
    const store = getStore()
    setMembers(store.members.slice(0, 4))   // show first 4
    setEvents(store.events.filter(e => e.status === 'upcoming').slice(0, 3)) // show 3 upcoming
    setStats({ totalMembers: store.members.length, totalEvents: store.events.length })

    // Refresh every 2 seconds to catch admin changes
    const interval = setInterval(() => {
      const s = getStore()
      setMembers(s.members.slice(0, 4))
      setEvents(s.events.filter(e => e.status === 'upcoming').slice(0, 3))
      setStats({ totalMembers: s.members.length, totalEvents: s.events.length })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const memberCount = useCounter(stats.totalMembers || 247)
  const eventCount  = useCounter(stats.totalEvents  || 38)
  const flagCount   = useCounter(1420)
  const teamCount   = useCounter(15)

  return (
    <div className="page-enter">

      {/* ── HERO ── */}
      <section style={{ position:'relative', minHeight:'88vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'4rem 2rem 2rem', overflow:'hidden' }}>
        <div className="scan-line" />
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#00cc55', border:'1px solid #00cc55', padding:'4px 16px', borderRadius:2, letterSpacing:'3px', marginBottom:'1.5rem' }}>
          &gt; CYBERSECURITY COMMUNITY
        </div>
        <img src="/dragon_byte_new.png" alt="DragonByte Logo"
          style={{ width:160, height:160, borderRadius:'50%', border:'2px solid #00cc55', boxShadow:'0 0 40px #00ff6e40', marginBottom:'1.5rem', objectFit:'cover' }}
          onError={e => e.target.style.display='none'}
        />
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(2rem,6vw,4rem)', fontWeight:900, letterSpacing:'4px', lineHeight:1.1, marginBottom:'0.5rem' }}>
          <span style={{ color:'#00ff6e', textShadow:'0 0 30px #00ff6e80' }}>DRAGON</span>
          <span style={{ color:'#00d4ff', textShadow:'0 0 30px #00d4ff80' }}>BYTE</span>
        </h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'clamp(0.8rem,2vw,1rem)', color:'#3a7a50', letterSpacing:'4px', marginBottom:'0.5rem' }}>&gt; COMMUNITY</p>
        <p style={{ fontSize:'1.1rem', color:'#7abf90', marginBottom:'2.5rem', fontWeight:600, letterSpacing:'1px' }}>
          <span style={{ color:'#00ff6e' }}>Learn.</span> Hack. <span style={{ color:'#00ff6e' }}>Defend.</span> Grow.
        </p>
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
          <Link href="/join"   className="btn-primary">JOIN COMMUNITY</Link>
          <Link href="/events" className="btn-outline-blue">EXPLORE EVENTS</Link>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#0f3020' }}>
        {[
          { num: memberCount, label:'MEMBERS'      },
          { num: eventCount,  label:'EVENTS HELD'  },
          { num: flagCount,   label:'CTF FLAGS'     },
          { num: teamCount,   label:'ACTIVE TEAMS'  },
        ].map(({ num, label }) => (
          <div key={label} style={{ background:'#030f08', padding:'1.5rem 1rem', textAlign:'center' }}>
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:'2rem', fontWeight:900, color:'#00ff6e', display:'block', textShadow:'0 0 15px #00ff6e60' }}>{num}</span>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#3a7a50', letterSpacing:'2px', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── UPCOMING EVENTS ── */}
      <section style={{ padding:'4rem 2rem', maxWidth:1100, margin:'0 auto' }}>
        <div className="section-header">
          <div className="section-line" />
          <div className="section-title">UPCOMING EVENTS</div>
          <div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} />
        </div>

        {events.length === 0 ? (
          <div style={{ textAlign:'center', padding:'2rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'2px' }}>
            NO UPCOMING EVENTS — CHECK BACK SOON
          </div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="db-card" style={{ padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'1rem' }}>
              <div style={{ background:'#00d4ff12', border:'1px solid #0099cc', borderRadius:4, padding:'8px 12px', textAlign:'center', minWidth:56, flexShrink:0 }}>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.3rem', fontWeight:900, color:'#00d4ff', lineHeight:1 }}>
                  {ev.date ? new Date(ev.date+'T00:00:00').getDate() : '??'}
                </div>
                <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#0099cc', letterSpacing:'2px', marginTop:2 }}>
                  {ev.date ? new Date(ev.date+'T00:00:00').toLocaleString('en',{month:'short'}).toUpperCase() : '???'}
                </div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#b0ffcc', letterSpacing:'1px' }}>{ev.title}</div>
                  <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'3px 10px', borderRadius:2, letterSpacing:'1px', ...TAG_STYLE[ev.type] }}>{ev.type}</span>
                </div>
                <div style={{ fontSize:'0.82rem', color:'#3a7a50', lineHeight:1.4 }}>{ev.desc}</div>
              </div>
            </div>
          ))
        )}

        <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
          <Link href="/events" className="btn-outline-blue" style={{ fontSize:'0.68rem', padding:'10px 24px' }}>VIEW ALL EVENTS →</Link>
        </div>
      </section>

      {/* ── FEATURED MEMBERS ── */}
      <section style={{ padding:'0 2rem 4rem', maxWidth:1100, margin:'0 auto' }}>
        <div className="section-header">
          <div className="section-line" />
          <div className="section-title">FEATURED MEMBERS</div>
          <div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1.25rem' }}>
          {members.map((m, i) => (
            <div key={m.id} className="db-card" style={{ padding:'1.5rem', textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:AVATAR_BG[m.id % AVATAR_BG.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'1.1rem', fontWeight:900, color:'#020c06', margin:'0 auto 1rem', border:'2px solid #0f3020' }}>
                {m.name.slice(0,2).toUpperCase()}
              </div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.78rem', color:'#b0ffcc', letterSpacing:'1px', marginBottom:4 }}>{m.name}</div>
              <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:ROLE_COLOR[m.role], letterSpacing:'1px', marginBottom:'0.75rem' }}>// {m.role.toUpperCase()}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, justifyContent:'center' }}>
                {(m.skills||[]).map(s => <span key={s} className="tag-skill">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
          <Link href="/members" className="btn-outline-blue" style={{ fontSize:'0.68rem', padding:'10px 24px' }}>VIEW ALL MEMBERS →</Link>
        </div>
      </section>

      {/* ── WHY DRAGONBYTE ── */}
      <section style={{ padding:'0 2rem 4rem', maxWidth:1100, margin:'0 auto' }}>
        <div className="section-header">
          <div className="section-line" />
          <div className="section-title">WHY DRAGONBYTE</div>
          <div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
          {[
            { icon:'🛡️', title:'LEARN CTF',   text:'Structured learning paths for every cybersecurity domain — from beginner to advanced.' },
            { icon:'⚔️', title:'COMPETE',     text:'Participate in national and international CTF competitions as a united team.' },
            { icon:'🤝', title:'COLLABORATE', text:'Find your team, share writeups, and grow together in a tight-knit community.' },
          ].map(({ icon, title, text }) => (
            <div key={title} className="db-card" style={{ padding:'1.5rem' }}>
              <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>{icon}</div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00ff6e', letterSpacing:'2px', marginBottom:'0.5rem' }}>{title}</div>
              <div style={{ fontSize:'0.9rem', color:'#3a7a50', lineHeight:1.6 }}>{text}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
