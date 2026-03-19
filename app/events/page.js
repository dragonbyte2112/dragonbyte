// app/events/page.js — reads from Firebase in real-time
'use client'
import { useState, useEffect } from 'react'
import { listenEvents } from '../../lib/db'
import Footer from '../../components/Footer'

const TS = { CTF:{bg:'#00ff6e15',c:'#00ff6e',b:'1px solid #00cc55'}, WORKSHOP:{bg:'#00d4ff15',c:'#00d4ff',b:'1px solid #00d4ff'}, TALK:{bg:'#ff204015',c:'#ff2040',b:'1px solid #ff2040'}, COMPETITION:{bg:'#ffcc0015',c:'#ffcc00',b:'1px solid #cc9900'} }

export default function EventsPage() {
  const [events,  setEvents]  = useState([])
  const [tab,     setTab]     = useState('upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = listenEvents(data => { setEvents(data); setLoading(false) })
    return () => unsub()
  }, [])

  const filtered = events.filter(e => e.status === tab)

  return (
    <div className="page-enter">
      <div style={{ padding:'3rem 2rem 1rem', maxWidth:900, margin:'0 auto' }}>
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:900, color:'#00ff6e', marginBottom:'0.5rem' }}>EVENTS</h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'1.5rem' }}>&gt; CTF &amp; WORKSHOPS — LIVE FROM FIREBASE</p>
        <div style={{ display:'flex', border:'1px solid #0f3020', borderRadius:4, overflow:'hidden', width:'fit-content', marginBottom:'2rem' }}>
          {[{k:'upcoming',l:'UPCOMING'},{k:'past',l:'PAST EVENTS'}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', padding:'10px 24px', cursor:'pointer', letterSpacing:'2px', border:'none', background:tab===t.k?'#00cc55':'transparent', color:tab===t.k?'#020c06':'#3a7a50', fontWeight:tab===t.k?700:400 }}>{t.l}</button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 2rem 4rem' }}>
        {loading
          ? <div style={{ padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'2px' }}>🐉 LOADING FROM FIREBASE...</div>
          : filtered.length===0
            ? <div style={{ padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'2px' }}>NO {tab.toUpperCase()} EVENTS — ADMIN CAN ADD FROM DASHBOARD</div>
            : filtered.map(ev=>(
              <div key={ev.id} className="db-card" style={{ padding:'1.5rem', marginBottom:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', marginBottom:'0.75rem' }}>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.9rem', color:'#b0ffcc', letterSpacing:'1px' }}>{ev.title}</div>
                  {ev.type&&<span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'3px 10px', borderRadius:2, letterSpacing:'1px', flexShrink:0, background:TS[ev.type]?.bg, color:TS[ev.type]?.c, border:TS[ev.type]?.b }}>{ev.type}</span>}
                </div>
                <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'0.75rem' }}>
                  <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#00d4ff', letterSpacing:'1px' }}>📅 {ev.date?new Date(ev.date+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—'}{ev.time?` — ${ev.time}`:''}</span>
                  {ev.org&&<span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#3a7a50', letterSpacing:'1px' }}>🏢 {ev.org}</span>}
                </div>
                <div style={{ fontSize:'0.88rem', color:'#3a7a50', lineHeight:1.6, marginBottom:'1rem' }}>{ev.desc}</div>
                {ev.link?<a href={ev.link} target="_blank" rel="noreferrer" style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#00ff6e', letterSpacing:'1px', borderBottom:'1px solid #00cc55', textDecoration:'none' }}>// REGISTER / JOIN →</a>:<span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#3a7a50', letterSpacing:'1px' }}>// LINK TBA</span>}
              </div>
            ))
        }
      </div>
      <Footer />
    </div>
  )
}
