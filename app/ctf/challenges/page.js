// app/ctf/challenges/page.js — DragonByte CTF Player Dashboard
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import Footer from '../../../components/Footer';
import { auth } from '../../../lib/firebase';
import { listenChallenges, submitFlag, listenLeaderboard, getUserSolves, getCTFSettings } from '../../../lib/ctf';

// ── Palette (matches your existing admin style) ──
const DIFF_COLOR = { easy:'#00ff6e', medium:'#ffcc00', hard:'#ff2040', insane:'#aa66ff' }
const CAT_ICONS  = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', osint:'👁️', misc:'🚩' }
const CATEGORIES = ['all','web','crypto','forensics','pwn','rev','osint','misc']

// ── Shared style atoms ──
const mono = '"Share Tech Mono",monospace'
const orb  = 'Orbitron,monospace'

export default function CTFDashboard() {
  const router = useRouter()
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [challenges,  setChallenges]  = useState([])
  const [solvedIds,   setSolvedIds]   = useState(new Set())
  const [leaderboard, setLeaderboard] = useState([])
  const [ctfSettings, setCTFSettings] = useState({ active: true, name: 'DragonByte CTF' })
  const [selected,    setSelected]    = useState(null)   // active challenge modal
  const [flagInput,   setFlagInput]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [feedback,    setFeedback]    = useState(null)   // { type:'success'|'error'|'warn', msg }
  const [revealedHints, setRevealedHints] = useState({}) // { challengeId: Set<hintIndex> }
  const [catFilter,   setCatFilter]   = useState('all')
  const [diffFilter,  setDiffFilter]  = useState('all')
  const [view,        setView]        = useState('challenges') // 'challenges' | 'scoreboard'
  const [myScore,     setMyScore]     = useState(0)
  const [myRank,      setMyRank]      = useState(null)

  // ── Auth gate ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setAuthLoading(false)
      if (!u) router.push('/login')
    })
    return unsub
  }, [router])

  // ── Data listeners ──
  useEffect(() => {
    if (!user) return
    // Published challenges only
    const unsubC = listenChallenges(data => {
      setChallenges(data.filter(c => c.published !== false))
    })
    const unsubL = listenLeaderboard(data => {
      setLeaderboard(data)
      const me = data.find(e => e.userId === user.uid)
      setMyScore(me?.points || 0)
      setMyRank(me ? data.indexOf(me) + 1 : null)
    })
    getCTFSettings().then(setCTFSettings)
    getUserSolves(user.uid).then(solves => {
      setSolvedIds(new Set(solves.map(s => s.challengeId)))
    })
    return () => { unsubC(); unsubL() }
  }, [user])

  // ── Flag submit ──
  const handleSubmit = useCallback(async () => {
    if (!flagInput.trim() || !selected) return
    setSubmitting(true)
    setFeedback(null)
    try {
      const result = await submitFlag(
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Player',
        selected.id,
        selected,
        flagInput,
      )
      if (result.success) {
        setSolvedIds(prev => new Set([...prev, selected.id]))
        setFeedback({ type: 'success', msg: result.message })
        setFlagInput('')
        setTimeout(() => {
          setSelected(null)
          setFeedback(null)
        }, 2200)
      } else {
        setFeedback({ type: result.message.includes('Already') ? 'warn' : 'error', msg: result.message })
      }
    } catch (e) {
      setFeedback({ type: 'error', msg: e.message })
    }
    setSubmitting(false)
  }, [flagInput, selected, user])

  const openChallenge = (c) => {
    setSelected(c)
    setFlagInput('')
    setFeedback(null)
  }

  const toggleHint = (chalId, idx) => {
    setRevealedHints(prev => {
      const existing = new Set(prev[chalId] || [])
      existing.has(idx) ? existing.delete(idx) : existing.add(idx)
      return { ...prev, [chalId]: existing }
    })
  }

  // ── Filtered challenges ──
  const filtered = challenges
    .filter(c => catFilter === 'all' || c.category === catFilter)
    .filter(c => diffFilter === 'all' || c.difficulty === diffFilter)

  const solvedCount  = challenges.filter(c => solvedIds.has(c.id)).length
  const totalPoints  = challenges.filter(c => solvedIds.has(c.id)).reduce((a, c) => a + (c.points || 0), 0)

  if (authLoading) return <LoadingScreen />
  if (!user) return null

  return (
    <div style={{ minHeight:'100vh', background:'#020d06', color:'#b0ffcc' }}>
      {/* ── Scanline overlay ── */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)', pointerEvents:'none', zIndex:1 }} />

      {/* ── Top nav ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'#020d06dd', borderBottom:'1px solid #0f3020', backdropFilter:'blur(8px)', padding:'0.6rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
        <Link href="/" style={{ textDecoration:'none' }}>
          <span style={{ fontFamily:orb, fontSize:'0.9rem', fontWeight:900 }}>
            <span style={{ color:'#00ff6e' }}>DRAGON</span><span style={{ color:'#00d4ff' }}>BYTE</span>
          </span>
        </Link>
        <span style={{ fontFamily:mono, fontSize:'0.55rem', color:'#00cc55', letterSpacing:'2px' }}>// CTF PLATFORM</span>

        <div style={{ flex:1 }} />

        {/* View toggle */}
        <div style={{ display:'flex', gap:4 }}>
          {[
            { key:'challenges', label:'🚩 CHALLENGES' },
            { key:'scoreboard', label:'🏆 SCOREBOARD' },
          ].map(v => (
            <button key={v.key} onClick={() => setView(v.key)} style={{
              fontFamily:mono, fontSize:'0.62rem', padding:'5px 12px', borderRadius:3, cursor:'pointer', letterSpacing:'1px',
              border: view===v.key ? '1px solid #00cc55' : '1px solid #0f3020',
              background: view===v.key ? '#00ff6e10' : 'transparent',
              color: view===v.key ? '#00ff6e' : '#3a7a50',
            }}>{v.label}</button>
          ))}
        </div>

        {/* Player badge */}
        <div style={{ fontFamily:mono, fontSize:'0.62rem', color:'#3a7a50', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#00cc55,#006622)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:orb, fontSize:'0.65rem', fontWeight:700, color:'#020c06' }}>
            {(user.displayName||user.email||'?').slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ color:'#b0ffcc', fontSize:'0.65rem' }}>{user.displayName || user.email?.split('@')[0]}</div>
            <div style={{ color:'#ffcc00', fontSize:'0.6rem' }}>{myScore} pts {myRank ? `· #${myRank}` : ''}</div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'1.5rem', position:'relative', zIndex:2 }}>

        {/* ── CTF paused banner ── */}
        {!ctfSettings.active && (
          <div style={{ background:'#ff204015', border:'1px solid #ff2040', borderRadius:6, padding:'1rem 1.5rem', marginBottom:'1.5rem', fontFamily:mono, fontSize:'0.75rem', color:'#ff2040', textAlign:'center', letterSpacing:'2px' }}>
            ⚠️ CTF IS CURRENTLY PAUSED — FLAG SUBMISSION DISABLED
          </div>
        )}

        {/* ── Player stats bar ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
          {[
            { n:challenges.length,   l:'CHALLENGES', c:'#00ff6e', a:'#00cc55' },
            { n:solvedCount,         l:'SOLVED',      c:'#00d4ff', a:'#0099cc' },
            { n:totalPoints,         l:'MY POINTS',   c:'#ffcc00', a:'#cc9900' },
            { n:myRank ? `#${myRank}` : '—', l:'RANK', c:'#aa66ff', a:'#8844cc' },
          ].map(({ n, l, c, a }) => (
            <div key={l} style={{ background:'#071a0e', border:'1px solid #0f3020', borderBottom:`2px solid ${a}`, borderRadius:6, padding:'1rem', textAlign:'center' }}>
              <div style={{ fontFamily:orb, fontSize:'1.5rem', fontWeight:900, color:c, lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:mono, fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'2px', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            CHALLENGES VIEW
        ══════════════════════════════════════ */}
        {view === 'challenges' && (
          <>
            {/* Filters */}
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.25rem', alignItems:'center' }}>
              <span style={{ fontFamily:mono, fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'1px', marginRight:4 }}>CAT:</span>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{
                  fontFamily:mono, fontSize:'0.58rem', padding:'4px 10px', borderRadius:2, cursor:'pointer', letterSpacing:'1px',
                  border: catFilter===c ? '1px solid #00cc55' : '1px solid #0f3020',
                  background: catFilter===c ? '#00ff6e10' : 'transparent',
                  color: catFilter===c ? '#00ff6e' : '#3a7a50',
                }}>
                  {CAT_ICONS[c] || ''} {c.toUpperCase()}
                </button>
              ))}
              <span style={{ fontFamily:mono, fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'1px', marginLeft:8, marginRight:4 }}>DIFF:</span>
              {['all','easy','medium','hard','insane'].map(d => (
                <button key={d} onClick={() => setDiffFilter(d)} style={{
                  fontFamily:mono, fontSize:'0.58rem', padding:'4px 10px', borderRadius:2, cursor:'pointer', letterSpacing:'1px',
                  border: diffFilter===d ? `1px solid ${DIFF_COLOR[d]||'#00cc55'}` : '1px solid #0f3020',
                  background: diffFilter===d ? `${DIFF_COLOR[d]||'#00ff6e'}10` : 'transparent',
                  color: diffFilter===d ? (DIFF_COLOR[d]||'#00ff6e') : '#3a7a50',
                }}>
                  {d.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Challenge grid */}
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
                {filtered.map(c => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    solved={solvedIds.has(c.id)}
                    onClick={() => openChallenge(c)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            SCOREBOARD VIEW
        ══════════════════════════════════════ */}
        {view === 'scoreboard' && (
          <ScoreboardTable leaderboard={leaderboard} myUid={user.uid} />
        )}
      </div>

      {/* ══════════════════════════════════════
          CHALLENGE MODAL
      ══════════════════════════════════════ */}
      {selected && (
        <ChallengeModal
          challenge={selected}
          solved={solvedIds.has(selected.id)}
          ctfActive={ctfSettings.active}
          flagInput={flagInput}
          setFlagInput={setFlagInput}
          onSubmit={handleSubmit}
          submitting={submitting}
          feedback={feedback}
          revealedHints={revealedHints[selected.id] || new Set()}
          onToggleHint={(idx) => toggleHint(selected.id, idx)}
          onClose={() => { setSelected(null); setFeedback(null); setFlagInput('') }}
        />
      )}

      <Footer />
    </div>
  )
}

// ─────────────────────────────────────────────
//  CHALLENGE CARD
// ─────────────────────────────────────────────
function ChallengeCard({ challenge: c, solved, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: solved ? '#00ff6e08' : '#071a0e',
        border: `1px solid ${solved ? '#00cc55' : hovered ? '#1a4a2a' : '#0f3020'}`,
        borderLeft: `3px solid ${DIFF_COLOR[c.difficulty] || '#00cc55'}`,
        borderRadius: 6,
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px #00ff6e0a' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Solved overlay */}
      {solved && (
        <div style={{ position:'absolute', top:10, right:10, fontFamily:mono, fontSize:'0.58rem', color:'#00ff6e', background:'#00ff6e15', border:'1px solid #00cc55', borderRadius:2, padding:'2px 8px', letterSpacing:'2px' }}>
          ✓ SOLVED
        </div>
      )}

      {/* Category + difficulty */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.75rem' }}>
        <span style={{ fontSize:'1.2rem' }}>{CAT_ICONS[c.category] || '🚩'}</span>
        <span style={{ fontFamily:mono, fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'1px' }}>{c.category?.toUpperCase()}</span>
        <span style={{ marginLeft:'auto', fontFamily:mono, fontSize:'0.6rem', padding:'2px 8px', borderRadius:2, background:`${DIFF_COLOR[c.difficulty]}15`, color:DIFF_COLOR[c.difficulty], border:`1px solid ${DIFF_COLOR[c.difficulty]}60` }}>
          {c.difficulty}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontFamily:orb, fontSize:'0.82rem', fontWeight:700, color: solved ? '#00ff6e' : '#b0ffcc', marginBottom:'0.5rem', lineHeight:1.3 }}>
        {c.title}
      </div>

      {/* Description preview */}
      <div style={{ fontFamily:mono, fontSize:'0.68rem', color:'#3a7a50', marginBottom:'1rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
        {c.description}
      </div>

      {/* Footer row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:orb, fontSize:'1rem', fontWeight:900, color:'#ffcc00' }}>{c.points}<span style={{ fontSize:'0.6rem', color:'#cc9900', marginLeft:3 }}>PTS</span></span>
        <span style={{ fontFamily:mono, fontSize:'0.6rem', color:'#3a7a50' }}>{c.solveCount || 0} solves</span>
        {c.hints?.length > 0 && <span style={{ fontFamily:mono, fontSize:'0.58rem', color:'#ffcc00' }}>💡 {c.hints.length}</span>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  CHALLENGE MODAL
// ─────────────────────────────────────────────
function ChallengeModal({ challenge: c, solved, ctfActive, flagInput, setFlagInput, onSubmit, submitting, feedback, revealedHints, onToggleHint, onClose }) {
  const fbColor = { success:'#00ff6e', error:'#ff2040', warn:'#ffcc00' }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'#000000dd', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:`3px solid ${DIFF_COLOR[c.difficulty]||'#00cc55'}`, borderRadius:8, width:'100%', maxWidth:640, maxHeight:'92vh', overflowY:'auto', position:'relative' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'1.25rem 1.5rem', borderBottom:'1px solid #0f3020' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:'1.1rem' }}>{CAT_ICONS[c.category]}</span>
              <span style={{ fontFamily:mono, fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'1px' }}>{c.category?.toUpperCase()}</span>
              <span style={{ fontFamily:mono, fontSize:'0.6rem', padding:'2px 8px', borderRadius:2, background:`${DIFF_COLOR[c.difficulty]}15`, color:DIFF_COLOR[c.difficulty], border:`1px solid ${DIFF_COLOR[c.difficulty]}60` }}>
                {c.difficulty}
              </span>
              {solved && <span style={{ fontFamily:mono, fontSize:'0.58rem', color:'#00ff6e', background:'#00ff6e15', border:'1px solid #00cc55', borderRadius:2, padding:'2px 8px' }}>✓ SOLVED</span>}
            </div>
            <div style={{ fontFamily:orb, fontSize:'1rem', fontWeight:700, color:'#b0ffcc' }}>{c.title}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
            <span style={{ fontFamily:orb, fontSize:'1.4rem', fontWeight:900, color:'#ffcc00', lineHeight:1 }}>{c.points}</span>
            <span style={{ fontFamily:mono, fontSize:'0.58rem', color:'#cc9900' }}>POINTS</span>
            <button onClick={onClose} style={{ fontFamily:mono, color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'4px 10px', borderRadius:3, cursor:'pointer', marginTop:4 }}>✕</button>
          </div>
        </div>

        <div style={{ padding:'1.5rem' }}>

          {/* Description */}
          <div style={{ fontFamily:'"Rajdhani",sans-serif', fontSize:'0.92rem', color:'#b0ffcc', lineHeight:1.7, marginBottom:'1.5rem', whiteSpace:'pre-wrap' }}>
            {c.description}
          </div>

          {/* Attachment */}
          {c.attachmentUrl && (
            <a href={c.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:mono, fontSize:'0.68rem', color:'#00d4ff', textDecoration:'none', background:'#00d4ff10', border:'1px solid #00d4ff40', borderRadius:4, padding:'6px 14px', marginBottom:'1.5rem' }}>
              📎 DOWNLOAD ATTACHMENT
            </a>
          )}

          {/* Stats row */}
          <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', fontFamily:mono, fontSize:'0.65rem', color:'#3a7a50' }}>
            <span>🚩 {c.solveCount || 0} solves</span>
            {c.hints?.length > 0 && <span>💡 {c.hints.length} hint{c.hints.length > 1 ? 's' : ''}</span>}
          </div>

          {/* Hints */}
          {c.hints?.length > 0 && (
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:mono, fontSize:'0.6rem', color:'#cc9900', letterSpacing:'2px', marginBottom:'0.5rem' }}>HINTS</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {c.hints.map((h, i) => (
                  <div key={i} style={{ background:revealedHints.has(i) ? '#ffcc0010' : '#030f08', border:`1px solid ${revealedHints.has(i) ? '#cc990060' : '#0f3020'}`, borderRadius:4, overflow:'hidden' }}>
                    <button
                      onClick={() => onToggleHint(i)}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}
                    >
                      <span style={{ fontFamily:mono, fontSize:'0.62rem', color:'#ffcc00' }}>💡</span>
                      <span style={{ fontFamily:mono, fontSize:'0.65rem', color:'#cc9900', flex:1 }}>
                        Hint {i + 1}
                      </span>
                      <span style={{ fontFamily:mono, fontSize:'0.58rem', color:'#3a7a50' }}>
                        {revealedHints.has(i) ? '▲ HIDE' : '▼ REVEAL'}
                      </span>
                    </button>
                    {revealedHints.has(i) && (
                      <div style={{ padding:'0 12px 10px 12px', fontFamily:'"Rajdhani",sans-serif', fontSize:'0.88rem', color:'#ffcc00', lineHeight:1.5 }}>
                        {h}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flag submission */}
          {solved ? (
            <div style={{ background:'#00ff6e12', border:'1px solid #00cc55', borderRadius:6, padding:'1.25rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:6 }}>🏆</div>
              <div style={{ fontFamily:orb, fontSize:'0.9rem', color:'#00ff6e', letterSpacing:'2px' }}>CHALLENGE SOLVED!</div>
              <div style={{ fontFamily:mono, fontSize:'0.65rem', color:'#3a7a50', marginTop:4 }}>+{c.points} points awarded</div>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily:mono, fontSize:'0.6rem', color:'#00cc55', letterSpacing:'2px', marginBottom:6 }}>SUBMIT FLAG</div>
              <div style={{ display:'flex', gap:8 }}>
                <input
                  value={flagInput}
                  onChange={e => setFlagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !submitting && ctfActive && onSubmit()}
                  disabled={!ctfActive || submitting}
                  placeholder="DragonByte{your_flag_here}"
                  style={{ flex:1, background:'#030f08', border:'1px solid #1a4a2a', borderRadius:4, padding:'10px 14px', color:'#00ff6e', fontFamily:'monospace', fontSize:'0.85rem', outline:'none', letterSpacing:'1px', opacity: ctfActive ? 1 : 0.5 }}
                />
                <button
                  onClick={onSubmit}
                  disabled={!ctfActive || submitting || !flagInput.trim()}
                  style={{ fontFamily:orb, fontSize:'0.62rem', fontWeight:700, color:'#020c06', background: (!ctfActive || submitting || !flagInput.trim()) ? '#006633' : '#00ff6e', padding:'10px 20px', border:'none', borderRadius:4, cursor: (!ctfActive || submitting) ? 'not-allowed' : 'pointer', letterSpacing:'2px', whiteSpace:'nowrap' }}
                >
                  {submitting ? '⟳...' : 'SUBMIT →'}
                </button>
              </div>

              {/* Feedback */}
              {feedback && (
                <div style={{ marginTop:10, padding:'10px 14px', borderRadius:4, background:`${fbColor[feedback.type]}15`, border:`1px solid ${fbColor[feedback.type]}60`, fontFamily:mono, fontSize:'0.75rem', color:fbColor[feedback.type], letterSpacing:'1px' }}>
                  {feedback.msg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  SCOREBOARD TABLE
// ─────────────────────────────────────────────
function ScoreboardTable({ leaderboard, myUid }) {
  const medal = ['🥇','🥈','🥉']
  return (
    <div>
      <div style={{ fontFamily:orb, fontSize:'0.85rem', color:'#00ff6e', letterSpacing:'2px', marginBottom:'1.25rem' }}>
        🏆 LEADERBOARD
      </div>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:400 }}>
          <thead>
            <tr style={{ background:'#030f08', borderBottom:'1px solid #0f3020' }}>
              {['RANK','PLAYER','SOLVES','POINTS'].map(h => (
                <th key={h} style={{ fontFamily:mono, fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'2px', padding:'10px 16px', textAlign: h==='POINTS'?'right':'left', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, i) => {
              const isMe = entry.userId === myUid || entry.id === myUid
              return (
                <tr key={entry.id}
                  style={{ background: isMe ? '#00ff6e08' : 'transparent', borderBottom:'1px solid #0a1f10' }}
                >
                  <td style={{ padding:'12px 16px', fontFamily:orb, fontSize:'0.85rem', color: i < 3 ? '#ffcc00' : '#3a7a50', fontWeight:900 }}>
                    {medal[i] || i + 1}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#00cc55,#006622)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:orb, fontSize:'0.6rem', fontWeight:700, color:'#020c06', flexShrink:0 }}>
                        {(entry.username||'?').slice(0,2).toUpperCase()}
                      </div>
                      <span style={{ fontFamily:orb, fontSize:'0.72rem', color: isMe ? '#00ff6e' : '#b0ffcc' }}>
                        {entry.username}
                        {isMe && <span style={{ fontFamily:mono, fontSize:'0.55rem', color:'#00ff6e', marginLeft:6 }}>(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontFamily:mono, fontSize:'0.72rem', color:'#3a7a50', textAlign:'left' }}>
                    {entry.solveCount || 0} 🚩
                  </td>
                  <td style={{ padding:'12px 16px', fontFamily:orb, fontSize:'1rem', color:'#ffcc00', fontWeight:900, textAlign:'right' }}>
                    {entry.points}
                  </td>
                </tr>
              )
            })}
            {leaderboard.length === 0 && (
              <tr><td colSpan={4} style={{ padding:'3rem', textAlign:'center', fontFamily:mono, fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'2px' }}>
                NO SCORES YET — SOLVE A CHALLENGE!
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign:'center', padding:'4rem 2rem', background:'#071a0e', border:'1px solid #0f3020', borderRadius:8 }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🚩</div>
      <div style={{ fontFamily:orb, fontSize:'0.85rem', color:'#3a7a50', letterSpacing:'2px', marginBottom:8 }}>NO CHALLENGES AVAILABLE</div>
      <div style={{ fontFamily:mono, fontSize:'0.68rem', color:'#1a3a20' }}>Admin has not published any challenges yet</div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#020d06' }}>
      <div style={{ fontFamily:orb, fontSize:'0.9rem', color:'#00ff6e', letterSpacing:'3px' }}>🐉 LOADING...</div>
    </div>
  )
}