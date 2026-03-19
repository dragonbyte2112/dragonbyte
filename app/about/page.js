// app/about/page.js
import Footer from '../../components/Footer'

export const metadata = { title: 'About — DragonByte' }

function AboutBlock({ label, heading, text, accent }) {
  const colors = { green: '#00cc55', blue: '#00d4ff', red: '#ff2040' }
  return (
    <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderLeft: `3px solid ${colors[accent]}`, borderRadius: 6, padding: '2rem' }}>
      <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', color: '#3a7a50', letterSpacing: '3px', marginBottom: '0.75rem' }}>{label}</div>
      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '1rem', color: colors[accent], marginBottom: '0.75rem', letterSpacing: '1px' }}>{heading}</div>
      <div style={{ fontSize: '0.9rem', color: '#3a7a50', lineHeight: 1.7 }}>{text}</div>
    </div>
  )
}

function TimelineItem({ date, title, desc, color, right }) {
  return (
    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', flexDirection: right ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, background: '#071a0e', border: '1px solid #0f3020', borderRadius: 6, padding: '1rem 1.25rem' }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.65rem', color: color, letterSpacing: '2px', marginBottom: 4 }}>{date}</div>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.78rem', color: '#b0ffcc', letterSpacing: '1px', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: '#3a7a50' }}>{desc}</div>
      </div>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '2px solid #020c06', boxShadow: `0 0 10px ${color}80`, flexShrink: 0, marginTop: 6, alignSelf: 'center' }} />
      <div style={{ flex: 1 }} />
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="page-enter">

      {/* ── PAGE HEADER ── */}
      <div style={{ padding: '4rem 2rem 2rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h1 className="glitch" style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '4px', color: '#00ff6e', marginBottom: '0.5rem', textShadow: '0 0 30px #00ff6e50' }}>
          ABOUT US
        </h1>
        <p style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.8rem', color: '#3a7a50', letterSpacing: '3px' }}>
          &gt; WHO WE ARE
        </p>
      </div>

      {/* ── ABOUT BLOCKS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem', maxWidth: 1100, margin: '0 auto', padding: '0 2rem 2rem' }}>
        <AboutBlock accent="green" label="// WHAT IS DRAGONBYTE" heading="The Community"
          text="DragonByte is a cybersecurity-focused community built for learners, hackers, and defenders. We bring together curious minds to compete in CTFs, share knowledge, and build skills that matter in the real world." />
        <AboutBlock accent="blue" label="// MISSION" heading="Our Mission"
          text="To make cybersecurity and CTF learning accessible to everyone — from zero experience to elite hacker. We believe every beginner deserves a team, a mentor, and a challenge to grow." />
        <AboutBlock accent="red" label="// VISION" heading="Our Vision"
          text="To become the most respected regional cybersecurity community, producing world-class CTF players and defenders who protect the digital world." />
      </div>

      {/* ── FOUNDER DIVIDER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ flex: 1, height: 1, background: '#0f3020' }} />
        <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.7rem', color: '#3a7a50', letterSpacing: '2px' }}>// FOUNDER</div>
        <div style={{ flex: 1, height: 1, background: '#0f3020' }} />
      </div>

      {/* ── FOUNDER CARD ── */}
      <div style={{ padding: '0 2rem 2rem', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderTop: '3px solid #ff2040', borderRadius: 6, padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>

          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#cc0020,#660010)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0, border: '2px solid #ff2040', boxShadow: '0 0 20px #ff204050' }}>
            🐉
          </div>

          {/* Info */}
          <div>
            {/* Name */}
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '1.1rem', fontWeight: 700, color: '#b0ffcc', letterSpacing: '2px', marginBottom: 4 }}>
              Sanjairathinam
            </div>

            {/* Title */}
            <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', color: '#ff2040', letterSpacing: '2px', marginBottom: 6 }}>
              // FOUNDER OF DRAGONBYTE 🐉
            </div>

            {/* Subtitle */}
            <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.65rem', color: '#00d4ff', letterSpacing: '1px', marginBottom: 10 }}>
              Cybersecurity • CTF • Community Builder
            </div>

            {/* Quote */}
            <div style={{ fontSize: '0.88rem', color: '#7abf90', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '2px solid #ff2040', paddingLeft: '0.75rem' }}>
              "Creating the team I once needed."
            </div>
          </div>

        </div>
      </div>

      {/* ── TIMELINE DIVIDER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ flex: 1, height: 1, background: '#0f3020' }} />
        <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: '0.7rem', color: '#3a7a50', letterSpacing: '2px' }}>// TIMELINE</div>
        <div style={{ flex: 1, height: 1, background: '#0f3020' }} />
      </div>

      {/* ── TIMELINE ── */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 2rem 4rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#0f3020', transform: 'translateX(-50%)' }} />
        <TimelineItem date="2023 — JAN" title="Community Founded"       desc="DragonByte started as a small Discord server with 5 members."         color="#00ff6e" right={false} />
        <TimelineItem date="2023 — JUN" title="First CTF Participation" desc="Competed in picoCTF as a unified team for the first time."             color="#00d4ff" right={true}  />
        <TimelineItem date="2024 — MAR" title="100 Members Milestone"   desc="Grew to 100+ active members across multiple skill levels."             color="#00ff6e" right={false} />
        <TimelineItem date="2025 — NOW" title="Website Launch"          desc="Official platform to connect, collaborate and compete."                color="#ff2040" right={true}  />
      </div>

      <Footer />
    </div>
  )
}