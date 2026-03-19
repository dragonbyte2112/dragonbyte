// app/page.js — Home Page (reads from Firebase in real-time)
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listenSettings, listenEvents, listenMembers } from '../lib/db'
import Footer from '../components/Footer'

function useCounter(target) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0; const step = target / 60
    const t = setInterval(() => { start += step; if(start>=target){setCount(target);clearInterval(t)}else setCount(Math.floor(start)) }, 20)
    return () => clearInterval(t)
  }, [target])
  return count
}

const AV = ['linear-gradient(135deg,#00cc55,#006622)','linear-gradient(135deg,#0066aa,#003366)','linear-gradient(135deg,#aa0020,#660010)','linear-gradient(135deg,#aa6600,#664400)','linear-gradient(135deg,#6600aa,#330066)','linear-gradient(135deg,#005566,#002233)']
const RC = { admin:'#ff2040', player:'#00ff6e', beginner:'#00d4ff' }
const TS = { CTF:{bg:'#00ff6e15',c:'#00ff6e',b:'1px solid #00cc55'}, WORKSHOP:{bg:'#00d4ff15',c:'#00d4ff',b:'1px solid #00d4ff'}, TALK:{bg:'#ff204015',c:'#ff2040',b:'1px solid #ff2040'} }
const CI = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', misc:'🚩' }

