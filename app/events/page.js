// app/events/page.js
// Reads from global store — reflects admin changes instantly
'use client'
import { useState, useEffect } from 'react'
import { getStore } from '../../lib/store'
import Footer from '../../components/Footer'

const TAG_STYLE = {
  CTF:         { background:'#00ff6e15', color:'#00ff6e', border:'1px solid #00cc55' },
  WORKSHOP:    { background:'#00d4ff15', color:'#00d4ff', border:'1px solid #00d4ff' },
  TALK:        { background:'#ff204015', color:'#ff2040', border:'1px solid #ff2040' },
  COMPETITION: { background:'#ffcc0015', color:'#ffcc00', border:'1px solid #cc9900' },
}

function EventCard({ event }) {
  return (
    <div className="db-card" style={{ padding:'1.5rem', marginBottom:'1.25rem' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', marginBottom:'0.75rem' }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.9rem', color:'#b0ffcc', letterSpacing:'1px' }}>{event.title}</div>
        <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'3px 10px', borderRadius:2, letterSpacing:'1px', flexShrink:0, ...(TAG_STYLE[event.type]||TAG_STYLE.CTF) }}>{event.type}</span>
      </div>
      <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'0.75rem' }}>
        <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#00d4ff', letterSpacing:'1px' }}>
          📅 {event.date ? new Date(event.date+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
          {event.time ? ` — ${event.time}` : ''}
        </span>
        {event.org && <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#3a7a50', letterSpacing:'1px' }}>🏢 {event.org}</span>}
      </div>
      <div style={{ fontSize:'0.88rem', color:'#3a7a50', lineHeight:1.6, marginBottom:'1rem' }}>{event.desc}</div>
      {event.link
        ? <a href={event.link} target="_blank" rel="noreferrer" style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#00ff6e', letterSpacing:'1px', borderBottom:'1px solid #00cc55', textDecoration:'none' }}>// REGISTER / JOIN →</a>
        : <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#3a7a50', letterSpacing:'1px' }}>// LINK TBA</span>
      }
    </div>
  )
}

export default function EventsPage() {
  const [tab,    setTab]    = useState('upcoming')
  const [events, setEvents] = useState([])

  // Load from store + refresh every 2 seconds for admin changes
  useEffect(() => {
    const load = () => setEvents([...getStore().events])
    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [])

  const filtered = events.filter(e => e.status === tab)

  return (
    <div className="page-enter">
      <div style={{ padding:'3rem 2rem 1rem', maxWidth:900, margin:'0 auto' }}>
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:900, color:'#00ff6e', marginBottom:'0.5rem' }}>EVENTS</h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'1.5rem' }}>&gt; CTF &amp; WORKSHOPS</p>

        {/* Tabs */}
        <div style={{ display:'flex', border:'1px solid #0f3020', borderRadius:4, overflow:'hidden', width:'fit-content', marginBottom:'2rem' }}>
          {[
            { key:'upcoming', label:'UPCOMING' },
            { key:'past',     label:'PAST EVENTS' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', padding:'10px 24px',
              cursor:'pointer', letterSpacing:'2px', border:'none',
              background: tab===t.key ? '#00cc55' : 'transparent',
              color:      tab===t.key ? '#020c06' : '#3a7a50',
              fontWeight: tab===t.key ? 700 : 400, transition:'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 2rem 4rem' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'2px' }}>
            NO {tab.toUpperCase()} EVENTS — ADMIN CAN ADD FROM DASHBOARD
          </div>
        ) : (
          filtered.map(ev => <EventCard key={ev.id} event={ev} />)
        )}
      </div>

      <Footer />
    </div>
  )
}
