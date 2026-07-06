// app/profile/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/AuthContext'
import { getUserSolves, getLeaderboard } from '../../lib/ctf'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import toast from 'react-hot-toast'
import Footer from '../../components/Footer'

const CAT_ICONS = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', osint:'👁️', misc:'🚩' }

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [solves,  setSolves]  = useState([])
  const [rank,    setRank]    = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return }
    if (user) {
      Promise.all([
        getUserSolves(user.uid),
        getLeaderboard(),
      ]).then(([s, board]) => {
        setSolves(s.filter(x=>x.correct).sort((a,b)=>b.solvedAt?.seconds-a.solvedAt?.seconds))
        const myRank = board.find(p=>p.userId===user.uid)
        setRank(myRank)
        setLoadingData(false)
      })
    }
  }, [user, loading])

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Logged out!')
    router.push('/')
  }

  if (loading || loadingData) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', fontFamily:'Orbitron,monospace', color:'#00ff6e', letterSpacing:'3px' }}>
      🐉 LOADING PROFILE...
    </div>
  )

  const totalPoints = solves.reduce((s,x) => s + (x.points||0), 0)

  return (
    <div className="page-enter">
      <div style={{ padding:'3rem 2rem', maxWidth:900, margin:'0 auto' }}>

        {/* Profile header */}
        <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00ff6e', borderRadius:8, padding:'2rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#00cc55,#006622)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'1.8rem', fontWeight:900, color:'#020c06', flexShrink:0, border:'3px solid #00cc55' }}>
            {(profile?.username||user?.displayName||'?').slice(0,2).toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.2rem', color:'#00ff6e', letterSpacing:'2px', marginBottom:4 }}>
              {profile?.username || user?.displayName || 'PLAYER'}
            </div>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', letterSpacing:'1px', marginBottom:8 }}>{user?.email}</div>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', padding:'4px 12px', background:'#00ff6e15', color:'#00ff6e', border:'1px solid #00cc55', borderRadius:2, letterSpacing:'1px' }}>
                {profile?.role?.toUpperCase() || 'PLAYER'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#ff2040', background:'transparent', border:'1px solid #cc0020', padding:'8px 16px', borderRadius:4, cursor:'pointer' }}>
            LOGOUT
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
          {[
            { n: rank?.rank ? `#${rank.rank}` : '—', l:'GLOBAL RANK',   c:'#ffcc00' },
            { n: totalPoints,                          l:'TOTAL POINTS',  c:'#00ff6e' },
            { n: solves.length,                        l:'FLAGS CAPTURED', c:'#00d4ff' },
            { n: rank?.solveCount || 0,                l:'CHALLENGES DONE', c:'#aa66ff' },
          ].map(({ n, l, c }) => (
            <div key={l} style={{ background:'#071a0e', border:'1px solid #0f3020', borderBottom:`2px solid ${c}60`, borderRadius:6, padding:'1.25rem', textAlign:'center' }}>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.8rem', fontWeight:900, color:c, lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'2px', marginTop:6 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Solve history */}
        <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, overflow:'hidden' }}>
          <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #0f3020' }}>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00ff6e', letterSpacing:'2px' }}>🚩 SOLVE HISTORY</div>
          </div>
          {solves.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'2px' }}>
              NO CHALLENGES SOLVED YET — GO HACK! 🐉
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#030f08', borderBottom:'1px solid #0f3020' }}>
                  {['CHALLENGE','CATEGORY','POINTS','SOLVED AT'].map(h=>(
                    <th key={h} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'2px', padding:'10px 14px', textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solves.map((s,i) => (
                  <tr key={s.id} style={{ borderBottom:'1px solid #0a1f10' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'10px 14px', fontFamily:'Orbitron,monospace', fontSize:'0.72rem', color:'#b0ffcc' }}>
                      ✓ {s.challengeName || 'Challenge'}
                    </td>
                    <td style={{ padding:'10px 14px', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50' }}>
                      {CAT_ICONS[s.category] || '🚩'} {s.category || '—'}
                    </td>
                    <td style={{ padding:'10px 14px', fontFamily:'Orbitron,monospace', fontSize:'0.78rem', color:'#00ff6e', fontWeight:900 }}>
                      +{s.points}
                    </td>
                    <td style={{ padding:'10px 14px', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50' }}>
                      {s.solvedAt?.toDate ? s.solvedAt.toDate().toLocaleString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