export default function HomePage() {
  const [settings, setSettings] = useState(null)
  const [events,   setEvents]   = useState([])
  const [members,  setMembers]  = useState([])

  useEffect(() => {
    const u1 = listenSettings(d => setSettings(d))
    const u2 = listenEvents(d   => setEvents(d))
    const u3 = listenMembers(d  => setMembers(d))
    return () => { u1(); u2(); u3() }
  }, [])

  const stats     = settings?.stats     || { memberCount:247, flagCount:1420, teamCount:15, eventCount:38 }
  const tf        = settings?.teamFinder|| { enabled:false }
  const flags     = settings?.flags     || []
  const upcomingE = events.filter(e=>e.status==='upcoming').slice(0,3)
  const featMems  = members.slice(0,4)
  const solvedF   = flags.filter(f=>f.solved)

  const mc = useCounter(stats.memberCount||247)
  const fc = useCounter(stats.flagCount  ||1420)
  const tc = useCounter(stats.teamCount  ||15)
  const ec = useCounter(stats.eventCount ||38)

  return (
    <div className="page-enter">
      {/* HERO */}
      <section style={{ position:'relative', minHeight:'88vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'4rem 2rem 2rem', overflow:'hidden' }}>
        <div className="scan-line" />
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#00cc55', border:'1px solid #00cc55', padding:'4px 16px', borderRadius:2, letterSpacing:'3px', marginBottom:'1.5rem' }}>&gt; CYBERSECURITY COMMUNITY</div>
        <img src="/dragon_byte_new.png" alt="DragonByte" style={{ width:160, height:160, borderRadius:'50%', border:'2px solid #00cc55', boxShadow:'0 0 40px #00ff6e40', marginBottom:'1.5rem', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
        <h1 className="glitch" style={{ fontFamily:'Orbitron,monospace', fontSize:'clamp(2rem,6vw,4rem)', fontWeight:900, letterSpacing:'4px', lineHeight:1.1, marginBottom:'0.5rem' }}>
          <span style={{ color:'#00ff6e', textShadow:'0 0 30px #00ff6e80' }}>DRAGON</span><span style={{ color:'#00d4ff', textShadow:'0 0 30px #00d4ff80' }}>BYTE</span>
        </h1>
        <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'clamp(0.8rem,2vw,1rem)', color:'#3a7a50', letterSpacing:'4px', marginBottom:'0.5rem' }}>&gt; COMMUNITY</p>
        <p style={{ fontSize:'1.1rem', color:'#7abf90', marginBottom:'2.5rem', fontWeight:600, letterSpacing:'1px' }}><span style={{ color:'#00ff6e' }}>Learn.</span> Hack. <span style={{ color:'#00ff6e' }}>Defend.</span> Grow.</p>
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
          <Link href="/join"   className="btn-primary">JOIN COMMUNITY</Link>
          <Link href="/events" className="btn-outline-blue">EXPLORE EVENTS</Link>
        </div>
      </section>

      {/* STATS — from Firebase */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'#0f3020' }}>
        {[{n:mc,l:'MEMBERS'},{n:ec,l:'EVENTS HELD'},{n:fc,l:'CTF FLAGS'},{n:tc,l:'ACTIVE TEAMS'}].map(({n,l})=>(
          <div key={l} style={{ background:'#030f08', padding:'1.5rem 1rem', textAlign:'center' }}>
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:'2rem', fontWeight:900, color:'#00ff6e', display:'block', textShadow:'0 0 15px #00ff6e60' }}>{n}</span>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#3a7a50', letterSpacing:'2px', marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* UPCOMING EVENTS — from Firebase */}
      <section style={{ padding:'4rem 2rem', maxWidth:1100, margin:'0 auto' }}>
        <div className="section-header"><div className="section-line" /><div className="section-title">UPCOMING EVENTS</div><div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} /></div>
        {upcomingE.length===0
          ? <div style={{ textAlign:'center', padding:'2rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#3a7a50', letterSpacing:'2px' }}>NO UPCOMING EVENTS — ADMIN CAN ADD FROM DASHBOARD</div>
          : upcomingE.map(ev=>(
            <div key={ev.id} className="db-card" style={{ padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'1rem' }}>
              <div style={{ background:'#00d4ff12', border:'1px solid #0099cc', borderRadius:4, padding:'8px 12px', textAlign:'center', minWidth:56, flexShrink:0 }}>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.3rem', fontWeight:900, color:'#00d4ff', lineHeight:1 }}>{ev.date?new Date(ev.date+'T00:00:00').getDate():'??'}</div>
                <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#0099cc', letterSpacing:'2px', marginTop:2 }}>{ev.date?new Date(ev.date+'T00:00:00').toLocaleString('en',{month:'short'}).toUpperCase():'???'}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#b0ffcc', letterSpacing:'1px' }}>{ev.title}</div>
                  {ev.type&&<span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'3px 10px', borderRadius:2, letterSpacing:'1px', background:TS[ev.type]?.bg, color:TS[ev.type]?.c, border:TS[ev.type]?.b }}>{ev.type}</span>}
                </div>
                <div style={{ fontSize:'0.82rem', color:'#3a7a50', lineHeight:1.4 }}>{ev.desc}</div>
              </div>
            </div>
          ))
        }
        <div style={{ textAlign:'center', marginTop:'1.5rem' }}><Link href="/events" className="btn-outline-blue" style={{ fontSize:'0.68rem', padding:'10px 24px' }}>VIEW ALL EVENTS →</Link></div>
      </section>

      {/* TEAM FINDER — from Firebase */}
      {tf.enabled&&(
        <section style={{ padding:'0 2rem 4rem', maxWidth:1100, margin:'0 auto' }}>
          <div className="section-header"><div className="section-line" /><div className="section-title">TEAM FINDER</div><div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} /></div>
          <div className="db-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'1.25rem 1.5rem', background:'#00ff6e06', borderBottom:'1px solid #0f3020', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.1rem', fontWeight:700, color:'#00ff6e', textShadow:'0 0 20px #00ff6e60', letterSpacing:'2px', marginBottom:6 }}>{tf.name}</div>
                <div style={{ fontSize:'0.88rem', color:'#3a7a50', lineHeight:1.6, maxWidth:500 }}>{tf.description}</div>
              </div>
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', padding:'6px 14px', borderRadius:4, whiteSpace:'nowrap', background:tf.slots>0?'#00ff6e08':'#ff204008', border:`1px solid ${tf.slots>0?'#00cc5544':'#ff204044'}`, color:tf.slots>0?'#00ff6e':'#ff2040' }}>
                {tf.slots} SLOT{tf.slots!==1?'S':''} {tf.slots>0?'OPEN':'FULL'}
              </span>
            </div>
            <div style={{ padding:'1.25rem 1.5rem' }}>
              {(tf.requirements||[]).length>0&&<div style={{ marginBottom:'1.25rem' }}><div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:8 }}>LOOKING FOR</div><div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{tf.requirements.map((r,i)=><span key={i} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', padding:'4px 12px', background:'#00d4ff10', border:'1px solid #00d4ff25', borderRadius:2, color:'#00d4ff', letterSpacing:'1px' }}>{r}</span>)}</div></div>}
              {(tf.teamMembers||[]).length>0&&<div><div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'3px', marginBottom:8 }}>CURRENT MEMBERS</div><div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8 }}>{tf.teamMembers.map((m,i)=><div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#0a2010', border:'1px solid #0f3020', borderRadius:4 }}><div style={{ width:28, height:28, borderRadius:'50%', background:AV[i%AV.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'0.65rem', fontWeight:700, color:'#020c06', flexShrink:0 }}>{(m.name[0]||'?').toUpperCase()}</div><div><div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#b0ffcc' }}>{m.name}</div><div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#3a7a50', marginTop:1 }}>{m.role}</div></div></div>)}</div></div>}
              <div style={{ marginTop:'1.25rem' }}><Link href="/team-finder" className="btn-primary" style={{ fontSize:'0.65rem', padding:'9px 20px' }}>VIEW TEAM FINDER →</Link></div>
            </div>
          </div>
        </section>
      )}

      {/* CTF FLAGS — from Firebase */}
      {flags.length>0&&(
        <section style={{ padding:'0 2rem 4rem', maxWidth:1100, margin:'0 auto' }}>
          <div className="section-header"><div className="section-line" /><div className="section-title">CTF FLAGS — {solvedF.length}/{flags.length} SOLVED</div><div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'0.75rem' }}>
            {flags.map(f=>(
              <div key={f.id} style={{ background:f.solved?'#00ff6e08':'#071a0e', border:`1px solid ${f.solved?'#00cc55':'#0f3020'}`, borderRadius:6, padding:'1rem', display:'flex', alignItems:'center', gap:'0.75rem', position:'relative', overflow:'hidden' }}>
                {f.solved&&<div style={{ position:'absolute', top:8, right:10, color:'#00ff6e', fontSize:'1rem' }}>✓</div>}
                <div style={{ fontSize:'1.4rem', flexShrink:0 }}>{CI[f.cat]||'🚩'}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', color:'#b0ffcc', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', padding:'2px 7px', background:'#ffcc0015', color:'#ffcc00', border:'1px solid #cc990040', borderRadius:2 }}>{f.pts}PTS</span>
                    <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', padding:'2px 7px', background:'#00d4ff10', color:'#00d4ff', border:'1px solid #00d4ff30', borderRadius:2 }}>{f.cat}</span>
                    <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', padding:'2px 7px', background:f.solved?'#00ff6e15':'transparent', color:f.solved?'#00ff6e':'#3a7a50', border:`1px solid ${f.solved?'#00cc55':'#0f3020'}`, borderRadius:2 }}>{f.solved?'✓ SOLVED':'○ OPEN'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED MEMBERS — from Firebase */}
      <section style={{ padding:'0 2rem 4rem', maxWidth:1100, margin:'0 auto' }}>
        <div className="section-header"><div className="section-line" /><div className="section-title">FEATURED MEMBERS</div><div className="section-line" style={{ background:'linear-gradient(90deg,transparent,#00cc55)' }} /></div>
        {featMems.length===0
          ? <div style={{ textAlign:'center', padding:'2rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'2px' }}>NO MEMBERS YET — ADD FROM ADMIN DASHBOARD</div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1.25rem' }}>
              {featMems.map(m=>(
                <div key={m.id} className="db-card" style={{ padding:'1.5rem', textAlign:'center' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:AV[(m.name?.charCodeAt(0)||0)%AV.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'1.1rem', fontWeight:900, color:'#020c06', margin:'0 auto 1rem', border:'2px solid #0f3020' }}>{(m.name||'?').slice(0,2).toUpperCase()}</div>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.78rem', color:'#b0ffcc', letterSpacing:'1px', marginBottom:4 }}>{m.name}</div>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:RC[m.role]||'#3a7a50', letterSpacing:'1px', marginBottom:'0.75rem' }}>// {(m.role||'beginner').toUpperCase()}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4, justifyContent:'center' }}>{(m.skills||[]).map(s=><span key={s} className="tag-skill">{s}</span>)}</div>
                </div>
              ))}
            </div>
        }
        <div style={{ textAlign:'center', marginTop:'1.5rem' }}><Link href="/members" className="btn-outline-blue" style={{ fontSize:'0.68rem', padding:'10px 24px' }}>VIEW ALL MEMBERS →</Link></div>
      </section>

      <Footer />
    </div>
  )
}
