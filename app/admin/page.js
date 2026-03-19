// app/admin/page.js — FIXED (hooks error resolved)
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
import Footer from '../../components/Footer'

const ADMIN_EMAIL    = 'cybermonk'
const ADMIN_PASSWORD = 'mrx'

const SKILLS   = ['WEB','CRYPTO','FORENSICS','REV','PWN','OSINT']
const CTF_CATS = ['web','crypto','forensics','pwn','rev','misc']
const CAT_ICONS= { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', misc:'🚩' }
const ROLES    = ['CAPTAIN','WEB','PWN','REV','CRYPTO','FORENSICS','OSINT','MISC']
const AV       = ['linear-gradient(135deg,#00cc55,#006622)','linear-gradient(135deg,#0066aa,#003366)','linear-gradient(135deg,#aa0020,#660010)','linear-gradient(135deg,#aa6600,#664400)','linear-gradient(135deg,#6600aa,#330066)','linear-gradient(135deg,#005566,#002233)']
const RC       = { admin:'#ff2040', player:'#00ff6e', beginner:'#00d4ff' }
const TS       = { CTF:{bg:'#00ff6e15',c:'#00ff6e',b:'1px solid #00cc55'}, WORKSHOP:{bg:'#00d4ff15',c:'#00d4ff',b:'1px solid #00d4ff'}, TALK:{bg:'#ff204015',c:'#ff2040',b:'1px solid #ff2040'}, COMPETITION:{bg:'#ffcc0015',c:'#ffcc00',b:'1px solid #cc9900'} }

const I  = { width:'100%', background:'#030f08', border:'1px solid #0f3020', borderRadius:4, padding:'10px 14px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.82rem', outline:'none', marginBottom:'1rem' }
const S  = { ...I, cursor:'pointer' }
const T  = { ...I, fontFamily:'Rajdhani,sans-serif', fontSize:'0.88rem', resize:'vertical', height:80 }
const L  = { fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:5 }
const AB = (c,b) => ({ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'4px 10px', borderRadius:3, cursor:'pointer', color:c, border:`1px solid ${b}`, background:'transparent' })
const PL = (a) => ({ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', padding:'5px 10px', borderRadius:2, cursor:'pointer', letterSpacing:'1px', border:a?'1px solid #00cc55':'1px solid #0f3020', background:a?'#00ff6e10':'transparent', color:a?'#00ff6e':'#3a7a50' })
const TH = { fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'2px', padding:'10px 12px', textAlign:'left', whiteSpace:'nowrap' }
const TD = { padding:'11px 12px', borderBottom:'1px solid #0a1f10', verticalAlign:'middle' }
const C  = { background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, padding:'1.5rem', marginBottom:'1.5rem' }

function SaveBtn({ onClick, saving, label='SAVE TO FIREBASE', color='#00ff6e' }) {
  return (
    <button onClick={onClick} disabled={saving} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', fontWeight:700, color:'#020c06', background:saving?'#009944':color, padding:'11px 28px', border:'none', borderRadius:4, cursor:saving?'not-allowed':'pointer', letterSpacing:'2px' }}>
      {saving ? '⟳ SAVING...' : `💾 ${label}`}
    </button>
  )
}

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
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.1rem', color:'#00ff6e', letterSpacing:'3px' }}>DRAGONBYTE</div>
          <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#ff2040', letterSpacing:'2px', marginTop:4 }}>// ADMIN — FIREBASE LIVE</div>
        </div>
        <label style={L}>EMAIL</label>
        <input style={I} type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        <label style={L}>PASSWORD</label>
        <input style={I} type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        {err&&<div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#ff2040', textAlign:'center', marginBottom:'0.75rem' }}>✖ INVALID CREDENTIALS</div>}
        <button onClick={handle} style={{ width:'100%', fontFamily:'Orbitron,monospace', fontSize:'0.75rem', fontWeight:700, color:'#fff', background:'#ff2040', padding:12, border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'3px' }}>AUTHENTICATE →</button>
      </div>
    </div>
  )
}

function MemberModal({ form, setForm, onSave, onClose, isEdit, saving }) {
  const tog = s => setForm(f=>({...f,skills:f.skills.includes(s)?f.skills.filter(x=>x!==s):[...f.skills,s]}))
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00cc55', borderRadius:8, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.5rem', borderBottom:'1px solid #0f3020' }}>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00ff6e', letterSpacing:'2px' }}>{isEdit?'EDIT MEMBER':'ADD MEMBER'}</div>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'4px 10px', borderRadius:3, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem' }}>
          <label style={L}>NAME *</label><input style={I} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <label style={L}>EMAIL *</label><input style={I} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label style={L}>ROLE</label><select style={S} value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}><option value="beginner">Beginner</option><option value="player">Player</option><option value="admin">Admin</option></select></div>
            <div><label style={L}>EXPERIENCE</label><select style={S} value={form.exp} onChange={e=>setForm(f=>({...f,exp:e.target.value}))}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
          </div>
          <label style={L}>SKILLS</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:'1rem' }}>
            {SKILLS.map(s=><label key={s} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:form.skills.includes(s)?'#00ff6e':'#3a7a50', cursor:'pointer' }}><input type="checkbox" checked={form.skills.includes(s)} onChange={()=>tog(s)} style={{ accentColor:'#00ff6e' }} />{s}</label>)}
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', padding:'1rem 1.5rem', borderTop:'1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>CANCEL</button>
          <SaveBtn onClick={onSave} saving={saving} label={isEdit?'UPDATE MEMBER':'ADD MEMBER'} />
        </div>
      </div>
    </div>
  )
}

