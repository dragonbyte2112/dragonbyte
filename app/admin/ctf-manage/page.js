// app/admin/ctf-manage/page.js
// Admin page to create/edit/delete CTF challenges
'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  listenChallenges, addChallenge, updateChallenge, deleteChallenge,
  getAllSubmissions, resetAllScores, getCTFSettings, saveCTFSettings,
} from '../../../lib/ctf'
import Footer from '../../../components/Footer'

// ── Admin credentials ──
const ADMIN_EMAIL    = 'dragonbyte2112@gmail.com'
const ADMIN_PASSWORD = 'DragonByte@2025'

const CATEGORIES   = ['web','crypto','forensics','pwn','rev','osint','misc']
const DIFFICULTIES = ['easy','medium','hard','insane']
const DIFF_COLOR   = { easy:'#00ff6e', medium:'#ffcc00', hard:'#ff2040', insane:'#aa66ff' }
const CAT_ICONS    = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', osint:'👁️', misc:'🚩' }

const I = { width:'100%', background:'#030f08', border:'1px solid #0f3020', borderRadius:4, padding:'10px 14px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.82rem', outline:'none', marginBottom:'1rem' }
const S = { ...I, cursor:'pointer' }
const T = { ...I, fontFamily:'Rajdhani,sans-serif', fontSize:'0.88rem', resize:'vertical', height:100 }
const L = { fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:5 }
const AB = (c,b) => ({ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'4px 10px', borderRadius:3, cursor:'pointer', color:c, border:`1px solid ${b}`, background:'transparent' })
const PL = (a) => ({ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'5px 10px', borderRadius:2, cursor:'pointer', letterSpacing:'1px', border:a?'1px solid #00cc55':'1px solid #0f3020', background:a?'#00ff6e10':'transparent', color:a?'#00ff6e':'#3a7a50' })

const EMPTY_CHAL = { title:'', description:'', category:'web', difficulty:'easy', points:100, flag:'', attachmentUrl:'', hints:[] }

function LoginScreen({ onLogin }) {
  const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [err,setErr]=useState(false)
  const handle = () => { if(email===ADMIN_EMAIL&&pass===ADMIN_PASSWORD) onLogin(); else {setErr(true);setTimeout(()=>setErr(false),3000)} }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #ff2040', borderRadius:8, padding:'2.5rem', width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🐉</div>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1rem', color:'#00ff6e', letterSpacing:'3px' }}>CTF ADMIN</div>
        </div>
        <label style={L}>EMAIL</label><input style={I} type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        <label style={L}>PASSWORD</label><input style={I} type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        {err&&<div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#ff2040', textAlign:'center', marginBottom:'0.75rem' }}>✖ INVALID</div>}
        <button onClick={handle} style={{ width:'100%', fontFamily:'Orbitron,monospace', fontSize:'0.75rem', fontWeight:700, color:'#fff', background:'#ff2040', padding:12, border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'3px' }}>AUTHENTICATE →</button>
      </div>
    </div>
  )
}

