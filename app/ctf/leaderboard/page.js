// app/ctf/leaderboard/page.js
'use client'
import { useState, useEffect } from 'react'
import { listenLeaderboard } from '../../../lib/ctf'
import { useAuth } from '../../../lib/AuthContext'
import Footer from '../../../components/Footer'

const MEDALS = ['🥇','🥈','🥉']
const AV_BG  = ['linear-gradient(135deg,#00cc55,#006622)','linear-gradient(135deg,#0066aa,#003366)','linear-gradient(135deg,#aa0020,#660010)','linear-gradient(135deg,#aa6600,#664400)','linear-gradient(135deg,#6600aa,#330066)','linear-gradient(135deg,#005566,#002233)']

export default function LeaderboardPage() {
  const { user, profile } = useAuth()
  const [board,   setBoard]   = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    const unsub = listenLeaderboard(data => {
      setBoard(data)
      setLoading(false)
      setLastUpdate(new Date().toLocaleTimeString('en-GB'))
    })
    return () => unsub()
  }, [])

  const myRank = board.find(p => p.userId === user?.uid)

  return (
    <div className="page-enter">
      <div style={{ padding:'3rem 2rem 2rem', maxWidth:900, margin:'0 auto' }}>
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:900, color:'#ffcc00', marginBottom:'0.5rem' }}>
          🏆 LEADERBOARD
        </h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:'0.5rem' }}>
          &gt; REAL-TIME RANKINGS — FIREBASE LIVE
        </p>
        {lastUpdate && (
          <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#0f3020', letterSpacing:'1px', marginBottom:'1.5rem' }}>
            Last updated: {lastUpdate}
          </p>
        )}

        {/* My rank card */}
        {user && myRank && (
          <div style={{ background:'#ffcc0015', border:'2px solid #cc9900', borderRadius:6, padding:'1rem 1.5rem', marginBottom:'2rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'2rem', fontWeight:900, color:'#ffcc00' }}>#{myRank.rank}</div>
            <div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#ffcc00', letterSpacing:'1px' }}>YOUR RANKING</div>
              <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#3a7a50', letterSpacing:'1px', marginTop:2 }}>
                {myRank.points} pts · {myRank.solveCount} solves
              </div>
            </div>
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', fontFamily:'"Share Tech Mono",monospace', color:'#3a7a50', letterSpacing:'2px' }}>
            🏆 LOADING LEADERBOARD FROM FIREBASE...
          </div>
        ) : board.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', background:'#071a0e', border:'1px solid #0f3020', borderRadius:8 }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🏆</div>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.9rem', color:'#ffcc00', letterSpacing:'2px', marginBottom:'0.75rem' }}>NO SCORES YET</div>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'1px' }}>Be the first to solve a challenge!</div>
          </div>
        ) : (
          <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 120px 100px', gap:0, background:'#030f08', borderBottom:'1px solid #0f3020', padding:'12px 16px' }}>
              {['RANK','PLAYER','POINTS','SOLVES'].map(h => (
                <div key={h} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'2px' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {board.map((player, i) => {
              const isMe = player.userId === user?.uid
              const isTop = i < 3
              return (
                <div key={player.id} style={{
                  display:'grid', gridTemplateColumns:'60px 1fr 120px 100px',
                  padding:'14px 16px', borderBottom:'1px solid #0a1f10',
                  background: isMe ? '#ffcc0010' : isTop ? '#00ff6e05' : 'transparent',
                  transition:'background 0.15s',
                }}
                  onMouseEnter={e=>!isMe&&(e.currentTarget.style.background='#00ff6e05')}
                  onMouseLeave={e=>!isMe&&(e.currentTarget.style.background=isTop?'#00ff6e05':'transparent')}
                >
                  {/* Rank */}
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1rem', fontWeight:900, color:i===0?'#ffcc00':i===1?'#b0b0b0':i===2?'#cd7f32':'#3a7a50', display:'flex', alignItems:'center', gap:6 }}>
                    {i < 3 ? MEDALS[i] : `#${player.rank}`}
                  </div>

                  {/* Player */}
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:AV_BG[(player.username?.charCodeAt(0)||0)%AV_BG.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#020c06', flexShrink:0 }}>
                      {(player.username||'?').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.78rem', color: isMe ? '#ffcc00' : isTop ? '#b0ffcc' : '#b0ffcc', letterSpacing:'1px' }}>
                        {player.username}
                        {isMe && <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', color:'#ffcc00', marginLeft:8, border:'1px solid #cc9900', padding:'1px 6px', borderRadius:2 }}>YOU</span>}
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1rem', fontWeight:900, color: i===0?'#ffcc00':i===1?'#b0b0b0':i===2?'#cd7f32':'#00ff6e', display:'flex', alignItems:'center' }}>
                    {player.points}
                    <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', color:'#3a7a50', marginLeft:4 }}>pts</span>
                  </div>

                  {/* Solves */}
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', display:'flex', alignItems:'center', letterSpacing:'1px' }}>
                    {player.solveCount} 🚩
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