function EventModal({ form, setForm, onSave, onClose, isEdit, saving }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00d4ff', borderRadius:8, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.5rem', borderBottom:'1px solid #0f3020' }}>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00d4ff', letterSpacing:'2px' }}>{isEdit?'EDIT EVENT':'ADD EVENT'}</div>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'4px 10px', borderRadius:3, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem' }}>
          <label style={L}>TITLE *</label><input style={I} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label style={L}>TYPE *</label><select style={S} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="">Select...</option><option>CTF</option><option>WORKSHOP</option><option>TALK</option><option>COMPETITION</option></select></div>
            <div><label style={L}>STATUS</label><select style={S} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="upcoming">Upcoming</option><option value="past">Past</option></select></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label style={L}>DATE *</label><input style={I} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} /></div>
            <div><label style={L}>TIME</label><input style={I} type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} /></div>
          </div>
          <label style={L}>DESCRIPTION *</label><textarea style={T} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} />
          <label style={L}>LINK</label><input style={I} type="url" placeholder="https://..." value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} />
          <label style={L}>ORGANIZER</label><input style={I} value={form.org} onChange={e=>setForm(f=>({...f,org:e.target.value}))} />
        </div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', padding:'1rem 1.5rem', borderTop:'1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>CANCEL</button>
          <SaveBtn onClick={onSave} saving={saving} label={isEdit?'UPDATE EVENT':'SAVE EVENT'} color='#00d4ff' />
        </div>
      </div>
    </div>
  )
}

function DelModal({ name, onConfirm, onClose, saving }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #ff2040', borderRadius:8, padding:'2rem', width:'100%', maxWidth:420 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#ff2040', letterSpacing:'2px', marginBottom:'1rem' }}>CONFIRM DELETE</div>
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#b0ffcc' }}>Delete from Firebase:</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.9rem', color:'#ff2040', margin:'0.75rem 0' }}>{name}</div>
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#3a7a50', marginBottom:'1.5rem' }}>// CANNOT BE UNDONE</div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>CANCEL</button>
          <button onClick={onConfirm} disabled={saving} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#fff', background:'#ff2040', padding:'10px 24px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>{saving?'DELETING...':'DELETE'}</button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, color, accent, value, onSave, saving }) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])
  const adj = d => setLocal(v => Math.max(0, Number(v) + d))
  return (
    <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderBottom:`3px solid ${accent}`, borderRadius:8, padding:'1.25rem' }}>
      <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'2px', marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'Orbitron,monospace', fontSize:'2rem', fontWeight:900, color, marginBottom:'1rem', lineHeight:1 }}>{local}</div>
      <div style={{ display:'flex', gap:4, marginBottom:'0.75rem' }}>
        <button onClick={()=>adj(-10)} style={{ flex:'0 0 auto', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'6px 8px', borderRadius:3, cursor:'pointer', color, border:`1px solid ${accent}60`, background:'transparent' }}>-10</button>
        <button onClick={()=>adj(-1)}  style={{ flex:'0 0 auto', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'6px 8px', borderRadius:3, cursor:'pointer', color, border:`1px solid ${accent}60`, background:'transparent' }}>-1</button>
        <input type="number" value={local} onChange={e=>setLocal(Math.max(0,parseInt(e.target.value)||0))} style={{ flex:'1 1 0', minWidth:0, background:'#030f08', border:`1px solid ${accent}60`, borderRadius:4, padding:'6px', color, fontFamily:'Orbitron,monospace', fontSize:'0.85rem', fontWeight:700, outline:'none', textAlign:'center' }} />
        <button onClick={()=>adj(1)}   style={{ flex:'0 0 auto', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'6px 8px', borderRadius:3, cursor:'pointer', color, border:`1px solid ${accent}60`, background:'transparent' }}>+1</button>
        <button onClick={()=>adj(10)}  style={{ flex:'0 0 auto', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'6px 8px', borderRadius:3, cursor:'pointer', color, border:`1px solid ${accent}60`, background:'transparent' }}>+10</button>
      </div>
      <button onClick={()=>onSave(local)} disabled={saving} style={{ width:'100%', fontFamily:'Orbitron,monospace', fontSize:'0.6rem', fontWeight:700, color:'#020c06', background:saving?'#009944':accent, padding:'8px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>
        {saving?'SAVING...':'💾 SAVE'}
      </button>
    </div>
  )
}

