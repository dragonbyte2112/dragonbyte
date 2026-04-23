'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { listenChallenges, submitFlag, getUserSolves } from '../../../lib/ctf'
import { useAuth } from '../../../lib/AuthContext'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Footer from '../../../components/Footer'

const CAT_ICONS  = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', osint:'👁️', misc:'🚩' }
const DIFF_COLOR = { easy:'#00ff6e', medium:'#ffcc00', hard:'#ff2040', insane:'#aa66ff' }
const DIFF_BG    = { easy:'#00ff6e15', medium:'#ffcc0015', hard:'#ff204015', insane:'#aa66ff15' }

// ── Challenge Card ──
function ChallengeCard({ challenge, solved, onSolve }) {
  const [open,       setOpen]      = useState(false)
  const [flagInput,  setFlagInput] = useState('')
  const [submitting, setSubmitting]= useState(false)
  const { user, profile } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!user) { router.push('/login'); return }
    if (!flagInput.trim()) { toast.error('Enter a flag!'); return }
    setSubmitting(true)
    const result = await submitFlag(
      user.uid,
      profile?.username || user.displayName || 'Anonymous',
      challenge.id,
      challenge,
      flagInput
    )
    if (result.success) {
      toast.success(result.message)
      setFlagInput('')
      onSolve(challenge.id, result.points)
    } else {
      toast.error(result.message)
    }
    setSubmitting(false)
  }

  const color = DIFF_COLOR[challenge.difficulty] || '#3a7a50'

  return (
    <div style={{
      background: solved ? '#00ff6e08' : '#071a0e',
      border: `1px solid ${solved ? '#00cc55' : '#0f3020'}`,
      borderRadius:6, overflow:'hidden', transition:'all 0.3s',
    }}>
      {/* Card header */}
      <div
        onClick={() => setOpen(!open)}
        style={{ padding:'1.25rem 1.5rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'1rem', justifyContent:'space-between' }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', flex:1, minWidth:0 }}>
          <div style={{ fontSize:'1.8rem', flexShrink:0 }}>{CAT_ICONS[challenge.category]||'🚩'}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color: solved ? '#00ff6e' : '#b0ffcc', letterSpacing:'1px', marginBottom:4 }}>
              {solved ? '✓ ' : ''}{challenge.title}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'2px 8px', borderRadius:2, background:DIFF_BG[challenge.difficulty], color, border:`1px solid ${color}60` }}>
                {(challenge.difficulty||'easy').toUpperCase()}
              </span>
              <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'2px 8px', borderRadius:2, background:'#ffcc0015', color:'#ffcc00', border:'1px solid #cc990060' }}>
                {challenge.points} PTS
              </span>
              <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'1px' }}>
                {challenge.solveCount || 0} solves
              </span>
            </div>
          </div>
        </div>
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#3a7a50', flexShrink:0 }}>
          {open ? '▲' : '▼'}
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding:'0 1.5rem 1.5rem', borderTop:'1px solid #0f3020' }}>
          
          {/* Description */}
          <div style={{ fontSize:'0.88rem', color:'#6aab80', lineHeight:1.7, margin:'1rem 0' }}>
            {challenge.description}
          </div>

          {/* ✅ QUESTION */}
          {challenge.question && (
            <div style={{
              marginBottom:'1rem',
              padding:'10px',
              background:'#02110a',
              border:'1px solid #0f3020',
              borderRadius:4,
              color:'#b0ffcc'
            }}>
              🧠 {challenge.question}
            </div>
          )}

          {/* ✅ IMAGE */}
          {challenge.imageUrl && (
            <div style={{ marginBottom:'1rem' }}>
              <img
                src={challenge.imageUrl}
                alt="challenge"
                style={{
                  maxWidth:'100%',
                  borderRadius:6,
                  border:'1px solid #0f3020'
                }}
              />
            </div>
          )}

          {/* Hints */}
          {(challenge.hints || []).length > 0 && (
            <div style={{ marginBottom:'1rem' }}>
              <details>
                <summary style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#ffcc00', letterSpacing:'2px', cursor:'pointer', marginBottom:'0.5rem' }}>
                  💡 HINTS ({challenge.hints.length})
                </summary>
                {challenge.hints.map((hint, i) => (
                  <div key={i} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#3a7a50', padding:'0.5rem', background:'#ffcc0010', border:'1px solid #cc990030', borderRadius:4, marginTop:'0.5rem' }}>
                    Hint {i+1}: {hint}
                  </div>
                ))}
              </details>
            </div>
          )}

          {/* Flag submission */}
          {solved ? (
            <div style={{ background:'#00ff6e15', border:'1px solid #00cc55', borderRadius:4, padding:'0.75rem 1rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#00ff6e', letterSpacing:'1px' }}>
              ✓ SOLVED — WELL DONE HACKER!
            </div>
          ) : user ? (
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
              <input
                style={{ flex:1, background:'#030f08', border:'1px solid #0f3020', borderRadius:4, padding:'10px 14px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.82rem', outline:'none' }}
                placeholder="DragonByte{flag_here}"
                value={flagInput}
                onChange={e => setFlagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={handleSubmit} disabled={submitting}
                style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#020c06', background:submitting?'#009944':'#00ff6e', padding:'10px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px', whiteSpace:'nowrap' }}>
                {submitting ? 'CHECKING...' : 'SUBMIT FLAG'}
              </button>
            </div>
          ) : (
            <Link href="/login"
              style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'10px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px', textDecoration:'none', display:'inline-block' }}>
              LOGIN TO SUBMIT
            </Link>
          )}
        </div>
      )}
    </div>
  )
}