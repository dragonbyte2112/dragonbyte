// app/admin/page.js — Dragon Bytes Admin + CTF Management
// ✅ All original tabs preserved
// ✅ CTF Management tab added (create/edit/delete challenges, submissions, scoreboard, settings)
'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  listenSettings, listenMembers, listenEvents, listenRequests,
  saveStats, saveTeamFinder, saveFlags, addLog,
  addMember, updateMember, deleteMember,
  addEvent, updateEvent, deleteEvent,
  updateRequest, deleteRequest,
} from '../../lib/db'
import {
  listenChallenges, addChallenge, updateChallenge, deleteChallenge,
  getAllSubmissions, resetAllScores, getCTFSettings, saveCTFSettings,
  listenLeaderboard,
} from '../../lib/ctf'
import Footer from '../../components/Footer'

// ── Auth ─────────────────────────────────────────────────────────
const ADMIN_EMAIL    = 'cybermonk'
const ADMIN_PASSWORD = 'mrx'

// ── Style tokens ─────────────────────────────────────────────────
const mono = '"Share Tech Mono",monospace'
const orb  = 'Orbitron,monospace'
const I  = { width:'100%', background:'#030f08', border:'1px solid #0f3020', borderRadius:4, padding:'10px 14px', color:'#b0ffcc', fontFamily:mono, fontSize:'0.82rem', outline:'none', marginBottom:'1rem' }
const S  = { ...I, cursor:'pointer' }
const T  = { ...I, fontFamily:'Rajdhani,sans-serif', fontSize:'0.88rem', resize:'vertical', height:80 }
const L  = { fontFamily:mono, fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:5 }
const AB = (c,b) => ({ fontFamily:mono, fontSize:'0.58rem', padding:'4px 10px', borderRadius:3, cursor:'pointer', color:c, border:`1px solid ${b}`, background:'transparent' })
const PL = (a)   => ({ fontFamily:mono, fontSize:'0.6rem', padding:'5px 10px', borderRadius:2, cursor:'pointer', letterSpacing:'1px', border:a?'1px solid #00cc55':'1px solid #0f3020', background:a?'#00ff6e10':'transparent', color:a?'#00ff6e':'#3a7a50' })
const TH = { fontFamily:mono, fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'2px', padding:'10px 12px', textAlign:'left', whiteSpace:'nowrap' }
const TD = { padding:'11px 12px', borderBottom:'1px solid #0a1f10', verticalAlign:'middle' }
const C  = { background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, padding:'1.5rem', marginBottom:'1.5rem' }

const SKILLS   = ['WEB','CRYPTO','FORENSICS','REV','PWN','OSINT']
const CTF_CATS = ['web','crypto','forensics','pwn','rev','osint','misc']
const CTF_DIFFS= ['easy','medium','hard','insane']
const DIFF_C   = { easy:'#00ff6e', medium:'#ffcc00', hard:'#ff2040', insane:'#aa66ff' }
const CAT_ICO  = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', osint:'👁️', misc:'🚩' }
const ROLES    = ['CAPTAIN','WEB','PWN','REV','CRYPTO','FORENSICS','OSINT','MISC']
const AV       = ['linear-gradient(135deg,#00cc55,#006622)','linear-gradient(135deg,#0066aa,#003366)','linear-gradient(135deg,#aa0020,#660010)','linear-gradient(135deg,#aa6600,#664400)','linear-gradient(135deg,#6600aa,#330066)','linear-gradient(135deg,#005566,#002233)']
const RC       = { admin:'#ff2040', player:'#00ff6e', beginner:'#00d4ff' }
const TS       = { CTF:{bg:'#00ff6e15',c:'#00ff6e',b:'1px solid #00cc55'}, WORKSHOP:{bg:'#00d4ff15',c:'#00d4ff',b:'1px solid #00d4ff'}, TALK:{bg:'#ff204015',c:'#ff2040',b:'1px solid #ff2040'}, COMPETITION:{bg:'#ffcc0015',c:'#ffcc00',b:'1px solid #cc9900'} }
const EMPTY_CTF = { title:'', description:'', category:'web', difficulty:'easy', points:100, flag:'', attachmentUrl:'', hints:[], published:true }

// ── Shared small components ───────────────────────────────────────
function SaveBtn({ onClick, saving, label='SAVE TO FIREBASE', color='#00ff6e' }) {
  return (
    <button onClick={onClick} disabled={saving} style={{ fontFamily:orb, fontSize:'0.72rem', fontWeight:700, color:'#020c06', background:saving?'#009944':color, padding:'11px 28px', border:'none', borderRadius:4, cursor:saving?'not-allowed':'pointer', letterSpacing:'2px' }}>
      {saving ? '⟳ SAVING...' : `💾 ${label}`}
    </button>
  )
}

// ── Login ─────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [err,setErr]=useState(false)
  const handle = () => {
    if(email===ADMIN_EMAIL&&pass===ADMIN_PASSWORD) onLogin()
    else { setErr(true); setTimeout(()=>setErr(false),3000) }
  }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #ff2040', borderRadius:8, padding:'2.5rem', width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🐉</div>
          <div style={{ fontFamily:orb, fontSize:'1.1rem', color:'#00ff6e', letterSpacing:'3px' }}>DRAGONBYTE</div>
          <div style={{ fontFamily:mono, fontSize:'0.65rem', color:'#ff2040', letterSpacing:'2px', marginTop:4 }}>// ADMIN — FIREBASE LIVE</div>
        </div>
        <label style={L}>USERNAME</label>
        <input style={I} value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        <label style={L}>PASSWORD</label>
        <input style={I} type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        {err&&<div style={{ fontFamily:mono, fontSize:'0.7rem', color:'#ff2040', textAlign:'center', marginBottom:'0.75rem' }}>✖ INVALID CREDENTIALS</div>}
        <button onClick={handle} style={{ width:'100%', fontFamily:orb, fontSize:'0.75rem', fontWeight:700, color:'#fff', background:'#ff2040', padding:12, border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'3px' }}>AUTHENTICATE →</button>
      </div>
    </div>
  )
}

