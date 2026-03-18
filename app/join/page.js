// app/join/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '../../components/Footer'

const SKILLS = ['WEB', 'CRYPTO', 'FORENSICS', 'REV', 'PWN', 'OSINT']

export default function JoinPage() {
  const router = useRouter()

  // Form state
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [exp,       setExp]       = useState('')
  const [why,       setWhy]       = useState('')
  const [skills,    setSkills]    = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  // Toggle skill checkbox
  const toggleSkill = (s) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  // Submit handler
  const handleSubmit = () => {
    setError('')

    // Validation
    if (!name.trim())  { setError('Please enter your name or handle.'); return }
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!exp)          { setError('Please select your experience level.'); return }

    // Save to shared store (visible to admin dashboard)
    if (typeof window !== 'undefined') {
      // Initialize store if needed
      if (!window.__DB_STORE__) {
        window.__DB_STORE__ = { members: [], requests: [], nextId: 100 }
      }

      const store = window.__DB_STORE__
      const newRequest = {
        id: store.nextId++,
        name:    name.trim(),
        email:   email.trim(),
        exp,
        why:     why.trim(),
        skills,
        status:  'pending',
        submittedAt: new Date().toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      }
      store.requests.unshift(newRequest)
    }

    setSubmitted(true)
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem' }}>
        <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderTop: '3px solid #00cc55', borderRadius: 8, padding: '3rem', maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐉</div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.1rem', color: '#00ff6e', letterSpacing: '3px', marginBottom: '1rem' }}>
            APPLICATION SENT!
          </div>
          <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.78rem', color: '#3a7a50', letterSpacing: '1px', lineHeight: 1.8, marginBottom: '2rem' }}>
            Your request has been submitted.<br />
            The admin will review and approve you soon!<br />
            Welcome to the DragonByte family 🐉
          </div>
          <button
            onClick={() => router.push('/')}
            style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', fontWeight: 700, color: '#020c06', background: '#00ff6e', padding: '12px 28px', border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '2px' }}>
            ← BACK TO HOME
          </button>
        </div>
      </div>
    )
  }

  // ── Form screen ──
  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ padding: '3rem 2rem 1rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: '#00ff6e', marginBottom: '0.5rem' }}>
          JOIN US
        </h1>
        <p style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.78rem', color: '#3a7a50', letterSpacing: '3px', marginBottom: '2rem' }}>
          &gt; BECOME PART OF THE CREW
        </p>
      </div>

      {/* Form card */}
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div style={{ background: '#071a0e', border: '1px solid #0f3020', borderTop: '3px solid #00cc55', borderRadius: 8, padding: '2rem' }}>

          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', color: '#00ff6e', letterSpacing: '3px', marginBottom: '1.5rem' }}>
            // COMMUNITY APPLICATION
          </div>

          {/* Error message */}
          {error && (
            <div style={{ background: '#ff204015', border: '1px solid #cc0020', borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.72rem', color: '#ff2040', letterSpacing: '1px' }}>
              ✖ {error}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.63rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 6 }}>
              FULL NAME / HANDLE *
            </label>
            <input
              className="db-input"
              type="text"
              placeholder="0xYourName"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.63rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 6 }}>
              EMAIL ADDRESS *
            </label>
            <input
              className="db-input"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.63rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 6 }}>
              EXPERIENCE LEVEL *
            </label>
            <select className="db-select" value={exp} onChange={e => setExp(e.target.value)}>
              <option value="">Select your level...</option>
              <option>Complete Beginner</option>
              <option>Some CTF Experience</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          {/* Skills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.63rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 8 }}>
              SKILLS (SELECT ALL THAT APPLY)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {SKILLS.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.7rem', color: skills.includes(s) ? '#00ff6e' : '#3a7a50', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={skills.includes(s)}
                    onChange={() => toggleSkill(s)}
                    style={{ accentColor: '#00ff6e' }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Why join */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.63rem', color: '#00cc55', letterSpacing: '2px', display: 'block', marginBottom: 6 }}>
              WHY DO YOU WANT TO JOIN?
            </label>
            <textarea
              className="db-textarea"
              style={{ height: 90 }}
              placeholder="Tell us about yourself and your goals..."
              value={why}
              onChange={e => setWhy(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            style={{ width: '100%', fontFamily: 'Orbitron, monospace', fontSize: '0.8rem', fontWeight: 700, color: '#020c06', background: '#00ff6e', padding: 13, border: 'none', borderRadius: 4, cursor: 'pointer', letterSpacing: '3px', transition: 'all 0.2s' }}
            onMouseOver={e => { e.target.style.background = '#39ff14'; e.target.style.boxShadow = '0 0 25px #00ff6e60' }}
            onMouseOut={e => { e.target.style.background = '#00ff6e'; e.target.style.boxShadow = 'none' }}
          >
            SUBMIT APPLICATION
          </button>

        </div>
      </div>

      <Footer />
    </div>
  )
}
