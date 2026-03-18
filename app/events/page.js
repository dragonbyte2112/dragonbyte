// app/events/page.js
'use client'
import { useState } from 'react'
import Footer from '../../components/Footer'

// Sample events — replace with Firestore fetch in production
const EVENTS = {
  upcoming: [
    { id:1, title:'picoCTF 2025 Team Round',     type:'CTF',      date:'28 Mar 2025', time:'09:00', desc:'Join our team for the biggest beginner CTF of the year. All skill levels welcome. Register via the link below.', link:'https://picoctf.org',     org:'picoCTF'   },
    { id:2, title:'Web Exploitation Workshop',    type:'WORKSHOP', date:'05 Apr 2025', time:'18:00', desc:'XSS, SQLi, IDOR — live practice on intentionally vulnerable apps. Bring your laptop.',                           link:'',                        org:'Internal'  },
    { id:3, title:'Reverse Engineering Talk',     type:'TALK',     date:'15 Apr 2025', time:'19:00', desc:'Introduction to binary analysis with Ghidra and pwndbg.',                                                        link:'',                        org:'Internal'  },
    { id:4, title:'HackTheBox Monthly',           type:'CTF',      date:'22 Apr 2025', time:'00:00', desc:'Monthly HTB challenge — compete for community leaderboard points.',                                               link:'https://hackthebox.com',  org:'HackTheBox'},
  ],
  past: [
    { id:5, title:'CTFtime New Year Blast',       type:'CTF',      date:'05 Jan 2025', time:'',      desc:'Community participation in New Year CTF. 3rd place overall finish.',                                             link:'',                        org:'CTFtime'   },
    { id:6, title:'Linux Fundamentals Workshop',  type:'WORKSHOP', date:'10 Feb 2025', time:'18:00', desc:'Covered bash scripting, file system, permissions, and essential CTF tools.',                                     link:'',                        org:'Internal'  },
    { id:7, title:'OSINT Challenge Night',        type:'TALK',     date:'01 Mar 2025', time:'20:00', desc:'Internal OSINT challenge — 18 participants, 6 flags captured.',                                                  link:'',                        org:'Internal'  },
  ],
}

const tagClass = { CTF: 'tag-ctf', WORKSHOP: 'tag-workshop', TALK: 'tag-talk' }

function EventCard({ event }) {
  return (
    <div className="db-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.9rem', color: '#b0ffcc', letterSpacing: '1px' }}>{event.title}</div>
        <span className={`tag ${tagClass[event.type] || 'tag-ctf'}`} style={{ flexShrink: 0 }}>{event.type}</span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <span style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.72rem', color: '#00d4ff', letterSpacing: '1px' }}>📅 {event.date}{event.time ? ` — ${event.time}` : ''}</span>
        <span style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.72rem', color: '#3a7a50', letterSpacing: '1px' }}>🏢 {event.org}</span>
      </div>
      <div style={{ fontSize: '0.88rem', color: '#3a7a50', lineHeight: 1.6, marginBottom: '1rem' }}>{event.desc}</div>
      {event.link
        ? <a href={event.link} target="_blank" rel="noreferrer" style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.7rem', color: '#00ff6e', letterSpacing: '1px', borderBottom: '1px solid #00cc55', textDecoration: 'none' }}>// REGISTER / JOIN →</a>
        : <span style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.7rem', color: '#3a7a50', letterSpacing: '1px' }}>// LINK TBA</span>
      }
    </div>
  )
}

export default function EventsPage() {
  const [tab, setTab] = useState('upcoming')

  return (
    <div className="page-enter">
      <div style={{ padding: '3rem 2rem 1rem', maxWidth: 900, margin: '0 auto' }}>
        <h1 className="glitch" style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: '#00ff6e', marginBottom: '0.5rem' }}>
          EVENTS
        </h1>
        <p style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.78rem', color: '#3a7a50', letterSpacing: '3px', marginBottom: '1.5rem' }}>
          &gt; CTF &amp; WORKSHOPS
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', border: '1px solid #0f3020', borderRadius: 4, overflow: 'hidden', width: 'fit-content', marginBottom: '2rem' }}>
          {['upcoming','past'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: '"Share Tech Mono",monospace', fontSize: '0.7rem', padding: '10px 24px',
              cursor: 'pointer', letterSpacing: '2px', border: 'none',
              background: tab === t ? '#00cc55' : 'transparent',
              color: tab === t ? '#020c06' : '#3a7a50',
              fontWeight: tab === t ? 700 : 400, transition: 'all 0.2s',
            }}>
              {t === 'upcoming' ? 'UPCOMING' : 'PAST EVENTS'}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {EVENTS[tab].map(event => <EventCard key={event.id} event={event} />)}
      </div>

      <Footer />
    </div>
  )
}
