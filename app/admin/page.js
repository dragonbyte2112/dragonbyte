// app/admin/page.js
// ═══════════════════════════════════════════════════════════
// FULL ADMIN DASHBOARD
// Controls: Members | Events | Team Finder | CTF Flags | Stats | Requests
// ═══════════════════════════════════════════════════════════
'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  getStore, getMembers, getEvents, getRequests,
  getStats, updateStats,
  getTeamFinder, updateTeamFinder,
  getFlags, addFlag, toggleFlag, deleteFlag, setFlags,
  addLog, getLogs,
} from '../../lib/store'
import Footer from '../../components/Footer'

// ── Change your admin credentials here ──
const ADMIN_EMAIL    = 'dragonbyte2112@gmail.com'
const ADMIN_PASSWORD = 'DragonByte@2025'

// ── Constants ──
const SKILLS   = ['WEB','CRYPTO','FORENSICS','REV','PWN','OSINT']
const CTF_CATS = ['web','crypto','forensics','pwn','rev','misc']
const CAT_ICONS = { web:'🌐', crypto:'🔐', forensics:'🔍', pwn:'💥', rev:'⚙️', misc:'🚩' }
const ROLES    = ['CAPTAIN','WEB','PWN','REV','CRYPTO','FORENSICS','OSINT','MISC']
const AVATAR_BG = ['linear-gradient(135deg,#00cc55,#006622)','linear-gradient(135deg,#0066aa,#003366)','linear-gradient(135deg,#aa0020,#660010)','linear-gradient(135deg,#aa6600,#664400)','linear-gradient(135deg,#6600aa,#330066)','linear-gradient(135deg,#005566,#002233)']
const ROLE_COLOR = { admin:'#ff2040', player:'#00ff6e', beginner:'#00d4ff' }
const TAG_STYLE  = { CTF:{background:'#00ff6e15',color:'#00ff6e',border:'1px solid #00cc55'}, WORKSHOP:{background:'#00d4ff15',color:'#00d4ff',border:'1px solid #00d4ff'}, TALK:{background:'#ff204015',color:'#ff2040',border:'1px solid #ff2040'}, COMPETITION:{background:'#ffcc0015',color:'#ffcc00',border:'1px solid #cc9900'} }

// ── Shared styles ──
const inp  = { width:'100%', background:'#030f08', border:'1px solid #0f3020', borderRadius:4, padding:'10px 14px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.82rem', outline:'none', marginBottom:'1rem' }
const sel  = { ...inp, cursor:'pointer' }
const tex  = { ...inp, fontFamily:'Rajdhani,sans-serif', fontSize:'0.88rem', resize:'vertical', height:80, marginBottom:'1rem' }
const lbl  = { fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:5 }
const abtn = (c,b) => ({ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'4px 10px', borderRadius:3, cursor:'pointer', letterSpacing:'1px', color:c, border:`1px solid ${b}`, background:'transparent', transition:'all .15s' })
const pill = (active) => ({ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', padding:'6px 14px', borderRadius:2, cursor:'pointer', letterSpacing:'1px', transition:'all .2s', border:active?'1px solid #00cc55':'1px solid #0f3020', background:active?'#00ff6e10':'transparent', color:active?'#00ff6e':'#3a7a50' })
const thStyle = { fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', color:'#3a7a50', letterSpacing:'2px', padding:'10px 12px', textAlign:'left', whiteSpace:'nowrap' }
const tdStyle = { padding:'11px 12px', borderBottom:'1px solid #0a1f10', verticalAlign:'middle' }

const EMPTY_MEMBER = { name:'', email:'', role:'beginner', exp:'Beginner', skills:[] }
const EMPTY_EVENT  = { title:'', type:'', status:'upcoming', date:'', time:'', desc:'', link:'', org:'' }

// ════════════════════════
// LOGIN SCREEN
// ════════════════════════
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [err,   setErr]   = useState(false)
  const handle = () => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) { onLogin() }
    else { setErr(true); setTimeout(() => setErr(false), 3000) }
  }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #ff2040', borderRadius:8, padding:'2.5rem', width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🐉</div>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.1rem', color:'#00ff6e', letterSpacing:'3px' }}>DRAGONBYTE</div>
          <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#ff2040', letterSpacing:'2px', marginTop:4 }}>// ADMIN ACCESS ONLY</div>
        </div>
        <label style={lbl}>EMAIL</label>
        <input style={inp} type="email" placeholder="admin email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        <label style={lbl}>PASSWORD</label>
        <input style={inp} type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        {err && <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#ff2040', textAlign:'center', marginBottom:'0.75rem' }}>✖ INVALID CREDENTIALS</div>}
        <button onClick={handle} style={{ width:'100%', fontFamily:'Orbitron,monospace', fontSize:'0.75rem', fontWeight:700, color:'#fff', background:'#ff2040', padding:12, border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'3px' }}>AUTHENTICATE →</button>
      </div>
    </div>
  )
}

