// app/page.js  ← Home Page
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Footer from '../components/Footer'

// ── Animated counter hook ──
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 20)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 20)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

// ── Stats section ──
function StatsBar() {
  const members = useCounter(247)
  const events  = useCounter(38)
  const flags   = useCounter(1420)
  const teams   = useCounter(15)

  const stats = [
    { num: members, label: 'MEMBERS' },
    { num: events,  label: 'EVENTS HELD' },
    { num: flags,   label: 'CTF FLAGS' },
    { num: teams,   label: 'ACTIVE TEAMS' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#0f3020' }}>
      {stats.map(({ num, label }) => (
        <div key={label} style={{ background: '#030f08', padding: '1.5rem 1rem', textAlign: 'center' }}>
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '2rem', fontWeight: 900, color: '#00ff6e', display: 'block', textShadow: '0 0 15px #00ff6e60' }}>
            {num}
          </span>
          <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.62rem', color: '#3a7a50', letterSpacing: '2px', marginTop: 4 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Featured member card ──
function MemberCard({ name, role, skills, color }) {
  return (
    <div className="db-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron,monospace', fontSize: '1.1rem', fontWeight: 900, color: '#020c06', margin: '0 auto 1rem', border: '2px solid #0f3020' }}>
        {name.slice(0,2).toUpperCase()}
      </div>
      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.78rem', color: '#b0ffcc', letterSpacing: '1px', marginBottom: 4 }}>{name}</div>
      <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', letterSpacing: '1px', marginBottom: '0.75rem', color: role === 'admin' ? '#ff2040' : role === 'player' ? '#00ff6e' : '#00d4ff' }}>// {role.toUpperCase()}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {skills.map(s => <span key={s} className="tag-skill">{s}</span>)}
      </div>
    </div>
  )
}

// ── Event preview card ──
function EventCard({ day, month, title, desc, type }) {
  const tagClass = type === 'CTF' ? 'tag-ctf' : type === 'WORKSHOP' ? 'tag-workshop' : 'tag-talk'
  return (
    <div className="db-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ background: '#00d4ff12', border: '1px solid #0099cc', borderRadius: 4, padding: '8px 12px', textAlign: 'center', minWidth: 56, flexShrink: 0 }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '1.4rem', fontWeight: 900, color: '#00d4ff', lineHeight: 1 }}>{day}</div>
        <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.6rem', color: '#0099cc', letterSpacing: '2px', marginTop: 2 }}>{month}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.82rem', color: '#b0ffcc', letterSpacing: '1px' }}>{title}</div>
          <span className={`tag ${tagClass}`}>{type}</span>
        </div>
        <div style={{ fontSize: '0.82rem', color: '#3a7a50', lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  )
}

// ── Feature card ──
function FeatureCard({ icon, title, text }) {
  return (
    <div className="db-card" style={{ padding: '1.5rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.82rem', color: '#00ff6e', letterSpacing: '2px', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '0.9rem', color: '#3a7a50', lineHeight: 1.6 }}>{text}</div>
    </div>
  )
}

// ── Main Home Page ──
export default function HomePage() {
  return (
    <div className="page-enter">

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem 2rem', overflow: 'hidden' }}>
        <div className="scan-line" />

        <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.7rem', color: '#00cc55', border: '1px solid #00cc55', padding: '4px 16px', borderRadius: 2, letterSpacing: '3px', marginBottom: '1.5rem' }}>
          &gt; CYBERSECURITY COMMUNITY
        </div>

        {/* Logo image — place dragon_byte_new.png in /public folder */}
        <img
          src="/dragon_byte_new.png"
          alt="DragonByte Logo"
          style={{ width: 160, height: 160, borderRadius: '50%', border: '2px solid #00cc55', boxShadow: '0 0 40px #00ff6e40', marginBottom: '1.5rem', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none' }} // hide if logo not yet added
        />

        <h1 className="glitch" style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 900, letterSpacing: '4px', lineHeight: 1.1, marginBottom: '0.5rem' }}>
          <span style={{ color: '#00ff6e', textShadow: '0 0 30px #00ff6e80' }}>DRAGON</span>
          <span style={{ color: '#00d4ff', textShadow: '0 0 30px #00d4ff80' }}>BYTE</span>
        </h1>

        <p style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: 'clamp(0.8rem,2vw,1rem)', color: '#3a7a50', letterSpacing: '4px', marginBottom: '0.5rem' }}>
          &gt; COMMUNITY
        </p>

        <p style={{ fontSize: '1.1rem', color: '#7abf90', marginBottom: '2.5rem', fontWeight: 600, letterSpacing: '1px' }}>
          <span style={{ color: '#00ff6e' }}>Learn.</span> Hack. <span style={{ color: '#00ff6e' }}>Defend.</span> Grow.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/join"   className="btn-primary">JOIN COMMUNITY</Link>
          <Link href="/events" className="btn-outline-blue">EXPLORE EVENTS</Link>
        </div>
      </section>

      {/* ── STATS ── */}
      <StatsBar />

      {/* ── UPCOMING EVENTS PREVIEW ── */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-header">
          <div className="section-line" />
          <div className="section-title">UPCOMING EVENTS</div>
          <div className="section-line" style={{ background: 'linear-gradient(90deg,transparent,#00cc55)' }} />
        </div>
        <EventCard day="28" month="MAR" title="picoCTF 2025 Team Round"      desc="Join our team for the biggest beginner CTF. All levels welcome."        type="CTF"      />
        <EventCard day="05" month="APR" title="Web Exploitation Workshop"     desc="XSS, SQLi, IDOR — live practice on intentionally vulnerable apps."      type="WORKSHOP" />
        <EventCard day="15" month="APR" title="Reverse Engineering Talk"      desc="Introduction to binary analysis with Ghidra and pwndbg."               type="TALK"     />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/events" className="btn-outline-blue" style={{ fontSize: '0.68rem', padding: '10px 24px' }}>VIEW ALL EVENTS →</Link>
        </div>
      </section>

      {/* ── FEATURED MEMBERS ── */}
      <section style={{ padding: '0 2rem 4rem', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-header">
          <div className="section-line" />
          <div className="section-title">FEATURED MEMBERS</div>
          <div className="section-line" style={{ background: 'linear-gradient(90deg,transparent,#00cc55)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1.25rem' }}>
          <MemberCard name="0xAlex"    role="admin"    skills={['WEB','PWN','CRYPTO']}    color="linear-gradient(135deg,#00cc55,#006622)" />
          <MemberCard name="DarkRaven" role="player"   skills={['FORENSICS','OSINT']}     color="linear-gradient(135deg,#0066aa,#003366)" />
          <MemberCard name="ZeroPulse" role="player"   skills={['REV','PWN']}             color="linear-gradient(135deg,#aa0020,#660010)" />
          <MemberCard name="NullX"     role="beginner" skills={['WEB','CRYPTO']}          color="linear-gradient(135deg,#006699,#003355)" />
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/members" className="btn-outline-blue" style={{ fontSize: '0.68rem', padding: '10px 24px' }}>VIEW ALL MEMBERS →</Link>
        </div>
      </section>

      {/* ── WHY DRAGONBYTE ── */}
      <section style={{ padding: '0 2rem 4rem', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-header">
          <div className="section-line" />
          <div className="section-title">WHY DRAGONBYTE</div>
          <div className="section-line" style={{ background: 'linear-gradient(90deg,transparent,#00cc55)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.5rem' }}>
          <FeatureCard icon="🛡️" title="LEARN CTF"    text="Structured learning paths for every cybersecurity domain — from beginner to advanced." />
          <FeatureCard icon="⚔️" title="COMPETE"      text="Participate in national and international CTF competitions as a united team." />
          <FeatureCard icon="🤝" title="COLLABORATE"  text="Find your team, share writeups, and grow together in a tight-knit community." />
        </div>
      </section>

      <Footer />
    </div>
  )
}
