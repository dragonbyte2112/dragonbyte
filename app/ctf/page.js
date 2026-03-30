// app/ctf/page.js — CTF Hub
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { listenChallenges } from '../../lib/ctf'
import { useAuth } from '../../lib/AuthContext'
import Footer from '../../components/Footer'

const CAT_ICONS  = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', osint:'👁️', misc:'🚩' }
const CAT_COLORS = { web:'#00ff6e', crypto:'#00d4ff', forensics:'#ffcc00', pwn:'#ff2040', rev:'#aa66ff', osint:'#ff8800', misc:'#3a7a50' }
const DIFF_COLORS= { easy:'#00ff6e', medium:'#ffcc00', hard:'#ff2040', insane:'#aa66ff' }

export default function CTFPage() {
  const { user, profile } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const unsub = listenChallenges(data => { setChallenges(data.filter(c => c.published)); setLoading(false) })
    return () => unsub()
  }, [])

  const published = challenges.filter(c => c.published)
  const categories = [...new Set(published.map(c => c.category))]
  const totalPoints = published.reduce((sum, c) => sum + (c.points || 0), 0)

  return (
    <div className="page-enter">
      {/* Header */}
      <section style={{ position:'relative', padding:'4rem 2rem 3rem', textAlign:'center', overflow:'hidden' }}>
        <div className="scan-line" />
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#00cc55', border:'1px solid #00cc55', padding:'4px 16px', borderRadius:2, letterSpacing:'3px', marginBottom:'1.5rem', display:'inline-block' }}>
          &gt; CTF PLATFORM ONLINE
        </div>
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, letterSpacing:'4px', marginBottom:'0.5rem' }}>
          <span style={{ color:'#00ff6e' }}>DRAGON</span><span style={{ color:'#00d4ff' }}>BYTE</span>
          <span style={{ color:'#ffcc00' }}> CTF</span>
        </h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.9rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'2rem' }}>
          &gt; HACK. SOLVE. CONQUER.
        </p>

        {!user ? (
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/register" className="btn-primary">REGISTER TO PLAY</Link>
            <Link href="/login" className="btn-outline-blue">LOGIN</Link>
          </div>
        ) : (
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/ctf/challenges" className="btn-primary">VIEW CHALLENGES →</Link>
            <Link href="/ctf/leaderboard" className="btn-outline-blue">LEADERBOARD</Link>
          </div>
        )}
      </section>

      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#0f3020' }}>
        {[
          { n: published.length,    l:'CHALLENGES'  },
          { n: categories.length,   l:'CATEGORIES'  },
          { n: totalPoints,         l:'TOTAL POINTS' },
          { n: published.filter(c=>c.solveCount>0).length, l:'SOLVED BY SOMEONE' },
        ].map(({ n, l }) => (
          <div key={l} style={{ background:'#030f08', padding:'1.25rem 1rem', textAlign:'center' }}>
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:'1.8rem', fontWeight:900, color:'#00ff6e', display:'block' }}>{n}</span>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'2px', marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section style={{ padding:'3rem 2rem', maxWidth:1100, margin:'0 auto' }}>
        <div className="section-header">
          <div className="section-line" />
          <div className="section-title">CATEGORIES</div>
          <div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} />
        </div>
        {loading ? (
          <div style={{ textAlign:'center', padding:'3rem', fontFamily:'"Share Tech Mono",monospace', color:'#3a7a50' }}>🐉 LOADING CHALLENGES...</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
            {categories.map(cat => {
              const catChallenges = published.filter(c => c.category === cat)
              const catPoints = catChallenges.reduce((s,c) => s + (c.points||0), 0)
              return (
                <Link key={cat} href={`/ctf/challenges?cat=${cat}`} style={{ textDecoration:'none' }}>
                  <div className="db-card" style={{ padding:'1.5rem', textAlign:'center', cursor:'pointer' }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>{CAT_ICONS[cat]||'🚩'}</div>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.8rem', color:CAT_COLORS[cat]||'#00ff6e', letterSpacing:'2px', marginBottom:'0.5rem' }}>{cat.toUpperCase()}</div>
                    <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50', letterSpacing:'1px' }}>{catChallenges.length} challenges • {catPoints} pts</div>
                  </div>
                </Link>
              )
            })}
            {categories.length === 0 && (
              <div style={{ gridColumn:'1/-1', padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'2px' }}>
                NO CHALLENGES YET — ADMIN CAN ADD FROM DASHBOARD
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign:'center' }}>
          <Link href="/ctf/challenges" className="btn-primary" style={{ marginRight:'1rem' }}>ALL CHALLENGES →</Link>
          <Link href="/ctf/leaderboard" className="btn-outline-blue">VIEW LEADERBOARD</Link>
        </div>
      </section>

      {/* Recent solves preview */}
      {user && (
        <section style={{ padding:'0 2rem 3rem', maxWidth:1100, margin:'0 auto' }}>
          <div className="section-header">
            <div className="section-line" />
            <div className="section-title">QUICK START</div>
            <div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
            {[
              { icon:'🌐', title:'WEB EXPLOITATION', desc:'XSS, SQLi, IDOR, LFI and more', link:'/ctf/challenges?cat=web', color:'#00ff6e' },
              { icon:'🔐', title:'CRYPTOGRAPHY', desc:'Caesar, RSA, AES and more', link:'/ctf/challenges?cat=crypto', color:'#00d4ff' },
              { icon:'🔍', title:'FORENSICS', desc:'File analysis, steganography', link:'/ctf/challenges?cat=forensics', color:'#ffcc00' },
              { icon:'💥', title:'PWN / EXPLOIT', desc:'Buffer overflow, ROP chains', link:'/ctf/challenges?cat=pwn', color:'#ff2040' },
            ].map(({ icon, title, desc, link, color }) => (
              <Link key={title} href={link} style={{ textDecoration:'none' }}>
                <div className="db-card" style={{ padding:'1.5rem', cursor:'pointer' }}>
                  <div style={{ fontSize:'1.8rem', marginBottom:'0.75rem' }}>{icon}</div>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.78rem', color, letterSpacing:'1px', marginBottom:'0.5rem' }}>{title}</div>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', letterSpacing:'1px' }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