// ════════════════════════
// MEMBER MODAL
// ════════════════════════
function MemberModal({ form, setForm, onSave, onClose, isEdit }) {
  const toggle = s => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills,s] }))
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00cc55', borderRadius:8, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', borderBottom:'1px solid #0f3020' }}>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00ff6e', letterSpacing:'2px' }}>{isEdit?'EDIT MEMBER':'ADD MEMBER'}</div>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'4px 10px', borderRadius:3, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem' }}>
          <label style={lbl}>NAME / HANDLE *</label>
          <input style={inp} placeholder="0xHacker" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <label style={lbl}>EMAIL *</label>
          <input style={inp} type="email" placeholder="user@email.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label style={lbl}>ROLE</label>
              <select style={sel} value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                <option value="beginner">Beginner</option><option value="player">Player</option><option value="admin">Admin</option>
              </select>
            </div>
            <div><label style={lbl}>EXPERIENCE</label>
              <select style={sel} value={form.exp} onChange={e=>setForm(f=>({...f,exp:e.target.value}))}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
          </div>
          <label style={lbl}>SKILLS</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:'1rem' }}>
            {SKILLS.map(s => (
              <label key={s} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:form.skills.includes(s)?'#00ff6e':'#3a7a50', cursor:'pointer' }}>
                <input type="checkbox" checked={form.skills.includes(s)} onChange={()=>toggle(s)} style={{ accentColor:'#00ff6e' }} /> {s}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', padding:'1rem 1.5rem', borderTop:'1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>CANCEL</button>
          <button onClick={onSave} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'10px 24px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>{isEdit?'UPDATE':'ADD MEMBER'}</button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════
// EVENT MODAL
// ════════════════════════
function EventModal({ form, setForm, onSave, onClose, isEdit }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00cc55', borderRadius:8, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', borderBottom:'1px solid #0f3020' }}>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00ff6e', letterSpacing:'2px' }}>{isEdit?'EDIT EVENT':'ADD EVENT'}</div>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'4px 10px', borderRadius:3, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem' }}>
          <label style={lbl}>EVENT TITLE *</label>
          <input style={inp} placeholder="e.g. picoCTF 2025" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label style={lbl}>TYPE *</label>
              <select style={sel} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value="">Select...</option><option value="CTF">CTF</option><option value="WORKSHOP">WORKSHOP</option><option value="TALK">TALK</option><option value="COMPETITION">COMPETITION</option>
              </select>
            </div>
            <div><label style={lbl}>STATUS</label>
              <select style={sel} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option value="upcoming">Upcoming</option><option value="past">Past</option>
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label style={lbl}>DATE *</label><input style={inp} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} /></div>
            <div><label style={lbl}>TIME</label><input style={inp} type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} /></div>
          </div>
          <label style={lbl}>DESCRIPTION *</label>
          <textarea style={tex} placeholder="Event description..." value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} />
          <label style={lbl}>REGISTRATION LINK</label>
          <input style={inp} type="url" placeholder="https://..." value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} />
          <label style={lbl}>ORGANIZER</label>
          <input style={inp} placeholder="e.g. Internal, picoCTF" value={form.org} onChange={e=>setForm(f=>({...f,org:e.target.value}))} />
        </div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', padding:'1rem 1.5rem', borderTop:'1px solid #0f3020' }}>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>CANCEL</button>
          <button onClick={onSave} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'10px 24px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>{isEdit?'UPDATE':'SAVE EVENT'}</button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════