function ChallengeModal({ form, setForm, onSave, onClose, isEdit, saving }) {
  const [hintInput, setHintInput] = useState('')
  const addHint = () => { if(!hintInput.trim())return; setForm(f=>({...f,hints:[...(f.hints||[]),hintInput.trim()]})); setHintInput('') }
  const removeHint = i => setForm(f=>({...f,hints:f.hints.filter((_,j)=>j!==i)}))

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00ff6e', borderRadius:8, width:'100%', maxWidth:580, maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.5rem', borderBottom:'1px solid #0f3020' }}>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00ff6e', letterSpacing:'2px' }}>{isEdit?'EDIT CHALLENGE':'ADD CHALLENGE'}</div>
          <button onClick={onClose} style={{ color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'4px 10px', borderRadius:3, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem' }}>
          <label style={L}>CHALLENGE TITLE *</label><input style={I} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. SQL Injection 101" />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
            <div><label style={L}>CATEGORY *</label><select style={S} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={L}>DIFFICULTY *</label><select style={S} value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}>{DIFFICULTIES.map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label style={L}>POINTS *</label><input style={I} type="number" min="1" value={form.points} onChange={e=>setForm(f=>({...f,points:parseInt(e.target.value)||100}))} /></div>
          </div>

          <label style={L}>DESCRIPTION *</label>
          <textarea style={T} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the challenge, provide context, links to challenge server etc." />

          <label style={L}>FLAG * (exact flag players must submit)</label>
          <input style={{ ...I, fontFamily:'monospace', letterSpacing:'2px', color:'#00ff6e' }} value={form.flag} onChange={e=>setForm(f=>({...f,flag:e.target.value}))} placeholder="DragonByte{your_flag_here}" />

          <label style={L}>ATTACHMENT URL (optional)</label>
          <input style={I} type="url" value={form.attachmentUrl||''} onChange={e=>setForm(f=>({...f,attachmentUrl:e.target.value}))} placeholder="https://..." />

          <label style={L}>HINTS (optional — add one at a time)</label>
          <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
            <input style={{ ...I, marginBottom:0, flex:1 }} value={hintInput} onChange={e=>setHintInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addHint()} placeholder="Type hint, press Enter..." />
            <button onClick={addHint} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.6rem', fontWeight:700, color:'#020c06', background:'#ffcc00', padding:'0 16px', border:'none', borderRadius:4, cursor:'pointer' }}>ADD</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:'1rem' }}>
            {(form.hints||[]).map((h,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, background:'#ffcc0010', border:'1px solid #cc990030', borderRadius:4, padding:'6px 10px' }}>
                <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#ffcc00', flex:1 }}>💡 {h}</span>
                <button onClick={()=>removeHint(i)} style={{ background:'none', border:'none', color:'#ff2040', cursor:'pointer', fontSize:'0.8rem' }}>×</button>
              </div>
            ))}
          </div>

          <label style={L}>PUBLISHED</label>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
            <button onClick={()=>setForm(f=>({...f,published:!f.published}))} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, padding:'8px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px', background:form.published!==false?'#00ff6e':'#ff2040', color:'#020c06' }}>
              {form.published!==false?'◆ PUBLISHED':'■ HIDDEN'}
            </button>
            <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50' }}>{form.published!==false?'Visible to players':'Hidden from players'}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', padding:'1rem 1.5rem', borderTop:'1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>CANCEL</button>
          <button onClick={onSave} disabled={saving} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#020c06', background:saving?'#009944':'#00ff6e', padding:'10px 24px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>
            {saving?'SAVING...': isEdit?'💾 UPDATE':'💾 ADD CHALLENGE'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DelModal({ name, onConfirm, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #ff2040', borderRadius:8, padding:'2rem', width:'100%', maxWidth:420 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#ff2040', letterSpacing:'2px', marginBottom:'1rem' }}>DELETE CHALLENGE</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.9rem', color:'#ff2040', margin:'0.75rem 0' }}>{name}</div>
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#3a7a50', marginBottom:'1.5rem' }}>// This will also delete all submissions for this challenge</div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>CANCEL</button>
          <button onClick={onConfirm} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#fff', background:'#ff2040', padding:'10px 24px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>DELETE</button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ onLogout }) {
  const [tab,         setTab]       = useState('challenges')
  const [challenges,  setChallenges]= useState([])
  const [submissions, setSubmissions]=useState([])
  const [ctfSettings, setCTFSettings]=useState({ active:true, name:'DragonByte CTF' })
  const [modal,       setModal]     = useState(null)
  const [editId,      setEditId]    = useState(null)
  const [delTarget,   setDelTarget] = useState(null)
  const [form,        setForm]      = useState(EMPTY_CHAL)
  const [saving,      setSaving]    = useState(false)
  const [catFilter,   setCatFilter] = useState('all')
  const [search,      setSearch]    = useState('')

  useEffect(() => {
    const unsub = listenChallenges(data => setChallenges(data))
    getCTFSettings().then(s => setCTFSettings(s))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (tab === 'submissions') getAllSubmissions().then(setSubmissions)
  }, [tab])

  const openAdd  = () => { setForm({...EMPTY_CHAL}); setEditId(null); setModal('challenge') }
  const openEdit = c => { setForm({...c,hints:[...(c.hints||[])]}); setEditId(c.id); setModal('challenge') }

  const saveChal = async () => {
    if (!form.title.trim() || !form.flag.trim() || !form.description.trim()) { toast.error('Fill required fields!'); return }
    setSaving(true)
    try {
      if (editId) {
        await updateChallenge(editId, { title:form.title, description:form.description, category:form.category, difficulty:form.difficulty, points:Number(form.points), flag:form.flag.trim(), attachmentUrl:form.attachmentUrl||'', hints:form.hints||[], published:form.published!==false })
        toast.success('✓ CHALLENGE UPDATED IN FIREBASE!')
      } else {
        await addChallenge({ title:form.title, description:form.description, category:form.category, difficulty:form.difficulty, points:Number(form.points), flag:form.flag.trim(), attachmentUrl:form.attachmentUrl||'', hints:form.hints||[], published:form.published!==false })
        toast.success('✓ CHALLENGE ADDED TO FIREBASE!')
      }
      setModal(null)
    } catch(e) { toast.error('Error: '+e.message) }
    setSaving(false)
  }

  const confirmDelete = async () => {
    try { await deleteChallenge(delTarget.id); toast.error('CHALLENGE DELETED'); setModal(null) } catch(e) { toast.error(e.message) }
  }

  const togglePublish = async (c) => {
    await updateChallenge(c.id, { published: !c.published })
    toast.success(c.published ? 'Challenge hidden' : '✓ Challenge published!')
  }

  const handleResetScores = async () => {
    if (!confirm('Reset ALL scores and submissions? This cannot be undone!')) return
    setSaving(true)
    try { await resetAllScores(); toast.success('✓ ALL SCORES RESET') } catch(e) { toast.error(e.message) }
    setSaving(false)
  }

  const saveCTF = async () => {
    setSaving(true)
    try { await saveCTFSettings(ctfSettings); toast.success('✓ CTF SETTINGS SAVED!') } catch(e) { toast.error(e.message) }
    setSaving(false)
  }

  const filtChallenges = challenges
    .filter(c => catFilter==='all' || c.category===catFilter)
    .filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))

  const TH = { fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'2px', padding:'10px 12px', textAlign:'left', whiteSpace:'nowrap' }
  const TD = { padding:'11px 12px', borderBottom:'1px solid #0a1f10', verticalAlign:'middle' }
  const C  = { background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, padding:'1.5rem', marginBottom:'1.5rem' }

  return (
    <div>
      {/* Top bar */}
      <div style={{ background:'#030f08', borderBottom:'1px solid #0f3020', padding:'8px 1rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.85rem', fontWeight:900, flexShrink:0 }}>
          <span style={{ color:'#00ff6e' }}>DRAGON</span><span style={{ color:'#00d4ff' }}>BYTE</span>
          <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', color:'#ffcc00', marginLeft:'0.75rem' }}>🚩 CTF ADMIN</span>
        </div>
        <div style={{ display:'flex', gap:3, flexWrap:'wrap', flex:1, justifyContent:'center' }}>
          {[
            { key:'challenges', label:`🚩 CHALLENGES (${challenges.length})` },
            { key:'submissions',label:'📋 SUBMISSIONS' },
            { key:'settings',   label:'⚙️ CTF SETTINGS' },
          ].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{ ...PL(tab===t.key), padding:'5px 10px', fontSize:'0.6rem' }}>{t.label}</button>
          ))}
        </div>
        <button onClick={onLogout} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#ff2040', background:'transparent', border:'1px solid #cc0020', padding:'6px 12px', borderRadius:4, cursor:'pointer', flexShrink:0 }}>LOGOUT</button>
      </div>

      <div style={{ padding:'1.5rem', maxWidth:1200, margin:'0 auto' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
          {[
            { n:challenges.length,                        l:'TOTAL CHALLENGES', c:'#00ff6e', a:'#00cc55' },
            { n:challenges.filter(c=>c.published).length, l:'PUBLISHED',        c:'#00d4ff', a:'#0099cc' },
            { n:challenges.filter(c=>!c.published).length,l:'HIDDEN',           c:'#ff2040', a:'#cc0020' },
            { n:challenges.reduce((s,c)=>s+(c.solveCount||0),0), l:'TOTAL SOLVES', c:'#ffcc00', a:'#cc9900' },
          ].map(({n,l,c,a})=>(
            <div key={l} style={{ background:'#071a0e',border:'1px solid #0f3020',borderBottom:`2px solid ${a}`,borderRadius:6,padding:'1.25rem',textAlign:'center' }}>
              <div style={{ fontFamily:'Orbitron,monospace',fontSize:'1.8rem',fontWeight:900,color:c,lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.6rem',color:'#3a7a50',letterSpacing:'2px',marginTop:5 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ── CHALLENGES TAB ── */}
        {tab==='challenges'&&(
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                <input style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:4,padding:'8px 12px',color:'#b0ffcc',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',outline:'none',width:200 }} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
                {['all',...CATEGORIES].map(c=><button key={c} onClick={()=>setCatFilter(c)} style={PL(catFilter===c)}>{c.toUpperCase()}</button>)}
              </div>
              <button onClick={openAdd} style={{ fontFamily:'Orbitron,monospace',fontSize:'0.65rem',fontWeight:700,color:'#020c06',background:'#00ff6e',padding:'9px 20px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>+ ADD CHALLENGE</button>
            </div>

            <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',minWidth:700 }}>
                <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>
                  {['CHALLENGE','CAT','DIFF','POINTS','SOLVES','STATUS','ACTIONS'].map(h=><th key={h} style={TH}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtChallenges.map(c=>(
                    <tr key={c.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={TD}>
                        <div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.72rem',color:'#b0ffcc' }}>{c.title}</div>
                        <div style={{ fontSize:'0.68rem',color:'#3a7a50',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:2 }}>{c.description}</div>
                      </td>
                      <td style={TD}><span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.6rem' }}>{CAT_ICONS[c.category]} {c.category}</span></td>
                      <td style={TD}><span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.6rem',padding:'2px 8px',borderRadius:2,background:`${DIFF_COLOR[c.difficulty]}15`,color:DIFF_COLOR[c.difficulty],border:`1px solid ${DIFF_COLOR[c.difficulty]}60` }}>{c.difficulty}</span></td>
                      <td style={{ ...TD,fontFamily:'Orbitron,monospace',fontSize:'0.8rem',color:'#ffcc00',fontWeight:900 }}>{c.points}</td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.72rem',color:'#3a7a50' }}>{c.solveCount||0} 🚩</td>
                      <td style={TD}>
                        <button onClick={()=>togglePublish(c)} style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,letterSpacing:'1px',background:c.published?'#00ff6e15':'#ff204015',color:c.published?'#00ff6e':'#ff2040',border:`1px solid ${c.published?'#00cc55':'#cc0020'}`,cursor:'pointer' }}>
                          {c.published?'LIVE':'HIDDEN'}
                        </button>
                      </td>
                      <td style={TD}><div style={{ display:'flex',gap:4 }}>
                        <button onClick={()=>openEdit(c)} style={AB('#00d4ff','#0099cc')}>EDIT</button>
                        <button onClick={()=>{setDelTarget(c);setModal('delete')}} style={AB('#ff2040','#cc0020')}>DELETE</button>
                      </div></td>
                    </tr>
                  ))}
                  {filtChallenges.length===0&&<tr><td colSpan={7} style={{ padding:'3rem',textAlign:'center',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO CHALLENGES YET — ADD ONE!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {tab==='submissions'&&(
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
              <div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px' }}>ALL SUBMISSIONS ({submissions.length})</div>
              <button onClick={handleResetScores} disabled={saving} style={{ fontFamily:'Orbitron,monospace',fontSize:'0.65rem',fontWeight:700,color:'#fff',background:'#ff2040',padding:'9px 20px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>
                {saving?'RESETTING...':'⚠️ RESET ALL SCORES'}
              </button>
            </div>
            <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',minWidth:600 }}>
                <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>
                  {['PLAYER','CHALLENGE','POINTS','SOLVED AT'].map(h=><th key={h} style={TH}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {submissions.map(s=>(
                    <tr key={s.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ ...TD,fontFamily:'Orbitron,monospace',fontSize:'0.72rem',color:'#b0ffcc' }}>{s.username}</td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.7rem',color:'#3a7a50' }}>{s.challengeName}</td>
                      <td style={{ ...TD,fontFamily:'Orbitron,monospace',fontSize:'0.8rem',color:'#00ff6e',fontWeight:900 }}>+{s.points}</td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.65rem',color:'#3a7a50',whiteSpace:'nowrap' }}>{s.solvedAt?.toDate?s.solvedAt.toDate().toLocaleString('en-GB'):'—'}</td>
                    </tr>
                  ))}
                  {submissions.length===0&&<tr><td colSpan={4} style={{ padding:'3rem',textAlign:'center',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO SUBMISSIONS YET</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CTF SETTINGS TAB ── */}
        {tab==='settings'&&(
          <div style={C}>
            <div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px',marginBottom:'1.25rem' }}>CTF SETTINGS</div>
            <label style={L}>CTF NAME</label>
            <input style={I} value={ctfSettings.name||''} onChange={e=>setCTFSettings(s=>({...s,name:e.target.value}))} />
            <label style={L}>CTF DESCRIPTION</label>
            <textarea style={T} value={ctfSettings.description||''} onChange={e=>setCTFSettings(s=>({...s,description:e.target.value}))} />
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', padding:'1rem', background:'#030f08', borderRadius:6, border:'1px solid #0f3020' }}>
              <button onClick={()=>setCTFSettings(s=>({...s,active:!s.active}))} style={{ fontFamily:'Orbitron,monospace',fontSize:'0.7rem',fontWeight:700,padding:'8px 20px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px',background:ctfSettings.active?'#00ff6e':'#ff2040',color:'#020c06' }}>
                {ctfSettings.active?'◆ CTF ACTIVE':'■ CTF PAUSED'}
              </button>
              <div style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.62rem',color:ctfSettings.active?'#00ff6e':'#ff2040' }}>
                {ctfSettings.active?'Players can submit flags':'Flag submission is disabled'}
              </div>
            </div>
            <button onClick={saveCTF} disabled={saving} style={{ fontFamily:'Orbitron,monospace',fontSize:'0.75rem',fontWeight:700,color:'#020c06',background:saving?'#009944':'#00ff6e',padding:'12px 32px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'3px' }}>
              {saving?'SAVING...':'💾 SAVE CTF SETTINGS'}
            </button>
          </div>
        )}
      </div>

      {modal==='challenge'&&<ChallengeModal form={form} setForm={setForm} onSave={saveChal} onClose={()=>setModal(null)} isEdit={!!editId} saving={saving} />}
      {modal==='delete'  &&<DelModal name={delTarget?.title} onConfirm={confirmDelete} onClose={()=>setModal(null)} />}

      <Footer />
    </div>
  )
}

export default function CTFAdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />
  return <Dashboard onLogout={() => setLoggedIn(false)} />
}