// ════════════════════════════════════
// DASHBOARD — ALL HOOKS AT TOP LEVEL
// ════════════════════════════════════
function Dashboard({ onLogout }) {
  // ALL useState at top — never inside conditions
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

  useEffect(() => {
    const u1 = listenSettings(d => {
      setSettings(d)
      setTFEdit(JSON.parse(JSON.stringify(d.teamFinder || { enabled:true, name:'', description:'', slots:0, requirements:[], teamMembers:[] })))
      setFlagsEdit(JSON.parse(JSON.stringify(d.flags || [])))
      setLoading(false)
    })
    const u2 = listenMembers(d  => setMembers(d))
    const u3 = listenEvents(d   => setEvents(d))
    const u4 = listenRequests(d => setReqs(d))
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  if(loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1rem', color:'#00ff6e', letterSpacing:'3px' }}>🐉 LOADING FROM FIREBASE...</div>
    </div>
  )

  const stats = settings?.stats || {}
  const logs  = settings?.logs  || []
  const pendingCount = requests.filter(r=>r.status==='pending').length
  const solvedCount  = flagsEdit.filter(f=>f.solved).length

  const saveStat = async (key, val) => {
    setSaving(true)
    try { await saveStats({ ...stats, [key]: Math.max(0, Number(val)) }); await addLog(`Stat: ${key}=${val}`); toast.success('✓ SAVED! Home page updated for everyone!') } catch(e) { toast.error(e.message) }
    setSaving(false)
  }

  const openAddMember  = () => { setMForm({name:'',email:'',role:'beginner',exp:'Beginner',skills:[]}); setEditId(null); setModal('member') }
  const openEditMember = m  => { setMForm({name:m.name,email:m.email,role:m.role,exp:m.exp||'Beginner',skills:[...(m.skills||[])]}); setEditId(m.id); setModal('member') }
  const saveMember = async () => {
    if(!mForm.name.trim()||!mForm.email.trim()) { toast.error('Fill required fields!'); return }
    setSaving(true)
    try {
      if(editId) { await updateMember(editId,mForm); await addLog(`Updated: ${mForm.name}`); toast.success('✓ MEMBER UPDATED IN FIREBASE!') }
      else { await addMember({...mForm,joined:new Date().toISOString().slice(0,10)}); await addLog(`Added: ${mForm.name}`); toast.success('✓ MEMBER ADDED TO FIREBASE!') }
      setModal(null)
    } catch(e) { toast.error(e.message) }
    setSaving(false)
  }
  const promoteRole = async m => {
    const next = m.role==='beginner'?'player':m.role==='player'?'admin':'player'
    setSaving(true)
    try { await updateMember(m.id,{role:next}); toast.success(`✓ ${m.name} → ${next.toUpperCase()}`) } catch(e) { toast.error(e.message) }
    setSaving(false)
  }
  const openDelMember = m => { setDelTgt(m); setDelType('member'); setModal('delete') }

  const openAddEvent  = () => { setEForm({title:'',type:'',status:'upcoming',date:'',time:'',desc:'',link:'',org:''}); setEditId(null); setModal('event') }
  const openEditEvent = ev => { setEForm({title:ev.title,type:ev.type,status:ev.status,date:ev.date,time:ev.time||'',desc:ev.desc,link:ev.link||'',org:ev.org||''}); setEditId(ev.id); setModal('event') }
  const saveEvent = async () => {
    if(!eForm.title.trim()||!eForm.type||!eForm.date||!eForm.desc.trim()) { toast.error('Fill required fields!'); return }
    setSaving(true)
    try {
      if(editId) { await updateEvent(editId,eForm); await addLog(`Updated event: ${eForm.title}`); toast.success('✓ EVENT UPDATED! Visible everywhere!') }
      else { await addEvent(eForm); await addLog(`Added event: ${eForm.title}`); toast.success('✓ EVENT ADDED! Visible everywhere!') }
      setModal(null)
    } catch(e) { toast.error(e.message) }
    setSaving(false)
  }
  const openDelEvent = ev => { setDelTgt(ev); setDelType('event'); setModal('delete') }

  const confirmDel = async () => {
    setSaving(true)
    try {
      if(delType==='member')  { await deleteMember(delTgt.id);  toast.error('MEMBER DELETED') }
      if(delType==='event')   { await deleteEvent(delTgt.id);   toast.error('EVENT DELETED') }
      if(delType==='request') { await deleteRequest(delTgt.id); toast.error('REQUEST REMOVED') }
      setModal(null)
    } catch(e) { toast.error(e.message) }
    setSaving(false)
  }

  const saveTF = async () => {
    setSaving(true)
    try { await saveTeamFinder(tfEdit); await addLog(`Team Finder: ${tfEdit.enabled?'ON':'OFF'}`); toast.success('✓ TEAM FINDER SAVED!') } catch(e) { toast.error(e.message) }
    setSaving(false)
  }

  const saveAllFlags = async () => {
    setSaving(true)
    try { await saveFlags(flagsEdit); await addLog(`Flags saved: ${flagsEdit.length}`); toast.success('✓ FLAGS SAVED TO FIREBASE!') } catch(e) { toast.error(e.message) }
    setSaving(false)
  }

  const approveReq = async r => {
    setSaving(true)
    try {
      await updateRequest(r.id,{status:'approved'})
      await addMember({name:r.name,email:r.email,role:'beginner',exp:r.exp||'Beginner',skills:r.skills||[],joined:new Date().toISOString().slice(0,10)})
      toast.success('✓ APPROVED & ADDED TO MEMBERS!')
    } catch(e) { toast.error(e.message) }
    setSaving(false)
  }
  const rejectReq  = async r => { try { await updateRequest(r.id,{status:'rejected'}); toast.error('REJECTED') } catch(e) {} }
  const openDelReq = r => { setDelTgt(r); setDelType('request'); setModal('delete') }

  const FM = members.filter(m=>(mF==='all'||m.role===mF)&&(m.name?.toLowerCase().includes(mS.toLowerCase())||m.email?.toLowerCase().includes(mS.toLowerCase())))
  const FE = events.filter(e=>(eF==='all'||e.status===eF||e.type===eF)&&e.title?.toLowerCase().includes(eS.toLowerCase()))
  const FR = requests.filter(r=>(rF==='all'||r.status===rF)&&(r.name?.toLowerCase().includes(rS.toLowerCase())||r.email?.toLowerCase().includes(rS.toLowerCase())))
  const FF = flagsEdit.filter(f=>(fFil==='all'||(fFil==='solved'&&f.solved)||(fFil==='open'&&!f.solved)||f.cat===fFil)&&f.name?.toLowerCase().includes(fS.toLowerCase()))

  const TABS = [
    {key:'stats',label:'📊 STATS'},
    {key:'members',label:`👥 MEMBERS (${members.length})`},
    {key:'events',label:`📅 EVENTS (${events.length})`},
    {key:'team',label:'🤝 TEAM FINDER'},
    {key:'flags',label:`🚩 FLAGS (${solvedCount}/${flagsEdit.length})`},
    {key:'requests',label:'📬 REQUESTS',badge:pendingCount},
    {key:'logs',label:'📋 LOGS'},
  ]

  return (
    <div>
      <div style={{ background:'#030f08', borderBottom:'1px solid #0f3020', padding:'8px 1rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.85rem', fontWeight:900, flexShrink:0 }}>
          <span style={{ color:'#00ff6e' }}>DRAGON</span><span style={{ color:'#00d4ff' }}>BYTE</span>
          <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', color:'#00cc55', marginLeft:'0.75rem' }}>🔥 FIREBASE</span>
          {saving&&<span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', color:'#ffcc00', marginLeft:'0.5rem' }}>⟳ SAVING...</span>}
        </div>
        <div style={{ display:'flex', gap:3, flexWrap:'wrap', flex:1, justifyContent:'center' }}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{ ...PL(tab===t.key), padding:'5px 10px', position:'relative', fontSize:'0.58rem' }}>
              {t.label}
              {t.badge>0&&<span style={{ position:'absolute', top:-6, right:-6, background:'#ff2040', color:'#fff', fontSize:'0.48rem', width:14, height:14, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{t.badge}</span>}
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#ff2040', background:'transparent', border:'1px solid #cc0020', padding:'6px 12px', borderRadius:4, cursor:'pointer', flexShrink:0 }}>LOGOUT</button>
      </div>

      <div style={{ padding:'1.5rem', maxWidth:1150, margin:'0 auto' }}>

        {tab==='stats'&&(
          <div>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.9rem', color:'#00ff6e', letterSpacing:'2px', marginBottom:'0.5rem' }}>HOME PAGE STATS</div>
            <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', marginBottom:'1.5rem' }}>✅ Each SAVE button updates Firebase permanently for ALL visitors</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1rem' }}>
              <StatCard label="TOTAL MEMBERS" color="#00ff6e" accent="#00cc55" value={stats.memberCount||0} onSave={v=>saveStat('memberCount',v)} saving={saving} />
              <StatCard label="CTF FLAGS"     color="#00d4ff" accent="#0099cc" value={stats.flagCount||0}   onSave={v=>saveStat('flagCount',v)}   saving={saving} />
              <StatCard label="ACTIVE TEAMS"  color="#ffcc00" accent="#cc9900" value={stats.teamCount||0}   onSave={v=>saveStat('teamCount',v)}   saving={saving} />
              <StatCard label="EVENTS HELD"   color="#ff2040" accent="#cc0020" value={stats.eventCount||0}  onSave={v=>saveStat('eventCount',v)}  saving={saving} />
            </div>
          </div>
        )}

        {tab==='members'&&(
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                <input style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:4, padding:'8px 12px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', outline:'none', width:200 }} placeholder="Search..." value={mS} onChange={e=>setMS(e.target.value)} />
                {['all','admin','player','beginner'].map(f=><button key={f} onClick={()=>setMF(f)} style={PL(mF===f)}>{f.toUpperCase()}</button>)}
              </div>
              <button onClick={openAddMember} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.62rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'9px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>+ ADD MEMBER</button>
            </div>
            <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
                <thead><tr style={{ background:'#030f08', borderBottom:'1px solid #0f3020' }}>{['MEMBER','ROLE','SKILLS','EMAIL','JOINED','ACTIONS'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {FM.map(m=>(
                    <tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={TD}><div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34,height:34,borderRadius:'50%',background:AV[(m.name?.charCodeAt(0)||0)%AV.length],display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Orbitron,monospace',fontSize:'0.65rem',fontWeight:700,color:'#020c06',flexShrink:0 }}>{(m.name||'?').slice(0,2).toUpperCase()}</div>
                        <div><div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.7rem',color:'#b0ffcc' }}>{m.name}</div><div style={{ fontSize:'0.62rem',color:'#3a7a50',marginTop:2 }}>{m.exp||'—'}</div></div>
                      </div></td>
                      <td style={TD}><span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,background:`${RC[m.role]||'#3a7a50'}15`,color:RC[m.role]||'#3a7a50',border:`1px solid ${RC[m.role]||'#3a7a50'}80` }}>{(m.role||'beginner').toUpperCase()}</span></td>
                      <td style={TD}><div style={{ display:'flex',flexWrap:'wrap',gap:3 }}>{(m.skills||[]).map(s=><span key={s} style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.52rem',padding:'2px 6px',borderRadius:2,background:'#00ff6e10',color:'#00cc55',border:'1px solid #00ff6e25' }}>{s}</span>)}</div></td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.65rem',color:'#3a7a50' }}>{m.email}</td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.62rem',color:'#3a7a50',whiteSpace:'nowrap' }}>{m.joined||'—'}</td>
                      <td style={TD}><div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                        <button onClick={()=>openEditMember(m)} style={AB('#00d4ff','#0099cc')}>EDIT</button>
                        <button onClick={()=>promoteRole(m)} style={AB('#ffcc00','#cc9900')}>{m.role==='admin'?'DEMOTE':'PROMOTE'}</button>
                        <button onClick={()=>openDelMember(m)} style={AB('#ff2040','#cc0020')}>DELETE</button>
                      </div></td>
                    </tr>
                  ))}
                  {FM.length===0&&<tr><td colSpan={6} style={{ padding:'3rem',textAlign:'center',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO MEMBERS YET — ADD ONE!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='events'&&(
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                <input style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:4,padding:'8px 12px',color:'#b0ffcc',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',outline:'none',width:200 }} placeholder="Search..." value={eS} onChange={e=>setES(e.target.value)} />
                {['all','upcoming','past','CTF','WORKSHOP','TALK'].map(f=><button key={f} onClick={()=>setEF(f)} style={PL(eF===f)}>{f.toUpperCase()}</button>)}
              </div>
              <button onClick={openAddEvent} style={{ fontFamily:'Orbitron,monospace',fontSize:'0.62rem',fontWeight:700,color:'#020c06',background:'#00d4ff',padding:'9px 20px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px' }}>+ ADD EVENT</button>
            </div>
            <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',minWidth:600 }}>
                <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>{['EVENT','TYPE','DATE','STATUS','ACTIONS'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {FE.map(ev=>(
                    <tr key={ev.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={TD}><div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.7rem',color:'#b0ffcc',marginBottom:3 }}>{ev.title}</div><div style={{ fontSize:'0.68rem',color:'#3a7a50',maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ev.desc}</div></td>
                      <td style={TD}>{ev.type&&<span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,background:TS[ev.type]?.bg,color:TS[ev.type]?.c,border:TS[ev.type]?.b }}>{ev.type}</span>}</td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.68rem',color:'#00d4ff',whiteSpace:'nowrap' }}>{ev.date?new Date(ev.date+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—'}</td>
                      <td style={TD}><span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,background:ev.status==='upcoming'?'#00ff6e12':'#3a3a3a22',color:ev.status==='upcoming'?'#00ff6e':'#557755',border:`1px solid ${ev.status==='upcoming'?'#00cc55':'#1a3020'}` }}>{(ev.status||'').toUpperCase()}</span></td>
                      <td style={TD}><div style={{ display:'flex',gap:4 }}>
                        <button onClick={()=>openEditEvent(ev)} style={AB('#00d4ff','#0099cc')}>EDIT</button>
                        <button onClick={()=>openDelEvent(ev)} style={AB('#ff2040','#cc0020')}>DELETE</button>
                      </div></td>
                    </tr>
                  ))}
                  {FE.length===0&&<tr><td colSpan={5} style={{ padding:'3rem',textAlign:'center',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO EVENTS YET — ADD ONE!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='team'&&(
          <div style={C}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00ff6e', letterSpacing:'2px' }}>TEAM FINDER</div>
              <SaveBtn onClick={saveTF} saving={saving} label="SAVE TEAM FINDER" />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', padding:'1rem', background:'#030f08', borderRadius:6, border:'1px solid #0f3020' }}>
              <button onClick={()=>setTFEdit(t=>({...t,enabled:!t.enabled}))} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.7rem', fontWeight:700, padding:'8px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px', background:tfEdit.enabled?'#00ff6e':'#ff2040', color:'#020c06' }}>
                {tfEdit.enabled?'◆ ONLINE':'■ OFFLINE'}
              </button>
              <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:tfEdit.enabled?'#00ff6e':'#ff2040' }}>{tfEdit.enabled?'Visible to all visitors':'Hidden from all visitors'}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div><label style={L}>TEAM NAME</label><input style={I} value={tfEdit.name||''} onChange={e=>setTFEdit(t=>({...t,name:e.target.value}))} /></div>
              <div><label style={L}>OPEN SLOTS</label><input style={I} type="number" min="0" value={tfEdit.slots||0} onChange={e=>setTFEdit(t=>({...t,slots:parseInt(e.target.value)||0}))} /></div>
            </div>
            <label style={L}>DESCRIPTION</label>
            <textarea style={T} value={tfEdit.description||''} onChange={e=>setTFEdit(t=>({...t,description:e.target.value}))} />
            <label style={L}>REQUIREMENTS</label>
            <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem' }}>
              <input style={{ ...I, marginBottom:0, flex:1 }} value={tfReqInp} onChange={e=>setTFReqInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&tfReqInp.trim()){setTFEdit(t=>({...t,requirements:[...(t.requirements||[]),tfReqInp.trim()]}));setTFReqInp('')}}} placeholder="Type skill, press Enter..." />
              <button onClick={()=>{if(!tfReqInp.trim())return;setTFEdit(t=>({...t,requirements:[...(t.requirements||[]),tfReqInp.trim()]}));setTFReqInp('')}} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.6rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'0 16px', border:'none', borderRadius:4, cursor:'pointer' }}>ADD</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'1.5rem' }}>
              {(tfEdit.requirements||[]).map((r,i)=>(
                <span key={i} style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.65rem',padding:'4px 10px',borderRadius:2,background:'#00d4ff15',color:'#00d4ff',border:'1px solid #00d4ff40',display:'flex',alignItems:'center',gap:6 }}>
                  {r}<button onClick={()=>setTFEdit(t=>({...t,requirements:t.requirements.filter((_,j)=>j!==i)}))} style={{ background:'none',border:'none',color:'#ff2040',cursor:'pointer',fontSize:'0.8rem',padding:0 }}>×</button>
                </span>
              ))}
            </div>
            <label style={L}>TEAM MEMBERS</label>
            {(tfEdit.teamMembers||[]).map((m,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <div style={{ width:28,height:28,borderRadius:'50%',background:AV[i%AV.length],display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Orbitron,monospace',fontSize:'0.62rem',fontWeight:700,color:'#020c06',flexShrink:0 }}>{(m.name[0]||'?').toUpperCase()}</div>
                <input style={{ ...I, marginBottom:0, flex:1 }} value={m.name} onChange={e=>setTFEdit(t=>({...t,teamMembers:t.teamMembers.map((x,j)=>j===i?{...x,name:e.target.value}:x)}))} />
                <select style={{ ...S, marginBottom:0, width:120 }} value={m.role} onChange={e=>setTFEdit(t=>({...t,teamMembers:t.teamMembers.map((x,j)=>j===i?{...x,role:e.target.value}:x)}))}>
                  {ROLES.map(r=><option key={r}>{r}</option>)}
                </select>
                <button onClick={()=>setTFEdit(t=>({...t,teamMembers:t.teamMembers.filter((_,j)=>j!==i)}))} style={{ ...AB('#ff2040','#cc0020'), padding:'6px 10px' }}>×</button>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.5rem' }}>
              <input style={{ ...I, marginBottom:0, flex:1 }} value={tfNewMem.name} onChange={e=>setTFNewMem(m=>({...m,name:e.target.value}))} placeholder="New member name..." />
              <select style={{ ...S, marginBottom:0, width:120 }} value={tfNewMem.role} onChange={e=>setTFNewMem(m=>({...m,role:e.target.value}))}>
                {ROLES.map(r=><option key={r}>{r}</option>)}
              </select>
              <button onClick={()=>{if(!tfNewMem.name.trim())return;setTFEdit(t=>({...t,teamMembers:[...(t.teamMembers||[]),{...tfNewMem}]}));setTFNewMem({name:'',role:'MISC'})}} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.6rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'9px 14px', border:'none', borderRadius:4, cursor:'pointer' }}>+ ADD</button>
            </div>
            <SaveBtn onClick={saveTF} saving={saving} label="SAVE TEAM FINDER TO FIREBASE" />
          </div>
        )}

        {tab==='flags'&&(
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
              {[{n:flagsEdit.length,l:'TOTAL',c:'#00ff6e',a:'#00cc55'},{n:solvedCount,l:'SOLVED',c:'#00d4ff',a:'#0099cc'},{n:flagsEdit.length-solvedCount,l:'OPEN',c:'#ffcc00',a:'#cc9900'}].map(({n,l,c,a})=>(
                <div key={l} style={{ background:'#071a0e',border:'1px solid #0f3020',borderBottom:`2px solid ${a}`,borderRadius:6,padding:'1.25rem',textAlign:'center' }}>
                  <div style={{ fontFamily:'Orbitron,monospace',fontSize:'2rem',fontWeight:900,color:c,lineHeight:1 }}>{n}</div>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.6rem',color:'#3a7a50',letterSpacing:'2px',marginTop:5 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ ...C, borderLeft:'3px solid #ffcc00', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
              <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#ffcc00' }}>⚠️ After changes — click SAVE to update Firebase</div>
              <SaveBtn onClick={saveAllFlags} saving={saving} label="SAVE ALL FLAGS TO FIREBASE" color="#ffcc00" />
            </div>
            <div style={{ ...C, borderLeft:'3px solid #00cc55', marginBottom:'1.25rem' }}>
              <div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.75rem',color:'#00ff6e',letterSpacing:'2px',marginBottom:'1rem' }}>ADD NEW FLAG</div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:'0.75rem', alignItems:'end' }}>
                <div><label style={L}>FLAG NAME *</label><input style={{ ...I, marginBottom:0 }} placeholder="FLAG_NAME" value={newFlag.name} onChange={e=>setNewFlag(f=>({...f,name:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&(()=>{if(!newFlag.name.trim()){toast.error('Enter flag name!');return}setFlagsEdit(p=>[...p,{...newFlag,id:'f'+Date.now(),solved:false}]);setNewFlag({name:'',pts:100,cat:'web'});toast('Added! Click SAVE FLAGS',{icon:'⚠️'})})() } /></div>
                <div><label style={L}>POINTS</label><input style={{ ...I, marginBottom:0 }} type="number" min="0" value={newFlag.pts} onChange={e=>setNewFlag(f=>({...f,pts:parseInt(e.target.value)||0}))} /></div>
                <div><label style={L}>CATEGORY</label><select style={{ ...S, marginBottom:0 }} value={newFlag.cat} onChange={e=>setNewFlag(f=>({...f,cat:e.target.value}))}>{CTF_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                <button onClick={()=>{if(!newFlag.name.trim()){toast.error('Enter flag name!');return}setFlagsEdit(p=>[...p,{...newFlag,id:'f'+Date.now(),solved:false}]);setNewFlag({name:'',pts:100,cat:'web'});toast('Added! Click SAVE FLAGS',{icon:'⚠️'})}} style={{ fontFamily:'Orbitron,monospace',fontSize:'0.6rem',fontWeight:700,color:'#020c06',background:'#00ff6e',padding:'10px 16px',border:'none',borderRadius:4,cursor:'pointer',letterSpacing:'2px',height:42 }}>+ ADD</button>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center', marginBottom:'1.25rem' }}>
              <input style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:4,padding:'8px 12px',color:'#b0ffcc',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',outline:'none',width:200 }} placeholder="Search flags..." value={fS} onChange={e=>setFS(e.target.value)} />
              {['all','solved','open',...CTF_CATS].map(f=><button key={f} onClick={()=>setFFil(f)} style={PL(fFil===f)}>{f.toUpperCase()}</button>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'0.75rem' }}>
              {FF.map(f=>(
                <div key={f.id} style={{ background:f.solved?'#00ff6e08':'#071a0e',border:`1px solid ${f.solved?'#00cc55':'#0f3020'}`,borderRadius:6,padding:'1rem',display:'flex',alignItems:'center',gap:'0.75rem' }}>
                  <div style={{ fontSize:'1.4rem',flexShrink:0 }}>{CAT_ICONS[f.cat]||'🚩'}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.68rem',color:'#b0ffcc',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{f.name}</div>
                    <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.55rem',padding:'2px 7px',background:'#ffcc0015',color:'#ffcc00',border:'1px solid #cc990040',borderRadius:2 }}>{f.pts}PTS</span>
                      <span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.55rem',padding:'2px 7px',background:'#00d4ff10',color:'#00d4ff',border:'1px solid #00d4ff30',borderRadius:2 }}>{f.cat}</span>
                      <span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.55rem',padding:'2px 7px',background:f.solved?'#00ff6e15':'transparent',color:f.solved?'#00ff6e':'#3a7a50',border:`1px solid ${f.solved?'#00cc55':'#0f3020'}`,borderRadius:2 }}>{f.solved?'✓ SOLVED':'○ OPEN'}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',gap:3,flexShrink:0 }}>
                    <button onClick={()=>setFlagsEdit(p=>p.map(x=>x.id===f.id?{...x,solved:!x.solved}:x))} style={{ ...AB(f.solved?'#ffcc00':'#00ff6e',f.solved?'#cc9900':'#00cc55'),padding:'3px 8px',fontSize:'0.52rem' }}>{f.solved?'REOPEN':'SOLVE'}</button>
                    <button onClick={()=>setFlagsEdit(p=>p.filter(x=>x.id!==f.id))} style={{ ...AB('#ff2040','#cc0020'),padding:'3px 8px',fontSize:'0.52rem' }}>DEL</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:'1.5rem', textAlign:'center' }}>
              <SaveBtn onClick={saveAllFlags} saving={saving} label="SAVE ALL FLAGS TO FIREBASE" color="#ffcc00" />
            </div>
          </div>
        )}

        {tab==='requests'&&(
          <div>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center', marginBottom:'1.25rem' }}>
              <input style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:4,padding:'8px 12px',color:'#b0ffcc',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',outline:'none',width:200 }} placeholder="Search..." value={rS} onChange={e=>setRS(e.target.value)} />
              {['all','pending','approved','rejected'].map(f=><button key={f} onClick={()=>setRF(f)} style={PL(rF===f)}>{f.toUpperCase()}{f==='pending'&&pendingCount>0?` (${pendingCount})`:''}</button>)}
            </div>
            <div style={{ background:'#071a0e',border:'1px solid #0f3020',borderRadius:8,overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',minWidth:700 }}>
                <thead><tr style={{ background:'#030f08',borderBottom:'1px solid #0f3020' }}>{['APPLICANT','EMAIL','LEVEL','SKILLS','DATE','STATUS','ACTIONS'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {FR.map((r,i)=>(
                    <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={TD}><div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <div style={{ width:30,height:30,borderRadius:'50%',background:AV[i%AV.length],display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Orbitron,monospace',fontSize:'0.65rem',fontWeight:700,color:'#020c06',flexShrink:0 }}>{(r.name||'?').slice(0,2).toUpperCase()}</div>
                        <div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.68rem',color:'#b0ffcc' }}>{r.name}</div>
                      </div></td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.65rem',color:'#3a7a50' }}>{r.email}</td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.65rem',color:'#b0ffcc' }}>{r.exp||'—'}</td>
                      <td style={TD}><div style={{ display:'flex',flexWrap:'wrap',gap:3 }}>{(r.skills||[]).map(s=><span key={s} style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.52rem',padding:'2px 6px',borderRadius:2,background:'#00ff6e10',color:'#00cc55',border:'1px solid #00ff6e25' }}>{s}</span>)}</div></td>
                      <td style={{ ...TD,fontFamily:'"Share Tech Mono",monospace',fontSize:'0.6rem',color:'#3a7a50',whiteSpace:'nowrap' }}>{r.createdAt?.toDate?r.createdAt.toDate().toLocaleDateString('en-GB'):'—'}</td>
                      <td style={TD}><span style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.58rem',padding:'3px 9px',borderRadius:2,background:r.status==='approved'?'#00ff6e15':r.status==='pending'?'#ff204015':'#3a3a3a22',color:r.status==='approved'?'#00ff6e':r.status==='pending'?'#ff2040':'#557755',border:`1px solid ${r.status==='approved'?'#00cc55':r.status==='pending'?'#cc0020':'#1a3020'}` }}>{(r.status||'').toUpperCase()}</span></td>
                      <td style={TD}><div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                        {r.status==='pending'&&<><button onClick={()=>approveReq(r)} style={AB('#00ff6e','#00cc55')}>APPROVE</button><button onClick={()=>rejectReq(r)} style={AB('#3a7a50','#0f3020')}>REJECT</button></>}
                        {r.status==='rejected'&&<button onClick={()=>approveReq(r)} style={AB('#00ff6e','#00cc55')}>RE-APPROVE</button>}
                        <button onClick={()=>openDelReq(r)} style={AB('#ff2040','#cc0020')}>REMOVE</button>
                      </div></td>
                    </tr>
                  ))}
                  {FR.length===0&&<tr><td colSpan={7} style={{ padding:'3rem',textAlign:'center',fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px' }}>NO REQUESTS YET</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='logs'&&(
          <div style={C}>
            <div style={{ fontFamily:'Orbitron,monospace',fontSize:'0.82rem',color:'#00ff6e',letterSpacing:'2px',marginBottom:'1rem' }}>ACTIVITY LOG</div>
            {logs.length===0
              ? <div style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.75rem',color:'#3a7a50',letterSpacing:'2px',padding:'2rem',textAlign:'center' }}>NO ACTIVITY YET</div>
              : logs.map((l,i)=>(
                <div key={i} style={{ display:'flex',gap:'1rem',padding:'8px 0',borderBottom:'1px solid #0a1f10' }}>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.62rem',color:'#3a7a50',whiteSpace:'nowrap',flexShrink:0 }}>{l.time}</div>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace',fontSize:'0.65rem',color:'#b0ffcc' }}>{l.msg}</div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {modal==='member'&&<MemberModal form={mForm} setForm={setMForm} onSave={saveMember} onClose={()=>setModal(null)} isEdit={!!editId} saving={saving} />}
      {modal==='event' &&<EventModal  form={eForm} setForm={setEForm} onSave={saveEvent}  onClose={()=>setModal(null)} isEdit={!!editId} saving={saving} />}
      {modal==='delete'&&<DelModal name={delTgt?.name||delTgt?.title} onConfirm={confirmDel} onClose={()=>setModal(null)} saving={saving} />}

      <Footer />
    </div>
  )
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  if(!loggedIn) return <LoginScreen onLogin={()=>setLoggedIn(true)} />
  return <Dashboard onLogout={()=>setLoggedIn(false)} />
}
