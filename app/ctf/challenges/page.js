// app/ctf/challenges/page.js
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { listenChallenges, submitFlag, hasSolved, getUserSolves } from '../../../lib/ctf'
import { useAuth } from '../../../lib/Authcontext'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Footer from '../../../components/Footer'

const CAT_ICONS  = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', osint:'👁️', misc:'🚩' }
const DIFF_COLOR = { easy:'#00ff6e', medium:'#ffcc00', hard:'#ff2040', insane:'#aa66ff' }
const DIFF_BG    = { easy:'#00ff6e15', medium:'#ffcc0015', hard:'#ff204015', insane:'#aa66ff15' }

// ── Challenge Card ──
function ChallengeCard({ challenge, solved, onSolve }) {
  const [open,      setOpen]    = useState(false)
  const [flagInput, setFlagInput]= useState('')
  const [submitting,setSubmitting]=useState(false)
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

          {/* Attachments */}
          {challenge.attachmentUrl && (
            <div style={{ marginBottom:'1rem' }}>
              <a href={challenge.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#00d4ff', letterSpacing:'1px', textDecoration:'none', border:'1px solid #0099cc', padding:'6px 14px', borderRadius:4, display:'inline-block' }}>
                📎 DOWNLOAD ATTACHMENT
              </a>
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
                onChange={e=>setFlagInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
              />
              <button onClick={handleSubmit} disabled={submitting} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#020c06', background:submitting?'#009944':'#00ff6e', padding:'10px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px', whiteSpace:'nowrap' }}>
                {submitting?'CHECKING...':'SUBMIT FLAG'}
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'10px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px', textDecoration:'none', display:'inline-block' }}>
              LOGIN TO SUBMIT
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main challenges page ──
export default function ChallengesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const initCat = searchParams.get('cat') || 'all'

  const [challenges, setChallenges] = useState([])
  const [solvedIds,  setSolvedIds]  = useState(new Set())
  const [loading,    setLoading]    = useState(true)
  const [catFilter,  setCatFilter]  = useState(initCat)
  const [diffFilter, setDiffFilter] = useState('all')
  const [search,     setSearch]     = useState('')
  const [sortBy,     setSortBy]     = useState('points-asc')

  useEffect(() => {
    const unsub = listenChallenges(data => { setChallenges(data.filter(c=>c.published)); setLoading(false) })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) { setSolvedIds(new Set()); return }
    getUserSolves(user.uid).then(solves => {
      setSolvedIds(new Set(solves.filter(s=>s.correct).map(s=>s.challengeId)))
    })
  }, [user])

  const handleSolve = (id) => setSolvedIds(prev => new Set([...prev, id]))

  const categories = ['all', ...new Set(challenges.map(c=>c.category))]

  // Filter + sort
  const filtered = challenges
    .filter(c => (catFilter==='all' || c.category===catFilter))
    .filter(c => (diffFilter==='all' || c.difficulty===diffFilter))
    .filter(c => c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==='points-asc')  return (a.points||0) - (b.points||0)
      if (sortBy==='points-desc') return (b.points||0) - (a.points||0)
      if (sortBy==='solves')      return (b.solveCount||0) - (a.solveCount||0)
      return 0
    })

  const solvedCount = filtered.filter(c => solvedIds.has(c.id)).length
  const totalPts    = filtered.filter(c => solvedIds.has(c.id)).reduce((s,c)=>s+(c.points||0),0)

  return (
    <div className="page-enter">
      <div style={{ padding:'3rem 2rem 1rem', maxWidth:1100, margin:'0 auto' }}>
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:900, color:'#00ff6e', marginBottom:'0.5rem' }}>
          🚩 CHALLENGES
        </h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'1.5rem' }}>
          &gt; {challenges.length} CHALLENGES — {user ? `${solvedCount} SOLVED · ${totalPts} PTS EARNED` : 'LOGIN TO TRACK PROGRESS'}
        </p>

        {/* Filters */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center', marginBottom:'1rem' }}>
          <input
            style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:4, padding:'8px 12px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', outline:'none', width:220 }}
            placeholder="Search challenges..." value={search} onChange={e=>setSearch(e.target.value)}
          />
          <select onChange={e=>setSortBy(e.target.value)} value={sortBy} style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:4, padding:'8px 12px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', outline:'none', cursor:'pointer' }}>
            <option value="points-asc">Points ↑</option>
            <option value="points-desc">Points ↓</option>
            <option value="solves">Most Solved</option>
          </select>
        </div>

        {/* Category filter */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.75rem' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', padding:'6px 14px', borderRadius:2,
              cursor:'pointer', letterSpacing:'1px', transition:'all 0.2s',
              border: catFilter===cat ? '1px solid #00cc55' : '1px solid #0f3020',
              background: catFilter===cat ? '#00ff6e10' : 'transparent',
              color: catFilter===cat ? '#00ff6e' : '#3a7a50',
            }}>{cat.toUpperCase()}</button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {['all','easy','medium','hard','insane'].map(d => (
            <button key={d} onClick={() => setDiffFilter(d)} style={{
              fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'5px 12px', borderRadius:2,
              cursor:'pointer', letterSpacing:'1px', transition:'all 0.2s',
              border: diffFilter===d ? `1px solid ${DIFF_COLOR[d]||'#00cc55'}` : '1px solid #0f3020',
              background: diffFilter===d ? `${DIFF_COLOR[d]||'#00ff6e'}15` : 'transparent',
              color: diffFilter===d ? (DIFF_COLOR[d]||'#00ff6e') : '#3a7a50',
            }}>{d.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Challenge list */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 2rem 4rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', fontFamily:'"Share Tech Mono",monospace', color:'#3a7a50', letterSpacing:'2px' }}>🐉 LOADING FROM FIREBASE...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', fontFamily:'"Share Tech Mono",monospace', color:'#3a7a50', letterSpacing:'2px' }}>NO CHALLENGES FOUND</div>
        ) : (
          filtered.map(c => (
            <ChallengeCard key={c.id} challenge={c} solved={solvedIds.has(c.id)} onSolve={handleSolve} />
          ))
        )}
      </div>

      <Footer />
    </div>
  )
}
