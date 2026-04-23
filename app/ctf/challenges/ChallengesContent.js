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
  const [open, setOpen] = useState(false)
  const [flagInput, setFlagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
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
      borderRadius:6, overflow:'hidden'
    }}>
      
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding:'1.25rem 1.5rem',
          cursor:'pointer',
          display:'flex',
          justifyContent:'space-between'
        }}
      >
        <div>
          <div style={{ color: solved ? '#00ff6e' : '#b0ffcc' }}>
            {solved ? '✓ ' : ''}{challenge.title}
          </div>
          <div style={{ fontSize:'0.7rem', color:'#3a7a50' }}>
            {challenge.points} pts • {challenge.solveCount || 0} solves
          </div>
        </div>
        <div>{open ? '▲' : '▼'}</div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ padding:'1rem', borderTop:'1px solid #0f3020' }}>

          {/* Description */}
          <div style={{ marginBottom:'1rem', color:'#6aab80' }}>
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
            <details style={{ marginBottom:'1rem' }}>
              <summary style={{ cursor:'pointer', color:'#ffcc00' }}>
                💡 Hints ({challenge.hints.length})
              </summary>
              {challenge.hints.map((hint, i) => (
                <div key={i} style={{ color:'#3a7a50', marginTop:'5px' }}>
                  Hint {i+1}: {hint}
                </div>
              ))}
            </details>
          )}

          {/* Submit */}
          {solved ? (
            <div style={{ color:'#00ff6e' }}>
              ✓ SOLVED
            </div>
          ) : user ? (
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <input
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                placeholder="DragonByte{flag_here}"
                style={{ flex:1 }}
              />
              <button onClick={handleSubmit}>
                {submitting ? '...' : 'Submit'}
              </button>
            </div>
          ) : (
            <Link href="/login">Login to submit</Link>
          )}

        </div>
      )}
    </div>
  )
}

// ── MAIN ──
export default function ChallengesContent() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [solvedIds, setSolvedIds] = useState(new Set())

  useEffect(() => {
    const unsub = listenChallenges(setChallenges)
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    getUserSolves(user.uid).then(solves => {
      setSolvedIds(new Set(solves.map(s => s.challengeId)))
    })
  }, [user])

  return (
    <div style={{ padding:'2rem' }}>
      {challenges.map(c => (
        <ChallengeCard
          key={c.id}
          challenge={c}
          solved={solvedIds.has(c.id)}
          onSolve={(id) => setSolvedIds(prev => new Set([...prev, id]))}
        />
      ))}
      <Footer />
    </div>
  )
}