// DELETE MODAL
// ════════════════════════
function DeleteModal({ name, onConfirm, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #ff2040', borderRadius:8, padding:'2rem', width:'100%', maxWidth:420 }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#ff2040', letterSpacing:'2px', marginBottom:'1rem' }}>CONFIRM DELETE</div>
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.78rem', color:'#b0ffcc', lineHeight:1.6, marginBottom:'0.5rem' }}>Permanently delete:</div>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.9rem', color:'#ff2040', letterSpacing:'1px', margin:'0.5rem 0 0.5rem' }}>{name}</div>
        <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#3a7a50', letterSpacing:'1px', marginBottom:'1.5rem' }}>// THIS CANNOT BE UNDONE</div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'10px 20px', borderRadius:4, cursor:'pointer' }}>CANCEL</button>
          <button onClick={onConfirm} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#fff', background:'#ff2040', padding:'10px 24px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>DELETE</button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════
// MAIN DASHBOARD
// ════════════════════════
function Dashboard({ onLogout }) {
  const [tab,       setTab]     = useState('stats')
  const [members,   setMem]     = useState([])
  const [events,    setEvt]     = useState([])
  const [requests,  setReq]     = useState([])
  const [flags,     setFlg]     = useState([])
  const [stats,     setStat]    = useState({})
  const [tf,        setTF]      = useState({})
  const [logs,      setLogs]    = useState([])

  // Filters
  const [mSearch, setMS] = useState(''); const [mFilter, setMF] = useState('all')
  const [eSearch, setES] = useState(''); const [eFilter, setEF] = useState('all')
  const [rSearch, setRS] = useState(''); const [rFilter, setRF] = useState('all')
  const [fSearch, setFS] = useState(''); const [fFilter, setFF] = useState('all')

  // Modals
  const [modal,    setModal]   = useState(null)
  const [editId,   setEditId]  = useState(null)
  const [delTarget,setDel]     = useState(null)
  const [delType,  setDelType] = useState(null)
  const [mForm,    setMForm]   = useState(EMPTY_MEMBER)
  const [eForm,    setEForm]   = useState(EMPTY_EVENT)

  // New flag form
  const [newFlag, setNewFlag] = useState({ name:'', pts:100, cat:'web' })

  // Team finder temp state
  const [tfReqInput, setTFReqInput] = useState('')
  const [tfNewMember, setTFNewMember] = useState({ name:'', role:'MISC' })

  const load = useCallback(() => {
    const s = getStore()
    setMem([...s.members])
    setEvt([...s.events])
    setReq([...s.requests])
    setFlg([...s.flags])
    setStat({ ...s.stats })
    setTF({ ...s.teamFinder, requirements:[...s.teamFinder.requirements], teamMembers:[...s.teamFinder.teamMembers] })
    setLogs([...s.logs])
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 2000); return () => clearInterval(t) }, [load])

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const solvedFlags  = flags.filter(f => f.solved).length

  // ════ STATS CONTROLS ════
  const updateStatField = (key, val) => {
    const s = getStore(); s.stats[key] = Math.max(0, parseInt(val) || 0); load()
  }
  const adjustStat = (key, delta) => {
    const s = getStore(); s.stats[key] = Math.max(0, (s.stats[key] || 0) + delta); load()
  }

  // ════ TEAM FINDER CONTROLS ════
  const saveTF = () => {
    updateTeamFinder(tf)
    addLog(`Team Finder updated: ${tf.enabled ? 'ONLINE' : 'OFFLINE'} — "${tf.name}"`)
    toast.success('✓ TEAM FINDER UPDATED')
    load()
  }
  const addTFReq = () => {
    if (!tfReqInput.trim()) return
    setTF(t => ({ ...t, requirements: [...t.requirements, tfReqInput.trim()] }))
    setTFReqInput('')
  }
  const removeTFReq = (i) => setTF(t => ({ ...t, requirements: t.requirements.filter((_,idx) => idx !== i) }))
  const addTFMember = () => {
    if (!tfNewMember.name.trim()) return
    setTF(t => ({ ...t, teamMembers: [...t.teamMembers, { ...tfNewMember }] }))
    setTFNewMember({ name:'', role:'MISC' })
  }
  const removeTFMember = (i) => setTF(t => ({ ...t, teamMembers: t.teamMembers.filter((_,idx) => idx !== i) }))

  // ════ CTF FLAGS ════
  const addNewFlag = () => {
    if (!newFlag.name.trim()) { toast.error('Enter flag name!'); return }
    addFlag({ ...newFlag, solved: false })
    addLog(`Flag added: ${newFlag.name} (${newFlag.pts} pts, ${newFlag.cat})`)
    toast.success('✓ FLAG ADDED')
    setNewFlag({ name:'', pts:100, cat:'web' })
    load()
  }
  const toggleFlagSolved = (id) => {
    toggleFlag(id); load()
  }
  const deleteFlagById = (id, name) => {
    deleteFlag(id)
    addLog(`Flag deleted: ${name}`)
    toast.error('FLAG DELETED')
    load()
  }

  // ════ MEMBERS ════
  const openAddMember  = () => { setMForm(EMPTY_MEMBER); setEditId(null); setModal('member') }
  const openEditMember = m => { setMForm({ name:m.name, email:m.email, role:m.role, exp:m.exp||'Beginner', skills:[...(m.skills||[])] }); setEditId(m.id); setModal('member') }
  const saveMember = () => {
    if (!mForm.name.trim() || !mForm.email.trim()) { toast.error('Fill required fields!'); return }
    const s = getStore()
    if (editId) { s.members = s.members.map(m => m.id === editId ? { ...m, ...mForm } : m); toast.success('✓ MEMBER UPDATED') }
    else { s.members.unshift({ ...mForm, id: s.nextId++, joined: new Date().toISOString().slice(0,10) }); toast.success('✓ MEMBER ADDED') }
    addLog(`Member ${editId?'updated':'added'}: ${mForm.name}`)
    load(); setModal(null)
  }
  const promoteRole = m => {
    const s = getStore(); const next = m.role==='beginner'?'player':m.role==='player'?'admin':'player'
    s.members = s.members.map(x => x.id===m.id ? {...x,role:next} : x)
    toast.success(`${m.role==='admin'?'⬇ DEMOTED':'⬆ PROMOTED'} TO ${next.toUpperCase()}`)
    addLog(`${m.name} ${m.role==='admin'?'demoted':'promoted'} to ${next}`)
    load()
  }
  const openDelMember = m => { setDel(m); setDelType('member'); setModal('delete') }
  const confirmDelMember = () => {
    const s = getStore(); s.members = s.members.filter(m => m.id !== delTarget.id)
    addLog(`Member deleted: ${delTarget.name}`); toast.error('MEMBER DELETED'); load(); setModal(null)
  }

  // ════ EVENTS ════
  const openAddEvent  = () => { setEForm(EMPTY_EVENT); setEditId(null); setModal('event') }
  const openEditEvent = ev => { setEForm({ title:ev.title, type:ev.type, status:ev.status, date:ev.date, time:ev.time||'', desc:ev.desc, link:ev.link||'', org:ev.org||'' }); setEditId(ev.id); setModal('event') }
  const saveEvent = () => {
    if (!eForm.title.trim() || !eForm.type || !eForm.date || !eForm.desc.trim()) { toast.error('Fill required fields!'); return }
    const s = getStore()
    if (editId) { s.events = s.events.map(e => e.id===editId ? {...e,...eForm} : e); toast.success('✓ EVENT UPDATED') }
    else { s.events.unshift({ ...eForm, id: s.nextId++ }); toast.success('✓ EVENT ADDED') }
    addLog(`Event ${editId?'updated':'added'}: ${eForm.title}`)
    load(); setModal(null)
  }
  const openDelEvent = ev => { setDel(ev); setDelType('event'); setModal('delete') }
  const confirmDelEvent = () => {
    const s = getStore(); s.events = s.events.filter(e => e.id!==delTarget.id)
    addLog(`Event deleted: ${delTarget.title}`); toast.error('EVENT DELETED'); load(); setModal(null)
  }

  // ════ REQUESTS ════
  const approveReq = r => {
    const s = getStore()
    s.requests = s.requests.map(x => x.id===r.id ? {...x,status:'approved'} : x)
    if (!s.members.some(m => m.email===r.email)) {
      s.members.unshift({ id:s.nextId++, name:r.name, email:r.email, role:'beginner', exp:r.exp||'Beginner', skills:r.skills||[], joined:new Date().toISOString().slice(0,10) })
      toast.success('✓ APPROVED & ADDED TO MEMBERS')
    } else { toast.success('✓ REQUEST APPROVED') }
    addLog(`Request approved: ${r.name}`)
    load()
  }
  const rejectReq = r => {
    const s = getStore(); s.requests = s.requests.map(x => x.id===r.id ? {...x,status:'rejected'} : x)
    toast.error('REQUEST REJECTED'); addLog(`Request rejected: ${r.name}`); load()
  }
  const openDelReq = r => { setDel(r); setDelType('request'); setModal('delete') }
  const confirmDelReq = () => {
    const s = getStore(); s.requests = s.requests.filter(r => r.id!==delTarget.id)
    toast.error('REQUEST REMOVED'); load(); setModal(null)
  }

  const confirmDelete = () => {
    if (delType==='member')  confirmDelMember()
    if (delType==='event')   confirmDelEvent()
    if (delType==='request') confirmDelReq()
  }

  // ════ FILTERED DATA ════
  const filtMembers  = members.filter(m  => (mFilter==='all'||m.role===mFilter) && (m.name.toLowerCase().includes(mSearch.toLowerCase())||m.email.toLowerCase().includes(mSearch.toLowerCase())))
  const filtEvents   = events.filter(e   => (eFilter==='all'||e.status===eFilter||e.type===eFilter) && e.title.toLowerCase().includes(eSearch.toLowerCase()))
  const filtRequests = requests.filter(r => (rFilter==='all'||r.status===rFilter) && (r.name.toLowerCase().includes(rSearch.toLowerCase())||r.email.toLowerCase().includes(rSearch.toLowerCase())))
  const filtFlags    = flags.filter(f    => (fFilter==='all'||(fFilter==='solved'&&f.solved)||(fFilter==='open'&&!f.solved)||f.cat===fFilter) && f.name.toLowerCase().includes(fSearch.toLowerCase()))

  // ── Tab list ──
  const TABS = [
    { key:'stats',   label:'📊 STATS'       },
    { key:'members', label:`👥 MEMBERS (${members.length})` },
    { key:'events',  label:`📅 EVENTS (${events.length})`   },
    { key:'team',    label:'🤝 TEAM FINDER'  },
    { key:'flags',   label:`🚩 CTF FLAGS (${solvedFlags}/${flags.length})` },
    { key:'requests',label:'📬 REQUESTS', badge: pendingCount },
    { key:'logs',    label:'📋 LOGS'         },
  ]

  const card = { background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, padding:'1.5rem', marginBottom:'1.5rem' }
  const cardTitle = { fontFamily:'Orbitron,monospace', fontSize:'0.82rem', color:'#00ff6e', letterSpacing:'2px', marginBottom:'1.25rem' }

  return (
    <div>
      {/* TOP BAR */}
      <div style={{ background:'#030f08', borderBottom:'1px solid #0f3020', padding:'0 1.5rem', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, flexWrap:'wrap', gap:'0.5rem' }}>
        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.9rem', fontWeight:900 }}>
          <span style={{ color:'#00ff6e' }}>DRAGON</span><span style={{ color:'#00d4ff' }}>BYTE</span>
          <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'2px', marginLeft:'1rem' }}>// ADMIN</span>
        </div>
        <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)} style={{ ...pill(tab===t.key), padding:'6px 12px', position:'relative', fontSize:'0.58rem' }}>
              {t.label}
              {t.badge > 0 && <span style={{ position:'absolute', top:-6, right:-6, background:'#ff2040', color:'#fff', fontSize:'0.5rem', width:15, height:15, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontWeight:700 }}>{t.badge}</span>}
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#ff2040', background:'transparent', border:'1px solid #cc0020', padding:'6px 14px', borderRadius:4, cursor:'pointer', letterSpacing:'1px' }}>LOGOUT</button>
      </div>

      <div style={{ padding:'1.5rem', maxWidth:1150, margin:'0 auto' }}>

        {/* ════ STATS TAB ════ */}
        {tab === 'stats' && (
          <div>
            <div style={cardTitle}>HOME PAGE STATS CONTROL</div>
            <p style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#3a7a50', letterSpacing:'1px', marginBottom:'1.5rem' }}>
              These numbers show on the home page. Adjust them manually below.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1rem' }}>
              {[
                { key:'memberCount', label:'TOTAL MEMBERS',  color:'#00ff6e', accent:'#00cc55' },
                { key:'flagCount',   label:'CTF FLAGS',      color:'#00d4ff', accent:'#0099cc' },
                { key:'teamCount',   label:'ACTIVE TEAMS',   color:'#ffcc00', accent:'#cc9900' },
                { key:'eventCount',  label:'EVENTS HELD',    color:'#ff2040', accent:'#cc0020' },
              ].map(({ key, label, color, accent }) => (
                <div key={key} style={{ ...card, borderBottom:`2px solid ${accent}`, marginBottom:0 }}>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#3a7a50', letterSpacing:'2px', marginBottom:8 }}>{label}</div>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'2.5rem', fontWeight:900, color, marginBottom:'1rem', lineHeight:1 }}>{stats[key] || 0}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button onClick={()=>adjustStat(key,-10)} style={{ ...abtn(color,accent), padding:'6px 10px', fontSize:'0.75rem' }}>-10</button>
                    <button onClick={()=>adjustStat(key,-1)}  style={{ ...abtn(color,accent), padding:'6px 10px', fontSize:'0.75rem' }}>-1</button>
                    <input
                      type="number"
                      value={stats[key] || 0}
                      onChange={e=>updateStatField(key, e.target.value)}
                      style={{ flex:1, background:'#030f08', border:`1px solid ${accent}`, borderRadius:4, padding:'6px 10px', color, fontFamily:'Orbitron,monospace', fontSize:'1rem', fontWeight:700, outline:'none', textAlign:'center' }}
                    />
                    <button onClick={()=>adjustStat(key,1)}  style={{ ...abtn(color,accent), padding:'6px 10px', fontSize:'0.75rem' }}>+1</button>
                    <button onClick={()=>adjustStat(key,10)} style={{ ...abtn(color,accent), padding:'6px 10px', fontSize:'0.75rem' }}>+10</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick summary */}
            <div style={{ ...card, marginTop:'1.5rem', borderLeft:'3px solid #00cc55' }}>
              <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#00cc55', letterSpacing:'2px', marginBottom:'0.75rem' }}>// LIVE SUMMARY</div>
              <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap' }}>
                {Object.entries(stats).map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'1px' }}>{k.replace('Count','').toUpperCase()}</div>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1.2rem', color:'#00ff6e', fontWeight:900 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ MEMBERS TAB ════ */}
        {tab === 'members' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                <input style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:4, padding:'8px 12px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', outline:'none', width:200 }} type="text" placeholder="Search members..." value={mSearch} onChange={e=>setMS(e.target.value)} />
                {['all','admin','player','beginner'].map(f => <button key={f} onClick={()=>setMF(f)} style={pill(mFilter===f)}>{f.toUpperCase()}</button>)}
              </div>
              <button onClick={openAddMember} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.62rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'9px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>+ ADD MEMBER</button>
            </div>
            <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'#030f08', borderBottom:'1px solid #0f3020' }}>
                  {['MEMBER','ROLE','SKILLS','EMAIL','JOINED','ACTIONS'].map(h=><th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtMembers.map((m) => (
                    <tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={tdStyle}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:AVATAR_BG[m.id%AVATAR_BG.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'0.72rem', fontWeight:700, color:'#020c06', flexShrink:0 }}>{m.name.slice(0,2).toUpperCase()}</div>
                          <div>
                            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', color:'#b0ffcc', letterSpacing:'1px' }}>{m.name}</div>
                            <div style={{ fontSize:'0.68rem', color:'#3a7a50', marginTop:2 }}>{m.exp||'—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}><span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'3px 9px', borderRadius:2, letterSpacing:'1px', background:`${ROLE_COLOR[m.role]}15`, color:ROLE_COLOR[m.role], border:`1px solid ${ROLE_COLOR[m.role]}80` }}>{m.role.toUpperCase()}</span></td>
                      <td style={tdStyle}><div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>{(m.skills||[]).map(s=><span key={s} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', padding:'2px 7px', borderRadius:2, background:'#00ff6e10', color:'#00cc55', border:'1px solid #00ff6e25' }}>{s}</span>)}</div></td>
                      <td style={{ ...tdStyle, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50' }}>{m.email}</td>
                      <td style={{ ...tdStyle, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50', whiteSpace:'nowrap' }}>{m.joined||'—'}</td>
                      <td style={tdStyle}><div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        <button onClick={()=>openEditMember(m)} style={abtn('#00d4ff','#0099cc')}>EDIT</button>
                        <button onClick={()=>promoteRole(m)}    style={abtn('#ffcc00','#cc9900')}>{m.role==='admin'?'DEMOTE':'PROMOTE'}</button>
                        <button onClick={()=>openDelMember(m)}  style={abtn('#ff2040','#cc0020')}>DELETE</button>
                      </div></td>
                    </tr>
                  ))}
                  {filtMembers.length===0 && <tr><td colSpan={6} style={{ padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'2px' }}>NO MEMBERS FOUND</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ EVENTS TAB ════ */}
        {tab === 'events' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                <input style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:4, padding:'8px 12px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', outline:'none', width:200 }} type="text" placeholder="Search events..." value={eSearch} onChange={e=>setES(e.target.value)} />
                {['all','upcoming','past','CTF','WORKSHOP','TALK'].map(f=><button key={f} onClick={()=>setEF(f)} style={pill(eFilter===f)}>{f.toUpperCase()}</button>)}
              </div>
              <button onClick={openAddEvent} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.62rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'9px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px' }}>+ ADD EVENT</button>
            </div>
            <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'#030f08', borderBottom:'1px solid #0f3020' }}>
                  {['EVENT','TYPE','DATE','STATUS','ACTIONS'].map(h=><th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtEvents.map(ev => (
                    <tr key={ev.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={tdStyle}>
                        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', color:'#b0ffcc', letterSpacing:'1px', marginBottom:3 }}>{ev.title}</div>
                        <div style={{ fontSize:'0.72rem', color:'#3a7a50', maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.desc}</div>
                      </td>
                      <td style={tdStyle}><span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'3px 9px', borderRadius:2, letterSpacing:'1px', ...(TAG_STYLE[ev.type]||{}) }}>{ev.type}</span></td>
                      <td style={{ ...tdStyle, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#00d4ff', whiteSpace:'nowrap' }}>
                        {ev.date ? new Date(ev.date+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                        {ev.time && <div style={{ fontSize:'0.62rem', color:'#3a7a50', marginTop:2 }}>{ev.time}</div>}
                      </td>
                      <td style={tdStyle}><span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'3px 9px', borderRadius:2, letterSpacing:'1px', background:ev.status==='upcoming'?'#00ff6e12':'#3a3a3a22', color:ev.status==='upcoming'?'#00ff6e':'#557755', border:`1px solid ${ev.status==='upcoming'?'#00cc55':'#1a3020'}` }}>{ev.status.toUpperCase()}</span></td>
                      <td style={tdStyle}><div style={{ display:'flex', gap:5 }}>
                        <button onClick={()=>openEditEvent(ev)} style={abtn('#00d4ff','#0099cc')}>EDIT</button>
                        <button onClick={()=>openDelEvent(ev)}  style={abtn('#ff2040','#cc0020')}>DELETE</button>
                      </div></td>
                    </tr>
                  ))}
                  {filtEvents.length===0 && <tr><td colSpan={5} style={{ padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'2px' }}>NO EVENTS FOUND</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ TEAM FINDER TAB ════ */}
        {tab === 'team' && (
          <div>
            <div style={card}>
              <div style={cardTitle}>TEAM FINDER CONTROL</div>

              {/* On/Off toggle */}
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', padding:'1rem', background:'#030f08', borderRadius:6, border:'1px solid #0f3020' }}>
                <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50', letterSpacing:'2px' }}>TEAM FINDER STATUS</div>
                <button
                  onClick={()=>setTF(t=>({...t,enabled:!t.enabled}))}
                  style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', fontWeight:700, padding:'8px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px', background:tf.enabled?'#00ff6e':'#ff2040', color:'#020c06', transition:'all 0.2s' }}>
                  {tf.enabled ? '◆ ONLINE' : '■ OFFLINE'}
                </button>
                <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:tf.enabled?'#00ff6e':'#ff2040', letterSpacing:'1px' }}>
                  {tf.enabled ? 'Team finder visible to users' : 'Team finder hidden from users'}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label style={lbl}>TEAM NAME</label>
                  <input style={inp} value={tf.name||''} onChange={e=>setTF(t=>({...t,name:e.target.value}))} placeholder="Team name..." />
                </div>
                <div>
                  <label style={lbl}>OPEN SLOTS</label>
                  <input style={inp} type="number" min="0" value={tf.slots||0} onChange={e=>setTF(t=>({...t,slots:parseInt(e.target.value)||0}))} />
                </div>
              </div>

              <label style={lbl}>TEAM DESCRIPTION</label>
              <textarea style={tex} value={tf.description||''} onChange={e=>setTF(t=>({...t,description:e.target.value}))} placeholder="Describe what you're looking for..." />

              {/* Requirements */}
              <label style={lbl}>SKILL REQUIREMENTS</label>
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <input style={{ ...inp, marginBottom:0, flex:1 }} value={tfReqInput} onChange={e=>setTFReqInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTFReq()} placeholder="e.g. WEB, CRYPTO..." />
                <button onClick={addTFReq} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.62rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'0 16px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'1px', whiteSpace:'nowrap' }}>ADD</button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'1.5rem' }}>
                {(tf.requirements||[]).map((r,i) => (
                  <span key={i} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', padding:'4px 10px', borderRadius:2, background:'#00d4ff15', color:'#00d4ff', border:'1px solid #00d4ff40', display:'flex', alignItems:'center', gap:6 }}>
                    {r}
                    <button onClick={()=>removeTFReq(i)} style={{ background:'none', border:'none', color:'#ff2040', cursor:'pointer', fontSize:'0.8rem', padding:0, lineHeight:1 }}>×</button>
                  </span>
                ))}
              </div>

              {/* Team members */}
              <label style={lbl}>CURRENT TEAM MEMBERS</label>
              <div style={{ marginBottom:'1rem' }}>
                {(tf.teamMembers||[]).map((m,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:AVATAR_BG[i%AVATAR_BG.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'0.7rem', fontWeight:700, color:'#020c06', flexShrink:0 }}>{(m.name[0]||'?').toUpperCase()}</div>
                    <input style={{ ...inp, marginBottom:0, flex:1 }} value={m.name} onChange={e=>setTF(t=>({...t,teamMembers:t.teamMembers.map((x,j)=>j===i?{...x,name:e.target.value}:x)}))} placeholder="Member name" />
                    <select style={{ ...sel, marginBottom:0, width:130 }} value={m.role} onChange={e=>setTF(t=>({...t,teamMembers:t.teamMembers.map((x,j)=>j===i?{...x,role:e.target.value}:x)}))}>
                      {ROLES.map(r=><option key={r}>{r}</option>)}
                    </select>
                    <button onClick={()=>removeTFMember(i)} style={{ ...abtn('#ff2040','#cc0020'), padding:'6px 10px' }}>×</button>
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                  <input style={{ ...inp, marginBottom:0, flex:1 }} value={tfNewMember.name} onChange={e=>setTFNewMember(m=>({...m,name:e.target.value}))} placeholder="New member name..." />
                  <select style={{ ...sel, marginBottom:0, width:130 }} value={tfNewMember.role} onChange={e=>setTFNewMember(m=>({...m,role:e.target.value}))}>
                    {ROLES.map(r=><option key={r}>{r}</option>)}
                  </select>
                  <button onClick={addTFMember} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.62rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'9px 16px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'1px', whiteSpace:'nowrap' }}>ADD</button>
                </div>
              </div>

              <button onClick={saveTF} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.75rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'12px 32px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'3px', transition:'all 0.2s' }}>
                SAVE TEAM FINDER
              </button>
            </div>
          </div>
        )}

        {/* ════ CTF FLAGS TAB ════ */}
        {tab === 'flags' && (
          <div>
            {/* Summary */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
              {[
                { num:flags.length,  label:'TOTAL FLAGS',  color:'#00ff6e', accent:'#00cc55' },
                { num:solvedFlags,   label:'SOLVED',       color:'#00d4ff', accent:'#0099cc' },
                { num:flags.filter(f=>!f.solved).length, label:'OPEN', color:'#ffcc00', accent:'#cc9900' },
              ].map(({ num, label, color, accent }) => (
                <div key={label} style={{ background:'#071a0e', border:'1px solid #0f3020', borderBottom:`2px solid ${accent}`, borderRadius:6, padding:'1.25rem', textAlign:'center' }}>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'2rem', fontWeight:900, color, lineHeight:1 }}>{num}</div>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6rem', color:'#3a7a50', letterSpacing:'2px', marginTop:5 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Add new flag */}
            <div style={{ ...card, borderLeft:'3px solid #00cc55' }}>
              <div style={cardTitle}>ADD NEW FLAG</div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:'0.75rem', alignItems:'end' }}>
                <div><label style={lbl}>FLAG NAME *</label><input style={{ ...inp, marginBottom:0 }} placeholder="FLAG_NAME_HERE" value={newFlag.name} onChange={e=>setNewFlag(f=>({...f,name:e.target.value}))} /></div>
                <div><label style={lbl}>POINTS</label><input style={{ ...inp, marginBottom:0 }} type="number" min="0" value={newFlag.pts} onChange={e=>setNewFlag(f=>({...f,pts:parseInt(e.target.value)||0}))} /></div>
                <div><label style={lbl}>CATEGORY</label>
                  <select style={{ ...sel, marginBottom:0 }} value={newFlag.cat} onChange={e=>setNewFlag(f=>({...f,cat:e.target.value}))}>
                    {CTF_CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={addNewFlag} style={{ fontFamily:'Orbitron,monospace', fontSize:'0.62rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'10px 20px', border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'2px', height:42 }}>+ ADD</button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center', marginBottom:'1.25rem' }}>
              <input style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:4, padding:'8px 12px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', outline:'none', width:200 }} type="text" placeholder="Search flags..." value={fSearch} onChange={e=>setFS(e.target.value)} />
              {['all','solved','open',...CTF_CATS].map(f=><button key={f} onClick={()=>setFF(f)} style={pill(fFilter===f)}>{f.toUpperCase()}</button>)}
            </div>

            {/* Flags grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'0.75rem' }}>
              {filtFlags.map(f => (
                <div key={f.id} style={{ background: f.solved ? '#00ff6e08' : '#071a0e', border:`1px solid ${f.solved?'#00cc55':'#0f3020'}`, borderRadius:6, padding:'1rem', display:'flex', alignItems:'center', gap:'0.75rem', transition:'all 0.2s' }}>
                  <div style={{ fontSize:'1.5rem', flexShrink:0 }}>{CAT_ICONS[f.cat]||'🚩'}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.72rem', color:'#b0ffcc', letterSpacing:'1px', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'2px 8px', background:'#ffcc0015', color:'#ffcc00', border:'1px solid #cc990040', borderRadius:2 }}>{f.pts} PTS</span>
                      <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'2px 8px', background:'#00d4ff10', color:'#00d4ff', border:'1px solid #00d4ff30', borderRadius:2 }}>{f.cat}</span>
                      <span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'2px 8px', background:f.solved?'#00ff6e15':'#3a3a3a15', color:f.solved?'#00ff6e':'#3a7a50', border:`1px solid ${f.solved?'#00cc55':'#0f3020'}`, borderRadius:2 }}>{f.solved?'✓ SOLVED':'○ OPEN'}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                    <button onClick={()=>toggleFlagSolved(f.id)} style={{ ...abtn(f.solved?'#ffcc00':'#00ff6e', f.solved?'#cc9900':'#00cc55'), padding:'4px 8px', fontSize:'0.55rem' }}>{f.solved?'REOPEN':'SOLVE'}</button>
                    <button onClick={()=>deleteFlagById(f.id, f.name)} style={{ ...abtn('#ff2040','#cc0020'), padding:'4px 8px', fontSize:'0.55rem' }}>DELETE</button>
                  </div>
                </div>
              ))}
              {filtFlags.length===0 && <div style={{ gridColumn:'1/-1', padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'2px' }}>NO FLAGS FOUND</div>}
            </div>
          </div>
        )}

        {/* ════ REQUESTS TAB ════ */}
        {tab === 'requests' && (
          <div>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center', marginBottom:'1.25rem' }}>
              <input style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:4, padding:'8px 12px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', outline:'none', width:200 }} type="text" placeholder="Search requests..." value={rSearch} onChange={e=>setRS(e.target.value)} />
              {['all','pending','approved','rejected'].map(f=><button key={f} onClick={()=>setRF(f)} style={pill(rFilter===f)}>{f.toUpperCase()}{f==='pending'&&pendingCount>0?` (${pendingCount})`:''}</button>)}
            </div>
            <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderRadius:8, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'#030f08', borderBottom:'1px solid #0f3020' }}>
                  {['APPLICANT','EMAIL','LEVEL','SKILLS','SUBMITTED','STATUS','ACTIONS'].map(h=><th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtRequests.map((r,i) => (
                    <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background='#00ff6e06'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={tdStyle}><div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:AVATAR_BG[i%AVATAR_BG.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron,monospace', fontSize:'0.68rem', fontWeight:700, color:'#020c06', flexShrink:0 }}>{r.name.slice(0,2).toUpperCase()}</div>
                        <div style={{ fontFamily:'Orbitron,monospace', fontSize:'0.7rem', color:'#b0ffcc', letterSpacing:'1px' }}>{r.name}</div>
                      </div></td>
                      <td style={{ ...tdStyle, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#3a7a50' }}>{r.email}</td>
                      <td style={{ ...tdStyle, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#b0ffcc' }}>{r.exp||'—'}</td>
                      <td style={tdStyle}><div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>{(r.skills||[]).map(s=><span key={s} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.55rem', padding:'2px 7px', borderRadius:2, background:'#00ff6e10', color:'#00cc55', border:'1px solid #00ff6e25' }}>{s}</span>)}</div></td>
                      <td style={{ ...tdStyle, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#3a7a50', whiteSpace:'nowrap' }}>{r.submittedAt||'—'}</td>
                      <td style={tdStyle}><span style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.58rem', padding:'3px 9px', borderRadius:2, letterSpacing:'1px', background:r.status==='approved'?'#00ff6e15':r.status==='pending'?'#ff204015':'#3a3a3a22', color:r.status==='approved'?'#00ff6e':r.status==='pending'?'#ff2040':'#557755', border:`1px solid ${r.status==='approved'?'#00cc55':r.status==='pending'?'#cc0020':'#1a3020'}` }}>{r.status.toUpperCase()}</span></td>
                      <td style={tdStyle}><div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {r.status==='pending'&&<><button onClick={()=>approveReq(r)} style={abtn('#00ff6e','#00cc55')}>APPROVE</button><button onClick={()=>rejectReq(r)} style={abtn('#3a7a50','#0f3020')}>REJECT</button></>}
                        {r.status==='rejected'&&<button onClick={()=>approveReq(r)} style={abtn('#00ff6e','#00cc55')}>RE-APPROVE</button>}
                        <button onClick={()=>openDelReq(r)} style={abtn('#ff2040','#cc0020')}>REMOVE</button>
                      </div></td>
                    </tr>
                  ))}
                  {filtRequests.length===0&&<tr><td colSpan={7} style={{ padding:'3rem', textAlign:'center', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'2px' }}>{rFilter==='pending'?'NO PENDING REQUESTS':'NO REQUESTS FOUND'}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ LOGS TAB ════ */}
        {tab === 'logs' && (
          <div style={card}>
            <div style={cardTitle}>ACTIVITY LOG</div>
            {logs.length === 0 ? (
              <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', color:'#3a7a50', letterSpacing:'2px', padding:'2rem', textAlign:'center' }}>NO ACTIVITY YET</div>
            ) : (
              logs.map((l,i) => (
                <div key={i} style={{ display:'flex', gap:'1rem', padding:'8px 0', borderBottom:'1px solid #0a1f10', alignItems:'flex-start' }}>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50', whiteSpace:'nowrap', flexShrink:0 }}>{l.time}</div>
                  <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#b0ffcc', lineHeight:1.5 }}>{l.msg}</div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* MODALS */}
      {modal==='member'  && <MemberModal form={mForm} setForm={setMForm} onSave={saveMember} onClose={()=>setModal(null)} isEdit={!!editId} />}
      {modal==='event'   && <EventModal  form={eForm} setForm={setEForm} onSave={saveEvent}  onClose={()=>setModal(null)} isEdit={!!editId} />}
      {modal==='delete'  && <DeleteModal name={delTarget?.name||delTarget?.title} onConfirm={confirmDelete} onClose={()=>setModal(null)} />}

      <Footer />
    </div>
  )
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />
  return <Dashboard onLogout={() => setLoggedIn(false)} />
}