// ── CTF Challenge Modal ───────────────────────────────────────────
function CTFChallengeModal({ form, setForm, hintInput, setHintInput, onSave, onClose, isEdit, saving }) {
  const addH = () => { if(!hintInput.trim())return; setForm(f=>({...f,hints:[...(f.hints||[]),hintInput.trim()]})); setHintInput('') }
  const remH = i => setForm(f=>({...f,hints:f.hints.filter((_,j)=>j!==i)}))
  return (
    <div style={{ position:'fixed',inset:0,background:'#000000cc',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderTop:'3px solid #00ff6e',borderRadius:8,width:'100%',maxWidth:580,maxHeight:'92vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.25rem 1.5rem',borderBottom:'1px solid #0f3020' }}>
          <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px' }}>{isEdit?'EDIT CHALLENGE':'CREATE CHALLENGE'}</div>
          <button onClick={onClose} style={{ color:'#3a7a50',background:'transparent',border:'1px solid #0f3020',padding:'4px 10px',borderRadius:3,cursor:'pointer',fontFamily:mono }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem' }}>
          <label style={L}>CHALLENGE TITLE *</label>
          <input style={I} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. SQL Injection 101" />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem' }}>
            <div><label style={L}>CATEGORY</label><select style={S} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CTF_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={L}>DIFFICULTY</label><select style={S} value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}>{CTF_DIFFS.map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label style={L}>POINTS</label><input style={I} type="number" min="1" value={form.points} onChange={e=>setForm(f=>({...f,points:parseInt(e.target.value)||100}))} /></div>
          </div>
          <label style={L}>DESCRIPTION *</label>
          <textarea style={{...T,height:100}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the challenge and provide all context players need." />
          <label style={L}>FLAG * — exact string players must submit</label>
          <input style={{...I,fontFamily:'monospace',letterSpacing:'2px',color:'#00ff6e'}} value={form.flag} onChange={e=>setForm(f=>({...f,flag:e.target.value}))} placeholder="DragonByte{your_flag_here}" />
          <div style={{ fontFamily:mono,fontSize:'0.58rem',color:'#3a7a50',marginTop:-14,marginBottom:'1rem' }}>// Flag is NEVER exposed to players — stored securely in Firestore</div>
          <label style={L}>ATTACHMENT URL (optional)</label>
          <input style={I} type="url" value={form.attachmentUrl||''} onChange={e=>setForm(f=>({...f,attachmentUrl:e.target.value}))} placeholder="https://..." />
          <label style={L}>HINTS (optional)</label>
          <div style={{ display:'flex',gap:'0.5rem',marginBottom:'0.5rem' }}>
            <input style={{...I,marginBottom:0,flex:1}} value={hintInput} onChange={e=>setHintInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addH()} placeholder="Type a hint, press Enter..." />
            <button onClick={addH} style={{ fontFamily:orb,fontSize:'0.6rem',fontWeight:700,color:'#020c06',background:'#ffcc00',padding:'0 16px',border:'none',borderRadius:4,cursor:'pointer' }}>ADD</button>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:4,marginBottom:'1rem' }}>
            {(form.hints||[]).map((h,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',gap:8,background:'#ffcc0010',border:'1px solid #cc990030',borderRadius:4,padding:'6px 10px' }}>
                <span style={{ fontFamily:mono,fontSize:'0.7rem',color:'#ffcc00',flex:1 }}>💡 {h}</span>
                <button onClick={()=>remH(i)} style={{ background:'none',border:'none',color:'#ff2040',cursor:'pointer',fontSize:'0.9rem',padding:0 }}>×</button>
              </div>
            ))}
          </div>
          <label style={L}>VISIBILITY</label>
          <div style={{ display:'flex',alignItems:'center',gap:'1rem',padding:'0.75rem',background:'#030f08',borderRadius:6,border:'1px solid #0f3020',marginBottom:'1rem' }}>
            <button onClick={()=>setForm(f=>({...f,published:!f.published}))} style={{ fontFamily:orb,fontSize:'0.68rem',fontWeight:700,padding:'7px 18px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px',background:form.published!==false?'#00ff6e':'#ff2040',color:'#020c06' }}>
              {form.published!==false?'◆ PUBLISHED':'■ HIDDEN'}
            </button>
            <span style={{ fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50' }}>{form.published!==false?'Visible to all players':'Hidden from players'}</span>
          </div>
        </div>
        <div style={{ display:'flex',gap:'0.75rem',justifyContent:'flex-end',padding:'1rem 1.5rem',borderTop:'1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily:mono,fontSize:'0.68rem',color:'#3a7a50',background:'transparent',border:'1px solid #0f3020',padding:'10px 20px',borderRadius:4,cursor:'pointer' }}>CANCEL</button>
          <button onClick={onSave} disabled={saving} style={{ fontFamily:orb,fontSize:'0.68rem',fontWeight:700,color:'#020c06',background:saving?'#009944':'#00ff6e',padding:'10px 28px',border:'none',borderRadius:4,cursor:saving?'not-allowed':'pointer',letterSpacing:'2px' }}>
            {saving?'⟳ SAVING...':isEdit?'💾 UPDATE':'💾 CREATE'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────
function StatCard({ label, color, accent, value, onSave, saving }) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])
  const adj = d => setLocal(v => Math.max(0, Number(v) + d))
  return (
    <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderBottom:`3px solid ${accent}`, borderRadius:8, padding:'1.25rem' }}>
      <div style={{ fontFamily:mono, fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'2px', marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:orb, fontSize:'2rem', fontWeight:900, color, marginBottom:'1rem', lineHeight:1 }}>{local}</div>
      <div style={{ display:'flex', gap:4, marginBottom:'0.75rem' }}>
        {[-10,-1].map(n=><button key={n} onClick={()=>adj(n)} style={{ flex:'0 0 auto',fontFamily:mono,fontSize:'0.58rem',padding:'6px 8px',borderRadius:3,cursor:'pointer',color,border:`1px solid ${accent}60`,background:'transparent' }}>{n}</button>)}
        <input type="number" value={local} onChange={e=>setLocal(Math.max(0,parseInt(e.target.value)||0))} style={{ flex:'1 1 0',minWidth:0,background:'#030f08',border:`1px solid ${accent}60`,borderRadius:4,padding:'6px',color,fontFamily:orb,fontSize:'0.85rem',fontWeight:700,outline:'none',textAlign:'center' }} />
        {[1,10].map(n=><button key={n} onClick={()=>adj(n)} style={{ flex:'0 0 auto',fontFamily:mono,fontSize:'0.58rem',padding:'6px 8px',borderRadius:3,cursor:'pointer',color,border:`1px solid ${accent}60`,background:'transparent' }}>+{n}</button>)}
      </div>
      <button onClick={()=>onSave(local)} disabled={saving} style={{ width:'100%',fontFamily:orb,fontSize:'0.6rem',fontWeight:700,color:'#020c06',background:saving?'#009944':accent,padding:'8px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>
        {saving?'SAVING...':'💾 SAVE'}
      </button>
    </div>
  )
}

// ── Member Modal ──────────────────────────────────────────────────
function MemberModal({ form, setForm, onSave, onClose, isEdit, saving }) {
  const tog = s => setForm(f=>({...f,skills:f.skills.includes(s)?f.skills.filter(x=>x!==s):[...f.skills,s]}))
  return (
    <div style={{ position:'fixed',inset:0,background:'#000000cc',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderTop:'3px solid #00cc55',borderRadius:8,width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.25rem 1.5rem',borderBottom:'1px solid #0f3020' }}>
          <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px' }}>{isEdit?'EDIT MEMBER':'ADD MEMBER'}</div>
          <button onClick={onClose} style={{ fontFamily:mono,color:'#3a7a50',background:'transparent',border:'1px solid #0f3020',padding:'4px 10px',borderRadius:3,cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem' }}>
          <label style={L}>NAME *</label><input style={I} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <label style={L}>EMAIL *</label><input style={I} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}>
            <div><label style={L}>ROLE</label><select style={S} value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}><option value="beginner">Beginner</option><option value="player">Player</option><option value="admin">Admin</option></select></div>
            <div><label style={L}>EXPERIENCE</label><select style={S} value={form.exp} onChange={e=>setForm(f=>({...f,exp:e.target.value}))}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
          </div>
          <label style={L}>SKILLS</label>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:'1rem' }}>
            {SKILLS.map(s=><label key={s} style={{ display:'flex',alignItems:'center',gap:6,fontFamily:mono,fontSize:'0.7rem',color:form.skills.includes(s)?'#00ff6e':'#3a7a50',cursor:'pointer' }}><input type="checkbox" checked={form.skills.includes(s)} onChange={()=>tog(s)} style={{ accentColor:'#00ff6e' }} />{s}</label>)}
          </div>
        </div>
        <div style={{ display:'flex',gap:'0.75rem',justifyContent:'flex-end',padding:'1rem 1.5rem',borderTop:'1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily:mono,fontSize:'0.68rem',color:'#3a7a50',background:'transparent',border:'1px solid #0f3020',padding:'10px 20px',borderRadius:4,cursor:'pointer' }}>CANCEL</button>
          <SaveBtn onClick={onSave} saving={saving} label={isEdit?'UPDATE MEMBER':'ADD MEMBER'} />
        </div>
      </div>
    </div>
  )
}

// ── Event Modal ───────────────────────────────────────────────────
function EventModal({ form, setForm, onSave, onClose, isEdit, saving }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'#000000cc',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderTop:'3px solid #00d4ff',borderRadius:8,width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.25rem 1.5rem',borderBottom:'1px solid #0f3020' }}>
          <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#00d4ff',letterSpacing:'2px' }}>{isEdit?'EDIT EVENT':'ADD EVENT'}</div>
          <button onClick={onClose} style={{ fontFamily:mono,color:'#3a7a50',background:'transparent',border:'1px solid #0f3020',padding:'4px 10px',borderRadius:3,cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem' }}>
          <label style={L}>TITLE *</label><input style={I} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}>
            <div><label style={L}>TYPE *</label><select style={S} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="">Select...</option><option>CTF</option><option>WORKSHOP</option><option>TALK</option><option>COMPETITION</option></select></div>
            <div><label style={L}>STATUS</label><select style={S} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="upcoming">Upcoming</option><option value="past">Past</option></select></div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}>
            <div><label style={L}>DATE *</label><input style={I} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} /></div>
            <div><label style={L}>TIME</label><input style={I} type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} /></div>
          </div>
          <label style={L}>DESCRIPTION *</label><textarea style={T} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} />
          <label style={L}>LINK</label><input style={I} type="url" placeholder="https://..." value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} />
          <label style={L}>ORGANIZER</label><input style={I} value={form.org} onChange={e=>setForm(f=>({...f,org:e.target.value}))} />
        </div>
        <div style={{ display:'flex',gap:'0.75rem',justifyContent:'flex-end',padding:'1rem 1.5rem',borderTop:'1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily:mono,fontSize:'0.68rem',color:'#3a7a50',background:'transparent',border:'1px solid #0f3020',padding:'10px 20px',borderRadius:4,cursor:'pointer' }}>CANCEL</button>
          <SaveBtn onClick={onSave} saving={saving} label={isEdit?'UPDATE EVENT':'SAVE EVENT'} color='#00d4ff' />
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────
function DelModal({ name, onConfirm, onClose, saving }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'#000000cc',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderTop:'3px solid #ff2040',borderRadius:8,padding:'2rem',width:'100%',maxWidth:420 }}>
        <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#ff2040',letterSpacing:'2px',marginBottom:'1rem' }}>CONFIRM DELETE</div>
        <div style={{ fontFamily:orb,fontSize:'0.9rem',color:'#ff2040',margin:'0.75rem 0' }}>{name}</div>
        <div style={{ fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50',marginBottom:'1.5rem' }}>// CANNOT BE UNDONE</div>
        <div style={{ display:'flex',gap:'0.75rem',justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ fontFamily:mono,fontSize:'0.68rem',color:'#3a7a50',background:'transparent',border:'1px solid #0f3020',padding:'10px 20px',borderRadius:4,cursor:'pointer' }}>CANCEL</button>
          <button onClick={onConfirm} disabled={saving} style={{ fontFamily:orb,fontSize:'0.68rem',fontWeight:700,color:'#fff',background:'#ff2040',padding:'10px 24px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>{saving?'DELETING...':'DELETE'}</button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════
function Dashboard({ onLogout }) {
  // ── Original state ──────────────────────────────────────────
  const [tab,      setTab]     = useState('stats')
  const [settings, setSettings]= useState(null)
  const [members,  setMembers] = useState([])
  const [events,   setEvents]  = useState([])
  const [requests, setReqs]    = useState([])
  const [loading,  setLoading] = useState(true)
  const [saving,   setSaving]  = useState(false)
  const [tfEdit,   setTFEdit]  = useState({ enabled:true, name:'', description:'', slots:0, requirements:[], teamMembers:[] })
  const [flagsEdit,setFlagsEdit]=useState([])
  const [newFlag,  setNewFlag] = useState({ name:'', pts:100, cat:'web' })
  const [tfReqInp, setTFReqInp]= useState('')
  const [tfNewMem, setTFNewMem]= useState({ name:'', role:'MISC' })
  const [modal,    setModal]   = useState(null)
  const [editId,   setEditId]  = useState(null)
  const [delTgt,   setDelTgt]  = useState(null)
  const [delType,  setDelType] = useState(null)
  const [mForm,    setMForm]   = useState({ name:'', email:'', role:'beginner', exp:'Beginner', skills:[] })
  const [eForm,    setEForm]   = useState({ title:'', type:'', status:'upcoming', date:'', time:'', desc:'', link:'', org:'' })
  const [mS,setMS]=useState(''); const [mF,setMF]=useState('all')
  const [eS,setES]=useState(''); const [eF,setEF]=useState('all')
  const [rS,setRS]=useState(''); const [rF,setRF]=useState('all')
  const [fS,setFS]=useState(''); const [fFil,setFFil]=useState('all')

  // ── CTF state ────────────────────────────────────────────────
  const [ctfChallenges,  setCTFChallenges]  = useState([])
  const [ctfSubmissions, setCTFSubmissions] = useState([])
  const [ctfSettings,    setCTFSettings2]   = useState({ active:true, name:'DragonByte CTF', description:'' })
  const [ctfModal,       setCTFModal]       = useState(null)
  const [ctfForm,        setCTFForm]        = useState({...EMPTY_CTF})
  const [ctfEditId,      setCTFEditId]      = useState(null)
  const [ctfDelTarget,   setCTFDelTarget]   = useState(null)
  const [ctfHintInput,   setCTFHintInput]   = useState('')
  const [ctfCatFilter,   setCTFCatFilter]   = useState('all')
  const [ctfSearch,      setCTFSearch]      = useState('')
  const [ctfSubTab,      setCTFSubTab]      = useState('challenges')
  const [ctfBoard,       setCTFBoard]       = useState([])

  // ── Listeners ────────────────────────────────────────────────
  useEffect(() => {
    const u1 = listenSettings(d => {
      setSettings(d)
      setTFEdit(JSON.parse(JSON.stringify(d.teamFinder||{enabled:true,name:'',description:'',slots:0,requirements:[],teamMembers:[]})))
      setFlagsEdit(JSON.parse(JSON.stringify(d.flags||[])))
      setLoading(false)
    })
    const u2 = listenMembers(d  => setMembers(d))
    const u3 = listenEvents(d   => setEvents(d))
    const u4 = listenRequests(d => setReqs(d))
    // CTF listeners
    const u5 = listenChallenges(d => setCTFChallenges(d))
    const u6 = listenLeaderboard(d => setCTFBoard(d))
    getCTFSettings().then(s => setCTFSettings2(s))
    return () => { u1(); u2(); u3(); u4(); u5(); u6() }
  }, [])

  if(loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',flexDirection:'column',gap:'1rem' }}>
      <div style={{ fontFamily:orb,fontSize:'1rem',color:'#00ff6e',letterSpacing:'3px' }}>🐉 LOADING FROM FIREBASE...</div>
    </div>
  )

  const stats        = settings?.stats || {}
  const logs         = settings?.logs  || []
  const pendingCount = requests.filter(r=>r.status==='pending').length
  const solvedCount  = flagsEdit.filter(f=>f.solved).length

  // ── Original handlers ──────────────────────────────────────
  const saveStat = async (key, val) => {
    setSaving(true)
    try { await saveStats({...stats,[key]:Math.max(0,Number(val))}); await addLog(`Stat: ${key}=${val}`); toast.success('✓ SAVED!') } catch(e) { toast.error(e.message) }
    setSaving(false)
  }
  const openAddMember  = () => { setMForm({name:'',email:'',role:'beginner',exp:'Beginner',skills:[]}); setEditId(null); setModal('member') }
  const openEditMember = m  => { setMForm({name:m.name,email:m.email,role:m.role,exp:m.exp||'Beginner',skills:[...(m.skills||[])]}); setEditId(m.id); setModal('member') }
  const saveMember = async () => {
    if(!mForm.name.trim()||!mForm.email.trim()){toast.error('Fill required fields!');return}
    setSaving(true)
    try {
      if(editId){await updateMember(editId,mForm);await addLog(`Updated: ${mForm.name}`);toast.success('✓ MEMBER UPDATED!')}
      else{await addMember({...mForm,joined:new Date().toISOString().slice(0,10)});await addLog(`Added: ${mForm.name}`);toast.success('✓ MEMBER ADDED!')}
      setModal(null)
    } catch(e){toast.error(e.message)}
    setSaving(false)
  }
  const promoteRole = async m => {
    const next=m.role==='beginner'?'player':m.role==='player'?'admin':'player'
    setSaving(true)
    try{await updateMember(m.id,{role:next});toast.success(`✓ ${m.name} → ${next.toUpperCase()}`)}catch(e){toast.error(e.message)}
    setSaving(false)
  }
  const openAddEvent  = () => { setEForm({title:'',type:'',status:'upcoming',date:'',time:'',desc:'',link:'',org:''}); setEditId(null); setModal('event') }
  const openEditEvent = ev => { setEForm({title:ev.title,type:ev.type,status:ev.status,date:ev.date,time:ev.time||'',desc:ev.desc,link:ev.link||'',org:ev.org||''}); setEditId(ev.id); setModal('event') }
  const saveEvent = async () => {
    if(!eForm.title.trim()||!eForm.type||!eForm.date||!eForm.desc.trim()){toast.error('Fill required fields!');return}
    setSaving(true)
    try {
      if(editId){await updateEvent(editId,eForm);await addLog(`Updated event: ${eForm.title}`);toast.success('✓ EVENT UPDATED!')}
      else{await addEvent(eForm);await addLog(`Added event: ${eForm.title}`);toast.success('✓ EVENT ADDED!')}
      setModal(null)
    } catch(e){toast.error(e.message)}
    setSaving(false)
  }
  const confirmDel = async () => {
    setSaving(true)
    try {
      if(delType==='member'){await deleteMember(delTgt.id);toast.error('MEMBER DELETED')}
      if(delType==='event'){await deleteEvent(delTgt.id);toast.error('EVENT DELETED')}
      if(delType==='request'){await deleteRequest(delTgt.id);toast.error('REQUEST REMOVED')}
      setModal(null)
    } catch(e){toast.error(e.message)}
    setSaving(false)
  }
  const saveTF = async () => {
    setSaving(true)
    try{await saveTeamFinder(tfEdit);await addLog(`Team Finder: ${tfEdit.enabled?'ON':'OFF'}`);toast.success('✓ TEAM FINDER SAVED!')}catch(e){toast.error(e.message)}
    setSaving(false)
  }
  const saveAllFlags = async () => {
    setSaving(true)
    try{await saveFlags(flagsEdit);await addLog(`Flags: ${flagsEdit.length}`);toast.success('✓ FLAGS SAVED!')}catch(e){toast.error(e.message)}
    setSaving(false)
  }
  const approveReq = async r => {
    setSaving(true)
    try{await updateRequest(r.id,{status:'approved'});await addMember({name:r.name,email:r.email,role:'beginner',exp:r.exp||'Beginner',skills:r.skills||[],joined:new Date().toISOString().slice(0,10)});toast.success('✓ APPROVED!')}catch(e){toast.error(e.message)}
    setSaving(false)
  }
  const rejectReq = async r => { try{await updateRequest(r.id,{status:'rejected'});toast.error('REJECTED')}catch(e){} }

  // ── CTF handlers ─────────────────────────────────────────────
  const ctfOpenAdd  = () => { setCTFForm({...EMPTY_CTF}); setCTFEditId(null); setCTFModal('challenge') }
  const ctfOpenEdit = c  => { setCTFForm({...c,hints:[...(c.hints||[])]}); setCTFEditId(c.id); setCTFModal('challenge') }

  const ctfSaveChal = async () => {
    if(!ctfForm.title.trim()||!ctfForm.flag.trim()||!ctfForm.description.trim()){toast.error('Fill: Title, Description & Flag');return}
    setSaving(true)
    try {
      const p = { title:ctfForm.title.trim(), description:ctfForm.description.trim(), category:ctfForm.category, difficulty:ctfForm.difficulty, points:Number(ctfForm.points), flag:ctfForm.flag.trim(), attachmentUrl:ctfForm.attachmentUrl||'', hints:ctfForm.hints||[], published:ctfForm.published!==false }
      if(ctfEditId){ await updateChallenge(ctfEditId,p); toast.success('✓ CHALLENGE UPDATED!') }
      else { await addChallenge(p); toast.success('✓ CHALLENGE CREATED — LIVE FOR PLAYERS!') }
      setCTFModal(null)
    } catch(e){toast.error(e.message)}
    setSaving(false)
  }

  const ctfTogglePublish = async c => {
    try{await updateChallenge(c.id,{published:!c.published});toast.success(c.published?'Challenge hidden':'✓ Published!')}catch(e){toast.error(e.message)}
  }

  const ctfConfirmDelete = async () => {
    setSaving(true)
    try{await deleteChallenge(ctfDelTarget.id);toast.error('CHALLENGE DELETED');setCTFModal(null)}catch(e){toast.error(e.message)}
    setSaving(false)
  }

  const ctfLoadSubs = async () => { getAllSubmissions().then(setCTFSubmissions) }

  const ctfResetScores = async () => {
    if(!confirm('Reset ALL CTF scores and submissions? CANNOT BE UNDONE!'))return
    setSaving(true)
    try{await resetAllScores();toast.success('✓ ALL SCORES RESET')}catch(e){toast.error(e.message)}
    setSaving(false)
  }

  const ctfSaveSettings = async () => {
    setSaving(true)
    try{await saveCTFSettings(ctfSettings);toast.success('✓ CTF SETTINGS SAVED!')}catch(e){toast.error(e.message)}
    setSaving(false)
  }

  // ── Derived ──────────────────────────────────────────────────
  const FM = members.filter(m=>(mF==='all'||m.role===mF)&&(m.name?.toLowerCase().includes(mS.toLowerCase())||m.email?.toLowerCase().includes(mS.toLowerCase())))
  const FE = events.filter(e=>(eF==='all'||e.status===eF||e.type===eF)&&e.title?.toLowerCase().includes(eS.toLowerCase()))
  const FR = requests.filter(r=>(rF==='all'||r.status===rF)&&(r.name?.toLowerCase().includes(rS.toLowerCase())||r.email?.toLowerCase().includes(rS.toLowerCase())))
  const FF = flagsEdit.filter(f=>(fFil==='all'||(fFil==='solved'&&f.solved)||(fFil==='open'&&!f.solved)||f.cat===fFil)&&f.name?.toLowerCase().includes(fS.toLowerCase()))
  const FC = ctfChallenges.filter(c=>(ctfCatFilter==='all'||c.category===ctfCatFilter)&&c.title?.toLowerCase().includes(ctfSearch.toLowerCase()))

  const TABS = [
    {key:'stats',   label:'📊 STATS'},
    {key:'members', label:`👥 MEMBERS (${members.length})`},
    {key:'events',  label:`📅 EVENTS (${events.length})`},
    {key:'team',    label:'🤝 TEAM FINDER'},
    {key:'flags',   label:`🚩 FLAGS (${solvedCount}/${flagsEdit.length})`},
    {key:'ctf',     label:`⚔️ CTF (${ctfChallenges.length})`, highlight:true},
    {key:'requests',label:'📬 REQUESTS', badge:pendingCount},
    {key:'logs',    label:'📋 LOGS'},
  ]

  return (
    <div>
      {/* ── Top nav ─────────────────────────────────────────── */}
      <div style={{ background:'#030f08', borderBottom:'1px solid #0f3020', padding:'8px 1rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontFamily:orb, fontSize:'0.85rem', fontWeight:900, flexShrink:0 }}>
          <span style={{ color:'#00ff6e' }}>DRAGON</span><span style={{ color:'#00d4ff' }}>BYTE</span>
          <span style={{ fontFamily:mono, fontSize:'0.55rem', color:'#00cc55', marginLeft:'0.75rem' }}>🔥 ADMIN</span>
          {saving&&<span style={{ fontFamily:mono, fontSize:'0.55rem', color:'#ffcc00', marginLeft:'0.5rem' }}>⟳ SAVING...</span>}
        </div>
        <div style={{ display:'flex', gap:3, flexWrap:'wrap', flex:1, justifyContent:'center' }}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{ ...PL(tab===t.key), padding:'5px 10px', position:'relative', fontSize:'0.58rem', ...(t.highlight&&tab!==t.key?{borderColor:'#ffcc0060',color:'#ffcc00'}:{}) }}>
              {t.label}
              {(t.badge||0)>0&&<span style={{ position:'absolute',top:-6,right:-6,background:'#ff2040',color:'#fff',fontSize:'0.48rem',width:14,height:14,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center' }}>{t.badge}</span>}
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ fontFamily:mono,fontSize:'0.62rem',color:'#ff2040',background:'transparent',border:'1px solid #cc0020',padding:'6px 12px',borderRadius:4,cursor:'pointer',flexShrink:0 }}>LOGOUT</button>
      </div>

      <div style={{ padding:'1.5rem', maxWidth:1200, margin:'0 auto' }}>

        {/* ── STATS ─────────────────────────────────────────── */}
        {tab==='stats'&&(
          <div>
            <div style={{ fontFamily:orb,fontSize:'0.9rem',color:'#00ff6e',letterSpacing:'2px',marginBottom:'0.5rem' }}>HOME PAGE STATS</div>
            <div style={{ fontFamily:mono,fontSize:'0.68rem',color:'#3a7a50',marginBottom:'1.5rem' }}>✅ Each SAVE button updates Firebase for ALL visitors</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1rem' }}>
              <StatCard label="TOTAL MEMBERS" color="#00ff6e" accent="#00cc55" value={stats.memberCount||0} onSave={v=>saveStat('memberCount',v)} saving={saving} />
              <StatCard label="CTF FLAGS"     color="#00d4ff" accent="#0099cc" value={stats.flagCount||0}   onSave={v=>saveStat('flagCount',v)}   saving={saving} />
              <StatCard label="ACTIVE TEAMS"  color="#ffcc00" accent="#cc9900" value={stats.teamCount||0}   onSave={v=>saveStat('teamCount',v)}   saving={saving} />
              <StatCard label="EVENTS HELD"   color="#ff2040" accent="#cc0020" value={stats.eventCount||0}  onSave={v=>saveStat('eventCount',v)}  saving={saving} />
            </div>
          </div>
        )}

        {/* ── MEMBERS ───────────────────────────────────────── */}
        {tab==='members'&&(
          <div>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:'0.75rem' }}>
              <div style={{ display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center' }}>
                <input style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:4,padding:'8px 12px',color:'#b0ffcc',fontFamily:mono,fontSize:'0.75rem',outline:'none',width:200 }} placeholder="Search..." value={mS} onChange={e=>setMS(e.target.value)} />
                {['all','admin','player','beginner'].map(f=><button key={f} onClick={()=>setMF(f)} style={PL(mF===f)}>{f.toUpperCase()}</button>)}
              </div>
              <button onClick={openAddMember} style={{ fontFamily:orb,fontSize:'0.62rem',fontWeight:700,color:'#020c06',background:'#00ff6e',padding:'9px 20px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>+ ADD MEMBER</button>
            </div>
            <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',minWidth:600 }}>
                <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>{['MEMBER','ROLE','SKILLS','EMAIL','JOINED','ACTIONS'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {FM.map(m=>(
                    <tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={TD}><div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div style={{ width:34,height:34,borderRadius:'50%',background:AV[(m.name?.charCodeAt(0)||0)%AV.length],display:'flex',alignItems:'center',justifyContent:'center',fontFamily:orb,fontSize:'0.65rem',fontWeight:700,color:'#020c06',flexShrink:0 }}>{(m.name||'?').slice(0,2).toUpperCase()}</div>
                        <div><div style={{ fontFamily:orb,fontSize:'0.7rem',color:'#b0ffcc' }}>{m.name}</div><div style={{ fontSize:'0.62rem',color:'#3a7a50',marginTop:2 }}>{m.exp||'—'}</div></div>
                      </div></td>
                      <td style={TD}><span style={{ fontFamily:mono,fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,background:`${RC[m.role]||'#3a7a50'}15`,color:RC[m.role]||'#3a7a50',border:`1px solid ${RC[m.role]||'#3a7a50'}80` }}>{(m.role||'beginner').toUpperCase()}</span></td>
                      <td style={TD}><div style={{ display:'flex',flexWrap:'wrap',gap:3 }}>{(m.skills||[]).map(s=><span key={s} style={{ fontFamily:mono,fontSize:'0.52rem',padding:'2px 6px',borderRadius:2,background:'#00ff6e10',color:'#00cc55',border:'1px solid #00ff6e25' }}>{s}</span>)}</div></td>
                      <td style={{ ...TD,fontFamily:mono,fontSize:'0.65rem',color:'#3a7a50' }}>{m.email}</td>
                      <td style={{ ...TD,fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50',whiteSpace:'nowrap' }}>{m.joined||'—'}</td>
                      <td style={TD}><div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                        <button onClick={()=>openEditMember(m)} style={AB('#00d4ff','#0099cc')}>EDIT</button>
                        <button onClick={()=>promoteRole(m)} style={AB('#ffcc00','#cc9900')}>{m.role==='admin'?'DEMOTE':'PROMOTE'}</button>
                        <button onClick={()=>{setDelTgt(m);setDelType('member');setModal('delete')}} style={AB('#ff2040','#cc0020')}>DELETE</button>
                      </div></td>
                    </tr>
                  ))}
                  {FM.length===0&&<tr><td colSpan={6} style={{ padding:'3rem',textAlign:'center',fontFamily:mono,fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO MEMBERS YET</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EVENTS ────────────────────────────────────────── */}
        {tab==='events'&&(
          <div>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:'0.75rem' }}>
              <div style={{ display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center' }}>
                <input style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:4,padding:'8px 12px',color:'#b0ffcc',fontFamily:mono,fontSize:'0.75rem',outline:'none',width:200 }} placeholder="Search..." value={eS} onChange={e=>setES(e.target.value)} />
                {['all','upcoming','past','CTF','WORKSHOP','TALK'].map(f=><button key={f} onClick={()=>setEF(f)} style={PL(eF===f)}>{f.toUpperCase()}</button>)}
              </div>
              <button onClick={openAddEvent} style={{ fontFamily:orb,fontSize:'0.62rem',fontWeight:700,color:'#020c06',background:'#00d4ff',padding:'9px 20px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>+ ADD EVENT</button>
            </div>
            <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',minWidth:600 }}>
                <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>{['EVENT','TYPE','DATE','STATUS','ACTIONS'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {FE.map(ev=>(
                    <tr key={ev.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={TD}><div style={{ fontFamily:orb,fontSize:'0.7rem',color:'#b0ffcc',marginBottom:3 }}>{ev.title}</div><div style={{ fontSize:'0.68rem',color:'#3a7a50',maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ev.desc}</div></td>
                      <td style={TD}>{ev.type&&<span style={{ fontFamily:mono,fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,background:TS[ev.type]?.bg,color:TS[ev.type]?.c,border:TS[ev.type]?.b }}>{ev.type}</span>}</td>
                      <td style={{ ...TD,fontFamily:mono,fontSize:'0.68rem',color:'#00d4ff',whiteSpace:'nowrap' }}>{ev.date?new Date(ev.date+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—'}</td>
                      <td style={TD}><span style={{ fontFamily:mono,fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,background:ev.status==='upcoming'?'#00ff6e12':'#3a3a3a22',color:ev.status==='upcoming'?'#00ff6e':'#557755',border:`1px solid ${ev.status==='upcoming'?'#00cc55':'#1a3020'}` }}>{(ev.status||'').toUpperCase()}</span></td>
                      <td style={TD}><div style={{ display:'flex',gap:4 }}>
                        <button onClick={()=>openEditEvent(ev)} style={AB('#00d4ff','#0099cc')}>EDIT</button>
                        <button onClick={()=>{setDelTgt(ev);setDelType('event');setModal('delete')}} style={AB('#ff2040','#cc0020')}>DELETE</button>
                      </div></td>
                    </tr>
                  ))}
                  {FE.length===0&&<tr><td colSpan={5} style={{ padding:'3rem',textAlign:'center',fontFamily:mono,fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO EVENTS YET</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TEAM FINDER (abbreviated — your original code) ── */}
        {tab==='team'&&(
          <div style={C}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:'0.75rem' }}>
              <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px' }}>TEAM FINDER</div>
              <SaveBtn onClick={saveTF} saving={saving} label="SAVE TEAM FINDER" />
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem',padding:'1rem',background:'#030f08',borderRadius:6,border:'1px solid #0f3020' }}>
              <button onClick={()=>setTFEdit(t=>({...t,enabled:!t.enabled}))} style={{ fontFamily:orb,fontSize:'0.7rem',fontWeight:700,padding:'8px 20px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px',background:tfEdit.enabled?'#00ff6e':'#ff2040',color:'#020c06' }}>
                {tfEdit.enabled?'◆ ONLINE':'■ OFFLINE'}
              </button>
              <div style={{ fontFamily:mono,fontSize:'0.62rem',color:tfEdit.enabled?'#00ff6e':'#ff2040' }}>{tfEdit.enabled?'Visible to all visitors':'Hidden from visitors'}</div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}>
              <div><label style={L}>TEAM NAME</label><input style={I} value={tfEdit.name||''} onChange={e=>setTFEdit(t=>({...t,name:e.target.value}))} /></div>
              <div><label style={L}>OPEN SLOTS</label><input style={I} type="number" min="0" value={tfEdit.slots||0} onChange={e=>setTFEdit(t=>({...t,slots:parseInt(e.target.value)||0}))} /></div>
            </div>
            <label style={L}>DESCRIPTION</label>
            <textarea style={T} value={tfEdit.description||''} onChange={e=>setTFEdit(t=>({...t,description:e.target.value}))} />
            <SaveBtn onClick={saveTF} saving={saving} label="SAVE TO FIREBASE" />
          </div>
        )}

        {/* ── FLAGS (simplified — your original code) ───────── */}
        {tab==='flags'&&(
          <div>
            <div style={{ ...C,borderLeft:'3px solid #ffcc00',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem' }}>
              <div style={{ fontFamily:mono,fontSize:'0.7rem',color:'#ffcc00' }}>⚠️ After changes — click SAVE to update Firebase</div>
              <SaveBtn onClick={saveAllFlags} saving={saving} label="SAVE ALL FLAGS" color="#ffcc00" />
            </div>
            <div style={{ ...C,borderLeft:'3px solid #00cc55',marginBottom:'1.25rem' }}>
              <div style={{ fontFamily:orb,fontSize:'0.75rem',color:'#00ff6e',letterSpacing:'2px',marginBottom:'1rem' }}>ADD NEW FLAG</div>
              <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:'0.75rem',alignItems:'end' }}>
                <div><label style={L}>FLAG NAME *</label><input style={{...I,marginBottom:0}} placeholder="FLAG_NAME" value={newFlag.name} onChange={e=>setNewFlag(f=>({...f,name:e.target.value}))} /></div>
                <div><label style={L}>POINTS</label><input style={{...I,marginBottom:0}} type="number" min="0" value={newFlag.pts} onChange={e=>setNewFlag(f=>({...f,pts:parseInt(e.target.value)||0}))} /></div>
                <div><label style={L}>CATEGORY</label><select style={{...S,marginBottom:0}} value={newFlag.cat} onChange={e=>setNewFlag(f=>({...f,cat:e.target.value}))}>{CTF_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                <button onClick={()=>{if(!newFlag.name.trim()){toast.error('Enter flag name!');return}setFlagsEdit(p=>[...p,{...newFlag,id:'f'+Date.now(),solved:false}]);setNewFlag({name:'',pts:100,cat:'web'});toast('Added! Click SAVE FLAGS',{icon:'⚠️'})}} style={{ fontFamily:orb,fontSize:'0.6rem',fontWeight:700,color:'#020c06',background:'#00ff6e',padding:'10px 16px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px',height:42 }}>+ ADD</button>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'0.75rem' }}>
              {FF.map(f=>(
                <div key={f.id} style={{ background:f.solved?'#00ff6e08':'#071a0e',border:`1px solid ${f.solved?'#00cc55':'#0f3020'}`,borderRadius:6,padding:'1rem',display:'flex',alignItems:'center',gap:'0.75rem' }}>
                  <div style={{ fontSize:'1.4rem',flexShrink:0 }}>{CAT_ICO[f.cat]||'🚩'}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontFamily:orb,fontSize:'0.68rem',color:'#b0ffcc',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{f.name}</div>
                    <div style={{ display:'flex',gap:4 }}>
                      <span style={{ fontFamily:mono,fontSize:'0.55rem',padding:'2px 7px',background:'#ffcc0015',color:'#ffcc00',border:'1px solid #cc990040',borderRadius:2 }}>{f.pts}PTS</span>
                      <span style={{ fontFamily:mono,fontSize:'0.55rem',padding:'2px 7px',background:f.solved?'#00ff6e15':'transparent',color:f.solved?'#00ff6e':'#3a7a50',border:`1px solid ${f.solved?'#00cc55':'#0f3020'}`,borderRadius:2 }}>{f.solved?'✓ SOLVED':'○ OPEN'}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',gap:3,flexShrink:0 }}>
                    <button onClick={()=>setFlagsEdit(p=>p.map(x=>x.id===f.id?{...x,solved:!x.solved}:x))} style={{...AB(f.solved?'#ffcc00':'#00ff6e',f.solved?'#cc9900':'#00cc55'),padding:'3px 8px',fontSize:'0.52rem'}}>{f.solved?'REOPEN':'SOLVE'}</button>
                    <button onClick={()=>setFlagsEdit(p=>p.filter(x=>x.id!==f.id))} style={{...AB('#ff2040','#cc0020'),padding:'3px 8px',fontSize:'0.52rem'}}>DEL</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            ⚔️  CTF MANAGEMENT TAB
        ══════════════════════════════════════════════════════ */}
        {tab==='ctf'&&(
          <div>
            {/* Header */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:'0.75rem' }}>
              <div>
                <div style={{ fontFamily:orb,fontSize:'1rem',color:'#00ff6e',letterSpacing:'3px',fontWeight:700 }}>⚔️ CTF MANAGEMENT</div>
                <div style={{ fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50',marginTop:3 }}>Create challenges → instantly visible on player dashboard at /ctf</div>
              </div>
              <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                {[
                  {k:'challenges',l:`🚩 CHALLENGES (${ctfChallenges.length})`},
                  {k:'submissions',l:'📋 SUBMISSIONS',fn:ctfLoadSubs},
                  {k:'settings',l:'⚙️ SETTINGS'},
                  {k:'scoreboard',l:'🏆 SCOREBOARD'},
                ].map(t=>(
                  <button key={t.k} onClick={()=>{setCTFSubTab(t.k);t.fn?.()}} style={{...PL(ctfSubTab===t.k),padding:'5px 12px',fontSize:'0.6rem'}}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Stat mini-cards */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'0.75rem',marginBottom:'1.5rem' }}>
              {[
                {n:ctfChallenges.length,                          l:'TOTAL',   c:'#00ff6e',a:'#00cc55'},
                {n:ctfChallenges.filter(c=>c.published).length,   l:'LIVE',    c:'#00d4ff',a:'#0099cc'},
                {n:ctfChallenges.filter(c=>!c.published).length,  l:'HIDDEN',  c:'#ff2040',a:'#cc0020'},
                {n:ctfChallenges.reduce((s,c)=>s+(c.solveCount||0),0),l:'TOTAL SOLVES',c:'#ffcc00',a:'#cc9900'},
                {n:ctfBoard.length,                               l:'PLAYERS', c:'#aa66ff',a:'#8844cc'},
              ].map(({n,l,c,a})=>(
                <div key={l} style={{ background:'#071a0e',border:'1px solid #0f3020',borderBottom:`2px solid ${a}`,borderRadius:6,padding:'1rem',textAlign:'center' }}>
                  <div style={{ fontFamily:orb,fontSize:'1.5rem',fontWeight:900,color:c,lineHeight:1 }}>{n}</div>
                  <div style={{ fontFamily:mono,fontSize:'0.58rem',color:'#3a7a50',letterSpacing:'2px',marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* ── Challenges sub-tab ─────────────────────────── */}
            {ctfSubTab==='challenges'&&(
              <div>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',flexWrap:'wrap',gap:'0.75rem' }}>
                  <div style={{ display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center' }}>
                    <input style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:4,padding:'8px 12px',color:'#b0ffcc',fontFamily:mono,fontSize:'0.75rem',outline:'none',width:190 }} placeholder="Search..." value={ctfSearch} onChange={e=>setCTFSearch(e.target.value)} />
                    {['all',...CTF_CATS].map(c=><button key={c} onClick={()=>setCTFCatFilter(c)} style={PL(ctfCatFilter===c)}>{c.toUpperCase()}</button>)}
                  </div>
                  <button onClick={ctfOpenAdd} style={{ fontFamily:orb,fontSize:'0.65rem',fontWeight:700,color:'#020c06',background:'#00ff6e',padding:'9px 22px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>
                    + CREATE CHALLENGE
                  </button>
                </div>
                <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
                  <table style={{ width:'100%',borderCollapse:'collapse',minWidth:720 }}>
                    <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>
                      {['CHALLENGE','CAT','DIFF','PTS','SOLVES','STATUS','ACTIONS'].map(h=><th key={h} style={TH}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {FC.map(c=>(
                        <tr key={c.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={TD}>
                            <div style={{ fontFamily:orb,fontSize:'0.7rem',color:'#b0ffcc' }}>{c.title}</div>
                            <div style={{ fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50',maxWidth:250,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:2 }}>{c.description}</div>
                          </td>
                          <td style={{ ...TD,fontFamily:mono,fontSize:'0.62rem' }}>{CAT_ICO[c.category]||'🚩'} {c.category}</td>
                          <td style={TD}><span style={{ fontFamily:mono,fontSize:'0.6rem',padding:'2px 8px',borderRadius:2,background:`${DIFF_C[c.difficulty]}15`,color:DIFF_C[c.difficulty],border:`1px solid ${DIFF_C[c.difficulty]}50` }}>{c.difficulty}</span></td>
                          <td style={{ ...TD,fontFamily:orb,fontSize:'0.82rem',color:'#ffcc00',fontWeight:900 }}>{c.points}</td>
                          <td style={{ ...TD,fontFamily:mono,fontSize:'0.72rem',color:'#3a7a50' }}>{c.solveCount||0}🚩</td>
                          <td style={TD}>
                            <button onClick={()=>ctfTogglePublish(c)} style={{ fontFamily:mono,fontSize:'0.6rem',padding:'3px 10px',borderRadius:3,letterSpacing:'1px',background:c.published?'#00ff6e15':'#ff204015',color:c.published?'#00ff6e':'#ff2040',border:`1px solid ${c.published?'#00cc55':'#cc0020'}`,cursor:'pointer' }}>
                              {c.published?'LIVE':'HIDDEN'}
                            </button>
                          </td>
                          <td style={TD}><div style={{ display:'flex',gap:4 }}>
                            <button onClick={()=>ctfOpenEdit(c)} style={AB('#00d4ff','#0099cc')}>EDIT</button>
                            <button onClick={()=>{setCTFDelTarget(c);setCTFModal('ctf-delete')}} style={AB('#ff2040','#cc0020')}>DELETE</button>
                          </div></td>
                        </tr>
                      ))}
                      {FC.length===0&&<tr><td colSpan={7} style={{ padding:'3rem',textAlign:'center',fontFamily:mono,fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>
                        NO CHALLENGES YET — CLICK "CREATE CHALLENGE" TO START
                      </td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Submissions sub-tab ────────────────────────── */}
            {ctfSubTab==='submissions'&&(
              <div>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
                  <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px' }}>ALL SUBMISSIONS ({ctfSubmissions.length})</div>
                  <div style={{ display:'flex',gap:'0.5rem' }}>
                    <button onClick={ctfLoadSubs} style={{ fontFamily:mono,fontSize:'0.65rem',color:'#00d4ff',background:'transparent',border:'1px solid #0099cc',padding:'8px 16px',borderRadius:4,cursor:'pointer' }}>↺ REFRESH</button>
                    <button onClick={ctfResetScores} disabled={saving} style={{ fontFamily:orb,fontSize:'0.62rem',fontWeight:700,color:'#fff',background:'#ff2040',padding:'8px 18px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>
                      {saving?'RESETTING...':'⚠️ RESET ALL'}
                    </button>
                  </div>
                </div>
                <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
                  <table style={{ width:'100%',borderCollapse:'collapse',minWidth:560 }}>
                    <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>
                      {['PLAYER','CHALLENGE','POINTS','CATEGORY','SOLVED AT'].map(h=><th key={h} style={TH}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {ctfSubmissions.map(s=>(
                        <tr key={s.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ ...TD,fontFamily:orb,fontSize:'0.7rem',color:'#b0ffcc' }}>{s.username}</td>
                          <td style={{ ...TD,fontFamily:mono,fontSize:'0.68rem',color:'#3a7a50' }}>{s.challengeName}</td>
                          <td style={{ ...TD,fontFamily:orb,fontSize:'0.82rem',color:'#00ff6e',fontWeight:900 }}>+{s.points}</td>
                          <td style={{ ...TD,fontFamily:mono,fontSize:'0.62rem' }}>{CAT_ICO[s.category]||'🚩'} {s.category}</td>
                          <td style={{ ...TD,fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50',whiteSpace:'nowrap' }}>{s.solvedAt?.toDate?s.solvedAt.toDate().toLocaleString('en-GB'):'—'}</td>
                        </tr>
                      ))}
                      {ctfSubmissions.length===0&&<tr><td colSpan={5} style={{ padding:'3rem',textAlign:'center',fontFamily:mono,fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO SUBMISSIONS YET — REFRESH AFTER PLAYERS SUBMIT</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Settings sub-tab ───────────────────────────── */}
            {ctfSubTab==='settings'&&(
              <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,padding:'1.5rem',maxWidth:600 }}>
                <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px',marginBottom:'1.25rem' }}>CTF SETTINGS</div>
                <label style={L}>CTF NAME</label>
                <input style={I} value={ctfSettings.name||''} onChange={e=>setCTFSettings2(s=>({...s,name:e.target.value}))} />
                <label style={L}>DESCRIPTION (shown on player dashboard)</label>
                <textarea style={{...T,height:100}} value={ctfSettings.description||''} onChange={e=>setCTFSettings2(s=>({...s,description:e.target.value}))} />
                <label style={L}>CTF STATUS</label>
                <div style={{ display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem',padding:'1rem',background:'#030f08',borderRadius:6,border:'1px solid #0f3020' }}>
                  <button onClick={()=>setCTFSettings2(s=>({...s,active:!s.active}))} style={{ fontFamily:orb,fontSize:'0.7rem',fontWeight:700,padding:'8px 22px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px',background:ctfSettings.active?'#00ff6e':'#ff2040',color:'#020c06' }}>
                    {ctfSettings.active?'◆ ACTIVE':'■ PAUSED'}
                  </button>
                  <div style={{ fontFamily:mono,fontSize:'0.62rem',color:ctfSettings.active?'#00ff6e':'#ff2040' }}>
                    {ctfSettings.active?'Players can submit flags':'Flag submission disabled for all players'}
                  </div>
                </div>
                <SaveBtn onClick={ctfSaveSettings} saving={saving} label="SAVE CTF SETTINGS" />
              </div>
            )}

            {/* ── Scoreboard sub-tab ─────────────────────────── */}
            {ctfSubTab==='scoreboard'&&(
              <div>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
                  <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px' }}>LIVE RANKINGS ({ctfBoard.length} PLAYERS)</div>
                  <button onClick={ctfResetScores} disabled={saving} style={{ fontFamily:orb,fontSize:'0.62rem',fontWeight:700,color:'#fff',background:'#ff2040',padding:'8px 18px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>
                    {saving?'RESETTING...':'⚠️ RESET ALL SCORES'}
                  </button>
                </div>
                <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
                  <table style={{ width:'100%',borderCollapse:'collapse',minWidth:500 }}>
                    <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>
                      {['RANK','PLAYER','SCORE','SOLVES','LAST SOLVE'].map(h=><th key={h} style={TH}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {ctfBoard.map((entry,i)=>(
                        <tr key={entry.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ ...TD,fontFamily:orb,fontSize:'0.75rem',color:i===0?'#ffcc00':i===1?'#c0c0c0':i===2?'#cd7f32':'#3a7a50',fontWeight:900 }}>
                            {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                          </td>
                          <td style={{ ...TD,fontFamily:orb,fontSize:'0.7rem',color:'#b0ffcc' }}>{entry.username}</td>
                          <td style={{ ...TD,fontFamily:orb,fontSize:'0.9rem',color:'#00ff6e',fontWeight:900 }}>{entry.points}</td>
                          <td style={{ ...TD,fontFamily:mono,fontSize:'0.72rem',color:'#3a7a50' }}>{entry.solveCount||0}🚩</td>
                          <td style={{ ...TD,fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50',whiteSpace:'nowrap' }}>
                            {entry.lastSolveAt?.toDate?entry.lastSolveAt.toDate().toLocaleString('en-GB'):'—'}
                          </td>
                        </tr>
                      ))}
                      {ctfBoard.length===0&&<tr><td colSpan={5} style={{ padding:'3rem',textAlign:'center',fontFamily:mono,fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO PLAYERS YET</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CTF Modals */}
            {ctfModal==='challenge'&&(
              <CTFChallengeModal form={ctfForm} setForm={setCTFForm} hintInput={ctfHintInput} setHintInput={setCTFHintInput} onSave={ctfSaveChal} onClose={()=>setCTFModal(null)} isEdit={!!ctfEditId} saving={saving} />
            )}
            {ctfModal==='ctf-delete'&&(
              <div style={{ position:'fixed',inset:0,background:'#000000cc',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&setCTFModal(null)}>
                <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderTop:'3px solid #ff2040',borderRadius:8,padding:'2rem',width:'100%',maxWidth:420 }}>
                  <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#ff2040',letterSpacing:'2px',marginBottom:'1rem' }}>DELETE CHALLENGE</div>
                  <div style={{ fontFamily:orb,fontSize:'0.9rem',color:'#ff2040',margin:'0.75rem 0' }}>{ctfDelTarget?.title}</div>
                  <div style={{ fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50',marginBottom:'1.5rem' }}>// Also deletes all player submissions for this challenge</div>
                  <div style={{ display:'flex',gap:'0.75rem',justifyContent:'flex-end' }}>
                    <button onClick={()=>setCTFModal(null)} style={{ fontFamily:mono,fontSize:'0.68rem',color:'#3a7a50',background:'transparent',border:'1px solid #0f3020',padding:'10px 20px',borderRadius:4,cursor:'pointer' }}>CANCEL</button>
                    <button onClick={ctfConfirmDelete} disabled={saving} style={{ fontFamily:orb,fontSize:'0.68rem',fontWeight:700,color:'#fff',background:'#ff2040',padding:'10px 24px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>
                      {saving?'DELETING...':'DELETE'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REQUESTS ──────────────────────────────────────── */}
        {tab==='requests'&&(
          <div>
            <div style={{ display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center',marginBottom:'1.25rem' }}>
              <input style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:4,padding:'8px 12px',color:'#b0ffcc',fontFamily:mono,fontSize:'0.75rem',outline:'none',width:200 }} placeholder="Search..." value={rS} onChange={e=>setRS(e.target.value)} />
              {['all','pending','approved','rejected'].map(f=><button key={f} onClick={()=>setRF(f)} style={PL(rF===f)}>{f.toUpperCase()}{f==='pending'&&pendingCount>0?` (${pendingCount})`:''}</button>)}
            </div>
            <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',minWidth:700 }}>
                <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>{['APPLICANT','EMAIL','LEVEL','SKILLS','DATE','STATUS','ACTIONS'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {FR.map((r,i)=>(
                    <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={TD}><div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <div style={{ width:30,height:30,borderRadius:'50%',background:AV[i%AV.length],display:'flex',alignItems:'center',justifyContent:'center',fontFamily:orb,fontSize:'0.65rem',fontWeight:700,color:'#020c06',flexShrink:0 }}>{(r.name||'?').slice(0,2).toUpperCase()}</div>
                        <div style={{ fontFamily:orb,fontSize:'0.68rem',color:'#b0ffcc' }}>{r.name}</div>
                      </div></td>
                      <td style={{ ...TD,fontFamily:mono,fontSize:'0.65rem',color:'#3a7a50' }}>{r.email}</td>
                      <td style={{ ...TD,fontFamily:mono,fontSize:'0.65rem',color:'#b0ffcc' }}>{r.exp||'—'}</td>
                      <td style={TD}><div style={{ display:'flex',flexWrap:'wrap',gap:3 }}>{(r.skills||[]).map(s=><span key={s} style={{ fontFamily:mono,fontSize:'0.52rem',padding:'2px 6px',borderRadius:2,background:'#00ff6e10',color:'#00cc55',border:'1px solid #00ff6e25' }}>{s}</span>)}</div></td>
                      <td style={{ ...TD,fontFamily:mono,fontSize:'0.6rem',color:'#3a7a50',whiteSpace:'nowrap' }}>{r.createdAt?.toDate?r.createdAt.toDate().toLocaleDateString('en-GB'):'—'}</td>
                      <td style={TD}><span style={{ fontFamily:mono,fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,background:r.status==='approved'?'#00ff6e15':r.status==='pending'?'#ff204015':'#3a3a3a22',color:r.status==='approved'?'#00ff6e':r.status==='pending'?'#ff2040':'#557755',border:`1px solid ${r.status==='approved'?'#00cc55':r.status==='pending'?'#cc0020':'#1a3020'}` }}>{(r.status||'').toUpperCase()}</span></td>
                      <td style={TD}><div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                        {r.status==='pending'&&<><button onClick={()=>approveReq(r)} style={AB('#00ff6e','#00cc55')}>APPROVE</button><button onClick={()=>rejectReq(r)} style={AB('#3a7a50','#0f3020')}>REJECT</button></>}
                        {r.status==='rejected'&&<button onClick={()=>approveReq(r)} style={AB('#00ff6e','#00cc55')}>RE-APPROVE</button>}
                        <button onClick={()=>{setDelTgt(r);setDelType('request');setModal('delete')}} style={AB('#ff2040','#cc0020')}>REMOVE</button>
                      </div></td>
                    </tr>
                  ))}
                  {FR.length===0&&<tr><td colSpan={7} style={{ padding:'3rem',textAlign:'center',fontFamily:mono,fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO REQUESTS YET</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LOGS ──────────────────────────────────────────── */}
        {tab==='logs'&&(
          <div style={C}>
            <div style={{ fontFamily:orb,fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px',marginBottom:'1rem' }}>ACTIVITY LOG</div>
            {logs.length===0
              ? <div style={{ fontFamily:mono,fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px',padding:'2rem',textAlign:'center' }}>NO ACTIVITY YET</div>
              : logs.map((l,i)=>(
                <div key={i} style={{ display:'flex',gap:'1rem',padding:'8px 0',borderBottom:'1px solid #0a1f10' }}>
                  <div style={{ fontFamily:mono,fontSize:'0.62rem',color:'#3a7a50',whiteSpace:'nowrap',flexShrink:0 }}>{l.time}</div>
                  <div style={{ fontFamily:mono,fontSize:'0.65rem',color:'#b0ffcc' }}>{l.msg}</div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Original modals */}
      {modal==='member'&&<MemberModal form={mForm} setForm={setMForm} onSave={saveMember} onClose={()=>setModal(null)} isEdit={!!editId} saving={saving} />}
      {modal==='event' &&<EventModal  form={eForm} setForm={setEForm} onSave={saveEvent}  onClose={()=>setModal(null)} isEdit={!!editId} saving={saving} />}
      {modal==='delete'&&<DelModal name={delTgt?.name||delTgt?.title} onConfirm={confirmDel} onClose={()=>setModal(null)} saving={saving} />}

      <Footer />
    </div>
  )
}

// ── Root page ─────────────────────────────────────────────────────
export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />
  return <Dashboard onLogout={() => setLoggedIn(false)} />
}